# סיכום פרויקט SPINZ — מסמך מעבר מלא

---

## 3 הפרויקטים

| תיקייה | GitHub | כתובת | תפקיד |
|---|---|---|---|
| `spinz website` | omergalog/spinz | spinzbikes.com | האתר הראשי |
| `spinz-admin` | omergalog/spinz-admin | — | דשבורד ניהול פנימי |
| `spinz-vote` | omergalog/spinz-vote | — | סקר צבעים ללקוחות |

---

## איך להתחיל על מק חדש

```bash
cd ~/Desktop
git clone https://github.com/omergalog/spinz.git "spinz website"
git clone https://github.com/omergalog/spinz-admin.git
git clone https://github.com/omergalog/spinz-vote.git

cd "spinz website" && npm install
cd ../spinz-admin && npm install
cd ../spinz-vote && npm install
```

אחרי git clone — להעתיק ידנית את קבצי `.env` לכל תיקייה (אם קיימים).
להעתיק את תיקיית `~/.claude` מהווינדוס למק כדי לשמור את זיכרון Claude.

---

## תשתית — Supabase + Vercel + Stripe

- **Supabase** — בסיס הנתונים (PostgreSQL). מכיל: הזמנות, לידים, מלאי, הוצאות, סקר צבעים, מק"טים
- **Vercel** — hosting לאתר הראשי. מחובר ל-GitHub — כל push ל-main מפעיל deploy אוטומטי
- **Stripe** — תשלומים. יש מפתחות live ו-test
- **חשוב:** כל שינוי קוד → git commit + git push → Vercel מעדכן אוטומטית

---

## האתר הראשי — spinzbikes.com

### עמוד ראשי (Index.tsx) — סדר הסקשנים
1. **Navbar** — ניווט עם לוגו, קישורים, כפתור סל
2. **Hero** — תמונת רקע כהה, כותרת SPINZ ענקית, 2 כפתורי CTA, אינדיקטור גלילה
3. **VideoSection** — סרטון fullscreen אוטומטי ללא קול עם טקסט "BUILT FOR THE CITY"
4. **SpinzVibe** — "אנחנו לא מוכרים אופניים" — רקע פרלקס עם תמונה, 4 ערכים, סטטיסטיקות, קישור לסיפור
5. **Models** — בחירת צבע + מידה + הוספה לסל
6. **Lifestyle** — "הרחוב הוא שלך" — תמונה עם פרלקס
7. **AtmosphereOne** — תמונת אווירה 1 עם פרלקס + טקסט "רוכבים בסטייל"
8. **Reviews** — ביקורות לקוחות
9. **AtmosphereTwo** — תמונת אווירה 2 עם פרלקס + טקסט "העיר שלך"
10. **Specs** — מפרט טכני
11. **FAQ** — שאלות נפוצות
12. **LeadForm** — טופס יצירת קשר
13. **Footer**

### עמוד נחיתה — waitlist.spinzbikes.com
- קובץ: `src/pages/Waitlist.tsx`
- בוחרים צבע → בוחרים מידה → ממלאים שם + אימייל + טלפון → שולחים
- תמונות האופניים מגיעות מתיקיית `public/assets/` (bike-mat-new.png וכו')
- נתונים נשמרים ב-Supabase

### צבעים ומידות
```
colorVariants (src/data/models.ts):
- mat:   שחור מט  | hex: #2C2C2C | skuCode: MAT | image: bike-mat-new.png
- beige: בז'       | hex: #C4A882 | skuCode: BEI | image: bike-beige-new.png
- olive: ירוק זית | hex: #6B7C5C | skuCode: OLG | image: bike-olive-new.png

sizeVariants:
- 54: גובה 160–175 ס"מ
- 57: גובה 175–190 ס"מ
```

### סל קניות ותשלום
- `src/context/CartContext.tsx` — מנהל את הסל. CartItem מכיל: colorId, colorLabel, colorSkuCode, size
- `src/components/CartDrawer.tsx` — drawer צדדי עם הזמנות
  - מוצא SKU פנוי לפי size + colorSkuCode
  - מוריד מלאי אוטומטית ב-Supabase
  - שולח לתשלום ב-Stripe
- פילטור localStorage: פריטים ישנים ללא השדות החדשים נמחקים אוטומטית

### טכנולוגיות האתר
- React + TypeScript + Vite
- Tailwind CSS (עיצוב responsive)
- Framer Motion (כל האנימציות — פרלקס, reveal, slide)
- Lenis (smooth scroll)
- Supabase JS client
- Stripe JS

---

## דשבורד ניהול — spinz-admin

### כניסה
- מאובטח עם Supabase Auth
- רק למשתמשים מורשים

### עמודים

#### סקירה כללית
- כרטיסי מפתח: הזמנות היום, הכנסות החודש, מלאי כולל, לידים חדשים

#### פניות (Leads)
- כל מי שמילא טופס יצירת קשר באתר
- שם, אימייל, טלפון, הודעה, תאריך

#### הזמנות (Orders)
- רשימת כל ההזמנות מ-Supabase
- שדות: שם לקוח, אימייל, טלפון, כתובת, וריאנט (צבע + מידה), מחיר, סטטוס, תאריך
- שדות SKU: size, color, sku_id, sku_code
- אפשרות ביטול — משנה סטטוס ל-cancelled, לא מוחק
- **חשוב:** לעולם לא מוחקים הזמנות, רק מבטלים

#### ניהול מלאי (Inventory)
- 6 וריאנטים (3 צבעים × 2 מידות)
- צבעים ב-dashboard: mat (#2C2C2C), beige (#C4A882), olive (#6B7C5C)
- עדכון כמות ידני + ירידה אוטומטית בהזמנה
- סדר תצוגה: ['mat', 'beige', 'olive']

#### כספים (Revenue)
- גרף הכנסות לאורך זמן
- סיכום לפי חודשים

#### הוצאות (Expenses)
- הזנת הוצאות ידנית עם תיאור + סכום + תאריך

#### סטטיסטיקה (Statistics)
- גרפים נוספים על מכירות ופעילות

#### סקר צבעים (Survey)
- תוצאות הסקר מעמוד ה-Vote
- כמה הצביעו לכל צבע

#### מק"טים (SKU Generator)
- רשימת 6 המק"טים הקבועים
- Soft-delete: מק"ט "נמחק" מקבל deleted_at, לא נמחק מה-DB
- nextSerial מחשב לפי כל המק"טים כולל המחוקים — לעולם לא חוזר על מספר
- badge סטטוס: "משויך" (כחול) / "פנוי" (ירוק)

#### ייבוא (Import) — סימולטור
- ממלאים כמויות לכל אחד מ-6 הוריאנטים
- המערכת מחשבת טווח S/N (SN-00001 וכו')
- מדפיסים מדבקות 62mm × 40mm עם 2 ברקודים CODE128:
  - ברקוד גדול: SKU (למשל BC-URB-54-MAT) — "PRODUCT SKU"
  - ברקוד קטן: S/N (למשל SN-00001) — "SERIAL NUMBER"
- הדפסה: אחת אחת או כל הקבוצה
- **חשוב: זה עדיין סימולטור — לא שומר ל-DB**

---

## מערכת SKU ומספרים סידוריים — אפיון מלא

### 6 המק"טים הקבועים
```
BC-URB-54-MAT — Urban · שחור מט · 54
BC-URB-57-MAT — Urban · שחור מט · 57
BC-URB-54-OLG — Urban · ירוק זית · 54
BC-URB-57-OLG — Urban · ירוק זית · 57
BC-URB-54-BEI — Urban · בז' · 54
BC-URB-57-BEI — Urban · בז' · 57
```

### מספר סידורי (S/N)
- פורמט: SN-00001 עד SN-99999
- **גלובלי** — רץ על כל הוריאנטים יחד, לא לפי וריאנט
- **לעולם לא חוזר** — גם אחרי ביטול או מחיקה
- ממשיך רצף בין מכולות

### התהליך המלא
1. **הזמנת מכולה** — ממלאים כמויות בדשבורד, המערכת מקצה טווח S/N מראש
2. **הגעת סחורה** — מסמנים "הגיע", מלאי עולה, S/N נוצרים ב-DB
3. **הדפסת מדבקות** — מדביקים על כל קרטון במחסן
4. **הזמנת לקוח** — לקוח מזמין, מלאי יורד אוטומטית, **אין S/N עדיין**
5. **הכנת משלוח** — סורקים S/N ספציפי בטלפון → המערכת מקשרת להזמנה הפתוחה הבאה (FIFO)
6. **מעקב ואחריות** — כל S/N מקושר ללקוח לנצח

### חוקי ביטול
- ביטול לפני סריקה → order מסומן cancelled, S/N נשאר null (noop)
- ביטול אחרי סריקה (לפני שליחה) → order cancelled, S/N חוזר לפנוי
- ביטול אחרי שליחה → S/N נשאר מקושר לנצח כהיסטוריה

### טבלאות DB שעוד לא נבנו
```sql
-- טבלה 1: הזמנת מכולה
import_orders:
  id             uuid (PK)
  label          text        -- "מכולה ראשונה מאי 2026"
  sn_from        int         -- מספר S/N ראשון
  sn_to          int         -- מספר S/N אחרון
  total_units    int
  status         text        -- pending / arrived / labeled
  created_at     timestamptz
  arrived_at     timestamptz (nullable)

-- טבלה 2: יחידה פיזית
serial_numbers:
  id             uuid (PK)
  sn_code        text        -- SN-00089
  sn_number      int         -- 89 (לשאילתות טווח)
  variant_code   text        -- BC-URB-54-MAT
  size           int         -- 54 / 57
  color          text        -- MAT / BEI / OLG
  import_order_id uuid → import_orders
  order_id       uuid → orders (nullable — null = פנוי)
  shipped_at     timestamptz (nullable)
  created_at     timestamptz
```

### שאילתות מפתח
```sql
-- מציאת יחידה פנויה
SELECT * FROM serial_numbers 
WHERE variant_code = 'BC-URB-54-MAT' AND order_id IS NULL 
LIMIT 1;

-- כל לקוחות מכולה ספציפית (לריקול/QA)
SELECT * FROM serial_numbers 
WHERE import_order_id = '...' AND order_id IS NOT NULL;
```

---

## מה עוד לא בנוי

| פיצ'ר | תיאור |
|---|---|
| ייבוא אמיתי | חיבור סימולטור ל-DB — יצירת import_orders + serial_numbers |
| סריקת S/N במשלוח | עמוד בדשבורד לסריקת ברקוד ב-mobile, קישור להזמנה |
| הצגת S/N ללקוח | אימייל עם S/N אחרי משלוח / תעודת אחריות |
| ניהול החזרות | תהליך החזרת מוצר + עדכון מלאי |

---

## קבצים להעברה ידנית

### תיקייה זו (spinz website / 01 - מעבר ידני למקבוק)
- `אווירה1.png` — תמונת אווירה ראשונה (AtmosphereOne)
- `אווירה 2.png` — תמונת אווירה שנייה (AtmosphereTwo)
- `בז אורי.png` — תמונת בז' מקורית
- `סרטון לאתר.mp4` — סרטון VideoSection (הסרטון הסופי יוחלף בעתיד)

### spinz-admin / 02 - מעבר ידני למקבוק
- `אפיון-מערכת-spinz.html` — מסמך אפיון מערכת ה-SKU המלא

---

## זיכרון Claude — חשוב!
שמור ב-Windows: `C:\Users\user\.claude\`
להעביר למק: `~/.claude/`

מכיל:
- העדפות עבודה
- היסטוריית שיחות (קבצי .jsonl)
- memory files (feedback, project context)
