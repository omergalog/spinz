/**
 * כתובת משלוח מובנית (21.11.2026): עיר מתוך הרשימה הרשמית, רחוב מתוך
 * הרחובות של אותה עיר (או הקלדה ידנית אם הרחוב חסר), ומספר בית.
 *
 * למה: בשדה חופשי לקוחות כתבו כתובות בלי עיר ועם שגיאות ("נחלך בנימין 133" —
 * ויש נחלת בנימין גם בתל אביב וגם בדימונה). הנתונים מ-data.gov.il (משרד הפנים),
 * נבנים ב-scripts/build-address-data.mjs ומוגשים מ-public/addr.
 *
 * הכתובת נשלחת לשרת כמחרוזת אחת (composeAddress), בדיוק כמו קודם, כך
 * שהשרת, המיילים, האדמין והחשבונית לא השתנו.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface AddressValue {
  cityCode: number | null;
  city: string;
  street: string;
  num: string;
  /** הרחוב הוקלד ידנית (לא נמצא ברשימה) */
  manual: boolean;
}
export interface AddressStatus { noStreets: boolean; loadFailed: boolean; streetInList: boolean }
export const EMPTY_ADDRESS: AddressValue = { cityCode: null, city: '', street: '', num: '', manual: false };

type City = { c: number; n: string; e?: string };

/** ישוב בלי רחובות במאגר: רק מספר בית/משק */
export const composeAddress = (a: AddressValue, noStreets: boolean) =>
  noStreets || !a.street.trim() ? `${a.city} ${a.num.trim()}`.trim() : `${a.street.trim()} ${a.num.trim()}, ${a.city}`;

/** השוואה סלחנית: בלי רווחים, מקפים וגרשיים; קריית=קרית, יי=י, וו=ו */
const norm = (s: string) => s.toLowerCase()
  .replace(/קריית/g, 'קרית').replace(/["'״׳`\-–—().\s]/g, '').replace(/יי/g, 'י').replace(/וו/g, 'ו');

let citiesCache: Promise<City[]> | null = null;
const loadCities = () => (citiesCache ??= fetch('/addr/cities.json').then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .catch(e => { citiesCache = null; throw e; }));
const streetsCache = new Map<number, Promise<string[]>>();
const loadStreets = (code: number) => {
  if (!streetsCache.has(code)) {
    streetsCache.set(code, fetch(`/addr/s/${code}.json`).then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .catch(e => { streetsCache.delete(code); throw e; }));
  }
  return streetsCache.get(code)!;
};

function search<T>(items: T[], q: string, key: (t: T) => string[]): T[] {
  const nq = norm(q);
  if (!nq) return [];
  const starts: T[] = [], contains: T[] = [];
  for (const it of items) {
    const ks = key(it).map(norm);
    if (ks.some(k => k.startsWith(nq))) starts.push(it);
    else if (ks.some(k => k.includes(nq))) contains.push(it);
    if (starts.length >= 40) break;
  }
  return [...starts, ...contains].slice(0, 40);
}

interface Labels {
  city: string; cityPlaceholder: string; street: string; streetPlaceholder: string; streetFirstCity: string;
  num: string; numPlaceholder: string; numNoStreets: string; notListed: string; backToList: string;
  pickFromList: string; noResults: string; required: string; loadFailed: string;
}

interface Props {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  errors: { city?: boolean; street?: boolean; num?: boolean };
  clearError: (k: 'addrCity' | 'addrStreet' | 'addrNum') => void;
  /** מצב שהטופס צריך לבדיקת התקינות */
  onStatus: (st: AddressStatus) => void;
  labels: Labels;
  lang: 'he' | 'en';
  inputStyle: (error: boolean) => React.CSSProperties;
  labelStyle: (error: boolean) => React.CSSProperties;
  errorStyle: React.CSSProperties;
  hintStyle: React.CSSProperties;
}

function Combo<T>({ id, value, placeholder, disabled, error, items, getKey, render, onType, onPick, noResults, inputStyle }: {
  id: string; value: string; placeholder: string; disabled?: boolean; error: boolean; items: T[];
  getKey: (t: T) => string; render: (t: T) => string; onType: (s: string) => void; onPick: (t: T) => void;
  noResults: string; inputStyle: (error: boolean) => React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setActive(0); }, [items]);
  // הרשימה נפתחת מתחת לשדה. בטלפון השדה נמצא נמוך, והכפתור "אשר הזמנה"
  // והמקלדת הסתירו את האפשרויות — מגללים את השדה לראש האזור הגלוי.
  const lift = () => setTimeout(() => inputRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const show = open && !disabled && value.trim().length > 0;
  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        id={id} type="text" role="combobox" autoComplete="off" disabled={disabled}
        aria-expanded={show} aria-controls={listId} aria-autocomplete="list" aria-invalid={error || undefined}
        aria-activedescendant={show && items[active] ? `${listId}-${active}` : undefined}
        placeholder={placeholder} value={value}
        onChange={e => { onType(e.target.value); if (!open) lift(); setOpen(true); }}
        onFocus={() => { setOpen(true); lift(); }}
        onKeyDown={e => {
          if (!show) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
          else if (e.key === 'Enter' && items[active]) { e.preventDefault(); onPick(items[active]); setOpen(false); }
          else if (e.key === 'Escape') setOpen(false);
        }}
        style={{ ...inputStyle(error), opacity: disabled ? 0.55 : 1 }}
      />
      {show && (
        <ul id={listId} role="listbox" style={{
          position: 'absolute', zIndex: 20, insetInline: 0, top: 'calc(100% + 4px)', margin: 0, padding: '4px 0',
          listStyle: 'none', maxHeight: '220px', overflowY: 'auto', backgroundColor: '#FFFFFF',
          border: '1px solid #E0DCD4', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {items.length === 0 ? (
            <li style={{ padding: '10px 14px', color: '#6A6862', fontFamily: "'Heebo', sans-serif", fontSize: '13px' }}>{noResults}</li>
          ) : items.map((it, i) => (
            <li key={getKey(it)} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              onMouseDown={e => { e.preventDefault(); onPick(it); setOpen(false); }}
              onMouseEnter={() => setActive(i)}
              style={{ padding: '10px 14px', cursor: 'pointer', fontFamily: "'Heebo', sans-serif", fontSize: '14px',
                       color: '#1C1C1C', backgroundColor: i === active ? '#F5F2EC' : 'transparent' }}>
              {render(it)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddressFields({ value, onChange, errors, clearError, onStatus, labels, lang, inputStyle, labelStyle, errorStyle, hintStyle }: Props) {
  const [cities, setCities] = useState<City[] | null>(null);
  const [streets, setStreets] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [cityText, setCityText] = useState(value.city);

  useEffect(() => { loadCities().then(setCities).catch(() => setLoadError(true)); }, []);
  useEffect(() => {
    setStreets(null);
    if (value.cityCode == null) return;
    let alive = true;
    loadStreets(value.cityCode).then(s => { if (alive) setStreets(s); }).catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, [value.cityCode]);
  const noStreets = value.cityCode != null && streets !== null && streets.length === 0;
  const streetInList = !!streets && streets.includes(value.street.trim());
  useEffect(() => { onStatus({ noStreets, loadFailed: loadError, streetInList }); }, [noStreets, loadError, streetInList, onStatus]);

  const cityResults = useMemo(() => cities ? search(cities, cityText, c => [c.n, c.e ?? '']) : [], [cities, cityText]);
  const streetResults = useMemo(() => streets ? search(streets, value.street, s => [s]) : [], [streets, value.street]);
  const showCity = (c: City) => lang === 'en' && c.e ? `${c.n} (${c.e})` : c.n;

  // שגיאת טעינה: לא חוסמים את הלקוח — עיר ורחוב בהקלדה חופשית
  const manualAll = loadError;

  return (
    <>
      <div>
        <label htmlFor="cart-addrCity" style={labelStyle(!!errors.city)}>{labels.city}</label>
        {manualAll ? (
          <input id="cart-addrCity" type="text" autoComplete="address-level2" value={value.city}
            placeholder={labels.cityPlaceholder} aria-invalid={errors.city || undefined}
            onChange={e => { onChange({ ...value, city: e.target.value, cityCode: null }); clearError('addrCity'); }}
            style={inputStyle(!!errors.city)} />
        ) : (
          <Combo<City>
            id="cart-addrCity" value={cityText} placeholder={labels.cityPlaceholder} error={!!errors.city}
            items={cityResults} getKey={c => String(c.c)} render={showCity}
            onType={s => {
              setCityText(s);
              // עיר שהוקלדה ולא נבחרה מהרשימה לא נחשבת עיר
              if (value.cityCode != null || value.city) onChange({ ...EMPTY_ADDRESS, num: value.num });
              clearError('addrCity');
            }}
            onPick={c => {
              setCityText(c.n);
              onChange({ ...EMPTY_ADDRESS, cityCode: c.c, city: c.n, num: value.num });
              clearError('addrCity');
            }}
            noResults={cities ? labels.noResults : '…'} inputStyle={inputStyle} />
        )}
        {errors.city && <p role="alert" style={errorStyle}>{cityText.trim() && !manualAll ? labels.pickFromList : labels.required}</p>}
      </div>

      {!noStreets && (
        <div>
          <label htmlFor="cart-addrStreet" style={labelStyle(!!errors.street)}>{labels.street}</label>
          {value.manual || manualAll ? (
            <input id="cart-addrStreet" type="text" autoComplete="address-line1" value={value.street}
              disabled={value.cityCode == null && !manualAll}
              placeholder={labels.streetPlaceholder} aria-invalid={errors.street || undefined}
              onChange={e => { onChange({ ...value, street: e.target.value }); clearError('addrStreet'); }}
              style={inputStyle(!!errors.street)} />
          ) : (
            <Combo<string>
              id="cart-addrStreet" value={value.street}
              placeholder={value.cityCode == null ? labels.streetFirstCity : labels.streetPlaceholder}
              disabled={value.cityCode == null} error={!!errors.street}
              items={streetResults} getKey={s => s} render={s => s}
              onType={s => { onChange({ ...value, street: s, manual: false }); clearError('addrStreet'); }}
              onPick={s => { onChange({ ...value, street: s, manual: false }); clearError('addrStreet'); }}
              noResults={streets ? labels.noResults : '…'} inputStyle={inputStyle} />
          )}
          {errors.street && <p role="alert" style={errorStyle}>{value.street.trim() && !value.manual ? labels.pickFromList : labels.required}</p>}
          {!manualAll && value.cityCode != null && (
            <button type="button"
              onClick={() => { onChange({ ...value, manual: !value.manual, street: value.manual ? '' : value.street }); clearError('addrStreet'); }}
              style={{ ...hintStyle, background: 'none', border: 'none', padding: 0, marginTop: '5px', cursor: 'pointer',
                       textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              {value.manual ? labels.backToList : labels.notListed}
            </button>
          )}
        </div>
      )}

      <div>
        <label htmlFor="cart-addrNum" style={labelStyle(!!errors.num)}>{noStreets ? labels.numNoStreets : labels.num}</label>
        <input id="cart-addrNum" type="text" inputMode="text" autoComplete="off" value={value.num}
          placeholder={labels.numPlaceholder} aria-invalid={errors.num || undefined} dir="auto"
          onChange={e => { onChange({ ...value, num: e.target.value }); clearError('addrNum'); }}
          style={inputStyle(!!errors.num)} />
        {errors.num && <p role="alert" style={errorStyle}>{labels.required}</p>}
      </div>
    </>
  );
}

/** האם הכתובת שלמה לפי מה שהלקוח רואה */
export function addressErrors(a: AddressValue, st: AddressStatus) {
  const e: { addrCity?: boolean; addrStreet?: boolean; addrNum?: boolean } = {};
  if (st.loadFailed ? !a.city.trim() : a.cityCode == null) e.addrCity = true;
  // רחוב: מהרשימה, או בהקלדה ידנית אחרי "הרחוב לא ברשימה" (או כשהרשימה לא נטענה)
  if (!st.noStreets && (!a.street.trim() || (!a.manual && !st.loadFailed && !st.streetInList))) e.addrStreet = true;
  if (!a.num.trim()) e.addrNum = true;
  return e;
}
