import AdmZip from 'adm-zip';

// XPS text runs come as UnicodeString="..." attributes inside .fpage XML files.
// There's no table structure, but SimbaPOS writes rows in a clean, repeating
// order, so we classify each text run by shape and reconstruct rows from that.

function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractTextRuns(xmlContent) {
  const matches = [...xmlContent.matchAll(/UnicodeString="([^"]*)"/g)];
  return matches.map((m) => decodeXmlEntities(m[1]));
}

function classify(token) {
  if (!token) return 'TEXT';
  const clean = token.trim();
  if (/^\d+(\.\d+)?%$/.test(clean)) return 'PERCENT';
  if (/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(clean) && clean.includes(',')) return 'AMOUNT';
  if (/^\d+\.\d{1,2}$/.test(clean)) return 'AMOUNT';
  if (/^\d+$/.test(clean)) return 'INTEGER';
  return 'TEXT';
}

function toAmount(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
}

/**
 * Parses a SimbaPOS "Item Sales Report" XPS file into structured JSON.
 * @param {Buffer} buffer - raw bytes of the uploaded .xps file
 */
export function parseXpsReport(buffer) {
  const zip = new AdmZip(buffer);
  const pageEntries = zip
    .getEntries()
    .filter((e) => /Documents[/\\]\d+[/\\]Pages[/\\]\d+\.fpage$/i.test(e.entryName))
    .sort((a, b) => {
      const matchA = a.entryName.match(/Pages[/\\](\d+)\.fpage$/i);
      const matchB = b.entryName.match(/Pages[/\\](\d+)\.fpage$/i);
      const numA = matchA ? parseInt(matchA[1], 10) : 0;
      const numB = matchB ? parseInt(matchB[1], 10) : 0;
      return numA - numB;
    });

  if (pageEntries.length === 0) {
    throw new Error('This does not look like a valid XPS report (no page files found).');
  }

  let tokens = [];
  for (const entry of pageEntries) {
    const xml = entry.getData().toString('utf8');
    tokens = tokens.concat(extractTextRuns(xml));
  }

  const report = {
    hotelName: tokens[0] || null,
    reportTitle: tokens[1] || null,
    periodFrom: tokens[2] || null,
    periodTo: tokens[3] || null,
    groupSalesByAmount: [],
    groupSalesByQuantity: [],
    salesDetail: [],
    grandTotalAmount: 0,
    grandTotalQuantity: 0,
  };

  const findHeadingIndex = (phrase) =>
    tokens.findIndex((t) => t && t.trim().toLowerCase() === phrase.toLowerCase());

  const idxAmountHeading = findHeadingIndex('Group Sales by Amount');
  const idxQtyHeading = findHeadingIndex('Group Sales by Quantity');
  const idxSalesHeading = findHeadingIndex('Sales');

  function parseGroupSection(startIdx, endIdx, valueType) {
    const rows = [];
    let idx = startIdx + 1;
    let pendingName = null;
    while (idx < endIdx) {
      const token = tokens[idx]?.trim();
      if (!token || token.toLowerCase() === 'total') {
        idx += 2;
        continue;
      }
      const type = classify(token);
      if (type === 'TEXT') {
        pendingName = token;
        idx += 1;
        continue;
      }
      if (type === 'PERCENT') {
        const valueToken = tokens[idx + 1];
        rows.push({
          category: pendingName || 'Unspecified',
          percent: token,
          value: valueType === 'amount' ? toAmount(valueToken) : parseInt(valueToken, 10) || 0,
        });
        pendingName = null;
        idx += 2;
        continue;
      }
      idx += 1;
    }
    return rows;
  }

  if (idxAmountHeading !== -1 && idxQtyHeading !== -1) {
    report.groupSalesByAmount = parseGroupSection(idxAmountHeading, idxQtyHeading, 'amount');
  }
  const salesBound = idxSalesHeading !== -1 ? idxSalesHeading : tokens.length;
  if (idxQtyHeading !== -1) {
    report.groupSalesByQuantity = parseGroupSection(idxQtyHeading, salesBound, 'quantity');
  }

  if (idxSalesHeading !== -1) {
    let idx = idxSalesHeading + 1;
    // Skip any header row names if present
    while (
      idx < tokens.length &&
      ['item', 'items', 'item name', 'qty', 'quantity', 'amount', 'total'].includes(
        tokens[idx]?.toLowerCase()?.trim()
      )
    ) {
      idx += 1;
    }

    while (idx + 2 < tokens.length) {
      const name = tokens[idx]?.trim();
      const qtyToken = tokens[idx + 1]?.trim();
      const amountToken = tokens[idx + 2]?.trim();

      const qty = parseInt(qtyToken?.replace(/,/g, ''), 10);
      const amount = toAmount(amountToken);

      if (
        name &&
        !isNaN(qty) &&
        !isNaN(amount) &&
        !qtyToken.includes('%') &&
        name.toLowerCase() !== 'total'
      ) {
        report.salesDetail.push({ item: name, quantity: qty, amount: amount });
        idx += 3;
      } else if (name && name.toLowerCase() === 'total') {
        // reached totals footer
        break;
      } else {
        idx += 1;
      }
    }
  }

  report.grandTotalAmount = report.salesDetail.reduce((sum, r) => sum + r.amount, 0);
  report.grandTotalQuantity = report.salesDetail.reduce((sum, r) => sum + r.quantity, 0);

  return report;
}
