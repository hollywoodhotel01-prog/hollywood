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

const initialSeedInvoices: Invoice[] = [
  {
    id: "inv-seed-1",
    invoice_number: "INV-2026-0001",
    issue_date: "2026-07-20",
    due_date: "2026-08-04",
    status: "PAID",
    currency: "USD",
    order_id: "MH-2026-001",
    vendor: DEFAULT_VENDOR,
    customer: {
      customer_id: "CUST-101",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+250 788 111 222",
      address: "Kigali, Rwanda",
    },
    items: [
      {
        item_id: "DR-01",
        description: "Deluxe Room Accommodation (3 Nights)",
        quantity: 3,
        unit_price: 120,
        discount_amount: 20,
        tax_rate_percent: 18,
        tax_amount: 61.20,
        line_gross_total: 360,
        line_after_discount: 340,
        line_total: 401.20,
      },
      {
        item_id: "CB-01",
        description: "Breakfast & Special Coffee Package",
        quantity: 3,
        unit_price: 12,
        discount_amount: 0,
        tax_rate_percent: 18,
        tax_amount: 6.48,
        line_gross_total: 36,
        line_after_discount: 36,
        line_total: 42.48,
      },
    ],
    summary: {
      subtotal: 396.00,
      total_discount: 20.00,
      taxable_amount: 376.00,
      total_tax: 67.68,
      shipping_fee: 0.00,
      grand_total: 443.68,
      amount_paid: 443.68,
      balance_due: 0.00,
    },
    global_discount: 0,
    payment_terms: "Due on Receipt",
    payment_instructions: "Paid in full via Credit Card auth TXN-941203",
    notes: "VIP guest requested top floor quiet room.",
    created_at: "2026-07-20T10:00:00Z",
    updated_at: "2026-07-20T10:30:00Z",
  },
  {
    id: "inv-seed-2",
    invoice_number: "INV-2026-0002",
    issue_date: "2026-08-15",
    due_date: "2026-08-30",
    status: "PARTIALLY_PAID",
    currency: "USD",
    order_id: "MH-2026-002",
    vendor: DEFAULT_VENDOR,
    customer: {
      customer_id: "CUST-102",
      name: "Michael Smith",
      email: "m.smith@globalcorp.com",
      phone: "+250 788 333 444",
      address: "Nairobi, Kenya",
      tax_id: "PIN-P0512849",
    },
    items: [
      {
        item_id: "CH-01",
        description: "Conference Hall Rental (Full Day)",
        quantity: 2,
        unit_price: 450,
        discount_amount: 50,
        tax_rate_percent: 18,
        tax_amount: 153.00,
        line_gross_total: 900,
        line_after_discount: 850,
        line_total: 1003.00,
      },
      {
        item_id: "CAT-01",
        description: "Executive Catering / Buffet (25 Delegates x 2 Days)",
        quantity: 50,
        unit_price: 35,
        discount_amount: 100,
        tax_rate_percent: 18,
        tax_amount: 297.00,
        line_gross_total: 1750,
        line_after_discount: 1650,
        line_total: 1947.00,
      },
    ],
    summary: {
      subtotal: 2650.00,
      total_discount: 150.00,
      taxable_amount: 2500.00,
      total_tax: 450.00,
      shipping_fee: 50.00,
      grand_total: 3000.00,
      amount_paid: 1500.00,
      balance_due: 1500.00,
    },
    global_discount: 0,
    shipping_fee: 50.00,
    payment_terms: "50% Advance, Balance Net 15",
    payment_instructions: "Please settle remaining balance to Bank of Kigali A/C: 00045-0129384-88",
    notes: "Corporate Annual Strategy Retreat with projector & PA system setup.",
    created_at: "2026-08-15T09:15:00Z",
    updated_at: "2026-08-16T14:20:00Z",
  },
  {
    id: "inv-seed-3",
    invoice_number: "INV-2026-0003",
    issue_date: "2026-08-25",
    due_date: "2026-09-08",
    status: "UNPAID",
    currency: "USD",
    order_id: "MH-2026-003",
    vendor: DEFAULT_VENDOR,
    customer: {
      customer_id: "CUST-103",
      name: "Sarah Connor",
      email: "sarah.c@techsol.io",
      phone: "+250 788 555 666",
      address: "Musanze, Rwanda",
    },
    items: [
      {
        item_id: "SR-01",
        description: "Standard Room Stay (2 Nights)",
        quantity: 2,
        unit_price: 80,
        discount_amount: 0,
        tax_rate_percent: 18,
        tax_amount: 28.80,
        line_gross_total: 160,
        line_after_discount: 160,
        line_total: 188.80,
      },
    ],
    summary: {
      subtotal: 160.00,
      total_discount: 0.00,
      taxable_amount: 160.00,
      total_tax: 28.80,
      shipping_fee: 0.00,
      grand_total: 188.80,
      amount_paid: 0.00,
      balance_due: 188.80,
    },
    payment_terms: "Due on Arrival / Check-in",
    payment_instructions: "MTN Mobile Money Code: *182*8*1*558291#",
    notes: "Awaiting arrival confirmation.",
    created_at: "2026-08-25T11:45:00Z",
    updated_at: "2026-08-25T11:45:00Z",
  },
  {
    id: "inv-seed-4",
    invoice_number: "INV-2026-0004",
    issue_date: "2026-08-01",
    due_date: "2026-08-15",
    status: "OVERDUE",
    currency: "USD",
    order_id: "MH-2026-004",
    vendor: DEFAULT_VENDOR,
    customer: {
      customer_id: "CUST-104",
      name: "David Kim",
      email: "david.kim@innovate.kr",
      phone: "+250 788 777 888",
      address: "Seoul / Kigali",
    },
    items: [
      {
        item_id: "ST-01",
        description: "Presidential Suite (4 Nights)",
        quantity: 4,
        unit_price: 300,
        discount_amount: 100,
        tax_rate_percent: 18,
        tax_amount: 198.00,
        line_gross_total: 1200,
        line_after_discount: 1100,
        line_total: 1298.00,
      },
      {
        item_id: "TR-01",
        description: "Airport VIP Transfer Service",
        quantity: 2,
        unit_price: 75,
        discount_amount: 0,
        tax_rate_percent: 18,
        tax_amount: 27.00,
        line_gross_total: 150,
        line_after_discount: 150,
        line_total: 177.00,
      },
    ],
    summary: {
      subtotal: 1350.00,
      total_discount: 100.00,
      taxable_amount: 1250.00,
      total_tax: 225.00,
      shipping_fee: 0.00,
      grand_total: 1475.00,
      amount_paid: 0.00,
      balance_due: 1475.00,
    },
    payment_terms: "Net 14",
    payment_instructions: "Overdue reminder sent. Bank wire to Midland Hotel.",
    notes: "Follow-up email sent by accounting team.",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-16T09:00:00Z",
  },
];

const initialSeedReceipts: Receipt[] = [
  {
    id: "rec-seed-1",
    receipt_number: "REC-2026-0001",
    invoice_reference_id: "INV-2026-0001",
    order_id: "MH-2026-001",
    payment_date: "2026-07-20 10:30:00",
    payment_method: "CREDIT_CARD",
    transaction_reference: "CC-AUTH-941203",
    amount_received: 443.68,
    vendor: DEFAULT_VENDOR,
    customer: {
      customer_id: "CUST-101",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+250 788 111 222",
      address: "Kigali, Rwanda",
    },
    total_invoice_amount: 443.68,
    total_paid_to_date: 443.68,
    remaining_balance: 0.00,
    payment_status: "FULLY_PAID",
    notes: "Visa Card settlement via POS Terminal 1",
    created_at: "2026-07-20T10:30:00Z",
  },
  {
    id: "rec-seed-2",
    receipt_number: "REC-2026-0002",
    invoice_reference_id: "INV-2026-0002",
    order_id: "MH-2026-002",
    payment_date: "2026-08-16 14:20:00",
    payment_method: "BANK_TRANSFER",
    transaction_reference: "BK-TXN-718294",
    amount_received: 1500.00,
    vendor: DEFAULT_VENDOR,
    customer: {
      customer_id: "CUST-102",
      name: "Michael Smith",
      email: "m.smith@globalcorp.com",
      phone: "+250 788 333 444",
      address: "Nairobi, Kenya",
      tax_id: "PIN-P0512849",
    },
    total_invoice_amount: 3000.00,
    total_paid_to_date: 1500.00,
    remaining_balance: 1500.00,
    payment_status: "PARTIALLY_PAID",
    notes: "50% Corporate advance deposit received via Bank of Kigali Swift transfer",
    created_at: "2026-08-16T14:20:00Z",
  },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialSeedInvoices);
  const [receipts, setReceipts] = useState<Receipt[]>(initialSeedReceipts);
  const [vendorConfig, setVendorConfig] = useState<VendorInfo>(DEFAULT_VENDOR);

  // Check and update overdue status on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setInvoices((prev) =>
      prev.map((inv) => {
        if (
          (inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID" || inv.status === "ISSUED") &&
          inv.due_date < todayStr &&
          inv.summary.balance_due > 0
        ) {
          return { ...inv, status: "OVERDUE" };
        }
        return inv;
      })
    );
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
      notes: input.notes || "Thank you for choosing Midland Hotel Kayonza.",
      order_id: input.order_id,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
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
      "Standard Room": 80,
      "Deluxe Room": 120,
      "Executive Room": 150,
      "Suite": 300,
    };
    const unitPrice = prices[booking.roomType] || Math.round(booking.amount / nights);

    const itemInput = {
      item_id: `ROOM-${booking.roomType.substring(0, 2).toUpperCase()}`,
      description: `${booking.roomType} Accommodation (${nights} Night${nights > 1 ? "s" : ""}: ${booking.checkIn} to ${booking.checkOut})`,
      quantity: nights,
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
        address: "Midland Hotel Kayonza Guest",
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
