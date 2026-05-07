import * as XLSX from 'xlsx';

// ── Style helpers ──
const gold      = { fgColor: { rgb: 'C9A870' } };
const dark      = { fgColor: { rgb: '1A1A1A' } };
const lightBg   = { fgColor: { rgb: 'FFF8EE' } };
const blueBg    = { fgColor: { rgb: 'EBF3FB' } };
const greenBg   = { fgColor: { rgb: 'E8F7EB' } };
const grayBg    = { fgColor: { rgb: 'F5F2EC' } };
const yellowBg  = { fgColor: { rgb: 'FFFBE6' } };

const bold      = { bold: true };
const boldWhite = { bold: true, color: { rgb: 'FFFFFF' } };
const boldGold  = { bold: true, color: { rgb: 'C9A870' } };
const muted     = { color: { rgb: '999999' } };
const green     = { color: { rgb: '2E8B57' } };
const warn      = { color: { rgb: 'E07B39' } };

const moneyIL   = '"₪"#,##0';
const pct       = '0"%"';
const num       = '#,##0';

function cell(v, font = {}, fill = null, numFmt = null, align = 'right') {
  const c = { v, t: typeof v === 'number' ? 'n' : 's' };
  const s = {};
  if (Object.keys(font).length) s.font = font;
  if (fill) s.fill = { patternType: 'solid', ...fill };
  if (numFmt) { s.numFmt = numFmt; c.t = 'n'; }
  s.alignment = { horizontal: align, wrapText: true };
  if (Object.keys(s).length) c.s = s;
  return c;
}
const C  = (v, f = {}, fill = null, fmt = null) => cell(v, f, fill, fmt, 'right');
const CL = (v, f = {}, fill = null, fmt = null) => cell(v, f, fill, fmt, 'left');
const CC = (v, f = {}, fill = null, fmt = null) => cell(v, f, fill, fmt, 'center');

function fCell(formula, font = {}, fill = null, numFmt = null) {
  const c = { f: formula, t: 'n' };
  const s = {};
  if (Object.keys(font).length) s.font = font;
  if (fill) s.fill = { patternType: 'solid', ...fill };
  if (numFmt) s.numFmt = numFmt;
  s.alignment = { horizontal: 'right' };
  if (Object.keys(s).length) c.s = s;
  return c;
}

const wb = XLSX.utils.book_new();

// ══════════════════════════════════════════════
// SHEET 1 — השוואת חברות שליחויות
// ══════════════════════════════════════════════

const companies = [
  'דואר ישראל (דואר שליחים)',
  'הום דילברי (Home Delivery)',
  'יונט קארגו',
  'נאוי לוגיסטיקה',
  'ATA לוגיסטיקה',
  'Box.it',
  'Speedex',
  'TNT / FedEx',
  'כץ משלוחים (Katz)',
  'HFD שליחויות ולוגיסטיקה',
  'קארגו (Kargo)',
  "צ'יטה שליחויות (Cheetah)",
  'תפוז שליחויות (Tapuz)',
  'YDM',
]

const ws1_data = [
  // Row 0: Title
  [CL('SPINZ — השוואת הצעות מחיר שליחויות', { bold: true, size: 16 }, dark),
   null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],

  // Row 1: Subtitle
  [CL('חבילה: 130×18×74 ס"מ · 12 ק"ג · מהמחסן עד הלקוח', muted),
   null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],

  [null],

  // Row 3: Section label — COSTS
  [CC('── עלויות ──', boldGold, lightBg),
   CC('', {}, lightBg), CC('', {}, lightBg), CC('', {}, lightBg),
   CC('', {}, lightBg), CC('', {}, lightBg), CC('', {}, lightBg),
   CC('── שירות ──', boldGold, blueBg),
   CC('', {}, blueBg), CC('', {}, blueBg), CC('', {}, blueBg), CC('', {}, blueBg),
   CC('── ביטוח ──', boldGold, greenBg),
   CC('', {}, greenBg), CC('', {}, greenBg),
   CC('── טכנולוגיה ──', boldGold, yellowBg),
   CC('', {}, yellowBg),
   CC('── קשר ──', boldGold, grayBg),
   CC('', {}, grayBg),
   CC('הערות', bold),
  ],

  // Row 4: Column headers
  [
    CC('שם חברה', bold),
    CC('מחיר בסיס\nלחבילה (₪)', bold, lightBg),
    CC('תוספת\nחריג אורך (₪)', bold, lightBg),
    CC('תוספת\nפריפריה (₪)', bold, lightBg),
    CC('היטל\nדלק (%)', bold, lightBg),
    CC('ניסיון מסירה\nנוסף (₪)', bold, lightBg),
    CC('החזרה\nלוגיסטיקה הפוכה (₪)', bold, lightBg),
    CC('זמן אספקה\nמרכז (ימים)', bold, blueBg),
    CC('זמן אספקה\nפריפריה (ימים)', bold, blueBg),
    CC('תדירות\nאיסוף', bold, blueBg),
    CC('Cut-off\ntime', bold, blueBg),
    CC('מינימום\nחבילות לאיסוף', bold, blueBg),
    CC('ביטוח סטנדרטי\nמכסה עד (₪)', bold, greenBg),
    CC('השתתפות\nעצמית (₪)', bold, greenBg),
    CC('דרישות אריזה\nלביטוח', bold, greenBg),
    CC('API /\nאינטגרציה', bold, yellowBg),
    CC('מדפסת טרמית\n(מי מספק?)', bold, yellowBg),
    CC('איש קשר\nאישי', bold, grayBg),
    CC('טלפון\nישיר', bold, grayBg),
    CC('הערות', bold),
  ],

  // Rows 5-18: Companies (empty for filling in)
  ...companies.map(name => [
    CL(name, bold),
    C('', {}, lightBg),
    C('', {}, lightBg),
    C('', {}, lightBg),
    C('', {}, lightBg),
    C('', {}, lightBg),
    C('', {}, lightBg),
    C('', {}, blueBg),
    C('', {}, blueBg),
    C('', {}, blueBg),
    C('', {}, blueBg),
    C('', {}, blueBg),
    C('', {}, greenBg),
    C('', {}, greenBg),
    C('', {}, greenBg),
    C('', {}, yellowBg),
    C('', {}, yellowBg),
    C('', {}, grayBg),
    C('', {}, grayBg),
    CL(''),
  ]),
]

const ws1 = XLSX.utils.aoa_to_sheet(ws1_data)

ws1['!cols'] = [
  { wch: 30 }, // שם חברה
  { wch: 13 }, // מחיר בסיס
  { wch: 13 }, // תוספת חריג
  { wch: 13 }, // תוספת פריפריה
  { wch: 10 }, // היטל דלק
  { wch: 13 }, // ניסיון מסירה
  { wch: 16 }, // החזרה
  { wch: 13 }, // זמן מרכז
  { wch: 13 }, // זמן פריפריה
  { wch: 14 }, // תדירות
  { wch: 12 }, // cut-off
  { wch: 14 }, // מינימום
  { wch: 14 }, // ביטוח
  { wch: 13 }, // השתתפות
  { wch: 16 }, // דרישות אריזה
  { wch: 12 }, // API
  { wch: 16 }, // מדפסת
  { wch: 18 }, // איש קשר
  { wch: 14 }, // טלפון
  { wch: 28 }, // הערות
]

ws1['!rows'] = [
  { hpt: 28 }, // title
  { hpt: 18 }, // subtitle
  { hpt: 8  }, // spacer
  { hpt: 20 }, // section headers
  { hpt: 44 }, // column headers
  ...companies.map(() => ({ hpt: 22 })),
]

ws1['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 19 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 19 } },
  { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },   // עלויות
  { s: { r: 3, c: 7 }, e: { r: 3, c: 11 } },   // שירות
  { s: { r: 3, c: 12 }, e: { r: 3, c: 14 } },  // ביטוח
  { s: { r: 3, c: 15 }, e: { r: 3, c: 16 } },  // טכנולוגיה
  { s: { r: 3, c: 17 }, e: { r: 3, c: 18 } },  // קשר
]

ws1['!freeze'] = { xSplit: 1, ySplit: 5 }
ws1['!sheetView'] = { rightToLeft: true }
XLSX.utils.book_append_sheet(wb, ws1, 'השוואת חברות')


// ══════════════════════════════════════════════
// SHEET 2 — סימולטור עלות חודשית
// ══════════════════════════════════════════════

const ws2_data = [
  [CL('SPINZ — סימולטור עלות שליחויות חודשית', { bold: true, size: 16 }, dark),
   null,null,null,null],

  [CL('הכנס כמות חבילות — הטבלה מחשבת אוטומטית עלות חודשית לכל חברה', muted),
   null,null,null,null],

  [null],

  [CL('כמות חבילות בחודש:', bold),
   C(50, { bold: true, size: 14, color: { rgb: 'C9A870' } }, lightBg, num),
   CL('← שנה כאן', muted), null, null],

  [null],

  [
    CC('שם חברה', bold),
    CC('מחיר בסיס (₪)', bold, lightBg),
    CC('תוספת חריג + פריפריה (₪)', bold, lightBg),
    CC('עלות לחבילה (₪)', bold, grayBg),
    CC('עלות חודשית (₪)', { bold: true, color: { rgb: 'C9A870' } }, dark),
  ],

  ...companies.map((name, i) => {
    // Row index in sheet: title=0, sub=1, blank=2, qty=3, blank=4, header=5, data starts at 6
    const dataRow = 6 + i // 0-indexed
    const baseCol  = 'B'  // מחיר בסיס מגיליון 1
    const addCol   = 'C'  // תוספות
    const qtyCell  = 'B4' // כמות
    return [
      CL(name, bold),
      C('', {}, lightBg, moneyIL),           // מחיר בסיס — ימולא ידנית
      C('', {}, lightBg, moneyIL),           // תוספות — ימולא ידנית
      fCell(`B${dataRow+1}+C${dataRow+1}`, bold, grayBg, moneyIL),
      fCell(`D${dataRow+1}*$B$4`, { bold: true, color: { rgb: 'C9A870' } }, dark, moneyIL),
    ]
  }),

  [null],

  [
    CL('סה"כ — חברה הזולה ביותר', { bold: true, color: { rgb: '2E8B57' } }),
    null, null, null,
    fCell(`MIN(E6:E${6+companies.length})`, { bold: true, color: { rgb: '2E8B57' } }, greenBg, moneyIL),
  ],
  [
    CL('סה"כ — חברה היקרה ביותר', muted),
    null, null, null,
    fCell(`MAX(E6:E${6+companies.length})`, muted, null, moneyIL),
  ],
  [
    CL('הפרש (יקרה פחות זולה)', { italic: true }),
    null, null, null,
    fCell(`MAX(E6:E${6+companies.length})-MIN(E6:E${6+companies.length})`, { italic: true }, null, moneyIL),
  ],
]

const ws2 = XLSX.utils.aoa_to_sheet(ws2_data)

ws2['!cols'] = [
  { wch: 30 },
  { wch: 18 },
  { wch: 22 },
  { wch: 18 },
  { wch: 20 },
]

ws2['!rows'] = [
  { hpt: 28 },
  { hpt: 18 },
  { hpt: 8 },
  { hpt: 26 },
  { hpt: 8 },
  { hpt: 22 },
  ...companies.map(() => ({ hpt: 22 })),
]

ws2['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
]

ws2['!sheetView'] = { rightToLeft: true }
XLSX.utils.book_append_sheet(wb, ws2, 'סימולטור עלות')


// ══════════════════════════════════════════════
// SHEET 3 — שאלות לשאול כל חברה
// ══════════════════════════════════════════════

const questions = [
  ['עלויות', 'מה המחיר לחבילה בגודל 130×18×74 ס"מ / 12 ק"ג?'],
  ['עלויות', 'האם יש תוספת חריג על אורך מעל מטר? כמה?'],
  ['עלויות', 'האם יש תוספת לפריפריה / יישובי קצה?'],
  ['עלויות', 'האם המחיר כפוף להיטל דלק? מה האחוז הנוכחי?'],
  ['עלויות', 'מה עלות ניסיון מסירה שני/שלישי כשהלקוח לא זמין?'],
  ['עלויות', 'מה עלות לוגיסטיקה הפוכה (החזרה מלקוח)?'],
  ['שירות', 'מה זמן האספקה ללקוח — מרכז הארץ?'],
  ['שירות', 'מה זמן האספקה — פריפריה / ערים רחוקות?'],
  ['שירות', 'מה תדירות האיסוף מהמחסן שלנו? (יומי / יומיים / שבועי)'],
  ['שירות', 'מה שעת הcut-off היומית לאיסוף?'],
  ['שירות', 'האם יש מינימום כמות חבילות לאיסוף?'],
  ['ביטוח', 'מה גובה הביטוח הסטנדרטי על חבילה (מה מכוסה)?'],
  ['ביטוח', 'מה גובה ההשתתפות העצמית במקרה נזק/אובדן?'],
  ['ביטוח', 'האם יש דרישות אריזה ספציפיות למימוש הביטוח?'],
  ['טכנולוגיה', 'האם יש API או פלאגין לחיבור לאתר?'],
  ['טכנולוגיה', 'האם אתם מספקים מדפסת טרמית (Zebra וכד\') וגלילים?'],
  ['קשר', 'האם יש מנהל תיק אישי עם טלפון ישיר (לא מוקד)?'],
]

const ws3_data = [
  [CL('SPINZ — שאלות לשאול כל חברת שליחויות', { bold: true, size: 16 }, dark), null, null],
  [CL('העתק ושלח בפנייה לכל חברה — בקש מענה בכתב', muted), null, null],
  [null],
  [CC('קטגוריה', bold), CL('שאלה', bold), CL('תשובה', bold)],
  ...questions.map(([cat, q]) => [
    CC(cat, {}, cat === 'עלויות' ? lightBg : cat === 'שירות' ? blueBg : cat === 'ביטוח' ? greenBg : cat === 'טכנולוגיה' ? yellowBg : grayBg),
    CL(q, {}),
    CL(''),
  ]),
]

const ws3 = XLSX.utils.aoa_to_sheet(ws3_data)
ws3['!cols'] = [{ wch: 14 }, { wch: 58 }, { wch: 36 }]
ws3['!rows'] = [{ hpt: 28 }, { hpt: 18 }, { hpt: 8 }, { hpt: 22 }, ...questions.map(() => ({ hpt: 22 }))]
ws3['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
]
ws3['!sheetView'] = { rightToLeft: true }
XLSX.utils.book_append_sheet(wb, ws3, 'שאלות לחברות')


// ── Write ──
const outPath = './spinz-shipping-comparison.xlsx'
XLSX.writeFile(wb, outPath)
console.log('✓ נוצר:', outPath)
