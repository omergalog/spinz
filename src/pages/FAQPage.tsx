import PageShell from '../components/PageShell';
import FAQ from '../components/FAQ';

export default function FAQPage() {
  return (
    <PageShell
      eyebrow="שאלות נפוצות"
      title="כל מה שרצית לדעת."
      subtitle="משלוחים, הרכבה, תשלומים ואחריות – התשובות לכל השאלות לפני שאתם עולים על האוכף."
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 55%"
    >
      <FAQ hideHeader />
    </PageShell>
  );
}
