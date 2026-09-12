import {
  CurrencyCode,
  Invoice,
  InvoiceLineItem,
  InvoiceSummary,
  PaymentMethod,
  Receipt,
  VendorInfo,
} from "@/types/finance";

export const DEFAULT_VENDOR: VendorInfo = {
  name: "Midland Hotel Kayonza",
  email: "billing@midlandhotel.rw",
  phone: "+250 788 123 456",
  address: "Kayonza Commercial Center, Eastern Province, Rwanda",
  tax_id: "TIN-102938475",
  bank_name: "Bank of Kigali (BK)",
  account_name: "Midland Hotel Ltd",
  account_number: "00045-0129384-88",
  swift_code: "BKIGRWRW",
  momo_code: "*182*8*1*558291# (MIDLAND HOTEL)",
};

export interface ServicePreset {
  id: string;
  name: string;
  category: "Accommodation" | "Dining" | "Conference" | "Wellness" | "Transport" | "Other";
  unit_price: number;
  tax_rate_percent: number;
}

export const HOTEL_SERVICE_PRESETS: ServicePreset[] = [
  { id: "SR-01", name: "Standard Room (Nightly)", category: "Accommodation", unit_price: 80, tax_rate_percent: 18 },
  { id: "DR-01", name: "Deluxe Room (Nightly)", category: "Accommodation", unit_price: 120, tax_rate_percent: 18 },
  { id: "ER-01", name: "Executive Room (Nightly)", category: "Accommodation", unit_price: 150, tax_rate_percent: 18 },
  { id: "ST-01", name: "Presidential Suite (Nightly)", category: "Accommodation", unit_price: 300, tax_rate_percent: 18 },
  { id: "CH-01", name: "Conference Hall Rental (Full Day)", category: "Conference", unit_price: 450, tax_rate_percent: 18 },
  { id: "CH-02", name: "Conference Hall Rental (Half Day)", category: "Conference", unit_price: 250, tax_rate_percent: 18 },
  { id: "CAT-01", name: "Executive Catering / Buffet (Per Person)", category: "Dining", unit_price: 35, tax_rate_percent: 18 },
  { id: "CB-01", name: "Coffee Break & Pastries Package", category: "Dining", unit_price: 12, tax_rate_percent: 18 },
  { id: "GYM-01", name: "Gym & Fitness Day Pass", category: "Wellness", unit_price: 15, tax_rate_percent: 18 },
  { id: "SPA-01", name: "Spa & Soloon Full Body Treatment", category: "Wellness", unit_price: 60, tax_rate_percent: 18 },
  { id: "TR-01", name: "Kigali Airport Shuttle Transfer", category: "Transport", unit_price: 75, tax_rate_percent: 18 },
  { id: "LND-01", name: "Express Guest Laundry Service", category: "Other", unit_price: 25, tax_rate_percent: 18 },
];

/**
 * Helper to round to 2 decimal places reliably.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Section 4 Formula Implementations:
 * 1. line_gross_total = quantity * unit_price
 * 2. line_after_discount = line_gross_total - discount_amount
 * 3. line_tax_amount = line_after_discount * (tax_rate_percent / 100)
 * 4. line_net_total = line_after_discount + line_tax_amount
 */
export function calculateLineItem(
  item: Omit<InvoiceLineItem, "tax_amount" | "line_gross_total" | "line_after_discount" | "line_total">
): InvoiceLineItem {
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const unit_price = Math.max(0, Number(item.unit_price) || 0);
  const discount_amount = Math.max(0, Number(item.discount_amount) || 0);
  const tax_rate_percent = Math.max(0, Number(item.tax_rate_percent) || 0);

  const line_gross_total = round2(quantity * unit_price);
  const line_after_discount = round2(Math.max(0, line_gross_total - discount_amount));
  const tax_amount = round2(line_after_discount * (tax_rate_percent / 100));
  const line_total = round2(line_after_discount + tax_amount);

  return {
    ...item,
    quantity,
    unit_price,
    discount_amount,
    tax_rate_percent,
    tax_amount,
    line_gross_total,
    line_after_discount,
    line_total,
  };
}

/**
 * Section 4 Document Calculations:
 * 1. subtotal = SUM(line_gross_total for all items)
 * 2. total_discount = SUM(discount_amount for all items) + global_discount
 * 3. taxable_amount = subtotal - total_discount
 * 4. total_tax = SUM(line_tax_amount for all items)
 * 5. grand_total = taxable_amount + total_tax + shipping_fee
 * 6. balance_due = grand_total - total_paid_to_date
 */
export function calculateInvoiceSummary(
  items: InvoiceLineItem[],
  global_discount = 0,
  shipping_fee = 0,
  amount_paid = 0
): InvoiceSummary {
  const recalculatedItems = items.map((it) => calculateLineItem(it));

  const subtotal = round2(
    recalculatedItems.reduce((acc, it) => acc + it.line_gross_total, 0)
  );

  const itemDiscounts = recalculatedItems.reduce(
    (acc, it) => acc + it.discount_amount,
    0
  );
  const total_discount = round2(itemDiscounts + Math.max(0, global_discount));

  const taxable_amount = round2(Math.max(0, subtotal - total_discount));

  const total_tax = round2(
    recalculatedItems.reduce((acc, it) => acc + it.tax_amount, 0)
  );

  const grand_total = round2(
    taxable_amount + total_tax + Math.max(0, shipping_fee)
  );

  const safeAmountPaid = round2(Math.max(0, amount_paid));
  const balance_due = round2(Math.max(0, grand_total - safeAmountPaid));

  return {
    subtotal,
    total_discount,
    taxable_amount,
    total_tax,
    shipping_fee: round2(shipping_fee),
    grand_total,
    amount_paid: safeAmountPaid,
    balance_due,
  };
}

/**
 * Format currency display
 */
export function formatCurrency(amount: number, currency: CurrencyCode = "USD"): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  switch (currency) {
    case "USD":
      return `$${formatted}`;
    case "RWF":
      return `${formatted} RWF`;
    case "EUR":
      return `€${formatted}`;
    case "UGX":
      return `${formatted} UGX`;
    case "GBP":
      return `£${formatted}`;
    default:
      return `${currency} ${formatted}`;
  }
}

/**
 * Generate unique sequential Invoice Number: INV-YYYY-XXXX
 */
export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
  const currentYear = new Date().getFullYear();
  const yearPattern = new RegExp(`^INV-${currentYear}-(\\d+)$`);
  let maxSeq = 0;

  for (const inv of existingInvoices) {
    const match = inv.invoice_number.match(yearPattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, "0");
  return `INV-${currentYear}-${nextSeq}`;
}

/**
 * Generate unique sequential Receipt Number: REC-YYYY-XXXX
 */
export function generateReceiptNumber(existingReceipts: Receipt[]): string {
  const currentYear = new Date().getFullYear();
  const yearPattern = new RegExp(`^REC-${currentYear}-(\\d+)$`);
  let maxSeq = 0;

  for (const rec of existingReceipts) {
    const match = rec.receipt_number.match(yearPattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, "0");
  return `REC-${currentYear}-${nextSeq}`;
}

/**
 * Generate realistic Transaction Reference based on payment method
 */
export function generateTxnReference(method: PaymentMethod): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  switch (method) {
    case "MOBILE_MONEY":
      return `MOMO-${randomDigits}`;
    case "BANK_TRANSFER":
      return `BK-TXN-${randomDigits}`;
    case "CREDIT_CARD":
      return `CC-AUTH-${randomDigits}`;
    case "CASH":
      return `CSH-REC-${randomDigits}`;
    case "CHEQUE":
      return `CHQ-${randomDigits}`;
    default:
      return `TXN-${randomDigits}`;
  }
}
