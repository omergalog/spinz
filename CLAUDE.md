# SPINZ Website — Claude Context

## הפרויקט
אתר מכירות לאופני עיר מסוג סינגל ספיד של חברת SPINZ.
- **האתר הראשי:** spinzbikes.com
- **עמוד נחיתה:** waitlist.spinzbikes.com
- **GitHub:** omergalog/spinz
- **Hosting:** Vercel — כל push ל-main מפעיל deploy אוטומטי

## טכנולוגיות
- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion (אנימציות)
- Lenis (smooth scroll)
- Supabase (DB + Auth)
- Stripe (תשלומים)

## מוצרים
3 צבעים × 2 מידות = 6 וריאנטים:
- שחור מט (MAT): `bike-mat-new.png`
- בז' (BEI): `bike-beige-new.png`
- ירוק זית (OLG): `bike-olive-new.png`
- מידות: 54 (גובה 160–175) , 57 (גובה 175–190)
- מחיר: 2,290 ₪

## מבנה האתר (סדר סקשנים)
Hero → VideoSection → SpinzVibe → Models → Lifestyle → AtmosphereOne → Reviews → AtmosphereTwo → Specs → FAQ → LeadForm → Footer

## קבצים חשובים
- `src/data/models.ts` — צבעים, מידות, SKU codes
- `src/context/CartContext.tsx` — ניהול סל (colorId, colorLabel, colorSkuCode, size)
- `src/components/CartDrawer.tsx` — הקצאת SKU + ירידת מלאי + Stripe
- `src/components/VideoSection.tsx` — סרטון fullscreen
- `src/components/AtmosphereSection.tsx` — 2 תמונות אווירה עם פרלקס
- `src/pages/Waitlist.tsx` — עמוד נחיתה נפרד

## כללי עבודה
- כל שינוי קוד → git commit + git push (Vercel מתעדכן אוטומטית)
- תמונות עם שמות עבריים לא עובדות בדפדפן — תמיד להעתיק עם שם באנגלית
- הפרויקט הזה קשור ל-spinz-admin (דשבורד) ו-spinz-vote (סקר צבעים)
