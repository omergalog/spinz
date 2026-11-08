import { useT } from '../i18n/LanguageContext';
import PageShell from '../components/PageShell';
import MerchGrid from '../components/MerchGrid';
import Gallery, { numberedPhotos } from '../components/Gallery';

// צילומי החולצות בשטח (8.11.2026). בלי מטא-דאטה — ה-GPS של האייפון הוסר בהמרה.
const MERCH_PHOTOS = numberedPhotos('/assets/gallery-merch', 'm', 9);

export default function Merch() {
  const t = useT();
  return (
    <PageShell
      eyebrow="SPINZ Goods"
      title={t.pages.merch.title}
      subtitle={t.pages.merch.sub}
    >
      <MerchGrid />
      <Gallery
        photos={MERCH_PHOTOS}
        title={t.merch.galleryTitle}
        photoAlt={t.merch.galleryAlt}
        thumbAspect="3 / 4"
        gridClass="grid-cols-3 lg:grid-cols-9"
        showAllModels={false}
        sectionId="merch-gallery"
        compactTop
      />
    </PageShell>
  );
}
