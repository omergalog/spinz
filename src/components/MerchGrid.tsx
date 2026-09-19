import { useEffect, useMemo, useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLang, useT } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import { merchProducts, merchSlug, type MerchProduct } from '../data/merch';

const DARK   = '#1C1C1C';
const BORDER = '#E2DED8';
const MUTED  = '#6A6862';
const GOLD   = '#C9A870';

const formatPrice = (n: number) => `₪${n.toLocaleString('he-IL')}`;

/** מלאי ומחיר של שורת מוצר אחת, כפי שהם בטבלה ברגע זה. */
type Row = { stock: number; price: number; sale_price: number | null };

/**
 * כרטיס מוצר מרצ'נדייז.
 *
 * המחיר והמלאי נקראים מהטבלה ולא מהקטלוג שבקוד: הקטלוג מחזיק את
 * התמונות והשמות, והמספרים מתעדכנים בממשק הניהול בלי פריסה מחדש.
 */
function MerchCard({ product, rows }: { product: MerchProduct; rows: Record<string, Row> }) {
  const t = useT();
  const lang = useLang();
  const { addItem, openCart } = useCart();

  const [colorId, setColorId] = useState(product.colors[0].id);
  const [sizeId, setSizeId]   = useState('');
  const [added, setAdded]     = useState(false);

  const color = product.colors.find(c => c.id === colorId) ?? product.colors[0];
  const slug  = sizeId ? merchSlug(product.slugBase, colorId, sizeId) : '';
  const row   = slug ? rows[slug] : undefined;

  const price = row ? (row.sale_price ?? row.price) : product.price;
  const list  = row?.sale_price != null ? row.price : null;

  // מידה שאזלה נשארת על המסך ומסומנת, במקום להיעלם. רשימה שמתקצרת
  // מעצמה מקשה להבין אם המידה קיימת בכלל או רק חסרה כרגע.
  const soldOut = (sid: string) => {
    const r = rows[merchSlug(product.slugBase, colorId, sid)];
    return !r || r.stock <= 0;
  };

  const everySizeGone = product.sizes.every(s => soldOut(s.id));
  const canAdd = !!sizeId && !soldOut(sizeId);

  const add = () => {
    if (!canAdd) return;
    const size = product.sizes.find(s => s.id === sizeId)!;
    addItem(
      {
        id: slug,
        name: `${lang === 'en' ? product.nameEn : product.name} — ${lang === 'en' ? color.labelEn : color.label} ${size.label}`,
        tagline: lang === 'en' ? product.taglineEn : product.tagline,
        image: color.image,
        price,
        accentColor: color.hex,
        features: [],
      },
      colorId,
      lang === 'en' ? color.labelEn : color.label,
      '',
      sizeId,
      { slug, kind: 'merch' },
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    openCart();
  };

  return (
    <article style={{
      border: `1px solid ${BORDER}`, borderRadius: '10px', backgroundColor: '#fff',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        aspectRatio: '1 / 1', maxWidth: '100%', backgroundColor: '#F5F2EC',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <img
          src={color.image}
          alt={`${lang === 'en' ? product.nameEn : product.name} · ${lang === 'en' ? color.labelEn : color.label}`}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
        />
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: DARK }}>
            {lang === 'en' ? product.nameEn : product.name}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: MUTED }}>
            {lang === 'en' ? product.taglineEn : product.tagline}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: DARK }}>{formatPrice(price)}</span>
          {list != null && (
            <span style={{ fontSize: '14px', color: MUTED, textDecoration: 'line-through' }}>
              {formatPrice(list)}
            </span>
          )}
        </div>

        {/* צבע */}
        <div>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUTED, marginBottom: '6px' }}>
            {t.merch.color}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {product.colors.map(c => (
              <button
                key={c.id}
                onClick={() => { setColorId(c.id); setSizeId(''); }}
                aria-label={lang === 'en' ? c.labelEn : c.label}
                aria-pressed={c.id === colorId}
                style={{
                  width: '28px', height: '28px', borderRadius: '999px', cursor: 'pointer',
                  backgroundColor: c.hex,
                  border: c.id === colorId ? `2px solid ${GOLD}` : `1px solid ${BORDER}`,
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        {/* מידה */}
        <div>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUTED, marginBottom: '6px' }}>
            {t.merch.size}
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {product.sizes.map(s => {
              const gone = soldOut(s.id);
              const on   = s.id === sizeId;
              return (
                <button
                  key={s.id}
                  onClick={() => !gone && setSizeId(s.id)}
                  disabled={gone}
                  title={gone ? t.merch.soldOut : undefined}
                  style={{
                    minWidth: '44px', padding: '8px 10px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 700, cursor: gone ? 'not-allowed' : 'pointer',
                    border: `1px solid ${on ? GOLD : BORDER}`,
                    backgroundColor: on ? GOLD : '#fff',
                    color: gone ? '#B6B2AC' : DARK,
                    textDecoration: gone ? 'line-through' : 'none',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={add}
          disabled={!canAdd}
          style={{
            marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 700,
            cursor: canAdd ? 'pointer' : 'not-allowed',
            backgroundColor: canAdd ? DARK : '#EDEAE4',
            color: canAdd ? '#fff' : '#9A9690',
          }}
        >
          {added
            ? <><Check size={16} /> {t.merch.added}</>
            : <><ShoppingBag size={16} /> {everySizeGone ? t.merch.soldOut : sizeId ? t.merch.add : t.merch.pickSize}</>}
        </button>
      </div>
    </article>
  );
}

export default function MerchGrid() {
  const t = useT();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loaded, setLoaded] = useState(false);

  const slugs = useMemo(
    () => merchProducts.flatMap(p =>
      p.colors.flatMap(c => p.sizes.map(s => merchSlug(p.slugBase, c.id, s.id)))),
    [],
  );

  useEffect(() => {
    let alive = true;
    supabase.from('products').select('slug, stock, price, sale_price').in('slug', slugs)
      .then(({ data }) => {
        if (!alive) return;
        const map: Record<string, Row> = {};
        (data ?? []).forEach(r => {
          map[String(r.slug)] = {
            stock: Number(r.stock ?? 0),
            price: Number(r.price ?? 0),
            sale_price: r.sale_price == null ? null : Number(r.sale_price),
          };
        });
        setRows(map);
        setLoaded(true);
      });
    return () => { alive = false; };
  }, [slugs]);

  // עד שהמלאי נקרא, כל המידות נראות אזלו. עדיף להשהות את הרשת מאשר
  // להבהב "אזל" על מוצר שיש ממנו במלאי.
  if (!loaded) {
    return <p style={{ padding: '40px 0', textAlign: 'center', color: MUTED, fontSize: '14px' }}>
      {t.merch.loading}
    </p>;
  }

  return (
    <section style={{ padding: '0 16px 56px' }}>
      <div style={{
        maxWidth: '1000px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px',
      }}>
        {merchProducts.map(p => <MerchCard key={p.id} product={p} rows={rows} />)}
      </div>
    </section>
  );
}
