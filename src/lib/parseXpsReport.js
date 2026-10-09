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
  if (/^\d+(\.\d+)?%$/.test(token)) return 'PERCENT';
  if (/^\d{1,3}(,\d{3})*\.\d{2}$/.test(token)) return 'AMOUNT';
  if (/^\d+$/.test(token)) return 'INTEGER';
  return 'TEXT';
}

function toAmount(str) {
  return parseFloat(str.replace(/,/g, ''));
}

/**
 * Parses a SimbaPOS "Item Sales Report" XPS file into structured JSON.
 * @param {Buffer} buffer - raw bytes of the uploaded .xps file
 */
export function parseXpsReport(buffer) {
  const zip = new AdmZip(buffer);
  const pageEntries = zip
    .getEntries()
    .filter((e) => /Documents\/\d+\/Pages\/\d+\.fpage$/.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/Pages\/(\d+)\.fpage$/)[1], 10);
      const numB = parseInt(b.entryName.match(/Pages\/(\d+)\.fpage$/)[1], 10);
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

  const idxAmountHeading = tokens.indexOf('Group Sales by Amount');
  const idxQtyHeading = tokens.indexOf('Group Sales by Quantity');
  const idxSalesHeading = tokens.indexOf('Sales');

  function parseGroupSection(startIdx, endIdx, valueType) {
    const rows = [];
    let idx = startIdx + 1;
    let pendingName = null;
    while (idx < endIdx) {
      const token = tokens[idx];
      if (token === 'Total') {
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
          value: valueType === 'amount' ? toAmount(valueToken) : parseInt(valueToken, 10),
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
    while (idx + 2 < tokens.length) {
      const name = tokens[idx];
      const qty = tokens[idx + 1];
      const amount = tokens[idx + 2];
      if (classify(qty) !== 'INTEGER' || classify(amount) !== 'AMOUNT') break;
      report.salesDetail.push({ item: name, quantity: parseInt(qty, 10), amount: toAmount(amount) });
      idx += 3;
    }
  }

  report.grandTotalAmount = report.salesDetail.reduce((sum, r) => sum + r.amount, 0);
  report.grandTotalQuantity = report.salesDetail.reduce((sum, r) => sum + r.quantity, 0);

  return report;
}
