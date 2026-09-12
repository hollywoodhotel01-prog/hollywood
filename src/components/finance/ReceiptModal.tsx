"use client";

import React, { useState, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Invoice, PaymentMethod, Receipt } from "@/types/finance";
import { formatCurrency, generateTxnReference } from "@/lib/financeCalculations";
import {
  X,
  CreditCard,
  CheckCircle,
  Smartphone,
  Building,
  DollarSign,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetInvoice?: Invoice | null;
  onReceiptGenerated?: (receipt: Receipt) => void;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  targetInvoice,
  onReceiptGenerated,
}: ReceiptModalProps) {
  const { invoices, recordPayment } = useFinance();

  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string>("");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Active invoice details
  const activeInvoice =
    targetInvoice ||
    invoices.find((inv) => inv.invoice_number === selectedInvoiceNumber);

  useEffect(() => {
    if (targetInvoice) {
      setSelectedInvoiceNumber(targetInvoice.invoice_number);
      setAmountReceived(String(targetInvoice.summary.balance_due));
    } else if (invoices.length > 0) {
      const firstUnpaid = invoices.find(
        (i) => i.status !== "PAID" && i.status !== "CANCELLED"
      );
      if (firstUnpaid) {
        setSelectedInvoiceNumber(firstUnpaid.invoice_number);
        setAmountReceived(String(firstUnpaid.summary.balance_due));
      } else {
        setSelectedInvoiceNumber(invoices[0].invoice_number);
        setAmountReceived(String(invoices[0].summary.balance_due));
      }
    }

    const now = new Date();
    const formattedDate = now.toISOString().replace("T", " ").substring(0, 19);
    setPaymentDate(formattedDate);
    setTransactionRef(generateTxnReference("MOBILE_MONEY"));
    setErrorMsg("");
  }, [targetInvoice, isOpen, invoices]);

  // Update transaction reference suggestion when payment method changes
  const handleMethodChange = (newMethod: PaymentMethod) => {
    setPaymentMethod(newMethod);
    setTransactionRef(generateTxnReference(newMethod));
  };

  const handleInvoiceChange = (invNum: string) => {
    setSelectedInvoiceNumber(invNum);
    const found = invoices.find((i) => i.invoice_number === invNum);
    if (found) {
      setAmountReceived(String(found.summary.balance_due));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const numAmount = parseFloat(amountReceived);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Amount received must be greater than 0.00.");
      return;
    }

    if (!selectedInvoiceNumber) {
      setErrorMsg("Please select a valid invoice.");
      return;
    }

    try {
      const newReceipt = recordPayment({
        invoice_number: selectedInvoiceNumber,
        amount_received: numAmount,
        payment_method: paymentMethod,
        transaction_reference: transactionRef || generateTxnReference(paymentMethod),
        payment_date: paymentDate,
        notes: notes || `Payment recorded for ${selectedInvoiceNumber}`,
      });

      if (newReceipt && onReceiptGenerated) {
        onReceiptGenerated(newReceipt);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process payment.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-600 text-white rounded-xl shadow-md">
                <FileCheck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-heading font-black text-black">
                  Record Payment & Issue Receipt
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Generates an official immutable receipt and updates the invoice balance.
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

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={18} />
                {errorMsg}
              </div>
            )}

            {/* Target Invoice Selector */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Select Invoice To Pay *
              </label>
              <select
                value={selectedInvoiceNumber}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-gold"
                required
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.invoice_number}>
                    {inv.invoice_number} - {inv.customer.name} (Due: {formatCurrency(inv.summary.balance_due, inv.currency)} / Total: {formatCurrency(inv.summary.grand_total, inv.currency)}) [{inv.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Balance Insight Card */}
            {activeInvoice && (
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Grand Total</p>
                  <p className="text-base font-black text-black mt-0.5">
                    {formatCurrency(activeInvoice.summary.grand_total, activeInvoice.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Paid to Date</p>
                  <p className="text-base font-bold text-green-700 mt-0.5">
                    {formatCurrency(activeInvoice.summary.amount_paid, activeInvoice.currency)}
                  </p>
                </div>
                <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                  <p className="text-[11px] font-bold text-red-600 uppercase">Balance Due</p>
                  <p className="text-lg font-black text-red-700 mt-0.5">
                    {formatCurrency(activeInvoice.summary.balance_due, activeInvoice.currency)}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone },
                  { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building },
                  { id: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
                  { id: "CASH", label: "Cash", icon: DollarSign },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMethodChange(m.id as PaymentMethod)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      paymentMethod === m.id
                        ? "border-black bg-black text-gold shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gold hover:text-black"
                    }`}
                  >
                    <m.icon size={20} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Received & Quick Shortcut */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amount Received ({activeInvoice?.currency || "USD"}) *
                </label>
                {activeInvoice && activeInvoice.summary.balance_due > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountReceived(String(activeInvoice.summary.balance_due))}
                    className="text-xs font-bold text-gold-dark hover:underline flex items-center gap-1"
                  >
                    Pay Full Balance ({formatCurrency(activeInvoice.summary.balance_due, activeInvoice.currency)})
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-xl font-black text-black focus:outline-none focus:border-gold"
                placeholder="0.00"
                required
              />
            </div>

            {/* Transaction Reference & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Transaction / Gateway Reference *
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-black focus:outline-none focus:border-gold"
                  placeholder="e.g. MOMO-948123"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Payment Date & Time
                </label>
                <input
                  type="text"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-black focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                Receipt Notes / Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-black"
                placeholder="Payment confirmation notes or terminal ID..."
              />
            </div>

            {/* Footer Submit */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 text-sm hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-7 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Confirm & Issue Official Receipt
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
