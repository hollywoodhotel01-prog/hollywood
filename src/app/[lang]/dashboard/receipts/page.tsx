"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useFinance } from "@/context/FinanceContext";
import { PaymentMethod, Receipt } from "@/types/finance";
import { formatCurrency } from "@/lib/financeCalculations";
import ReceiptModal from "@/components/finance/ReceiptModal";
import PrintableDocumentModal from "@/components/finance/PrintableDocumentModal";
import {
  Receipt as ReceiptIcon,
  Plus,
  Search,
  CheckCircle,
  Printer,
  Smartphone,
  Building,
  CreditCard,
  DollarSign,
  Download,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReceiptsPage() {
  const { receipts } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<Receipt | null>(null);

  // Financial Stats
  const totalAmountReceived = receipts.reduce((acc, r) => acc + r.amount_received, 0);

  const momoCount = receipts.filter((r) => r.payment_method === "MOBILE_MONEY").length;
  const cardCount = receipts.filter((r) => r.payment_method === "CREDIT_CARD").length;
  const bankCount = receipts.filter((r) => r.payment_method === "BANK_TRANSFER").length;
  const cashCount = receipts.filter((r) => r.payment_method === "CASH").length;

  const filteredReceipts = receipts.filter((rec) => {
    const matchesSearch =
      rec.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.invoice_reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.transaction_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.order_id && rec.order_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === "ALL" || rec.payment_method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const handleOpenPrint = (rec: Receipt) => {
    setSelectedReceiptForPrint(rec);
    setIsPrintModalOpen(true);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "MOBILE_MONEY":
        return <Smartphone size={14} className="text-yellow-600" />;
      case "BANK_TRANSFER":
        return <Building size={14} className="text-blue-600" />;
      case "CREDIT_CARD":
        return <CreditCard size={14} className="text-purple-600" />;
      case "CASH":
        return <DollarSign size={14} className="text-green-600" />;
      default:
        return <ReceiptIcon size={14} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 flex relative">
      <div className="absolute top-0 right-0 w-full h-[300px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <DashboardSidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative z-10">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-black text-gold rounded-xl shadow-md">
                <ReceiptIcon size={24} />
              </div>
              <h1 className="text-4xl font-heading font-black text-black">
                Payment Receipts
              </h1>
            </div>
            <p className="text-gray-600 font-medium text-lg">
              Official proof-of-payment records and transaction confirmations.
            </p>
          </div>

          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="bg-black hover:bg-gold hover:text-black text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 group"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            Issue New Receipt
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-gold transition-all"
          >
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
              Total Receipts Issued
            </p>
            <p className="text-3xl font-black text-black">{receipts.length}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Valid payment confirmations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-green-400 transition-all"
          >
            <p className="text-xs text-green-700 font-bold uppercase tracking-widest mb-1">
              Total Revenue Collected
            </p>
            <p className="text-3xl font-black text-green-700">
              {formatCurrency(totalAmountReceived)}
            </p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Settled to bank/momo</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-amber-400 transition-all"
          >
            <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">
              Mobile Money / MTN
            </p>
            <p className="text-3xl font-black text-black">{momoCount} txns</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Direct merchant payments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-blue-400 transition-all"
          >
            <p className="text-xs text-blue-700 font-bold uppercase tracking-widest mb-1">
              Bank / Card / Cash
            </p>
            <p className="text-3xl font-black text-black">{bankCount + cardCount + cashCount} txns</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Wire transfers & POS terminals</p>
          </motion.div>
        </div>

        {/* Receipts Table Container */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Filters & Search */}
          <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/50">
            {/* Method Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "All Methods" },
                { id: "MOBILE_MONEY", label: "Mobile Money" },
                { id: "BANK_TRANSFER", label: "Bank Transfer" },
                { id: "CREDIT_CARD", label: "Credit Card" },
                { id: "CASH", label: "Cash" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMethodFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    methodFilter === tab.id
                      ? "bg-black text-gold shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search receipt #, invoice #, txn ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-xs focus:outline-none focus:border-gold bg-white text-black font-medium w-full sm:w-72 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Receipt #</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Invoice Ref</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Customer</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Payment Date</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Method & Txn Ref</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Amount Received</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Payment Status</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((rec, idx) => (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gold/5 transition-colors group"
                    >
                      {/* Receipt # */}
                      <td className="px-6 py-5">
                        <span className="font-mono font-black text-black block">{rec.receipt_number}</span>
                      </td>

                      {/* Invoice Ref */}
                      <td className="px-6 py-5 font-mono text-xs font-bold text-gray-700">
                        {rec.invoice_reference_id}
                        {rec.order_id && (
                          <span className="text-[10px] text-gray-400 block">({rec.order_id})</span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{rec.customer.name}</p>
                        <p className="text-xs text-gray-400">{rec.customer.email}</p>
                      </td>

                      {/* Payment Date */}
                      <td className="px-6 py-5 text-xs text-gray-600 font-medium">
                        {rec.payment_date}
                      </td>

                      {/* Method & Txn */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                          {getMethodIcon(rec.payment_method)}
                          {rec.payment_method.replace("_", " ")}
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
                          {rec.transaction_reference}
                        </span>
                      </td>

                      {/* Amount Received */}
                      <td className="px-6 py-5 font-black text-green-700 text-base">
                        {formatCurrency(rec.amount_received)}
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            rec.payment_status === "FULLY_PAID"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <CheckCircle size={12} />
                          {rec.payment_status.replace("_", " ")}
                        </span>
                        {rec.remaining_balance > 0 && (
                          <span className="text-[10px] text-red-600 block mt-0.5 font-semibold">
                            Rem: {formatCurrency(rec.remaining_balance)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleOpenPrint(rec)}
                          className="px-3.5 py-2 bg-black hover:bg-gold hover:text-black text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                        >
                          <Printer size={14} />
                          Print Receipt
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-8 py-16 text-center text-gray-500 font-medium text-lg">
                      No receipts found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onReceiptGenerated={(rec) => {
          setSelectedReceiptForPrint(rec);
          setIsPrintModalOpen(true);
        }}
      />

      <PrintableDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        type="receipt"
        receipt={selectedReceiptForPrint}
      />
    </div>
  );
}
