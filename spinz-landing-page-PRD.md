# 🚲 Spinz — Landing Page PRD
**Product Requirements Document for Claude Code**

---

## 1. Overview

**Brand:** Spinz  
**Product:** אופני עיר סינגל ספיד (Single Speed Urban Bikes)  
**Goal:** דף נחיתה שמשלב הצגת ברנד, יצירת לידים, וכניסה לחנות אונליין  
**Stack:** React + TypeScript + Tailwind CSS + Framer Motion  
**Reference vibe:** Pillar Company (pillar-company.com) — clean, bold, premium streetwear energy

---

## 2. Visual Direction

### Aesthetic
- **סגנון:** צבעוני / אנרגטי — לא פחד מצבע, לא "בטוח"
- **Mood:** Street culture meets precision engineering. NYC/Tokyo bike messenger meets boutique brand.
- **Theme:** Dark base (`#0A0A0A` / `#111111`) עם accents אנרגטיים — ניאון צהוב (#E8FF00), כתום חם, או lime green
- **לא:** pastel, minimalist-white, generic SaaS vibes

### Typography
- **Display font:** `Bebas Neue` או `Anton` — bold, all-caps, high energy
- **Body font:** `DM Sans` או `Syne` — clean, urban, readable
- **Hebrew support:** Heebo או Assistant לטקסט עברי

### Color Palette
```
Background:    #0A0A0A (almost black)
Surface:       #161616
Accent 1:      #E8FF00 (electric yellow-green)
Accent 2:      #FF4D00 (hot orange)
Text Primary:  #F5F5F5
Text Muted:    #888888
Border:        #2A2A2A
```

### Motion / Animations
- Hero: staggered entrance — לוגו fade-in, headline slide-up, bike image parallax
- Scroll-triggered reveals על כל section
- Bike product cards: hover = slight tilt + glow shadow
- CTA buttons: magnetic hover effect
- Background: subtle grain texture overlay

---

## 3. Site Structure & Sections

### Section 1: Hero (Above the Fold)
**מטרה:** תפוס תשומת לב תוך 2 שניות

**תוכן:**
- Logo: `SPINZ` בטיפוגרפיה גדולה
- Tagline: `"רכוב עיר. בלי הפשרות."` (או `"Built for the streets"`)
- תמונת אופניים גדולה — full-bleed, dramatic angle
- 2 כפתורי CTA ראשיים:
  - `"גלה את המודלים"` → scroll to bikes section
  - `"לחנות"` → link to shop URL

**Layout:** Full viewport height, centered or left-aligned headline, bike image on right (desktop) / below (mobile)

---

### Section 2: Brand Statement ("Why Spinz")
**מטרה:** לבנות אמינות ו-vibe

**תוכן:**
- כותרת: `"לא סתם אופניים"` 
- 3 נקודות ערך בכרטיסים:
  1. 🔧 **בנוי לסבול** — פריים חזק, רכיבים אמינים
  2. 🎨 **עיצוב שמדבר** — כל מודל עם אישיות
  3. ⚡ **סינגל ספיד = חופש** — פשוט, קל, מהיר

**Layout:** 3 cards side-by-side, icon + title + short text, dark surface background

---

### Section 3: Models / Products
**מטרה:** הצגת 1-3 מודלים יוקרתיים

**תוכן לכל מודל:**
- שם המודל (גדול)
- תמונה של האופניים
- 2-3 תכונות מרכזיות (frame material, color options, etc.)
- מחיר
- כפתור: `"לפרטים"` / `"להזמנה"`

**Layout:** Horizontal scroll cards on mobile, grid 1-3 columns on desktop  
**אפקט:** On hover — תמונה מתרחבת קלות, glow בצבע ה-accent

---

### Section 4: Social Proof / Gallery
**מטרה:** trust + FOMO

**תוכן:**
- כותרת: `"Spinz in the Wild"`
- Grid של 6 תמונות (placeholder grid — user יחליף בתמונות אמיתיות מאינסטגרם)
- Instagram handle link: `@spinz`

**Layout:** Masonry grid או uniform 3x2 grid

---

### Section 5: Lead Generation
**מטרה:** תפוס לידים מאנשים שמתעניינים אבל לא קנו עדיין

**תוכן:**
- כותרת: `"רוצה לדעת מתי מגיע המודל הבא?"`
- Sub: `"הרשם ותהיה הראשון לדעת"`
- Form fields: שם + אימייל (אפשר גם WhatsApp)
- CTA Button: `"אני רוצה לדעת"`

**Tech:** Form submission → EmailJS / Formspree (easy to set up, no backend needed)  
**Visual:** Centered on dark background, accent color on button, subtle border glow

---

### Section 6: Footer
**תוכן:**
- לוגו Spinz
- ניווט: בית | מודלים | חנות | צור קשר
- סושיאל: Instagram / TikTok icons
- WhatsApp contact button (fixed bottom-right on mobile too)
- `© 2025 Spinz. כל הזכויות שמורות`

---

## 4. Technical Requirements

### Stack
```
Framework:     React + TypeScript (Vite)
Styling:       Tailwind CSS
Animations:    Framer Motion
Routing:       React Router (כבר קיים)
Forms:         React Hook Form + EmailJS
Fonts:         Google Fonts (Bebas Neue, DM Sans, Heebo)
Icons:         Lucide React
```

### File Structure
```
src/
├── pages/
│   └── Index.tsx          ← דף הנחיתה הראשי (זה הקובץ שיש לך)
├── components/
│   ├── Hero.tsx
│   ├── BrandStatement.tsx
│   ├── Models.tsx
│   ├── Gallery.tsx
│   ├── LeadForm.tsx
│   └── Footer.tsx
├── data/
│   └── models.ts          ← data של המודלים (קל לעדכן)
└── styles/
    └── globals.css
```

### Responsive Breakpoints
- Mobile first
- `sm: 640px` | `md: 768px` | `lg: 1024px` | `xl: 1280px`

### Performance
- Images: WebP format, lazy loading
- Fonts: preload critical fonts
- Animations: `will-change`, `prefers-reduced-motion` support

---

## 5. Content Placeholders (להחליף)

| מקום | Placeholder | מה להחליף |
|------|-------------|------------|
| Hero image | `/assets/hero-bike.jpg` | תמונת אופניים ראשית |
| Model images | `/assets/model-1.jpg` etc. | תמונות לכל מודל |
| Gallery | 6 placeholder boxes | תמונות אינסטגרם |
| Shop URL | `#shop` | הקישור לחנות |
| Instagram | `@spinz` | ה-handle האמיתי |
| EmailJS | `YOUR_SERVICE_ID` | credentials |
| WhatsApp | `+972XXXXXXXXX` | מספר טלפון |

---

## 6. Instructions for Claude Code

כשאתה פותח Claude Code, תן לו את הפרומפט הזה:

> **"בנה לי דף נחיתה ל-Spinz — מותג אופני עיר סינגל ספיד. פרטים מלאים ב-PRD המצורף. 
> הקובץ `Index.tsx` כבר קיים ומכיל redirect ל-`/` — תחליף אותו בדף הנחיתה המלא.
> הסגנון: dark theme, electric yellow accent (#E8FF00), Bebas Neue לכותרות, Framer Motion לאנימציות.
> בנה כל section כ-component נפרד."**

---

## 7. Next Steps

1. ✅ פתח Claude Code בטרמינל: `claude`
2. ✅ הדבק את ה-PRD הזה כהקשר ראשוני
3. ✅ תן לו לבנות section אחד בכל פעם — תאשר לפני שממשיך
4. ✅ תחליף placeholders בתמונות ותוכן אמיתי
5. ✅ Deploy: Vercel / Netlify (חינמי)
