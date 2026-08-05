import PageShell from '../components/PageShell';
import { useT } from '../i18n/LanguageContext';
import FAQ from '../components/FAQ';

export default function FAQPage() {
  const t = useT();
  return (
    <PageShell
      eyebrow={t.pages.faq.eyebrow}
      title={t.pages.faq.title}
      subtitle={t.pages.faq.sub}
      heroImage="/assets/photo-black-detail.jpg"
      heroPosition="center 55%"
    >
      <FAQ hideHeader />
    </PageShell>
  );
}
