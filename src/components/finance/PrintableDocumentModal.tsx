"use client";

import React, { useRef } from "react";
import { Invoice, Receipt } from "@/types/finance";
import { formatCurrency } from "@/lib/financeCalculations";
import { X, Printer, Download, CheckCircle, Clock, AlertTriangle, Building2, User, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PrintableDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "invoice" | "receipt";
  invoice?: Invoice | null;
  receipt?: Receipt | null;
}

export default function PrintableDocumentModal({
  isOpen,
  onClose,
  type,
  invoice,
  receipt,
}: PrintableDocumentModalProps) {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    let dataToExport: any = null;
    let fileName = "document.json";

    if (type === "invoice" && invoice) {
      dataToExport = {
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        status: invoice.status,
        currency: invoice.currency,
        order_id: invoice.order_id,
        vendor: invoice.vendor,
        customer: invoice.customer,
        items: invoice.items.map((it) => ({
          item_id: it.item_id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount_amount: it.discount_amount,
          tax_rate_percent: it.tax_rate_percent,
          tax_amount: it.tax_amount,
          line_total: it.line_total,
        })),
        summary: invoice.summary,
        payment_terms: invoice.payment_terms,
        payment_instructions: invoice.payment_instructions,
        notes: invoice.notes,
      };
      fileName = `${invoice.invoice_number}.json`;
    } else if (type === "receipt" && receipt) {
      dataToExport = {
        receipt_number: receipt.receipt_number,
        invoice_reference_id: receipt.invoice_reference_id,
        order_id: receipt.order_id,
        payment_date: receipt.payment_date,
        payment_method: receipt.payment_method,
        transaction_reference: receipt.transaction_reference,
        amount_received: receipt.amount_received,
        vendor: receipt.vendor,
        customer: receipt.customer,
        total_invoice_amount: receipt.total_invoice_amount,
        total_paid_to_date: receipt.total_paid_to_date,
        remaining_balance: receipt.remaining_balance,
        payment_status: receipt.payment_status,
        notes: receipt.notes,
      };
      fileName = `${receipt.receipt_number}.json`;
    }

    if (dataToExport) {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const currentStatus = type === "invoice" ? invoice?.status : receipt?.payment_status;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 print:border-none print:shadow-none print:max-w-none print:max-h-none"
        >
          {/* Modal Header Actions (Hidden in Print) */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/80 print:hidden">
            <div className="flex items-center gap-3">
              <span className="bg-black text-gold px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase">
                {type === "invoice" ? "Official Invoice" : "Payment Receipt"}
              </span>
              <span className="font-mono text-sm font-bold text-gray-700">
                {type === "invoice" ? invoice?.invoice_number : receipt?.receipt_number}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-gray-700 hover:text-black transition-colors shadow-sm"
                title="Download JSON (Specification Compliant)"
              >
                <Download size={15} />
                JSON
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gold hover:text-black text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Printer size={15} />
                Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div
            ref={printContentRef}
            className="p-8 md:p-12 overflow-y-auto flex-1 bg-white text-black font-sans print:p-0 print:overflow-visible"
          >
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-gray-100">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-gold font-serif font-black text-xl shadow-md">
                    M
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif font-black tracking-tight text-black">
                      MIDLAND HOTEL
                    </h1>
                    <p className="text-xs font-bold text-gold uppercase tracking-widest">
                      Kayonza, Rwanda
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5 mt-3">
                  <p>{type === "invoice" ? invoice?.vendor.address : receipt?.vendor.address}</p>
                  <p>Email: {type === "invoice" ? invoice?.vendor.email : receipt?.vendor.email}</p>
                  <p>Phone: {type === "invoice" ? invoice?.vendor.phone : receipt?.vendor.phone}</p>
                  <p className="font-semibold text-gray-700">
                    TIN / VAT: {type === "invoice" ? invoice?.vendor.tax_id : receipt?.vendor.tax_id}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <h2 className="text-3xl font-black uppercase tracking-wider text-black font-heading">
                  {type === "invoice" ? "INVOICE" : "RECEIPT"}
                </h2>
                <p className="text-base font-mono font-bold text-gray-800 mt-1">
                  {type === "invoice" ? invoice?.invoice_number : receipt?.receipt_number}
                </p>

                {/* Status Badge */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      currentStatus === "PAID" || currentStatus === "FULLY_PAID"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : currentStatus === "PARTIALLY_PAID"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : currentStatus === "OVERDUE"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : currentStatus === "CANCELLED"
                        ? "bg-gray-200 text-gray-700 border border-gray-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}
                  >
                    {(currentStatus === "PAID" || currentStatus === "FULLY_PAID") && <CheckCircle size={13} />}
                    {currentStatus === "PARTIALLY_PAID" && <Clock size={13} />}
                    {currentStatus === "OVERDUE" && <AlertTriangle size={13} />}
                    {currentStatus}
                  </span>
                </div>

                <div className="text-xs text-gray-600 mt-4 space-y-1">
                  {type === "invoice" && invoice ? (
                    <>
                      <p>
                        <strong className="text-gray-900">Issue Date:</strong> {invoice.issue_date}
                      </p>
                      <p>
                        <strong className="text-gray-900">Due Date:</strong> {invoice.due_date}
                      </p>
                      {invoice.order_id && (
                        <p>
                          <strong className="text-gray-900">Booking Ref:</strong> {invoice.order_id}
                        </p>
                      )}
                    </>
                  ) : (
                    receipt && (
                      <>
                        <p>
                          <strong className="text-gray-900">Payment Date:</strong> {receipt.payment_date}
                        </p>
                        <p>
                          <strong className="text-gray-900">Invoice Ref:</strong>{" "}
                          {receipt.invoice_reference_id}
                        </p>
                        {receipt.order_id && (
                          <p>
                            <strong className="text-gray-900">Booking Ref:</strong> {receipt.order_id}
                          </p>
                        )}
                      </>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Bill To / Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 p-6 bg-gray-50/80 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <User size={14} /> Customer Information (Bill To)
                </p>
                <div className="text-sm">
                  <p className="font-black text-black text-base">
                    {type === "invoice" ? invoice?.customer.name : receipt?.customer.name}
                  </p>
                  <p className="text-gray-600 font-mono text-xs mt-0.5">
                    ID: {type === "invoice" ? invoice?.customer.customer_id : receipt?.customer.customer_id}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {type === "invoice" ? invoice?.customer.email : receipt?.customer.email}
                  </p>
                  {(type === "invoice" ? invoice?.customer.phone : receipt?.customer.phone) && (
                    <p className="text-gray-600">
                      {type === "invoice" ? invoice?.customer.phone : receipt?.customer.phone}
                    </p>
                  )}
                  {(type === "invoice" ? invoice?.customer.address : receipt?.customer.address) && (
                    <p className="text-gray-500 text-xs mt-1">
                      {type === "invoice" ? invoice?.customer.address : receipt?.customer.address}
                    </p>
                  )}
                  {(type === "invoice" ? invoice?.customer.tax_id : receipt?.customer.tax_id) && (
                    <p className="text-gray-600 text-xs font-medium mt-1">
                      Tax/VAT ID: {type === "invoice" ? invoice?.customer.tax_id : receipt?.customer.tax_id}
                    </p>
                  )}
                </div>
              </div>

              {type === "receipt" && receipt ? (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <CreditCard size={14} /> Payment Confirmation Details
                  </p>
                  <div className="text-sm space-y-1.5 bg-white p-4 rounded-xl border border-gray-200">
                    <p className="flex justify-between">
                      <span className="text-gray-500 text-xs">Payment Method:</span>
                      <span className="font-bold text-black uppercase">{receipt.payment_method.replace("_", " ")}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500 text-xs">Txn Reference:</span>
                      <span className="font-mono font-bold text-black text-xs">{receipt.transaction_reference}</span>
                    </p>
                    <p className="flex justify-between border-t border-gray-100 pt-1.5">
                      <span className="text-gray-500 text-xs">Amount Received:</span>
                      <span className="font-black text-green-700 text-base">{formatCurrency(receipt.amount_received)}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Building2 size={14} /> Payment Terms & Account Info
                  </p>
                  <div className="text-xs text-gray-600 space-y-1 bg-white p-4 rounded-xl border border-gray-200">
                    <p>
                      <strong className="text-gray-900">Terms:</strong> {invoice?.payment_terms}
                    </p>
                    <p>
                      <strong className="text-gray-900">Bank:</strong> {invoice?.vendor.bank_name}
                    </p>
                    <p>
                      <strong className="text-gray-900">A/C Name:</strong> {invoice?.vendor.account_name}
                    </p>
                    <p className="font-mono">
                      <strong className="text-gray-900">A/C No:</strong> {invoice?.vendor.account_number}
                    </p>
                    <p>
                      <strong className="text-gray-900">MTN MoMo:</strong> {invoice?.vendor.momo_code}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Line Items Table (For Invoice) */}
            {type === "invoice" && invoice && (
              <div className="my-8 overflow-hidden rounded-2xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black text-white text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Item & Description</th>
                      <th className="px-4 py-4 text-center">Qty</th>
                      <th className="px-4 py-4 text-right">Unit Price</th>
                      <th className="px-4 py-4 text-right">Discount</th>
                      <th className="px-4 py-4 text-right">Tax (18%)</th>
                      <th className="px-6 py-4 text-right">Net Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-black">{item.description}</p>
                          <p className="text-xs text-gray-400 font-mono">{item.item_id}</p>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-gray-800">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-gray-700">
                          {formatCurrency(item.unit_price, invoice.currency)}
                        </td>
                        <td className="px-4 py-4 text-right text-red-600">
                          {item.discount_amount > 0 ? `-${formatCurrency(item.discount_amount, invoice.currency)}` : "-"}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {formatCurrency(item.tax_amount, invoice.currency)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-black">
                          {formatCurrency(item.line_total, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Calculations Summary Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-8 my-8">
              {/* Notes & Instructions */}
              <div className="w-full sm:w-1/2 space-y-4">
                {type === "invoice" && invoice?.notes && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <p className="font-bold uppercase tracking-wider text-gray-500 mb-1">Notes & Remarks</p>
                    <p className="text-gray-700">{invoice.notes}</p>
                  </div>
                )}
                {type === "receipt" && receipt?.notes && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <p className="font-bold uppercase tracking-wider text-gray-500 mb-1">Receipt Notes</p>
                    <p className="text-gray-700">{receipt.notes}</p>
                  </div>
                )}
                {type === "invoice" && invoice?.payment_instructions && (
                  <div className="p-4 bg-gold/10 rounded-xl border border-gold/30 text-xs">
                    <p className="font-bold uppercase tracking-wider text-black mb-1">Payment Instructions</p>
                    <p className="text-gray-800 font-medium">{invoice.payment_instructions}</p>
                  </div>
                )}
              </div>

              {/* Totals Table */}
              <div className="w-full sm:w-80 space-y-2 text-sm bg-gray-50 p-6 rounded-2xl border border-gray-200">
                {type === "invoice" && invoice ? (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(invoice.summary.subtotal, invoice.currency)}</span>
                    </div>
                    {invoice.summary.total_discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Total Discount:</span>
                        <span className="font-bold">-{formatCurrency(invoice.summary.total_discount, invoice.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600 text-xs">
                      <span>Taxable Amount:</span>
                      <span className="font-semibold">{formatCurrency(invoice.summary.taxable_amount, invoice.currency)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Total VAT (18%):</span>
                      <span className="font-bold text-gray-900">{formatCurrency(invoice.summary.total_tax, invoice.currency)}</span>
                    </div>
                    {invoice.summary.shipping_fee > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Service / Extra Fee:</span>
                        <span className="font-bold">{formatCurrency(invoice.summary.shipping_fee, invoice.currency)}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-300 pt-2.5 flex justify-between text-base font-black text-black">
                      <span>Grand Total:</span>
                      <span className="text-lg">{formatCurrency(invoice.summary.grand_total, invoice.currency)}</span>
                    </div>
                    <div className="flex justify-between text-green-700 text-sm font-semibold pt-1">
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(invoice.summary.amount_paid, invoice.currency)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-red-600">
                      <span>Balance Due:</span>
                      <span>{formatCurrency(invoice.summary.balance_due, invoice.currency)}</span>
                    </div>
                  </>
                ) : (
                  receipt && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Original Invoice Total:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(receipt.total_invoice_amount)}</span>
                      </div>
                      <div className="flex justify-between text-green-700 font-bold border-t border-gray-200 pt-2">
                        <span>Amount Paid This Receipt:</span>
                        <span className="text-base">{formatCurrency(receipt.amount_received)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700 text-xs">
                        <span>Cumulative Total Paid:</span>
                        <span className="font-semibold">{formatCurrency(receipt.total_paid_to_date)}</span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-sm font-black text-black">
                        <span>Remaining Balance:</span>
                        <span className={receipt.remaining_balance > 0 ? "text-red-600" : "text-green-700"}>
                          {formatCurrency(receipt.remaining_balance)}
                        </span>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Document Footer / Official Sign-off */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
              <div>
                <p className="font-serif italic text-gray-500">
                  "Excellence in hospitality and corporate comfort."
                </p>
                <p className="text-[10px] mt-1 text-gray-400">
                  Generated by Midland Hotel Financial System. Document is officially registered and valid.
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="inline-block border-b border-black w-40 pb-1 mb-1"></div>
                <p className="text-[11px] font-bold text-gray-700 uppercase">Authorized Finance Officer</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
