import { useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';

const DARK   = '#1C1C1C';
const GOLD   = '#C9A870';
const CREAM  = '#EDEBE6';
const BORDER = '#2A2A2A';
const MUTED  = '#6A6862';

const sections = [
  {
    title: null,
    text: 'האמת? הכל התחיל משלושה חברים שגדלו בין הפרדסים של עמק חפר. שם, האופניים היו הכל בשבילנו – הדרך לים, לבית ספר, ובעיקר הדרך להרגיש חופשיים.',
  },
  {
    title: null,
    text: 'כשהחלטנו לארוז את החיים ולעבור לתל אביב, גילינו מהר מאוד שהעיר הזאת היא עולם אחר לגמרי. הפקקים, הלחץ, והמרדף אחרי חניה פשוט הוציאו לנו את החשק לזוז. ניסינו הכל – קורקינטים, אוטובוסים, אופניים עם 21 הילוכים וכבלים שנתקעים בכל חור... ושום דבר לא הרגיש "זה".',
  },
  {
    title: 'אז החלטנו לחזור לבסיס.',
    text: 'נזכרנו באופניים של פעם – אלו שפשוט עולים עליהם ונוסעים. בלי שטויות, בלי הילוכים מיותרים שמתקלקלים בדיוק כשממהרים לעבודה, ובלי משקל כבד שצריך לסחוב לקומה שלישית בלי מעלית.',
  },
  {
    title: 'ככה נולד המותג Spinz.',
    text: 'לקחנו את הפשטות של הסינגל-ספיד (Single Speed) ונתנו לה את הסטייל והדיוק של העיר הגדולה. רצינו לבנות אופניים שנראים מעולה, נוסעים חלק, ובעיקר – לא עושים כאב ראש. אופניים שאפשר לסמוך עליהם מהקפה של הבוקר ועד הבירה של הלילה.',
  },
  {
    title: 'למה אנחנו לא ברוטשילד? (ולמה זה טוב לכם)',
    text: 'חשבנו על זה הרבה. יכולנו לפתוח חנות נוצצת ברוטשילד או בדיזינגוף, אבל אז היינו צריכים לגלגל את השכירות המטורפת הזאת עליכם – וזה בדיוק מה שלא רצינו.\n\nהחלטנו לעשות את זה אחרת: בלי חנויות יוקרה במרכז תל אביב ובלי מתווכים שגוזרים קופון בדרך. בחרנו להשקיע את כל הכסף במוצר עצמו – בשילדות הכי חזקות, בצבעים הכי עמידים ובחלקים שיחזיקו לכם שנים על האספלט. התוצאה? אתם מקבלים אופני פרימיום במחיר הגיוני לגמרי, בלי "לשבור את הכיס".',
  },
  {
    title: 'לסיכום:',
    text: 'Spinz זה השקט שלנו בתוך כל הרעש של תל אביב. זה המותג שלנו, מהילדות בעמק ועד לאספלט של רוטשילד (שאנחנו רוכבים עליו, אבל לא משלמים עליו שכירות), ואנחנו הכי גאים בעולם לחלוק אותו אתכם.',
  },
];

function Section({ section, index }: { section: typeof sections[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '32px', paddingBottom: '32px' }}
    >
      {section.title && (
        <h3 style={{
          fontFamily: "'Heebo', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(15px, 2vw, 19px)',
          color: GOLD,
          margin: '0 0 14px',
          letterSpacing: '0.02em',
        }}>
          {section.title}
        </h3>
      )}
      <p style={{
        fontFamily: "'Heebo', sans-serif",
        fontSize: 'clamp(14px, 1.6vw, 17px)',
        color: '#CCCCCC',
        lineHeight: 1.9,
        margin: 0,
        whiteSpace: 'pre-line',
      }}>
        {section.text}
      </p>
    </motion.div>
  );
}

export default function Story() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ backgroundColor: DARK, minHeight: '100vh' }} dir="rtl">
      <CustomCursor />

      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: DARK,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/assets/logo.png"
              alt="SPINZ"
              style={{ height: '40px', width: 'auto', filter: 'invert(1) brightness(2)', opacity: 0.9 }}
            />
          </Link>
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: "'Heebo', sans-serif",
              fontSize: '13px', fontWeight: 600,
              color: MUTED,
              textDecoration: 'none',
              letterSpacing: '0.05em',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = CREAM; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = MUTED; }}
          >
            ← חזרה לאתר
          </Link>
        </div>
      </header>

      {/* Hero — photo placeholder */}
      <div
        ref={heroRef}
        style={{
          position: 'relative',
          height: 'clamp(340px, 55vh, 640px)',
          backgroundColor: '#141414',
          overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end',
        }}
      >
        {/* Parallax image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            y: imgY,
            position: 'absolute',
            inset: '-15% 0',
            backgroundImage: 'url(/assets/story-hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to left, rgba(0,0,0,0.15), rgba(0,0,0,0.55))',
        }} />

        {/* Gold line decoration */}
        <div style={{
          position: 'absolute', top: '40px', right: '48px',
          width: '3px', height: '80px', backgroundColor: GOLD, opacity: 0.5,
        }} />

        {/* Heading overlay */}
        <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(32px, 5vw, 64px)' }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              display: 'block', marginBottom: '12px',
              fontFamily: "'Heebo', sans-serif",
              fontSize: '11px', letterSpacing: '0.4em',
              textTransform: 'uppercase', color: GOLD,
            }}
          >
            הסיפור שלנו
          </motion.span>
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: '105%' }}
              animate={heroInView ? { y: '0%' } : {}}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
              style={{
                fontFamily: "'Heebo', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(32px, 6vw, 76px)',
                color: CREAM,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              נעים להכיר, אנחנו Spinz.
            </motion.h1>
          </div>
        </div>

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
          background: `linear-gradient(to bottom, transparent, ${DARK})`,
        }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 32px 100px' }}>
        {sections.map((section, i) => (
          <Section key={i} section={section} index={i} />
        ))}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            marginTop: '60px',
            paddingTop: '40px',
            borderTop: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: '20px',
          }}
        >
          <div style={{ width: '3px', height: '48px', backgroundColor: GOLD, flexShrink: 0 }} />
          <p style={{
            fontFamily: "'Heebo', sans-serif",
            fontSize: '13px', color: MUTED,
            lineHeight: 1.7, margin: 0,
          }}>
            Spinz · Designed in Tel Aviv · spinz.bikes@gmail.com
          </p>
        </motion.div>
      </div>
    </div>
  );
}
