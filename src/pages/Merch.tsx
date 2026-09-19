import { useT } from '../i18n/LanguageContext';
import PageShell from '../components/PageShell';
import MerchGrid from '../components/MerchGrid';

export default function Merch() {
  const t = useT();
  return (
    <PageShell
      eyebrow="SPINZ Goods"
      title={t.pages.merch.title}
      subtitle={t.pages.merch.sub}
    >
      <MerchGrid />
    </PageShell>
  );
}
