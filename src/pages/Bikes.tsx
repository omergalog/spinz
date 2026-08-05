import { useT } from '../i18n/LanguageContext';
import PageShell from '../components/PageShell';
import Models from '../components/Models';
import TrustBar from '../components/TrustBar';

export default function Bikes() {
  const t = useT();
  return (
    <PageShell
      eyebrow="Collection 2026"
      title={t.pages.bikes.title}
      subtitle={t.pages.bikes.sub}
      heroImage="/assets/photo-beige-bike.jpg"
      heroPosition="center 62%"
    >
      <Models />
      <TrustBar />
    </PageShell>
  );
}
