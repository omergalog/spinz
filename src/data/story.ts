import type { Lang } from '../i18n/LanguageContext';

export type StorySection = { title: string; text: string };

const he: StorySection[] = [
  {
    title: 'החופש של פעם',
    text: 'הכל התחיל משלושה חברים שגדלו בין הפרדסים של עמק חפר. שם, האופניים היו הכל בשבילנו – הדרך לים, לבית ספר, ובעיקר הדרך להרגיש חופשיים.',
  },
  {
    title: 'ואז הגענו לתל אביב',
    text: 'כשהחלטנו לארוז את החיים ולעבור לתל אביב, גילינו מהר מאוד שהעיר הזאת היא עולם אחר לגמרי. הפקקים, הלחץ, והמרדף אחרי חניה פשוט הוציאו לנו את החשק לזוז. ניסינו הכל – קורקינטים, אוטובוסים, אופניים עם 21 הילוכים וכבלים שנתקעים בכל חור... ושום דבר לא הרגיש "זה".\nאז החלטנו לחזור לבסיס.',
  },
  {
    title: 'פשוט לרכוב',
    text: 'נזכרנו באופניים של פעם – אלו שפשוט עולים עליהם ונוסעים. בלי שטויות, בלי הילוכים מיותרים שמתקלקלים בדיוק כשממהרים לעבודה, ובלי משקל כבד שצריך לסחוב לקומה שלישית בלי מעלית. ככה נולד המותג Spinz.',
  },
  {
    title: 'ככה נולד המותג Spinz',
    text: 'לקחנו את הפשטות של הסינגל-ספיד (Single Speed) ונתנו לה את הסטייל והדיוק של העיר הגדולה. רצינו לבנות אופניים שנראים מעולה, נוסעים חלק, ובעיקר – לא עושים כאב ראש. אופניים שאפשר לסמוך עליהם מהקפה של הבוקר ועד הבירה של הלילה.',
  },
  {
    title: 'למה אנחנו לא ברוטשילד? (ולמה זה טוב לכם)',
    text: 'חשבנו על זה הרבה. יכולנו לפתוח חנות נוצצת ברוטשילד או בדיזנגוף, אבל אז היינו צריכים לגלגל את השכירות המטורפת הזאת עליכם – וזה בדיוק מה שלא רצינו.\n\nהחלטנו לעשות את זה אחרת: בלי חנויות יוקרה במרכז תל אביב ובלי מתווכים שגוזרים קופון בדרך. בחרנו להשקיע את כל הכסף במוצר עצמו – בשלדות הכי חזקות, בצבעים הכי עמידים ובחלקים שיחזיקו לכם שנים על האספלט. התוצאה? אתם מקבלים אופני פרימיום במחיר הגיוני לגמרי, בלי לקרוע את הכיס.',
  },
  {
    title: 'בשורה התחתונה',
    text: 'Spinz זה השקט שלנו בתוך כל הרעש של תל אביב. זה המותג שלנו, מהילדות בעמק ועד לאספלט של רוטשילד (שאנחנו רוכבים עליו, אבל לא משלמים עליו שכירות), ואנחנו הכי גאים בעולם לחלוק אותו אתכם.',
  },
];

const en: StorySection[] = [
  {
    title: 'The freedom we grew up with',
    text: 'It started with three friends who grew up among the orange groves of Hefer Valley. Back there, bikes were everything to us — the way to the beach, the way to school, and above all the way to feel free.',
  },
  {
    title: 'Then we moved to Tel Aviv',
    text: 'When we packed up our lives and moved to Tel Aviv, we found out fast that this city is a different world. The traffic, the pressure, the endless hunt for parking — it all killed the urge to go anywhere. We tried everything: scooters, buses, bikes with 21 gears and cables that snagged on everything… and nothing felt right.\nSo we decided to go back to basics.',
  },
  {
    title: 'Just ride',
    text: 'We thought back to the bikes we grew up on — the kind you just get on and go. No nonsense, no extra gears to fail on you exactly when you’re late for work, no dead weight to haul up to a third-floor walk-up. That’s where Spinz began.',
  },
  {
    title: 'How Spinz came to be',
    text: 'We took the simplicity of a single speed and gave it the style and precision of a big city. We wanted a bike that looks great, rides smooth, and above all doesn’t give you a headache — a bike you can count on from your morning coffee to the last beer of the night.',
  },
  {
    title: 'Why we’re not on Rothschild (and why that’s good for you)',
    text: 'We thought about it a lot. We could have opened a glossy storefront on Rothschild or Dizengoff — but then we’d have had to pass that insane rent on to you, and that was exactly what we didn’t want.\n\nSo we did it differently: no flagship store in central Tel Aviv, no middlemen taking a cut along the way. We put every shekel into the product itself — the strongest frames, the most durable finishes, and parts that will last you years on the asphalt. The result? A premium bike at a genuinely sensible price, without emptying your pockets.',
  },
  {
    title: 'The bottom line',
    text: 'Spinz is our bit of quiet inside all the noise of Tel Aviv. It’s our brand, from a childhood in the valley to the asphalt of Rothschild — which we ride on, but don’t pay rent on — and we couldn’t be prouder to share it with you.',
  },
];

export const getStory = (lang: Lang): StorySection[] => (lang === 'en' ? en : he);
