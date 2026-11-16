import { useT } from '../i18n/LanguageContext';
import PageShell from '../components/PageShell';
import MerchGrid from '../components/MerchGrid';

// צילומי החולצות בשטח הוסרו (16.11.2026) לבקשת המצולמים.

export default function Merch() {
  const t = useT();
  return (
    <PageShell
      eyebrow="SPINZ Apparel"
      title={t.pages.merch.title}
      subtitle={t.pages.merch.sub}
    >
      <MerchGrid />
    </PageShell>
  );
}
