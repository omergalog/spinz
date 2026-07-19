import PageShell from '../components/PageShell';
import Gallery from '../components/Gallery';

export default function GalleryPage() {
  return (
    <PageShell
      eyebrow="2026 Collection"
      title="העיר שלך. הצבע שלך."
      subtitle="האופניים בשטח — מהרחובות של תל אביב ומהקהילה שלנו."
      heroImage="/assets/photo-beige-bike.jpg"
      heroPosition="center 40%"
    >
      <Gallery hideHeader />
    </PageShell>
  );
}
