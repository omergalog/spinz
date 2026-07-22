import PageShell from '../components/PageShell';
import Models from '../components/Models';
import TrustBar from '../components/TrustBar';

export default function Bikes() {
  return (
    <PageShell
      eyebrow="Collection 2026"
      title="הדגמים."
      subtitle="בחרו צבע ומידה – והאופניים שלכם בדרך. סינגל ספיד נקי, מעוצב לרחובות העיר."
      heroImage="/assets/photo-beige-bike.jpg"
      heroPosition="center 62%"
    >
      <Models />
      <TrustBar />
    </PageShell>
  );
}
