import PageShell from '../components/PageShell';
import Models from '../components/Models';

export default function Bikes() {
  return (
    <PageShell
      eyebrow="Collection 2026"
      title="הדגמים."
      subtitle="בחרו צבע ומידה — והאופניים שלכם בדרך. סינגל ספיד נקי, מעוצב לרחובות העיר."
    >
      <Models />
    </PageShell>
  );
}
