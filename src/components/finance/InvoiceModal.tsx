"use client";

import React, { useState, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useBookings } from "@/context/BookingContext";
import {
  CurrencyCode,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
} from "@/types/finance";
import {
  calculateInvoiceSummary,
  calculateLineItem,
  formatCurrency,
  HOTEL_SERVICE_PRESETS,
  ServicePreset,
} from "@/lib/financeCalculations";
import {
  X,
  Plus,
  Trash2,
  Receipt as ReceiptIcon,
  Sparkles,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
  onCreated?: (invoice: Invoice) => void;
}

type EditableLineItem = Omit<
  InvoiceLineItem,
  "tax_amount" | "line_gross_total" | "line_after_discount" | "line_total"
>;

export default function InvoiceModal({
  isOpen,
  onClose,
  invoiceToEdit,
  onCreated,
}: InvoiceModalProps) {
  const { createInvoice, updateInvoice, vendorConfig } = useFinance();
  const { bookings } = useBookings();

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");

  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [paymentTerms, setPaymentTerms] = useState("Net 14");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [status, setStatus] = useState<InvoiceStatus>("ISSUED");

  const [items, setItems] = useState<EditableLineItem[]>([
    {
      item_id: "DR-01",
      description: "Deluxe Room Accommodation",
      quantity: 1,
      unit_price: 120,
      discount_amount: 0,
      tax_rate_percent: 18,
    },
  ]);

  // Populate state when editing or opening
  useEffect(() => {
    if (invoiceToEdit) {
      setCustomerId(invoiceToEdit.customer.customer_id);
      setCustomerName(invoiceToEdit.customer.name);
      setCustomerEmail(invoiceToEdit.customer.email);
      setCustomerPhone(invoiceToEdit.customer.phone || "");
      setCustomerAddress(invoiceToEdit.customer.address || "");
      setCustomerTaxId(invoiceToEdit.customer.tax_id || "");
      setIssueDate(invoiceToEdit.issue_date);
      setDueDate(invoiceToEdit.due_date);
      setCurrency(invoiceToEdit.currency);
      setPaymentTerms(invoiceToEdit.payment_terms);
      setPaymentInstructions(invoiceToEdit.payment_instructions || "");
      setNotes(invoiceToEdit.notes || "");
      setOrderId(invoiceToEdit.order_id || "");
      setGlobalDiscount(invoiceToEdit.global_discount || 0);
      setShippingFee(invoiceToEdit.summary.shipping_fee || 0);
      setStatus(invoiceToEdit.status);
      setItems(
        invoiceToEdit.items.map((it) => ({
          item_id: it.item_id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount_amount: it.discount_amount,
          tax_rate_percent: it.tax_rate_percent,
        }))
      );
    } else {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      setCustomerId(`CUST-${Math.floor(100 + Math.random() * 900)}`);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerTaxId("");
      setIssueDate(today);
      setDueDate(due);
      setCurrency("USD");
      setPaymentTerms("Net 14");
      setPaymentInstructions(
        `Bank Transfer to ${vendorConfig.bank_name} A/C ${vendorConfig.account_number} or MTN MoMo: ${vendorConfig.momo_code}`
      );
      setNotes("Thank you for choosing Midland Hotel Kayonza. We appreciate your business!");
      setOrderId("");
      setGlobalDiscount(0);
      setShippingFee(0);
      setStatus("ISSUED");
      setItems([
        {
          item_id: "DR-01",
          description: "Deluxe Room Accommodation",
          quantity: 1,
          unit_price: 120,
          discount_amount: 0,
          tax_rate_percent: 18,
        },
      ]);
    }
  }, [invoiceToEdit, isOpen, vendorConfig]);

  if (!isOpen) return null;

  // Real-time recalculations using mathematical formulas
  const calculatedItems = items.map((it) => calculateLineItem(it));
  const summary = calculateInvoiceSummary(
    calculatedItems,
    globalDiscount,
    shippingFee,
    invoiceToEdit ? invoiceToEdit.summary.amount_paid : 0
  );

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        item_id: `ITEM-0${prev.length + 1}`,
        description: "New Hotel Service",
        quantity: 1,
        unit_price: 50,
        discount_amount: 0,
        tax_rate_percent: 18,
      },
    ]);
  };

  const handleApplyPreset = (preset: ServicePreset, index: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        item_id: preset.id,
        description: preset.name,
        quantity: updated[index].quantity || 1,
        unit_price: preset.unit_price,
        discount_amount: 0,
        tax_rate_percent: preset.tax_rate_percent,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof EditableLineItem,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleAutofillFromBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setOrderId(booking.id);
    setCustomerName(booking.guestName);
    setCustomerEmail(`${booking.guestName.toLowerCase().replace(/\s+/g, ".")}@example.com`);
    setCustomerId(`CUST-${booking.id.replace("MH-2026-", "")}`);

    const d1 = new Date(booking.checkIn);
    const d2 = new Date(booking.checkOut);
    const nights = Math.max(
      1,
      Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24))
    );

    const prices: Record<string, number> = {
      "Standard Room": 80,
      "Deluxe Room": 120,
      "Executive Room": 150,
      "Suite": 300,
    };
    const unitPrice = prices[booking.roomType] || Math.round(booking.amount / nights);

    setItems([
      {
        item_id: `ROOM-${booking.roomType.substring(0, 2).toUpperCase()}`,
        description: `${booking.roomType} Accommodation (${nights} Night${nights > 1 ? "s" : ""}: ${booking.checkIn} to ${booking.checkOut})`,
        quantity: nights,
        unit_price: unitPrice,
        discount_amount: 0,
        tax_rate_percent: 18,
      },
    ]);
  };

  const handleSubmit = (targetStatus: InvoiceStatus = "ISSUED") => {
    if (!customerName.trim()) {
      alert("Please provide the customer name.");
      return;
    }
    if (items.length === 0) {
      alert("Please include at least one line item.");
      return;
    }

    const payload = {
      issue_date: issueDate,
      due_date: dueDate,
      status: targetStatus,
      currency,
      customer: {
        customer_id: customerId || `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: customerName,
        email: customerEmail || "guest@midlandhotel.rw",
        phone: customerPhone,
        address: customerAddress,
        tax_id: customerTaxId,
      },
      items,
      global_discount: Number(globalDiscount) || 0,
      shipping_fee: Number(shippingFee) || 0,
      payment_terms: paymentTerms,
      payment_instructions: paymentInstructions,
      notes,
      order_id: orderId || undefined,
    };

    let resultInvoice: Invoice | null = null;
    if (invoiceToEdit) {
      resultInvoice = updateInvoice(invoiceToEdit.id, payload);
    } else {
      resultInvoice = createInvoice(payload);
    }

    if (resultInvoice && onCreated) {
      onCreated(resultInvoice);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black text-gold rounded-xl shadow-md">
                <ReceiptIcon size={20} />
              </div>
              <div>
                <h2 className="text-xl font-heading font-black text-black">
                  {invoiceToEdit ? `Edit Invoice: ${invoiceToEdit.invoice_number}` : "Create New Invoice"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Financial document generation adhering to strict VAT and balance calculation rules.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            {/* Quick Autofill from Reservation */}
            {!invoiceToEdit && (
              <div className="p-4 bg-amber-50/70 border border-gold/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="text-gold-dark" size={20} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-black">
                      Quick Autofill from Booking Reservation
                    </p>
                    <p className="text-xs text-gray-600">
                      Select any active hotel booking to instantly populate customer and room nights.
                    </p>
                  </div>
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAutofillFromBooking(e.target.value);
                  }}
                  className="bg-white border-2 border-gold/40 text-black text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Select Reservation --
                  </option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.guestName} ({b.roomType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* General Metadata & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-gray-50/70 rounded-2xl border border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-black focus:outline-none focus:border-gold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="RWF">RWF (Rwanda Francs)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="UGX">UGX (Uganda Shillings)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-black focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-black focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-black focus:outline-none focus:border-gold"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Due on Arrival">Due on Arrival / Check-in</option>
                  <option value="Net 7">Net 7 Days</option>
                  <option value="Net 14">Net 14 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="50% Advance, Balance Net 15">50% Advance Deposit</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                <User size={16} /> Customer / Bill-To Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe / Global Corp"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-black focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+250 788 123 456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-black focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Tax / VAT ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="TIN-987654321"
                    value={customerTaxId}
                    onChange={(e) => setCustomerTaxId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                  <DollarSign size={16} /> Invoice Line Items & Mathematical Breakdown
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => {
                  const calculated = calculatedItems[index] || calculateLineItem(item);
                  return (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-black text-gold text-xs font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="SKU / Item ID"
                            value={item.item_id}
                            onChange={(e) =>
                              handleItemChange(index, "item_id", e.target.value)
                            }
                            className="w-24 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-black"
                          />
                        </div>

                        {/* Preset Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-400 uppercase">
                            Preset:
                          </span>
                          <select
                            onChange={(e) => {
                              const preset = HOTEL_SERVICE_PRESETS.find(
                                (p) => p.id === e.target.value
                              );
                              if (preset) handleApplyPreset(preset, index);
                            }}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 font-medium"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              -- Apply Hotel Service --
                            </option>
                            {HOTEL_SERVICE_PRESETS.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (${p.unit_price})
                              </option>
                            ))}
                          </select>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Item Inputs Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                            Description
                          </label>
                          <input
                            type="text"
                            placeholder="Description of service / product"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, "description", e.target.value)
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-black"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-black text-center"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                            Unit Price ({currency})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-black"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                            Discount ({currency})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.discount_amount}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "discount_amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-red-600"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                            Tax %
                          </label>
                          <input
                            type="number"
                            value={item.tax_rate_percent}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "tax_rate_percent",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-sm font-medium text-center text-black"
                          />
                        </div>
                      </div>

                      {/* Real-time Math Feedback */}
                      <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-gray-200 text-gray-500 font-mono">
                        <span>
                          Gross: {formatCurrency(calculated.line_gross_total, currency)}
                        </span>
                        <span>
                          After Disc: {formatCurrency(calculated.line_after_discount, currency)}
                        </span>
                        <span>
                          VAT (18%): {formatCurrency(calculated.tax_amount, currency)}
                        </span>
                        <span className="font-bold text-black text-sm">
                          Line Total: {formatCurrency(calculated.line_total, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Adjustments & Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Global Discount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-black"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Shipping / Extra Service Fee ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-black"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Payment Instructions & Bank / MoMo Details
                  </label>
                  <textarea
                    rows={2}
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Notes & Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-black"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-3 self-start">
                <h4 className="text-xs font-black uppercase tracking-widest text-black border-b border-gray-200 pb-2">
                  Summary & Formula Verification
                </h4>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-black">
                    {formatCurrency(summary.subtotal, currency)}
                  </span>
                </div>

                {summary.total_discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Total Discount:</span>
                    <span className="font-bold">
                      -{formatCurrency(summary.total_discount, currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Taxable Base:</span>
                  <span>{formatCurrency(summary.taxable_amount, currency)}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Tax (VAT 18%):</span>
                  <span className="font-bold text-black">
                    {formatCurrency(summary.total_tax, currency)}
                  </span>
                </div>

                {summary.shipping_fee > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping / Service Fee:</span>
                    <span className="font-bold">
                      {formatCurrency(summary.shipping_fee, currency)}
                    </span>
                  </div>
                )}

                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-base font-black text-black">
                  <span>Grand Total:</span>
                  <span className="text-xl">
                    {formatCurrency(summary.grand_total, currency)}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-green-700 font-semibold pt-1">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(summary.amount_paid, currency)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-red-600">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(summary.balance_due, currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 text-sm hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                className="px-5 py-2.5 rounded-xl border-2 border-black font-bold text-black text-sm hover:bg-gray-100 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("ISSUED")}
                className="px-7 py-2.5 rounded-xl bg-black hover:bg-gold hover:text-black text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle size={16} />
                {invoiceToEdit ? "Update Invoice" : "Issue Invoice"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
