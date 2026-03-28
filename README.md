# Spinz — Landing Page

אופני עיר סינגל ספיד. דף נחיתה בנוי עם React + TypeScript + Tailwind CSS + Framer Motion.

---

## דרישות מקדימות

- [Node.js](https://nodejs.org) גרסה 18 ומעלה
- npm גרסה 9 ומעלה

---

## התקנה והרצה

```bash
# 1. כנס לתיקיית הפרויקט
cd "spinz website"

# 2. התקן תלויות
npm install

# 3. הרץ סביבת פיתוח
npm run dev
```

הפרויקט יעלה על `http://localhost:3000`

---

## פקודות

| פקודה | תיאור |
|---|---|
| `npm run dev` | סביבת פיתוח עם HMR |
| `npm run build` | בנייה לפרודקשן (output: `dist/`) |
| `npm run preview` | תצוגה מקדימה של ה-build על port 4000 |
| `npm run lint` | בדיקת ESLint |

---

## מבנה הפרויקט

```
spinz website/
├── public/
│   └── assets/
│       ├── hero-bike.svg        ← החלף בתמונת אופניים ראשית
│       ├── model-1.svg          ← החלף בתמונת STREET 01
│       ├── model-2.svg          ← החלף בתמונת URBAN X
│       ├── model-3.svg          ← החלף בתמונת TRACK R
│       ├── gallery-1.svg        ← החלף בתמונות אינסטגרם (1-6)
│       └── ...
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── BrandStatement.tsx
│   │   ├── Models.tsx
│   │   ├── Gallery.tsx
│   │   ├── LeadForm.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── models.ts            ← עדכן מחירים, שמות, תכונות
│   ├── pages/
│   │   └── Index.tsx
│   ├── styles/
│   │   └── globals.css
│   └── main.tsx
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## התאמה אישית

### 1. תמונות

החלף את קבצי ה-SVG ב-`public/assets/` בתמונות אמיתיות (JPG/WebP מומלץ).
עדכן את ה-extension בקבצים הבאים:

- `src/components/Hero.tsx` — שורה עם `src="/assets/hero-bike.svg"`
- `src/data/models.ts` — שדה `image` לכל מודל
- `src/components/Gallery.tsx` — מערך `photos`

### 2. מודלים ומחירים

ערוך את `src/data/models.ts`:

```ts
{
  id: 'street-01',
  name: 'STREET 01',
  tagline: 'הקלאסיק של הרחוב',
  image: '/assets/model-1.jpg',
  price: 2490,               // ← עדכן מחיר
  accentColor: '#E8FF00',
  features: [
    { label: 'פריים', value: 'Chromoly Steel' },
    // ...
  ],
}
```

### 3. WhatsApp

ערוך את `src/components/Footer.tsx`, שורה 5:

```ts
const WHATSAPP_NUMBER = '+972500000000'; // ← מספר אמיתי
```

### 4. Instagram

חפש `@spinz` בקבצים והחלף ב-handle האמיתי:
- `src/components/Gallery.tsx`
- `src/components/Footer.tsx`

### 5. טופס לידים (EmailJS)

הירשם בחינם על [emailjs.com](https://emailjs.com) וערוך את `src/components/LeadForm.tsx`:

```ts
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
```

---

## Deploy

### Vercel (מומלץ)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# גרור את תיקיית dist/ לממשק Netlify
```

### GitHub Pages

```bash
npm run build
# העלה את תיקיית dist/ ל-gh-pages branch
```

---

## Stack

| טכנולוגיה | גרסה | תפקיד |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Framer Motion | 11 | Animations |
| React Hook Form | 7 | Form validation |
| EmailJS | 4 | Form submission |
| Lucide React | latest | Icons |

---

## פונטים

- **Bebas Neue** — כותרות ראשיות
- **DM Sans** — UI, לייבלים, כפתורים
- **Heebo** — טקסט עברי

טעונים מ-Google Fonts דרך `index.html`.

---

## פלטת צבעים

| שם | Hex |
|---|---|
| Background | `#0A0A0A` |
| Surface | `#161616` |
| Accent Yellow | `#E8FF00` |
| Accent Orange | `#FF4D00` |
| Text Primary | `#F5F5F5` |
| Text Muted | `#888888` |
| Border | `#2A2A2A` |
