# מבנה האתר הנוכחי — Spinz
> תיעוד מצב האתר נכון ליוני 2026. שמור לצורך הפניה עתידית.

---

## עמודים (Pages)

### `/` — עמוד בית (Index.tsx)
סדר הסקשנים מלמעלה למטה:
1. **Navbar** — תפריט עליון קבוע (לוגו + ניווט + עגלה + המבורגר)
2. **Hero** — תמונת hero עם כיתוב ראשי וכפתור CTA
3. **VideoSection** — סרטון מלא מסך עם כיתוב "BUILT FOR THE CITY", כפתור השתקה
4. **SpinzVibe** — סקשן "לא בשביל הדרך, בשביל הרגעים" + טקסט הסיפור הקצר + כפתור "הסיפור המלא"
5. **ScrollyFeatures** — 4 פאנלים scrollytelling (תופס עיניים / נגיש באמת / פשוט וטהור / ישראלי בנשמה) עם תמונות sticky
6. **Models** — בחירת צבע (שחור/בז'/זית) + מידה (54/57) + הוספה לסל
7. **Lifestyle** — גלריה אווירה (תמונות lifestyle)
8. **Reviews** — המלצות לקוחות
9. **Specs** — מפרט טכני
10. **FAQ** — שאלות ותשובות
11. **LeadForm** — טופס השארת פרטים (שם + טלפון + אימייל)
12. **Footer** — לינקים לתנאים/נגישות, אינסטגרם, מייל

### `/story` — הסיפור שלנו (Story.tsx)
- Header קבוע עם לוגו + "חזרה לאתר →"
- Layout שתי עמודות: תמונה sticky משמאל + טקסט גולל מימין
- 6 סקשני טקסט עם כותרות (החופש של פעם / ואז הגענו לתל אביב / פשוט לרכוב / ככה נולד Spinz / למה לא ברוטשילד / בשורה התחתונה)
- כפתור CTA "בואו להכיר את הדגמים ←"

### `/terms` — מדיניות פרטיות ותנאי שימוש (Terms.tsx)
- Header + "חזרה לאתר →"
- טאבים: תנאי שימוש / מדיניות פרטיות / מדיניות החזרות / מדיניות משלוח

### `/accessibility` — הצהרת נגישות (Accessibility.tsx)
- Header + "חזרה לאתר →"
- תוכן הצהרת נגישות

### `/waitlist` — Waitlist (Waitlist.tsx)
- עמוד ייעודי לרשימת המתנה

---

## קומפוננטות (Components)

| קובץ | תיאור |
|------|--------|
| `Navbar.tsx` | תפריט עליון: לוגו, ניווט (עלינו/דגמים/גלריה/הסיפור), עגלה, המבורגר |
| `Hero.tsx` | תמונת פתיחה עם כיתוב וכפתור |
| `VideoSection.tsx` | סרטון מלא מסך, desktop: spinz-video-compressed.mp4, mobile: spinz-mobile.mp4 |
| `SpinzVibe.tsx` | סקשן "למה Spinz" + טקסט קצר + קישור לסיפור |
| `ScrollyFeatures.tsx` | 4 שלבי scrollytelling עם תמונות sticky (desktop) / כרטיסים (mobile) |
| `Models.tsx` | בוחר צבע/מידה + עגלה + Supabase לבדיקת מלאי ומחיר |
| `Lifestyle.tsx` | גלריית תמונות אווירה |
| `Reviews.tsx` | המלצות לקוחות |
| `Specs.tsx` | מפרט טכני (שלדה, גלגלים, בלמים וכו') |
| `FAQ.tsx` | שאלות ותשובות accordion |
| `LeadForm.tsx` | טופס השארת פרטים → Supabase |
| `Footer.tsx` | לינקים, מייל, אינסטגרם |
| `CartDrawer.tsx` | מגירת עגלה (drawer מימין) |
| `CartContext.tsx` | Context לניהול מצב העגלה |
| `Loader.tsx` | מסך טעינה ראשוני (פעם אחת לסשן) |
| `CookieBanner.tsx` | באנר עוגיות |
| `WaitlistCookieBar.tsx` | באר Waitlist |
| `AccessibilityWidget.tsx` | ווידג'ט נגישות |
| `CustomCursor.tsx` | עכבר מותאם |
| `BrandStatement.tsx` | הצהרת מותג |
| `AboutModal.tsx` | מודאל "עלינו" |
| `PrivacyModal.tsx` | מודאל פרטיות |
| `AtmosphereSection.tsx` | סקשן אווירה |
| `About.tsx` | עמוד "עלינו" |
| `BottomNav.tsx` | ניווט תחתון (mobile) |
| `PasswordGate.tsx` | שער סיסמה |

---

## נתונים (Data)

| קובץ | תיאור |
|------|--------|
| `src/data/models.ts` | colorVariants (mat/beige/olive) + sizeVariants (54/57) + prices |

---

## Assets עיקריים

| קובץ | תיאור |
|------|--------|
| `/assets/spinz-video-compressed.mp4` | סרטון desktop (7.4MB) |
| `/assets/spinz-mobile.mp4` | סרטון mobile (1.6MB, חתוך מ-0:33) |
| `/assets/bike-mat-new.png` | אופניים שחור מט |
| `/assets/bike-beige-new.png` | אופניים בז' |
| `/assets/bike-olive-new.png` | אופניים ירוק זית |
| `/assets/bike-beige-3d.glb` | מודל תלת מימד אופניים בז' (22MB) |
| `/assets/story-hero.jpg` | תמונת hero לעמוד הסיפור |
| `/assets/hero-bg-new.jpg` | תמונת hero ראשי |
| `/assets/logo.png` | לוגו Spinz |
| `/assets/photo-beige-bike.jpg` | ScrollyFeatures שלב 1 |
| `/assets/photo-olive-lifestyle.jpg` | ScrollyFeatures שלב 2 |
| `/assets/black1.jpg` | ScrollyFeatures שלב 3 |
| `/assets/for-hero.jpg` | ScrollyFeatures שלב 4 |

---

## צבעי מותג

| משתנה | ערך | שימוש |
|--------|-----|--------|
| GOLD | `#C9A870` | כפתורים ראשיים, הדגשות |
| DARK | `#1C1C1C` | רקע כהה, טקסט ראשי |
| CREAM | `#EDEBE6` | טקסט על רקע כהה |
| BG | `#F5F2EC` | רקע בהיר ראשי |
| BORDER | `#E0DCD4` | גבולות |
| MUTED | `#9A9690` | טקסט משני |

---

## Backend / Integrations

- **Supabase** — מלאי, מחירים, הזמנות, leads
- **Google Analytics** — `G-Q414LWJ252`
- **Vercel** — deploy אוטומטי מ-GitHub (repo: omergalog/spinz)
- **Domain** — `spinzbikes.com`
