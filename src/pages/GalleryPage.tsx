import { useT } from '../i18n/LanguageContext';
import PageShell from '../components/PageShell';
import Gallery from '../components/Gallery';

export default function GalleryPage() {
  const t = useT();
  return (
    <PageShell
      eyebrow="2026 Collection"
      title={t.pages.gallery.title}
      subtitle={t.pages.gallery.sub}
      heroImage="/assets/photo-beige-bike.jpg"
      heroPosition="center 40%"
    >
      <Gallery hideHeader />
    </PageShell>
  );
}
