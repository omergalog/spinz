import PageShell from '../components/PageShell';
import { useT } from '../i18n/LanguageContext';
import Specs from '../components/Specs';

export default function SpecsPage() {
  const t = useT();
  return (
    <PageShell
      eyebrow={t.pages.specs.eyebrow}
      title={t.pages.specs.title}
      subtitle={t.pages.specs.sub}
      heroImage="/assets/lifestyle-hero.jpg"
      heroPosition="center 45%"
    >
      <Specs hideHeader />
    </PageShell>
  );
}
