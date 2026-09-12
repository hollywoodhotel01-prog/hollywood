/**
 * ============================================================
 *  Midland Hotel — Google Sheets Formatting Script
 *  (Format-only — data already written by setup_sheets.js)
 * ============================================================
 */

const { google } = require("googleapis");

const credentials = {
  type: "service_account",
  project_id: "directed-gasket-508415-c2",
  private_key_id: "3bdccc6ca6911a14b9d5919d378d54f9b2cec4d1",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3jTg3sH9Y3j0l\nqeUOcAzPb/mrE2bi+mpN9s7UivG6tYx+OxL+lbGQravduqe2LKwcTm7nga3vS4Wa\nnhRfsWiyS3ePxcwUBG5toM/n96wIRy1V9NKw87/YVt374vnuyk5uFyJ1wzTgi0+y\nJ94Bku+j9p14KMZ6W9RpAvvitl8dGU0gNM+PgHOLhwDXrY1GIkoEgy6lt2XM4peR\nlJJzh6+sFY4LmujRbifEp8ZUek8pe2JM9M2moNX9OEhpQtOjZ4KtinHOCKUedAPU\n96KQBky7lcV61JEwr3DGK1C/O3d8evIGUIwC2Wkpvm4nOdyaWK3tm9u6NxB8N+GS\nTn2+fIDbAgMBAAECggEAEI549TEC86msO1L9WdWKmkV/8EoCPFQZNaofEvXrgwtw\nPkym1Hb9Os8nkwsMqLaT2cPLZi+A2HZn+T/sF4uhpX+AK+RMGbwil9nrFwH0rxR4\nhunb/WEnO2TuhhN9tufhtjV5AsVWZjC6whetg1fVLOWIY7fN22igGs7NmLAZmT6x\nYacbd3EaHgqWKxmFrPHQXrd7V4j0fK5vVhg/hji3tFoPtJGNsKdeFivgQorvJAv2\nwJ0+hz8raycMUnuNsU4V523SDryJP8UYoBLEciJ58cFNOcIOB6g3CTWjgO9FA7IJ\nWLKCBQ3JwzavchIdX/Ln6MD5sU+oitKMx4RUgHbpxQKBgQDfqtZY0DZVNSyatMRA\npvOcVM2VuTHstDtHHtWRNULOgk6rh5EAbUqaJ0TzUYg94Kew7Nf4ukpQDVSw6Lle\nY3FuY9TT2msG2SoBidbiF/WtTlbEdXnaYgF/MBlG46eJZCBn+1lrU1nngqcp6oWj\n/TISw0HtYwD2Rb3dDJ7Ki3dlHwKBgQDSFdZ1QEWRob0w8wHc+1u+66wRT/ARgPrO\nbCNsyyccOpFg5aNOWEVMoiEtHKkckP2qHk9oAqzNVXESW7YIiaev+GTPRibaj2m8\nFonEQzE//kPrhGZ7Du8hs6mC+tUg6mH8Zv7kQAnJ4tU9lCKQ0wK2ShPX8HnGAZjC\nljlpEb5QxQKBgDN9UZDqhceB0T3gJVm41VYE07sHAi46o3bQ61tdRn7h0ph8Qe42\nOrlYFvBosZOFFzWMoH9a62aYWwnK2XmYLPG7u6/1lTPjZF8sSzKLT3xRD3p0jNOw\nQiX0fa0rFVN0oF0vqLsjWgwIsNDec1t4G0Hkf1XVt8/56CZuFFQOXTMDAoGAFN2A\nYELS5gTnUm5AOB9q3Epx24JR+JsTzd6log+HQeF7QOFt18EimNrdaqqXDTRFTVkX\nT+A8I2SiB02+hZiOZAbKlF+GSlzGBp1Cb5Cw2oc5XbHXr88q5vD+G/kno85Djxr3\no9nMXxW9UhFdYX7jnRE8aU0D+yt7bZAYAZx2h3UCgYAbmMmu5t6X/7x9y9koqobJ\noYrFQ8aobSg8oO2opL1Jz/j6lL7EMhoZZUw2o64MLpzFCloJe5msFJGQWkWTMdca\nQWu3dJ3dOOvcOidkHCPIUVq0gGv1XO/dUDaMkuMSMXgUaiEWwpCKVBk8WEpagKQs\n/F2uf56brlD27094s92GlQ==\n-----END PRIVATE KEY-----\n",
  client_email: "service-account@directed-gasket-508415-c2.iam.gserviceaccount.com",
  client_id: "101293143101321087520",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40directed-gasket-508415-c2.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const SPREADSHEET_ID = "1KNNXk9Wo_HmnKPZjHEmB7AH_jAOoRdk3a26pa081JQw";

// ── Theme Colors ───────────────────────────────────────────────────────────────
const COLORS = {
  headerBg:    { red: 0.071, green: 0.071, blue: 0.071 }, // near-black
  headerText:  { red: 0.984, green: 0.749, blue: 0.141 }, // gold
  subBg:       { red: 0.18,  green: 0.18,  blue: 0.18  }, // dark gray
  subText:     { red: 1,     green: 1,     blue: 1     }, // white
  altRow:      { red: 0.956, green: 0.964, blue: 0.980 }, // light blue-gray
  border:      { red: 0.78,  green: 0.78,  blue: 0.78  }, // light border
  gold:        { red: 0.984, green: 0.749, blue: 0.141 }, // gold accent
};

// ── Sheet metadata — IDs from first run ────────────────────────────────────────
// We fetch them dynamically so this script is always safe to re-run.
const SHEET_SPECS = [
  { name: "📋 Bookings",          numCols: 11, numDataRows: 6,  tabColor: { red: 0.2,  green: 0.6, blue: 1.0 } },
  { name: "🛏️ Rooms",             numCols: 9,  numDataRows: 13, tabColor: { red: 0.4,  green: 0.8, blue: 0.4 } },
  { name: "🧾 InHouseGuests",     numCols: 11, numDataRows: 2,  tabColor: { red: 0.6,  green: 0.4, blue: 1.0 } },
  { name: "🏛️ ConferenceBookings",numCols: 10, numDataRows: 2,  tabColor: { red: 1.0,  green: 0.6, blue: 0.2 } },
  { name: "🧾 Invoices",          numCols: 25, numDataRows: 4,  tabColor: { red: 0.2,  green: 0.7, blue: 0.5 } },
  { name: "📦 InvoiceItems",      numCols: 11, numDataRows: 7,  tabColor: { red: 0.3,  green: 0.8, blue: 0.6 } },
  { name: "💳 Receipts",          numCols: 16, numDataRows: 2,  tabColor: { red: 0.0,  green: 0.5, blue: 0.8 } },
  { name: "📊 DailySalesReports", numCols: 22, numDataRows: 2,  tabColor: { red: 0.8,  green: 0.3, blue: 0.5 } },
  { name: "👥 Staff",             numCols: 10, numDataRows: 4,  tabColor: { red: 0.5,  green: 0.5, blue: 0.9 } },
  { name: "🗂️ AdminLog",          numCols: 9,  numDataRows: 5,  tabColor: { red: 0.55, green: 0.55,blue: 0.55} },
];

const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const SUB_BANNER = `Midland Hotel Kayonza  •  Hotel Management System  •  Last Updated: ${today}`;

async function main() {
  console.log("\n🎨  Midland Hotel — Google Sheets Formatter");
  console.log("═".repeat(50));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Fetch current sheet IDs
  console.log("\n📡  Fetching sheet IDs...");
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingMap = {};
  for (const s of meta.data.sheets) {
    existingMap[s.properties.title] = s.properties.sheetId;
  }
  console.log("   Found:", Object.keys(existingMap).join(", "));

  // ── Pass 0: Unfreeze all columns FIRST (must happen before any mergeCells) ──
  console.log("\n🔓  Unfreezing columns on all sheets...");
  const unfreezeRequests = [];
  for (const spec of SHEET_SPECS) {
    const sheetId = existingMap[spec.name];
    if (sheetId === undefined) continue;
    unfreezeRequests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 0, frozenColumnCount: 0 },
        },
        fields: "gridProperties.frozenRowCount,gridProperties.frozenColumnCount",
      },
    });
  }
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests: unfreezeRequests },
  });
  console.log("   ✔  All columns unfrozen");
  await new Promise((r) => setTimeout(r, 500));

  // ── Build format requests ──────────────────────────────────────────────────
  const requests = [];

  for (const spec of SHEET_SPECS) {
    const sheetId = existingMap[spec.name];
    if (sheetId === undefined) {
      console.warn(`   ⚠️  Sheet not found: ${spec.name} — skipping`);
      continue;
    }

    const { numCols, numDataRows } = spec;

    // 1. Update tab color & freeze top 3 rows (NO column freeze — avoids merge conflict)
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          tabColor: spec.tabColor,
          gridProperties: { frozenRowCount: 3 },
        },
        fields: "tabColor,gridProperties.frozenRowCount",
      },
    });

    // 2. Row 1: title banner merge + style
    requests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: numCols },
        mergeType: "MERGE_ALL",
      },
    });
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.headerBg,
            textFormat: { foregroundColor: COLORS.headerText, bold: true, fontSize: 14, fontFamily: "Arial" },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
      },
    });
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 44 },
        fields: "pixelSize",
      },
    });

    // 3. Row 2: sub-banner merge + style + write text
    requests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: numCols },
        mergeType: "MERGE_ALL",
      },
    });
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredValue: { stringValue: SUB_BANNER },
          userEnteredFormat: {
            backgroundColor: COLORS.subBg,
            textFormat: { foregroundColor: COLORS.subText, italic: true, fontSize: 9, fontFamily: "Arial" },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredValue,userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
      },
    });
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 20 },
        fields: "pixelSize",
      },
    });

    // 4. Row 3: column header style (gold-on-black, bold, gold bottom border)
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.headerBg,
            textFormat: { foregroundColor: COLORS.headerText, bold: true, fontSize: 10, fontFamily: "Arial" },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            borders: {
              bottom: { style: "SOLID_MEDIUM", color: COLORS.gold, width: 2 },
              top:    { style: "SOLID",        color: COLORS.gold },
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,borders)",
      },
    });
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 2, endIndex: 3 },
        properties: { pixelSize: 42 },
        fields: "pixelSize",
      },
    });

    // 5. Data rows: alternating row backgrounds + row height
    for (let r = 0; r < numDataRows; r++) {
      const rowIdx = 3 + r;
      const bg = r % 2 === 0
        ? { red: 1, green: 1, blue: 1 }   // white
        : COLORS.altRow;                    // subtle blue-gray
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: numCols },
          cell: {
            userEnteredFormat: {
              backgroundColor: bg,
              textFormat: { fontSize: 10, fontFamily: "Arial" },
              verticalAlignment: "MIDDLE",
              borders: {
                bottom: { style: "SOLID", color: COLORS.border },
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,borders)",
        },
      });
    }

    // 6. Row height for data rows (28px each)
    if (numDataRows > 0) {
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: "ROWS", startIndex: 3, endIndex: 3 + numDataRows },
          properties: { pixelSize: 28 },
          fields: "pixelSize",
        },
      });
    }

    // 7. Bold + left-align column A (IDs)
    if (numDataRows > 0) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 3, endRowIndex: 3 + numDataRows, startColumnIndex: 0, endColumnIndex: 1 },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 10, fontFamily: "Arial" },
              horizontalAlignment: "LEFT",
            },
          },
          fields: "userEnteredFormat(textFormat,horizontalAlignment)",
        },
      });
    }

    // 8. Auto-resize all columns
    requests.push({
      autoResizeDimensions: {
        dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: numCols },
      },
    });
  }

  // ── Execute all formatting ─────────────────────────────────────────────────
  console.log(`\n📐  Sending ${requests.length} format requests...`);

  // Split into chunks of 50 to stay under API limits
  const CHUNK = 50;
  for (let i = 0; i < requests.length; i += CHUNK) {
    const chunk = requests.slice(i, i + CHUNK);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: chunk },
    });
    console.log(`   ✔  Batch ${Math.floor(i / CHUNK) + 1}/${Math.ceil(requests.length / CHUNK)} applied`);
    await new Promise((r) => setTimeout(r, 400));
  }

  // ── Delete Sheet1 if still present ────────────────────────────────────────
  if (existingMap["Sheet1"] !== undefined) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ deleteSheet: { sheetId: existingMap["Sheet1"] } }] },
    });
    console.log("\n🗑️   Removed leftover 'Sheet1'");
  }

  console.log("\n" + "═".repeat(50));
  console.log("✅  All formatting applied!");
  console.log(`🔗  https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  console.log("═".repeat(50) + "\n");
}

main().catch((err) => {
  console.error("\n❌  Error:", err.message || err);
  if (err.errors) err.errors.forEach((e) => console.error("   -", e.message));
  process.exit(1);
});
