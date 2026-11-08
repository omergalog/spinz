import { useT } from '../i18n/LanguageContext';
import PageShell from '../components/PageShell';
import MerchGrid from '../components/MerchGrid';
import Gallery, { numberedPhotos } from '../components/Gallery';

// צילומי החולצות בשטח (8.11.2026). בלי מטא-דאטה — ה-GPS של האייפון הוסר בהמרה.
// הסדר (8.11): שחור/לבן מתחלפים, ובן/בת וקדימה/אחורה מתחלפים ככל האפשר.
const MERCH_PHOTOS = numberedPhotos('/assets/gallery-merch', 'm', 8);

export default function Merch() {
  const t = useT();
  return (
    <PageShell
      eyebrow="SPINZ Apparel"
      title={t.pages.merch.title}
      subtitle={t.pages.merch.sub}
    >
      <MerchGrid />
      <Gallery
        photos={MERCH_PHOTOS}
        title={t.merch.galleryTitle}
        photoAlt={t.merch.galleryAlt}
        thumbAspect="3 / 4"
        gridClass="grid-cols-4 lg:grid-cols-8"
        showAllModels={false}
        sectionId="merch-gallery"
        compactTop
      />
    </PageShell>
  );
}
