import PageShell from '../components/PageShell';
import Specs from '../components/Specs';

export default function SpecsPage() {
  return (
    <PageShell
      eyebrow="מפרט טכני"
      title="מפרט ללא פשרות."
      subtitle="כל פרט באופני SPINZ תוכנן בקפידה כדי להעניק לך חוויית רכיבה חלקה, בטוחה ונטולת מאמץ ברחובות העיר."
      heroImage="/assets/lifestyle-hero.jpg"
      heroPosition="center 45%"
    >
      <Specs hideHeader />
    </PageShell>
  );
}
