"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  CurrencyCode,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  InvoiceSummary,
  PaymentMethod,
  PaymentSubmission,
  Receipt,
  VendorInfo,
} from "@/types/finance";
import {
  calculateInvoiceSummary,
  calculateLineItem,
  DEFAULT_VENDOR,
  generateInvoiceNumber,
  generateReceiptNumber,
  generateTxnReference,
  round2,
} from "@/lib/financeCalculations";
import { Booking } from "./BookingContext";

interface CreateInvoiceInput {
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
  status?: InvoiceStatus;
  currency?: CurrencyCode;
  customer: {
    customer_id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    tax_id?: string;
  };
  vendor?: VendorInfo;
  items: Array<Omit<InvoiceLineItem, "tax_amount" | "line_gross_total" | "line_after_discount" | "line_total">>;
  global_discount?: number;
  shipping_fee?: number;
  payment_terms?: string;
  payment_instructions?: string;
  notes?: string;
  order_id?: string;
}

interface FinanceContextType {
  invoices: Invoice[];
  receipts: Receipt[];
  vendorConfig: VendorInfo;
  setVendorConfig: React.Dispatch<React.SetStateAction<VendorInfo>>;
  createInvoice: (input: CreateInvoiceInput) => Invoice;
  updateInvoice: (id: string, input: Partial<CreateInvoiceInput> & { status?: InvoiceStatus }) => Invoice | null;
  cancelInvoice: (id: string) => boolean;
  deleteInvoice: (id: string) => boolean;
  recordPayment: (payment: PaymentSubmission) => Receipt | null;
  createReceiptDirect: (receiptData: Omit<Receipt, "id" | "created_at">) => Receipt;
  generateInvoiceFromBooking: (booking: Booking, customNotes?: string) => Invoice;
  getInvoiceByNumber: (invoiceNumber: string) => Invoice | undefined;
  getReceiptsForInvoice: (invoiceNumber: string) => Receipt[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [vendorConfig, setVendorConfig] = useState<VendorInfo>(DEFAULT_VENDOR);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch from Google Sheets on mount
  useEffect(() => {
    async function loadFinanceData() {
      try {
        const safeJson = async (res: Response) => {
          try {
            return await res.json();
          } catch (e) {
            return {};
          }
        };
        const [invRes, recRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/receipts')
        ]);
        const [invJson, recJson] = await Promise.all([
          safeJson(invRes),
          safeJson(recRes)
        ]);
        if (invJson.success && Array.isArray(invJson.invoices)) {
          const todayStr = new Date().toISOString().split("T")[0];
          const updatedInvoices = invJson.invoices.map((inv: Invoice) => {
            if (
              (inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID" || inv.status === "ISSUED") &&
              inv.due_date < todayStr &&
              inv.summary.balance_due > 0
            ) {
              return { ...inv, status: "OVERDUE" as InvoiceStatus };
            }
            return inv;
          });
          setInvoices(updatedInvoices);
        }
        if (recJson.success && Array.isArray(recJson.receipts)) setReceipts(recJson.receipts);
      } catch (e) {
        console.error("Failed to load finance data", e);
      } finally {
        setDataLoaded(true);
      }
    }
    loadFinanceData();
  }, []);

  const createInvoice = (input: CreateInvoiceInput): Invoice => {
    const calculatedItems = input.items.map((it) => calculateLineItem(it));
    const summary = calculateInvoiceSummary(
      calculatedItems,
      input.global_discount || 0,
      input.shipping_fee || 0,
      0
    );

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const defaultDueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const invoiceNumber = input.invoice_number || generateInvoiceNumber(invoices);
    const initialStatus: InvoiceStatus = input.status || "ISSUED";

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      invoice_number: invoiceNumber,
      issue_date: input.issue_date || todayStr,
      due_date: input.due_date || defaultDueDate,
      status: initialStatus,
      currency: input.currency || "USD",
      vendor: input.vendor || vendorConfig,
      customer: input.customer,
      items: calculatedItems,
      summary,
      global_discount: input.global_discount || 0,
      shipping_fee: input.shipping_fee || 0,
      payment_terms: input.payment_terms || "Due in 14 Days",
      payment_instructions:
        input.payment_instructions ||
        `Direct Transfer: ${vendorConfig.bank_name}, A/C: ${vendorConfig.account_number} or MoMo: ${vendorConfig.momo_code}`,
      notes: input.notes || "Thank you for choosing Hollywood Hotel.",
      order_id: input.order_id,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    fetch('/api/invoices', { method: 'POST', body: JSON.stringify(newInvoice) }).catch(e => console.error("Failed to save invoice", e));
    return newInvoice;
  };

  const updateInvoice = (
    id: string,
    input: Partial<CreateInvoiceInput> & { status?: InvoiceStatus }
  ): Invoice | null => {
    let updated: Invoice | null = null;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;

        const calculatedItems = input.items
          ? input.items.map((it) => calculateLineItem(it))
          : inv.items;

        const globalDiscount =
          input.global_discount !== undefined ? input.global_discount : inv.global_discount;
        const shippingFee =
          input.shipping_fee !== undefined ? input.shipping_fee : inv.summary.shipping_fee;

        const summary = calculateInvoiceSummary(
          calculatedItems,
          globalDiscount,
          shippingFee,
          inv.summary.amount_paid
        );

        let newStatus = input.status || inv.status;
        if (summary.balance_due <= 0 && inv.summary.amount_paid > 0) {
          newStatus = "PAID";
        } else if (inv.summary.amount_paid > 0 && summary.balance_due > 0) {
          newStatus = "PARTIALLY_PAID";
        }

        updated = {
          ...inv,
          invoice_number: input.invoice_number || inv.invoice_number,
          issue_date: input.issue_date || inv.issue_date,
          due_date: input.due_date || inv.due_date,
          status: newStatus,
          currency: input.currency || inv.currency,
          vendor: input.vendor || inv.vendor,
          customer: input.customer || inv.customer,
          items: calculatedItems,
          summary,
          global_discount: globalDiscount,
          shipping_fee: shippingFee,
          payment_terms: input.payment_terms || inv.payment_terms,
          payment_instructions: input.payment_instructions || inv.payment_instructions,
          notes: input.notes !== undefined ? input.notes : inv.notes,
          order_id: input.order_id || inv.order_id,
          updated_at: new Date().toISOString(),
        };

        return updated;
      })
    );

    if (updated) {
      fetch('/api/invoices', { method: 'PUT', body: JSON.stringify(updated) }).catch(e => console.error("Failed to update invoice", e));
    }
    return updated;
  };

  const cancelInvoice = (id: string): boolean => {
    let success = false;
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          success = true;
          return { ...inv, status: "CANCELLED", updated_at: new Date().toISOString() };
        }
        return inv;
      })
    );
    if (success) {
      fetch('/api/invoices', { method: 'PUT', body: JSON.stringify({ id, status: 'CANCELLED' }) }).catch(e => console.error("Failed to cancel invoice", e));
    }
    return success;
  };

  const deleteInvoice = (id: string): boolean => {
    let success = false;
    setInvoices((prev) => {
      const exists = prev.some((inv) => inv.id === id);
      if (exists) {
        success = true;
        return prev.filter((inv) => inv.id !== id);
      }
      return prev;
    });
    if (success) {
      fetch(`/api/invoices?id=${id}`, { method: 'DELETE' }).catch(e => console.error("Failed to delete invoice", e));
    }
    return success;
  };

  /**
   * Section 5 Workflow & State Transition Logic:
   * Validation: amount_received > 0
   * Update Invoice:
   *  - total_paid_to_date += amount_received
   *  - balance_due = grand_total - total_paid_to_date
   *  - If balance_due <= 0 -> Set Invoice Status to PAID
   *  - If balance_due > 0 -> Set Invoice Status to PARTIALLY_PAID
   * Issue Receipt: Generate immutable Receipt document referencing invoice_number
   */
  const recordPayment = (payment: PaymentSubmission): Receipt | null => {
    if (!payment.amount_received || payment.amount_received <= 0) {
      throw new Error("Payment amount must be greater than 0.");
    }

    const targetInvoice = invoices.find(
      (inv) => inv.invoice_number === payment.invoice_number
    );

    if (!targetInvoice) {
      throw new Error(`Invoice ${payment.invoice_number} not found.`);
    }

    const amountReceived = round2(payment.amount_received);
    const newTotalPaid = round2(targetInvoice.summary.amount_paid + amountReceived);
    const newBalanceDue = round2(Math.max(0, targetInvoice.summary.grand_total - newTotalPaid));
    const newStatus: InvoiceStatus = newBalanceDue <= 0 ? "PAID" : "PARTIALLY_PAID";

    // Update target invoice
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoice_number !== payment.invoice_number) return inv;
        return {
          ...inv,
          status: newStatus,
          summary: {
            ...inv.summary,
            amount_paid: newTotalPaid,
            balance_due: newBalanceDue,
          },
          updated_at: new Date().toISOString(),
        };
      })
    );

    // Format current date-time for payment
    const now = new Date();
    const formattedDate = payment.payment_date || now.toISOString().replace("T", " ").substring(0, 19);

    const receiptNumber = generateReceiptNumber(receipts);
    const txnRef = payment.transaction_reference || generateTxnReference(payment.payment_method);

    const newReceipt: Receipt = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      receipt_number: receiptNumber,
      invoice_reference_id: targetInvoice.invoice_number,
      order_id: targetInvoice.order_id,
      payment_date: formattedDate,
      payment_method: payment.payment_method,
      transaction_reference: txnRef,
      amount_received: amountReceived,
      vendor: targetInvoice.vendor,
      customer: targetInvoice.customer,
      total_invoice_amount: targetInvoice.summary.grand_total,
      total_paid_to_date: newTotalPaid,
      remaining_balance: newBalanceDue,
      payment_status: newBalanceDue <= 0 ? "FULLY_PAID" : "PARTIALLY_PAID",
      notes: payment.notes || `Payment recorded for ${targetInvoice.invoice_number}`,
      created_at: now.toISOString(),
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    // Save receipt
    fetch('/api/receipts', { method: 'POST', body: JSON.stringify(newReceipt) }).catch(e => console.error("Failed to save receipt", e));
    // Update invoice
    fetch('/api/invoices', { method: 'PUT', body: JSON.stringify({
      invoice_number: targetInvoice.invoice_number,
      status: newStatus,
      summary: {
        ...targetInvoice.summary,
        amount_paid: newTotalPaid,
        balance_due: newBalanceDue,
      }
    }) }).catch(e => console.error("Failed to update invoice payment", e));

    return newReceipt;
  };

  const createReceiptDirect = (
    receiptData: Omit<Receipt, "id" | "created_at">
  ): Receipt => {
    const now = new Date();
    const newReceipt: Receipt = {
      ...receiptData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: now.toISOString(),
    };
    setReceipts((prev) => [newReceipt, ...prev]);
    fetch('/api/receipts', { method: 'POST', body: JSON.stringify(newReceipt) }).catch(e => console.error("Failed to save direct receipt", e));
    return newReceipt;
  };

  /**
   * 1-Click Invoice Generation from a Booking reservation
   */
  const generateInvoiceFromBooking = (booking: Booking, customNotes?: string): Invoice => {
    const d1 = new Date(booking.checkIn);
    const d2 = new Date(booking.checkOut);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

    const prices: Record<string, number> = {
      "Luxury Room": 200000,
    };
    
    const roomsCount = booking.numberOfRooms || 1;
    const unitPrice = prices[booking.roomType] || Math.round(booking.amount / (nights * roomsCount));

    const itemInput = {
      item_id: `ROOM-${booking.roomType.substring(0, 2).toUpperCase()}`,
      description: `${roomsCount}x ${booking.roomType} Accommodation (${nights} Night${nights > 1 ? "s" : ""}: ${booking.checkIn} to ${booking.checkOut})`,
      quantity: nights * roomsCount,
      unit_price: unitPrice,
      discount_amount: 0,
      tax_rate_percent: 18,
    };

    return createInvoice({
      order_id: booking.id,
      status: "ISSUED",
      customer: {
        customer_id: `CUST-${booking.id.replace("MH-2026-", "")}`,
        name: booking.guestName,
        email: `${booking.guestName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: "+250 788 000 000",
        address: "Hollywood Hotel Guest",
      },
      items: [itemInput],
      notes: customNotes || `Generated for reservation ${booking.id} (${booking.roomType})`,
      payment_terms: "Due on Arrival / Check-in",
    });
  };

  const getInvoiceByNumber = (invoiceNumber: string) => {
    return invoices.find((inv) => inv.invoice_number === invoiceNumber);
  };

  const getReceiptsForInvoice = (invoiceNumber: string) => {
    return receipts.filter((rec) => rec.invoice_reference_id === invoiceNumber);
  };

  return (
    <FinanceContext.Provider
      value={{
        invoices,
        receipts,
        vendorConfig,
        setVendorConfig,
        createInvoice,
        updateInvoice,
        cancelInvoice,
        deleteInvoice,
        recordPayment,
        createReceiptDirect,
        generateInvoiceFromBooking,
        getInvoiceByNumber,
        getReceiptsForInvoice,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
