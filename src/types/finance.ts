export type InvoiceStatus = 
  | "DRAFT"
  | "ISSUED"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type ReceiptStatus = 
  | "PAID"
  | "PARTIALLY_PAID"
  | "REFUNDED";

export type PaymentMethod = 
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "CASH"
  | "CHEQUE"
  | "OTHER";

export type CurrencyCode = "USD" | "RWF" | "EUR" | "UGX" | "GBP";

export interface VendorInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string; // e.g. TIN / VAT number
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  swift_code?: string;
  momo_code?: string; // Mobile Money Merchant Code
}

export interface CustomerInfo {
  customer_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tax_id?: string;
}

export interface InvoiceLineItem {
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number; // Discount per item or absolute line discount
  tax_rate_percent: number; // e.g., 18 for 18% VAT
  tax_amount: number; // calculated: (quantity * unit_price - discount_amount) * (tax_rate_percent / 100)
  line_gross_total: number; // quantity * unit_price
  line_after_discount: number; // line_gross_total - discount_amount
  line_total: number; // line_after_discount + tax_amount
}

export interface InvoiceSummary {
  subtotal: number; // SUM(line_gross_total)
  total_discount: number; // SUM(discount_amount) + global_discount
  taxable_amount: number; // subtotal - total_discount
  total_tax: number; // SUM(tax_amount)
  shipping_fee: number; // extra fees (service charge/delivery)
  grand_total: number; // taxable_amount + total_tax + shipping_fee
  amount_paid: number; // total_paid_to_date
  balance_due: number; // grand_total - amount_paid
}

export interface Invoice {
  id: string; // Internal unique ID
  invoice_number: string; // e.g. INV-2026-0001
  issue_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  status: InvoiceStatus;
  currency: CurrencyCode;
  vendor: VendorInfo;
  customer: CustomerInfo;
  items: InvoiceLineItem[];
  summary: InvoiceSummary;
  global_discount?: number;
  shipping_fee?: number;
  payment_terms: string; // e.g., "Due on Receipt", "Net 30", "Net 15"
  payment_instructions?: string;
  notes?: string;
  order_id?: string; // Optional linked Booking ID (e.g. MH-2026-001)
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string; // Internal unique ID
  receipt_number: string; // e.g. REC-2026-0001
  invoice_reference_id: string; // Associated invoice number, e.g. INV-2026-0001
  order_id?: string; // Associated order/booking ID
  payment_date: string; // YYYY-MM-DD HH:mm:ss
  payment_method: PaymentMethod;
  transaction_reference: string; // e.g. TXN-8941203 or MOMO-558291
  amount_received: number;
  vendor: VendorInfo;
  customer: CustomerInfo;
  total_invoice_amount: number;
  total_paid_to_date: number;
  remaining_balance: number;
  payment_status: "FULLY_PAID" | "PARTIALLY_PAID" | "REFUNDED";
  notes?: string;
  created_at: string;
}

export interface PaymentSubmission {
  invoice_number: string;
  amount_received: number;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  payment_date?: string;
  notes?: string;
}
