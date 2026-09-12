"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useFinance } from "@/context/FinanceContext";
import { Invoice, InvoiceStatus } from "@/types/finance";
import { formatCurrency } from "@/lib/financeCalculations";
import InvoiceModal from "@/components/finance/InvoiceModal";
import ReceiptModal from "@/components/finance/ReceiptModal";
import PrintableDocumentModal from "@/components/finance/PrintableDocumentModal";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  CreditCard,
  Edit2,
  Trash2,
  Download,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

export default function InvoicesPage() {
  const { invoices, deleteInvoice, cancelInvoice } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [targetInvoiceForPayment, setTargetInvoiceForPayment] = useState<Invoice | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Financial KPI Calculations
  const totalInvoiced = invoices
    .filter((i) => i.status !== "CANCELLED")
    .reduce((acc, i) => acc + i.summary.grand_total, 0);

  const totalCollected = invoices
    .filter((i) => i.status !== "CANCELLED")
    .reduce((acc, i) => acc + i.summary.amount_paid, 0);

  const totalOutstanding = invoices
    .filter((i) => i.status !== "CANCELLED")
    .reduce((acc, i) => acc + i.summary.balance_due, 0);

  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customer.customer_id &&
        inv.customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.order_id && inv.order_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      inv.status === statusFilter ||
      (statusFilter === "UNPAID_ALL" &&
        (inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID" || inv.status === "ISSUED" || inv.status === "OVERDUE"));

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (inv: Invoice) => {
    setInvoiceToEdit(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenNewInvoice = () => {
    setInvoiceToEdit(null);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenPayment = (inv: Invoice) => {
    setTargetInvoiceForPayment(inv);
    setIsReceiptModalOpen(true);
  };

  const handleOpenPrint = (inv: Invoice) => {
    setSelectedInvoiceForPrint(inv);
    setIsPrintModalOpen(true);
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
                <FileText size={24} />
              </div>
              <h1 className="text-4xl font-heading font-black text-black">
                Invoice Management
              </h1>
            </div>
            <p className="text-gray-600 font-medium text-lg">
              Create, track, and process official guest & corporate billing invoices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTargetInvoiceForPayment(null);
                setIsReceiptModalOpen(true);
              }}
              className="bg-white border-2 border-black hover:bg-black hover:text-white text-black px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <CreditCard size={18} />
              Record Payment
            </button>

            <button
              onClick={handleOpenNewInvoice}
              className="bg-black hover:bg-gold hover:text-black text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 group"
            >
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-gold transition-all"
          >
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
              Total Invoiced
            </p>
            <p className="text-3xl font-black text-black">{formatCurrency(totalInvoiced)}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Across {invoices.length} issued documents
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-green-400 transition-all"
          >
            <p className="text-xs text-green-700 font-bold uppercase tracking-widest mb-1">
              Total Collected
            </p>
            <p className="text-3xl font-black text-green-700">{formatCurrency(totalCollected)}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Confirmed via payment receipts
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-amber-400 transition-all"
          >
            <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">
              Outstanding Balance
            </p>
            <p className="text-3xl font-black text-amber-700">{formatCurrency(totalOutstanding)}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Awaiting final settlement</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-red-400 transition-all"
          >
            <p className="text-xs text-red-600 font-bold uppercase tracking-widest mb-1">
              Overdue Accounts
            </p>
            <p className="text-3xl font-black text-red-600">{overdueCount}</p>
            <p className="text-xs text-red-400 mt-2 font-medium">Past specified due date</p>
          </motion.div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Filters & Search Bar */}
          <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/50">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "All Invoices" },
                { id: "ISSUED", label: "Issued" },
                { id: "PARTIALLY_PAID", label: "Partially Paid" },
                { id: "PAID", label: "Fully Paid" },
                { id: "OVERDUE", label: "Overdue" },
                { id: "DRAFT", label: "Drafts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === tab.id
                      ? "bg-black text-gold shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search invoice #, guest, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-xs focus:outline-none focus:border-gold bg-white text-black font-medium w-full sm:w-72 transition-colors"
              />
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Invoice #</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Customer</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Issue / Due Date</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Grand Total</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Balance Due</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Status</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv, idx) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gold/5 transition-colors group"
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-5">
                        <span className="font-mono font-black text-black block">{inv.invoice_number}</span>
                        {inv.order_id && (
                          <span className="text-[11px] text-gray-400 font-mono">Ref: {inv.order_id}</span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900">{inv.customer.name}</p>
                        <p className="text-xs text-gray-400">{inv.customer.email}</p>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-5 text-xs text-gray-600">
                        <p>Issued: <span className="font-medium text-gray-800">{inv.issue_date}</span></p>
                        <p>Due: <span className={`font-medium ${inv.status === "OVERDUE" ? "text-red-600 font-bold" : "text-gray-800"}`}>{inv.due_date}</span></p>
                      </td>

                      {/* Grand Total */}
                      <td className="px-6 py-5 font-black text-black">
                        {formatCurrency(inv.summary.grand_total, inv.currency)}
                      </td>

                      {/* Balance Due */}
                      <td className="px-6 py-5">
                        <span
                          className={`font-black ${
                            inv.summary.balance_due === 0
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(inv.summary.balance_due, inv.currency)}
                        </span>
                        {inv.summary.amount_paid > 0 && inv.summary.balance_due > 0 && (
                          <p className="text-[10px] text-gray-400">
                            Paid: {formatCurrency(inv.summary.amount_paid, inv.currency)}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            inv.status === "PAID"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : inv.status === "PARTIALLY_PAID"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : inv.status === "OVERDUE"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : inv.status === "CANCELLED"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {inv.status === "PAID" && <CheckCircle size={12} />}
                          {inv.status === "PARTIALLY_PAID" && <Clock size={12} />}
                          {inv.status === "OVERDUE" && <AlertTriangle size={12} />}
                          {inv.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print / View */}
                          <button
                            onClick={() => handleOpenPrint(inv)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="View & Print Invoice"
                          >
                            <Printer size={16} />
                          </button>

                          {/* Record Payment */}
                          {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                              title="Record Payment / Issue Receipt"
                            >
                              <CreditCard size={16} />
                            </button>
                          )}

                          {/* Edit */}
                          {inv.status !== "PAID" && (
                            <button
                              onClick={() => handleOpenEdit(inv)}
                              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Invoice"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}

                          {/* Cancel / Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Cancel invoice ${inv.invoice_number}?`)) {
                                cancelInvoice(inv.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center text-gray-500 font-medium text-lg">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceToEdit={invoiceToEdit}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        targetInvoice={targetInvoiceForPayment}
        onReceiptGenerated={(newRec) => {
          // Open the receipt print modal right after creation!
          setIsPrintModalOpen(true);
        }}
      />

      <PrintableDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        type="invoice"
        invoice={selectedInvoiceForPrint}
      />
    </div>
  );
}
