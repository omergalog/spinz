import * as XLSX from 'xlsx';

// ── Parameters ──
const FOB       = 93.80;
const UNITS_20  = 170;
const UNITS_40  = 330;
const FREIGHT_20 = 16.06;
const FREIGHT_40 = 11.50;
const LOGISTICS  = 12.00;   // עמיל מכס + דמי נמל + ביטוח + שילוח פנים (worst case)
const TEKEN      = 0;       // אישור תקן ישראלי — TBD
const USD_RATE   = 3.00;    // ₪ per $

// ── Calculations ──
function calcUnit(freight) {
  const cif    = FOB + freight + LOGISTICS;
  const subtot = cif + TEKEN;
  const vat    = subtot * 0.17;
  return { fob: FOB, freight, logistics: LOGISTICS, cif, teken: TEKEN, subtot, vat, grand: subtot + vat };
}

const u20 = calcUnit(FREIGHT_20);
const u40 = calcUnit(FREIGHT_40);

// ── Style helpers ──
const gold   = { fgColor: { rgb: 'C9A870' } };
const dark   = { fgColor: { rgb: '1A1A1A' } };
const lightBg = { fgColor: { rgb: 'FFF8EE' } };
const subtotBg = { fgColor: { rgb: 'F5F2EC' } };
const greenBg  = { fgColor: { rgb: 'E8F7EB' } };

const bold       = { bold: true };
const boldGold   = { bold: true, color: { rgb: 'C9A870' } };
const boldWhite  = { bold: true, color: { rgb: 'FFFFFF' } };
const muted      = { color: { rgb: '999999' } };
const warn       = { color: { rgb: 'E07B39' } };
const green      = { color: { rgb: '2E8B57' } };

const money   = '"$"#,##0.00';
const moneyIL = '"₪"#,##0';
const pct     = '0.0"%"';
const num     = '#,##0';

function cell(v, font={}, fill=null, numFmt=null, alignment=null) {
  const c = { v, t: typeof v === 'number' ? 'n' : 's' };
  const s = {};
  if (Object.keys(font).length) s.font = font;
  if (fill) s.fill = { patternType: 'solid', ...fill };
  if (numFmt) { s.numFmt = numFmt; c.t = 'n'; }
  if (alignment) s.alignment = alignment;
  if (Object.keys(s).length) c.s = s;
  return c;
}
const C = (v, f={}, fill=null, fmt=null) => cell(v, f, fill, fmt, { horizontal: 'right' });
const CL = (v, f={}, fill=null, fmt=null) => cell(v, f, fill, fmt, { horizontal: 'left' });

// ── Build workbook ──
const wb = XLSX.utils.book_new();

// ════════════════════════════════
// SHEET 1 — פירוט עלות ייבוא
// ════════════════════════════════
const ws1_data = [
  // Row 1: Title
  [CL('SPINZ — מחשבון עלות ייבוא', { bold: true, size: 16 }, dark, null),
   null,null,null,null,null,null],

  // Row 2: Subtitle
  [CL('הזמנה ראשונה · מכולת 20 פיט · 170 זוגות', muted),
   null,null,null,null,null,null],

  [null],

  // Row 4: Section header — Parameters
  [CL('פרמטרים', { bold: true, color: { rgb: 'C9A870' } }),
   null,null,null,null,null,null],

  // Row 5-11: Input params
  [CL('מחיר מפעל ליחידה (FOB סין)', {}), C(FOB, {}, null, money)],
  [CL('מספר יחידות — מכולת 20 פיט', {}), C(UNITS_20, {}, null, num)],
  [CL('שילוח ים ליחידה — 20 פיט', {}), C(FREIGHT_20, {}, null, money)],
  [CL('לוגיסטיקה ליחידה (עמיל+דמי נמל+ביטוח+שילוח פנים, worst case)', {}), C(LOGISTICS, {}, null, money)],
  [CL('מכס (customs duty)', { color: { rgb: '2E8B57' } }), CL('פטור — HS 8712.00', { color: { rgb: '2E8B57' } })],
  [CL('אישור תקן ישראלי', warn), C(TEKEN, warn, null, money), CL('⚠ עלות אישור בארץ — TBD', warn)],
  [CL('שער דולר (₪)', {}), C(USD_RATE, {}, null, '"₪"0.00')],

  [null],

  // Row 13: Section header — Breakdown
  [CL('פירוט עלות ייבוא', { bold: true, color: { rgb: 'C9A870' } })],

  // Row 14: Table headers
  [
    CL('סעיף', bold),
    CL('הערות', bold),
    C('$ ליחידה', bold, null, money),
    C('₪ ליחידה', bold, null, moneyIL),
    C('$ סה"כ (170 יח\')', bold, null, money),
    C('₪ סה"כ', bold, null, moneyIL),
  ],

  // Data rows
  [CL('מחיר מפעל (FOB)'), CL('כולל עד נמל סין'),
   C(u20.fob, {}, null, money), C(u20.fob*USD_RATE, {}, null, moneyIL),
   C(u20.fob*UNITS_20, {}, null, money), C(u20.fob*UNITS_20*USD_RATE, {}, null, moneyIL)],

  [CL('שילוח ים'), CL('מכולת 20 פיט'),
   C(u20.freight, {}, null, money), C(u20.freight*USD_RATE, {}, null, moneyIL),
   C(u20.freight*UNITS_20, {}, null, money), C(u20.freight*UNITS_20*USD_RATE, {}, null, moneyIL)],

  [CL('לוגיסטיקה'), CL('עמיל מכס + דמי נמל + ביטוח + שילוח פנים — worst case'),
   C(u20.logistics, {}, null, money), C(u20.logistics*USD_RATE, {}, null, moneyIL),
   C(u20.logistics*UNITS_20, {}, null, money), C(u20.logistics*UNITS_20*USD_RATE, {}, null, moneyIL)],

  [CL('מכס (customs duty)', { color: { rgb: '2E8B57' } }), CL('פטור — אופניים HS 8712.00', { color: { rgb: '2E8B57' } }),
   C(0, {}, null, money), C(0, {}, null, moneyIL), C(0, {}, null, money), C(0, {}, null, moneyIL)],

  [CL('אישור תקן ישראלי', TEKEN > 0 ? {} : warn),
   CL('CE אירופאי מהמפעל — עלות אישור בארץ TBD', TEKEN > 0 ? muted : warn),
   C(u20.teken, {}, null, money), C(u20.teken*USD_RATE, {}, null, moneyIL),
   C(u20.teken*UNITS_20, {}, null, money), C(u20.teken*UNITS_20*USD_RATE, {}, null, moneyIL)],

  // Subtotal no VAT
  [CL('סה"כ עלות ייבוא (ללא מע"מ)', bold), CL('לא כולל מע"מ', muted),
   C(u20.subtot, bold, subtotBg, money), C(u20.subtot*USD_RATE, bold, subtotBg, moneyIL),
   C(u20.subtot*UNITS_20, bold, subtotBg, money), C(u20.subtot*UNITS_20*USD_RATE, bold, subtotBg, moneyIL)],

  // VAT — cashflow
  [CL('מע"מ יבוא 17%', { italic: true }), CL('מוחזר ~60 יום — cash flow בלבד', { italic: true, ...muted }),
   C(u20.vat, { italic: true }, lightBg, money), C(u20.vat*USD_RATE, { italic: true }, lightBg, moneyIL),
   C(u20.vat*UNITS_20, { italic: true }, lightBg, money), C(u20.vat*UNITS_20*USD_RATE, { italic: true }, lightBg, moneyIL)],

  // Grand total
  [CL('עלות כוללת ליחידה (כולל מע"מ)', { bold: true, color: { rgb: 'FFFFFF' } }),
   CL('cash flow מקסימלי', { color: { rgb: '888888' } }),
   C(u20.grand, boldWhite, dark, money), C(u20.grand*USD_RATE, boldWhite, dark, moneyIL),
   C(u20.grand*UNITS_20, boldWhite, dark, money), C(u20.grand*UNITS_20*USD_RATE, boldWhite, dark, moneyIL)],

  [null],

  // Summary
  [CL('סיכום', { bold: true, color: { rgb: 'C9A870' } })],
  [CL('עלות ליחידה (ללא מע"מ)'), C(u20.subtot, bold, null, money), C(u20.subtot*USD_RATE, bold, null, moneyIL)],
  [CL('סה"כ השקעה ראשונית — 170 יח\''), C(u20.subtot*UNITS_20, bold, null, money), C(u20.subtot*UNITS_20*USD_RATE, bold, null, moneyIL)],
  [CL('cash flow נדרש (כולל מע"מ)'), C(u20.grand*UNITS_20, {}, null, money), C(u20.grand*UNITS_20*USD_RATE, { bold: true }, lightBg, moneyIL)],
  [CL('החזר מע"מ צפוי'), C(u20.vat*UNITS_20, {}, null, money), C(u20.vat*UNITS_20*USD_RATE, green, greenBg, moneyIL)],
];

const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);

// Column widths
ws1['!cols'] = [
  { wch: 42 }, { wch: 36 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 16 }
];

// Merge title rows
ws1['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
  { s: { r: 12, c: 0 }, e: { r: 12, c: 6 } },
];

ws1['!sheetView'] = { rightToLeft: true };
XLSX.utils.book_append_sheet(wb, ws1, 'עלות ייבוא — 20 פיט');

// ════════════════════════════════
// SHEET 2 — השוואה 20 vs 40 פיט
// ════════════════════════════════
const ws2_data = [
  [CL('SPINZ — השוואת מכולות', { bold: true, size: 14 })],
  [CL('20 פיט (170 זוגות)  vs  40 פיט (330 זוגות)', muted)],
  [null],
  [CL('פרמטר', bold), C('20 פיט', bold), C('40 פיט', bold), C('הפרש ל-40 פיט', bold)],
  [CL('מספר יחידות'), C(UNITS_20, {}, null, num), C(UNITS_40, {}, null, num), C(UNITS_40-UNITS_20, green, null, num)],
  [CL('שילוח ים ליחידה ($)'), C(FREIGHT_20, {}, null, money), C(FREIGHT_40, {}, null, money),
   C(FREIGHT_40-FREIGHT_20, green, null, money)],
  [CL('עלות CIF ליחידה ($)'), C(u20.cif, {}, null, money), C(u40.cif, {}, null, money),
   C(u40.cif-u20.cif, {}, null, money)],
  [CL('עלות ייבוא ליחידה (ללא מע"מ)'), C(u20.subtot, bold, null, money), C(u40.subtot, bold, null, money),
   C(u40.subtot-u20.subtot, { bold: true, ...green }, null, money)],
  [CL('עלות ליחידה (₪)'), C(u20.subtot*USD_RATE, {}, null, moneyIL), C(u40.subtot*USD_RATE, {}, null, moneyIL),
   C((u40.subtot-u20.subtot)*USD_RATE, green, null, moneyIL)],
  [null],
  [CL('סה"כ השקעה ($)', bold), C(u20.subtot*UNITS_20, bold, null, money), C(u40.subtot*UNITS_40, bold, null, money),
   C(u40.subtot*UNITS_40 - u20.subtot*UNITS_20, bold, null, money)],
  [CL('סה"כ השקעה (₪)', bold),
   C(u20.subtot*UNITS_20*USD_RATE, bold, null, moneyIL),
   C(u40.subtot*UNITS_40*USD_RATE, bold, null, moneyIL),
   C((u40.subtot*UNITS_40 - u20.subtot*UNITS_20)*USD_RATE, bold, null, moneyIL)],
  [null],
  [CL('חיסכון ליחידה בשילוח (40 vs 20)', { italic: true }),
   null, null, C(-(FREIGHT_40-FREIGHT_20), { bold: true, ...green }, greenBg, money)],
  [CL('חיסכון כולל בשילוח (330 יח\')', { italic: true }),
   null, null, C(-(FREIGHT_40-FREIGHT_20)*UNITS_40, { bold: true, ...green }, greenBg, money)],
];

const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
ws2['!cols'] = [{ wch: 38 }, { wch: 16 }, { wch: 16 }, { wch: 18 }];
ws2['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
];
ws2['!sheetView'] = { rightToLeft: true };
XLSX.utils.book_append_sheet(wb, ws2, 'השוואה 20 vs 40 פיט');

// ════════════════════════════════
// SHEET 3 — הערות ופריטים בבירור
// ════════════════════════════════
const ws3_data = [
  [CL('SPINZ — הערות ופריטים פתוחים', { bold: true, size: 14 })],
  [null],
  [CL('סטטוס', bold), CL('פריט', bold), CL('הערה', bold)],
  [CL('⚠ פתוח', warn), CL('אישור תקן ישראלי', warn),
   CL('תקן CE אירופאי מהמפעל. נדרש אישור בארץ — עלות טרם ידועה', warn)],
  [CL('⚠ פתוח', warn), CL('Demurrage — עיכובים בנמל', warn),
   CL('טרם בורר — לברר עלות ליום עיכוב', warn)],
  [CL('⚠ פתוח', warn), CL('אחסנה בארץ', warn),
   CL('טרם סוכמה — להוסיף לטבלה לאחר קבלת הצעות', warn)],
  [CL('✓ סגור', { color: { rgb: '2E8B57' } }), CL('מכס (customs duty)'),
   CL('פטור — אופניים HS 8712.00. אין חיוב מכס')],
  [CL('✓ סגור', { color: { rgb: '2E8B57' } }), CL('מע"מ יבוא 17%'),
   CL('מוחזר כ-60 יום לאחר שחרור. אינו עלות אלא cash flow זמני')],
  [CL('✓ סגור', { color: { rgb: '2E8B57' } }), CL('עמיל מכס'),
   CL('כלול במחיר הלוגיסטיקה ($12)')],
  [CL('✓ סגור', { color: { rgb: '2E8B57' } }), CL('דמי טיפול נמל + מסמכים'),
   CL('כלול במחיר הלוגיסטיקה ($12)')],
  [CL('✓ סגור', { color: { rgb: '2E8B57' } }), CL('ביטוח הובלה'),
   CL('כלול במחיר הלוגיסטיקה ($12)')],
  [CL('✓ סגור', { color: { rgb: '2E8B57' } }), CL('שילוח פנים — נמל עד מחסן'),
   CL('כלול במחיר הלוגיסטיקה ($12)')],
  [CL('✓ סגור', { color: { rgb: '2E8B57' } }), CL('שילוח ללקוח'),
   CL('על חשבון הלקוח — לא חלק מעלות הייבוא')],
];

const ws3 = XLSX.utils.aoa_to_sheet(ws3_data);
ws3['!cols'] = [{ wch: 12 }, { wch: 36 }, { wch: 52 }];
ws3['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
ws3['!sheetView'] = { rightToLeft: true };
XLSX.utils.book_append_sheet(wb, ws3, 'פריטים פתוחים');

// ── Write file ──
const outPath = './spinz-import-costs.xlsx';
XLSX.writeFile(wb, outPath);
console.log('✓ נוצר:', outPath);
