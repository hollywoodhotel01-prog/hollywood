/**
 * ============================================================
 *  Midland Hotel — Google Sheets Database Setup Script
 *  Sheets: Bookings | Rooms | InHouseGuests | ConferenceBookings
 *          Invoices | InvoiceItems | Receipts | DailySalesReports
 *          Staff | AdminLog
 * ============================================================
 */

const { google } = require("googleapis");

// ── Service Account Credentials ────────────────────────────────────────────────
const credentials = {
  type: "service_account",
  project_id: "directed-gasket-508415-c2",
  private_key_id: "3bdccc6ca6911a14b9d5919d378d54f9b2cec4d1",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3jTg3sH9Y3j0l\nqeUOcAzPb/mrE2bi+mpN9s7UivG6tYx+OxL+lbGQravduqe2LKwcTm7nga3vS4Wa\nnhRfsWiyS3ePxcwUBG5toM/n96wIRy1V9NKw87/YVt374vnuyk5uFyJ1wzTgi0+y\nJ94Bku+j9p14KMZ6W9RpAvvitl8dGU0gNM+PgHOLhwDXrY1GIkoEgy6lt2XM4peR\nlJJzh6+sFY4LmujRbifEp8ZUek8pe2JM9M2moNX9OEhpQtOjZ4KtinHOCKUedAPU\n96KQBky7lcV61JEwr3DGK1C/O3d8evIGUIwC2Wkpvm4nOdyaWK3tm9u6NxB8N+GS\nTn2+fIDbAgMBAAECggEAEI549TEC86msO1L9WdWKmkV/8EoCPFQZNaofEvXrgwtw\nPkym1Hb9Os8nkwsMqLaT2cPLZi+A2HZn+T/sF4uhpX+AK+RMGbwil9nrFwH0rxR4\nhunb/WEnO2TuhhN9tufhtjV5AsVWZjC6whetg1fVLOWIY7fN22igGs7NmLAZmT6x\nYacbd3EaHgqWKxmFrPHQXrd7V4j0fK5vVhg/hji3tFoPtJGNsKdeFivgQorvJAv2\nwJ0+hz8raycMUnuNsU4V523SDryJP8UYoBLEciJ58cFNOcIOB6g3CTWjgO9FA7IJ\nWLKCBQ3JwzavchIdX/Ln6MD5sU+oitKMx4RUgHbpxQKBgQDfqtZY0DZVNSyatMRA\npvOcVM2VuTHstDtHHtWRNULOgk6rh5EAbUqaJ0TzUYg94Kew7Nf4ukpQDVSw6Lle\nY3FuY9TT2msG2SoBidbiF/WtTlbEdXnaYgF/MBlG46eJZCBn+1lrU1nngqcp6oWj\n/TISw0HtYwD2Rb3dDJ7Ki3dlHwKBgQDSFdZ1QEWRob0w8wHc+1u+66wRT/ARgPrO\nbCNsyyccOpFg5aNOWEVMoiEtHKkckP2qHk9oAqzNVXESW7YIiaev+GTPRibaj2m8\nFonEQzE//kPrhGZ7Du8hs6mC+tUg6mH8Zv7kQAnJ4tU9lCKQ0wK2ShPX8HnGAZjC\nljlpEb5QxQKBgDN9UZDqhceB0T3gJVm41VYE07sHAi46o3bQ61tdRn7h0ph8Qe42\nOrlYFvBosZOFFzWMoH9a62aYWwnK2XmYLPG7u6/1lTPjZF8sSzKLT3xRD3p0jNOw\nQiX0fa0rFVN0oF0vqLsjWgwIsNDec1t4G0Hkf1XVt8/56CZuFFQOXTMDAoGAFN2A\nYELS5gTnUm5AOB9q3Epx24JR+JsTzd6log+HQeF7QOFt18EimNrdaqqXDTRFTVkX\nT+A8I2SiB02+hZiOZAbKlF+GSlzGBp1Cb5Cw2oc5XbHXr88q5vD+G/kno85Djxr3\no9nMXxW9UhFdYX7jnRE8aU0D+yt7bZAYAZx2h3UCgYAbmMmu5t6X/7x9y9koqobJ\noYrFQ8aobSg8oO2opL1Jz/j6lL7EMhoZZUw2o64MLpzFCloJe5msFJGQWkWTMdca\nQWu3dJ3dOOvcOidkHCPIUVq0gGv1XO/dUDaMkuMSMXgUaiEWwpCKVBk8WEpagKQs\n/F2uf56brlD27094s92GlQ==\n-----END PRIVATE KEY-----\n",
  client_email:
    "service-account@directed-gasket-508415-c2.iam.gserviceaccount.com",
  client_id: "101293143101321087520",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40directed-gasket-508415-c2.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const SPREADSHEET_ID = "1KNNXk9Wo_HmnKPZjHEmB7AH_jAOoRdk3a26pa081JQw";

// ── Theme Colors (hex without #) ───────────────────────────────────────────────
const COLORS = {
  headerBg: { red: 0.071, green: 0.071, blue: 0.071 },       // #121212 near-black
  headerText: { red: 0.984, green: 0.749, blue: 0.141 },      // #FBBF24 gold
  subheaderBg: { red: 0.18, green: 0.18, blue: 0.18 },        // #2E2E2E dark gray
  subheaderText: { red: 1, green: 1, blue: 1 },               // white
  altRowBg: { red: 0.973, green: 0.973, blue: 0.973 },        // #F8F8F8 very light gray
  tableBorder: { red: 0.8, green: 0.8, blue: 0.8 },           // light border
  accentGold: { red: 0.984, green: 0.749, blue: 0.141 },      // gold accent
};

// ── Sheet Definitions ──────────────────────────────────────────────────────────
const SHEETS = [
  {
    name: "📋 Bookings",
    tabColor: { red: 0.2, green: 0.6, blue: 1.0 },
    sectionTitle: "ROOM BOOKINGS — Midland Hotel Kayonza",
    columns: [
      "Booking ID", "Guest Name", "Room Type", "Room Price/Night (USD)",
      "Check-In Date", "Check-Out Date", "Nights", "Total Amount (USD)",
      "Status", "Created At", "Notes"
    ],
    data: [
      ["HH-2026-001", "Alice Johnson", "Deluxe Room", 120, "2026-07-20", "2026-07-23", 3, 360, "Confirmed", "2026-07-20T10:00:00Z", "VIP guest, top floor"],
      ["HH-2026-002", "Michael Smith", "Executive Room", 150, "2026-07-15", "2026-07-18", 3, 450, "Confirmed", "2026-07-15T09:00:00Z", ""],
      ["HH-2026-003", "Sarah Connor", "Standard Room", 80, "2026-07-25", "2026-07-27", 2, 160, "Pending", "2026-07-25T11:00:00Z", "Awaiting arrival confirmation"],
      ["HH-2026-004", "David Kim", "Hollywood Suite", 300, "2026-08-01", "2026-08-05", 4, 1200, "Confirmed", "2026-08-01T14:00:00Z", "2 guests"],
      ["HH-2026-005", "Emma Brown", "Deluxe Room", 120, "2026-07-18", "2026-07-20", 2, 240, "Cancelled", "2026-07-18T08:00:00Z", "Cancelled by guest"],
      ["HH-2026-006", "Robert Hayes", "Presidential Suite", 800, "2026-08-10", "2026-08-14", 4, 3200, "Confirmed", "2026-08-10T12:00:00Z", "Diplomatic visit"],
    ],
  },

  {
    name: "🛏️ Rooms",
    tabColor: { red: 0.4, green: 0.8, blue: 0.4 },
    sectionTitle: "ROOM INVENTORY & STATUS — Midland Hotel Kayonza",
    columns: [
      "Room Number", "Room Type", "Price/Night (USD)", "Status",
      "Housekeeper", "Last Updated", "Floor", "Max Guests", "Notes"
    ],
    data: [
      ["101", "Standard Room", 80, "Occupied", "Jane Doe", "2026-09-12", 1, 2, ""],
      ["102", "Standard Room", 80, "Available", "Jane Doe", "2026-09-12", 1, 2, ""],
      ["103", "Standard Room", 80, "Cleaning", "Jane Doe", "2026-09-12", 1, 2, ""],
      ["201", "Deluxe Room", 120, "Occupied", "John Smith", "2026-09-12", 2, 2, "Sea view"],
      ["202", "Deluxe Room", 120, "Available", "John Smith", "2026-09-12", 2, 2, ""],
      ["203", "Deluxe Room", 120, "Cleaning", "John Smith", "2026-09-12", 2, 2, ""],
      ["301", "Executive Room", 150, "Occupied", "Mary Johnson", "2026-09-12", 3, 3, ""],
      ["302", "Executive Room", 150, "Maintenance", "-", "2026-09-12", 3, 3, "AC repair"],
      ["303", "Executive Room", 150, "Available", "Mary Johnson", "2026-09-12", 3, 3, ""],
      ["401", "Hollywood Suite", 300, "Occupied", "Jane Doe", "2026-09-12", 4, 4, "Living room + bedroom"],
      ["402", "Hollywood Suite", 300, "Available", "Jane Doe", "2026-09-12", 4, 4, ""],
      ["501", "Presidential Suite", 800, "Available", "Mary Johnson", "2026-09-12", 5, 6, "Full butler service"],
      ["502", "Presidential Suite", 800, "Occupied", "Mary Johnson", "2026-09-12", 5, 6, ""],
    ],
  },

  {
    name: "🧾 InHouseGuests",
    tabColor: { red: 0.6, green: 0.4, blue: 1.0 },
    sectionTitle: "IN-HOUSE GUESTS — Receptionist Register",
    columns: [
      "Guest ID", "Full Name", "ID / Passport No.", "Phone",
      "Nationality", "Room Assigned", "Guest Count",
      "Check-In Date", "Check-Out Date", "Checked-In At", "Status"
    ],
    data: [
      ["IG-001", "Alice Johnson", "NID-RW-123456", "+250 700 111 222", "Rwandan", "101", 1, "2026-07-20", "2026-07-23", "2026-07-20T10:30:00Z", "In-House"],
      ["IG-002", "David Kim", "PP-KR-AB123456", "+82 10 1234 5678", "South Korean", "401", 2, "2026-08-01", "2026-08-05", "2026-08-01T14:00:00Z", "In-House"],
    ],
  },

  {
    name: "🏛️ ConferenceBookings",
    tabColor: { red: 1.0, green: 0.6, blue: 0.2 },
    sectionTitle: "CONFERENCE & EVENT BOOKINGS — Receptionist / Admin",
    columns: [
      "Booking ID", "Contact Name", "Phone", "Event Type", "Hall / Venue",
      "Expected Guests", "Event Date", "Special Requirements", "Status", "Created At"
    ],
    data: [
      ["CB-2026-001", "Lucia Fernandez", "+250 781 234 567", "Corporate Meeting", "Executive Boardroom", 20, "2026-08-05", "Projector, whiteboard", "Confirmed", "2026-07-28T09:00:00Z"],
      ["CB-2026-002", "Peter Nkomo", "+250 782 345 678", "Training / Workshop", "Grand Ballroom", 120, "2026-08-12", "Tea break catering", "Pending", "2026-08-01T10:30:00Z"],
    ],
  },

  {
    name: "🧾 Invoices",
    tabColor: { red: 0.2, green: 0.7, blue: 0.5 },
    sectionTitle: "INVOICES — Accountant Module",
    columns: [
      "Invoice ID", "Invoice Number", "Order / Booking Ref",
      "Issue Date", "Due Date", "Status", "Currency",
      "Customer Name", "Customer Email", "Customer Phone", "Customer Address", "Customer Tax ID",
      "Subtotal (USD)", "Total Discount (USD)", "Taxable Amount (USD)",
      "Total Tax (USD)", "Shipping / Service Fee (USD)", "Grand Total (USD)",
      "Amount Paid (USD)", "Balance Due (USD)",
      "Payment Terms", "Payment Instructions", "Notes",
      "Created At", "Updated At"
    ],
    data: [
      [
        "inv-seed-1", "INV-2026-0001", "MH-2026-001",
        "2026-07-20", "2026-08-04", "PAID", "USD",
        "Alice Johnson", "alice.johnson@example.com", "+250 788 111 222", "Kigali, Rwanda", "",
        396.00, 20.00, 376.00, 67.68, 0.00, 443.68, 443.68, 0.00,
        "Due on Receipt", "Paid via Credit Card TXN-941203", "VIP guest requested top floor quiet room.",
        "2026-07-20T10:00:00Z", "2026-07-20T10:30:00Z"
      ],
      [
        "inv-seed-2", "INV-2026-0002", "MH-2026-002",
        "2026-08-15", "2026-08-30", "PARTIALLY_PAID", "USD",
        "Michael Smith", "m.smith@globalcorp.com", "+250 788 333 444", "Nairobi, Kenya", "PIN-P0512849",
        2650.00, 150.00, 2500.00, 450.00, 50.00, 3000.00, 1500.00, 1500.00,
        "50% Advance, Balance Net 15", "Settle to Bank of Kigali A/C: 00045-0129384-88", "Corporate Annual Strategy Retreat.",
        "2026-08-15T09:15:00Z", "2026-08-16T14:20:00Z"
      ],
      [
        "inv-seed-3", "INV-2026-0003", "MH-2026-003",
        "2026-08-25", "2026-09-08", "UNPAID", "USD",
        "Sarah Connor", "sarah.c@techsol.io", "+250 788 555 666", "Musanze, Rwanda", "",
        160.00, 0.00, 160.00, 28.80, 0.00, 188.80, 0.00, 188.80,
        "Due on Arrival / Check-in", "MTN MoMo: *182*8*1*558291#", "Awaiting arrival confirmation.",
        "2026-08-25T11:45:00Z", "2026-08-25T11:45:00Z"
      ],
      [
        "inv-seed-4", "INV-2026-0004", "MH-2026-004",
        "2026-08-01", "2026-08-15", "OVERDUE", "USD",
        "David Kim", "david.kim@innovate.kr", "+250 788 777 888", "Seoul / Kigali", "",
        1350.00, 100.00, 1250.00, 225.00, 0.00, 1475.00, 0.00, 1475.00,
        "Net 14", "Bank wire to Midland Hotel. Follow-up sent.", "Overdue — follow-up email sent by accounting.",
        "2026-08-01T08:00:00Z", "2026-08-16T09:00:00Z"
      ],
    ],
  },

  {
    name: "📦 InvoiceItems",
    tabColor: { red: 0.3, green: 0.8, blue: 0.6 },
    sectionTitle: "INVOICE LINE ITEMS — Accountant Detail View",
    columns: [
      "Invoice Number", "Item ID", "Description",
      "Quantity", "Unit Price (USD)", "Discount (USD)", "Tax Rate (%)",
      "Tax Amount (USD)", "Line Gross Total (USD)", "Line After Discount (USD)", "Line Total (USD)"
    ],
    data: [
      ["INV-2026-0001", "DR-01", "Deluxe Room Accommodation (3 Nights)", 3, 120, 20, 18, 61.20, 360, 340, 401.20],
      ["INV-2026-0001", "CB-01", "Breakfast & Special Coffee Package", 3, 12, 0, 18, 6.48, 36, 36, 42.48],
      ["INV-2026-0002", "CH-01", "Conference Hall Rental (Full Day)", 2, 450, 50, 18, 153.00, 900, 850, 1003.00],
      ["INV-2026-0002", "CAT-01", "Executive Catering / Buffet (25 Delegates x 2 Days)", 50, 35, 100, 18, 297.00, 1750, 1650, 1947.00],
      ["INV-2026-0003", "SR-01", "Standard Room Stay (2 Nights)", 2, 80, 0, 18, 28.80, 160, 160, 188.80],
      ["INV-2026-0004", "ST-01", "Presidential Suite (4 Nights)", 4, 300, 100, 18, 198.00, 1200, 1100, 1298.00],
      ["INV-2026-0004", "TR-01", "Airport VIP Transfer Service", 2, 75, 0, 18, 27.00, 150, 150, 177.00],
    ],
  },

  {
    name: "💳 Receipts",
    tabColor: { red: 0.0, green: 0.5, blue: 0.8 },
    sectionTitle: "PAYMENT RECEIPTS — Accountant / Cashier",
    columns: [
      "Receipt ID", "Receipt Number", "Invoice Reference", "Order / Booking Ref",
      "Payment Date", "Payment Method", "Transaction Reference",
      "Amount Received (USD)", "Total Invoice Amount (USD)",
      "Total Paid To Date (USD)", "Remaining Balance (USD)", "Payment Status",
      "Customer Name", "Customer Email",
      "Notes", "Created At"
    ],
    data: [
      [
        "rec-seed-1", "REC-2026-0001", "INV-2026-0001", "MH-2026-001",
        "2026-07-20 10:30:00", "CREDIT_CARD", "CC-AUTH-941203",
        443.68, 443.68, 443.68, 0.00, "FULLY_PAID",
        "Alice Johnson", "alice.johnson@example.com",
        "Visa Card via POS Terminal 1", "2026-07-20T10:30:00Z"
      ],
      [
        "rec-seed-2", "REC-2026-0002", "INV-2026-0002", "MH-2026-002",
        "2026-08-16 14:20:00", "BANK_TRANSFER", "BK-TXN-718294",
        1500.00, 3000.00, 1500.00, 1500.00, "PARTIALLY_PAID",
        "Michael Smith", "m.smith@globalcorp.com",
        "50% advance via Bank of Kigali Swift transfer", "2026-08-16T14:20:00Z"
      ],
    ],
  },

  {
    name: "📊 DailySalesReports",
    tabColor: { red: 0.8, green: 0.3, blue: 0.5 },
    sectionTitle: "DAILY SALES REPORTS — Cashier / POS Upload",
    columns: [
      "Report Date", "Total Sales (USD)", "Total Orders",
      "Food Sales (USD)", "Drinks Sales (USD)", "Room Service (USD)", "Bar Sales (USD)",
      "Cash Payments (USD)", "Mobile Money (USD)", "Card Payments (USD)",
      "Top Item 1", "Top Item 1 Qty", "Top Item 1 Amount (USD)",
      "Top Item 2", "Top Item 2 Qty", "Top Item 2 Amount (USD)",
      "Top Item 3", "Top Item 3 Qty", "Top Item 3 Amount (USD)",
      "vs Yesterday (%)", "Uploaded By", "Upload Timestamp"
    ],
    data: [
      [
        "2026-09-11", 685, 42,
        230, 120, 95, 240,
        170, 280, 235,
        "Grilled Tilapia Platter", 10, 150,
        "Hollywood Club Sandwich", 14, 112,
        "Signature Cocktail", 18, 162,
        "+12%", "Sandra Mbeki", "2026-09-11T23:55:00Z"
      ],
      [
        "2026-09-10", 612, 38,
        200, 105, 80, 227,
        150, 240, 222,
        "Breakfast Buffet", 22, 110,
        "Espresso / Coffee", 35, 70,
        "Grilled Tilapia Platter", 8, 120,
        "-3%", "Sandra Mbeki", "2026-09-10T23:50:00Z"
      ],
    ],
  },

  {
    name: "👥 Staff",
    tabColor: { red: 0.5, green: 0.5, blue: 0.9 },
    sectionTitle: "STAFF ACCOUNTS — Admin Directory",
    columns: [
      "Staff ID", "Full Name", "Role", "Email",
      "Phone", "Department", "Date Joined",
      "Status", "Last Login", "Notes"
    ],
    data: [
      ["STF-001", "Victor Adonis", "Admin", "admin@hollywoodhotel.com", "+250 700 001 001", "Management", "2024-01-01", "Active", "", "General Manager"],
      ["STF-002", "Sandra Mbeki", "Cashier", "cashier@hollywoodhotel.com", "+250 700 002 002", "Finance", "2024-03-15", "Active", "", "POS & Daily Reports"],
      ["STF-003", "James Osei", "Receptionist", "reception@hollywoodhotel.com", "+250 700 003 003", "Front Desk", "2024-02-01", "Active", "", "Guest check-in/out"],
      ["STF-004", "Grace Mutua", "Accountant", "accounts@hollywoodhotel.com", "+250 700 004 004", "Finance", "2024-01-20", "Active", "", "Invoices & receipts"],
    ],
  },

  {
    name: "🗂️ AdminLog",
    tabColor: { red: 0.6, green: 0.6, blue: 0.6 },
    sectionTitle: "ADMIN ACTIVITY LOG — Audit Trail",
    columns: [
      "Log ID", "Timestamp", "Staff Name", "Staff Role",
      "Action", "Module", "Record Reference", "Details", "IP / Device"
    ],
    data: [
      ["LOG-001", "2026-09-12T08:00:00Z", "Victor Adonis", "Admin", "LOGIN", "Auth", "-", "Admin logged in", "Desktop"],
      ["LOG-002", "2026-09-12T08:15:00Z", "James Osei", "Receptionist", "CHECK_IN_GUEST", "InHouseGuests", "IG-001", "Alice Johnson checked into room 101", "Front Desk Terminal"],
      ["LOG-003", "2026-09-12T09:00:00Z", "Grace Mutua", "Accountant", "CREATE_INVOICE", "Invoices", "INV-2026-0001", "Invoice created for Alice Johnson", "Accountant PC"],
      ["LOG-004", "2026-09-12T10:30:00Z", "Grace Mutua", "Accountant", "RECORD_PAYMENT", "Receipts", "REC-2026-0001", "Full payment received via Visa Card", "Accountant PC"],
      ["LOG-005", "2026-09-12T11:00:00Z", "Sandra Mbeki", "Cashier", "UPLOAD_SALES_REPORT", "DailySalesReports", "2026-09-11", "Daily POS report uploaded", "Cashier Terminal"],
    ],
  },
];

// ── Helper: sleep ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Helper: column letter from index ──────────────────────────────────────────
function colLetter(n) {
  let s = "";
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

// ── Helper: cell range ────────────────────────────────────────────────────────
function range(sheetName, startRow, startCol, endRow, endCol) {
  return `'${sheetName}'!${colLetter(startCol)}${startRow}:${colLetter(endCol)}${endRow}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🏨  Midland Hotel — Google Sheets Database Setup");
  console.log("═".repeat(55));

  // Auth
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // ── Step 1: Get existing sheets ───────────────────────────────────────────
  console.log("\n📡  Fetching spreadsheet metadata...");
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingSheets = meta.data.sheets.map((s) => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
  }));
  console.log(`   Found ${existingSheets.length} existing sheet(s): ${existingSheets.map((s) => s.title).join(", ")}`);

  // ── Step 2: Build batchUpdate requests ────────────────────────────────────
  const requests = [];
  const sheetIdMap = {}; // name -> sheetId

  // Track which sheets to add vs update
  const existingNames = new Set(existingSheets.map((s) => s.title));

  for (let idx = 0; idx < SHEETS.length; idx++) {
    const sheet = SHEETS[idx];

    if (!existingNames.has(sheet.name)) {
      // Add new sheet
      requests.push({
        addSheet: {
          properties: {
            title: sheet.name,
            index: idx + 1,
            tabColor: sheet.tabColor,
            gridProperties: { frozenRowCount: 3 },
          },
        },
      });
    } else {
      // Update existing sheet's tab color & freeze
      const existing = existingSheets.find((s) => s.title === sheet.name);
      sheetIdMap[sheet.name] = existing.sheetId;
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId: existing.sheetId,
            title: sheet.name,
            tabColor: sheet.tabColor,
            gridProperties: { frozenRowCount: 3 },
          },
          fields: "title,tabColor,gridProperties.frozenRowCount",
        },
      });
    }
  }

  // ── Step 3: Execute sheet creation ────────────────────────────────────────
  if (requests.length > 0) {
    console.log("\n🛠️   Creating / updating sheet tabs...");
    const batchRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });

    // Capture new sheetIds from replies
    let replyIdx = 0;
    for (let idx = 0; idx < SHEETS.length; idx++) {
      const sheet = SHEETS[idx];
      if (!existingNames.has(sheet.name)) {
        const reply = batchRes.data.replies[replyIdx++];
        sheetIdMap[sheet.name] = reply.addSheet.properties.sheetId;
        console.log(`   ✅  Created: ${sheet.name} (id=${sheetIdMap[sheet.name]})`);
      } else {
        replyIdx++;
        console.log(`   ↩️  Updated: ${sheet.name} (id=${sheetIdMap[sheet.name]})`);
      }
    }
  }

  await sleep(800);

  // ── Step 4: Write headers + data ─────────────────────────────────────────
  console.log("\n📝  Writing headers and seed data...");

  for (const sheet of SHEETS) {
    const sheetName = sheet.name;
    const cols = sheet.columns;
    const data = sheet.data;

    // Build values: Row1=section title, Row2=column headers, Row3+=data
    const values = [
      [sheet.sectionTitle],              // Row 1 — section title banner
      [],                                // Row 2 — spacer / section info
      cols,                              // Row 3 — column headers
      ...data,                           // Row 4+ — seed data
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    console.log(`   📄  ${sheetName}: ${data.length} rows written (${cols.length} columns)`);
    await sleep(300);
  }

  // ── Step 5: Formatting ────────────────────────────────────────────────────
  console.log("\n🎨  Applying formatting...");
  const formatRequests = [];

  for (const sheet of SHEETS) {
    const sheetId = sheetIdMap[sheet.name];
    const numCols = sheet.columns.length;

    // --- Row 1: Section title banner ---
    // Merge A1:last col
    formatRequests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: numCols },
        mergeType: "MERGE_ALL",
      },
    });
    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.headerBg,
            textFormat: { foregroundColor: COLORS.headerText, bold: true, fontSize: 13 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
      },
    });

    // Set row 1 height to 42px
    formatRequests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 42 },
        fields: "pixelSize",
      },
    });

    // --- Row 2: Sub-banner with hotel branding ---
    formatRequests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: numCols },
        mergeType: "MERGE_ALL",
      },
    });
    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredValue: { stringValue: "Midland Hotel Kayonza  •  Hotel Management System  •  Last Updated: " + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
          userEnteredFormat: {
            backgroundColor: COLORS.subheaderBg,
            textFormat: { foregroundColor: COLORS.subheaderText, italic: true, fontSize: 9 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredValue,userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
      },
    });

    formatRequests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 22 },
        fields: "pixelSize",
      },
    });

    // --- Row 3: Column header row ---
    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.headerBg,
            textFormat: { foregroundColor: COLORS.headerText, bold: true, fontSize: 10 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            borders: {
              bottom: { style: "SOLID_MEDIUM", color: COLORS.accentGold },
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,borders)",
      },
    });

    formatRequests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 2, endIndex: 3 },
        properties: { pixelSize: 40 },
        fields: "pixelSize",
      },
    });

    // --- Data rows: alternate row shading ---
    const numDataRows = sheet.data.length;
    if (numDataRows > 0) {
      // Even rows (0-indexed: 3, 5, 7... → row index 3,5,7...)
      for (let r = 0; r < numDataRows; r++) {
        const rowIdx = 3 + r;
        const bg = r % 2 === 0 ? { red: 1, green: 1, blue: 1 } : COLORS.altRowBg;
        formatRequests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: numCols },
            cell: {
              userEnteredFormat: {
                backgroundColor: bg,
                textFormat: { fontSize: 10 },
                verticalAlignment: "MIDDLE",
                borders: {
                  bottom: { style: "SOLID", color: COLORS.tableBorder },
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,borders)",
          },
        });
      }

      // Bold first column (IDs)
      formatRequests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 3, endRowIndex: 3 + numDataRows, startColumnIndex: 0, endColumnIndex: 1 },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 10 },
              horizontalAlignment: "LEFT",
            },
          },
          fields: "userEnteredFormat(textFormat,horizontalAlignment)",
        },
      });
    }

    // --- Auto-resize all columns ---
    formatRequests.push({
      autoResizeDimensions: {
        dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: numCols },
      },
    });

    // --- Freeze header rows only (no column freeze to avoid merge conflict) ---
    formatRequests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 3 },
        },
        fields: "gridProperties.frozenRowCount",
      },
    });
  }

  // Execute formatting in one batch
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests: formatRequests },
  });
  console.log("   ✅  Formatting applied to all sheets");

  // ── Step 6: Delete default "Sheet1" if it exists ──────────────────────────
  const sheet1 = existingSheets.find((s) => s.title === "Sheet1");
  if (sheet1) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ deleteSheet: { sheetId: sheet1.sheetId } }],
      },
    });
    console.log("\n🗑️   Removed default 'Sheet1'");
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(55));
  console.log("✅  All done! Your Google Sheet is ready:");
  console.log(`   🔗  https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  console.log("\nSheets created:");
  SHEETS.forEach((s) => console.log(`   • ${s.name}`));
  console.log("═".repeat(55) + "\n");
}

main().catch((err) => {
  console.error("\n❌  Error:", err.message || err);
  if (err.errors) {
    err.errors.forEach((e) => console.error("   -", e.message));
  }
  process.exit(1);
});
