import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const DARK  = '#1C1C1C';
const GOLD  = '#C9A870';
const BEIGE = '#F5F2EC';
const BORDER = '#2A2A2A';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function AboutModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 998, backgroundColor: 'rgba(0,0,0,0.75)' }}
          />

          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', perspective: '1200px' }}>
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                pointerEvents: 'all',
                backgroundColor: DARK,
                width: '90%', maxWidth: '680px',
                maxHeight: '85vh',
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                display: 'flex', flexDirection: 'column',
              }}
              dir="rtl"
            >
              {/* Header */}
              <div style={{ padding: '24px 28px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src="/assets/logo.png" alt="SPINZ" style={{ height: '32px', width: 'auto', objectFit: 'contain', filter: 'invert(1) brightness(2)', opacity: 0.9 }} />
                  <div style={{ width: '1px', height: '28px', backgroundColor: BORDER }} />
                  <h2 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 800, fontSize: '18px', color: BEIGE, margin: 0 }}>
                    נעים להכיר, אנחנו Spinz
                  </h2>
                </div>
                <button onClick={onClose} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div
                style={{ overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
                onWheel={e => e.stopPropagation()}
              >
                {sections.map(({ title, text }, i) => (
                  <div key={i}>
                    {title && (
                      <h3 style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '15px', color: GOLD, margin: '0 0 8px' }}>
                        {title}
                      </h3>
                    )}
                    <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: '15px', color: '#CCCCCC', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
