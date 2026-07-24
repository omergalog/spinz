import { searchIndex, type SearchDoc } from '../data/searchIndex';

export type SearchHit = {
  doc: SearchDoc;
  score: number;
  /** Where the best match was found, ready to render with highlights */
  snippet: string;
};

/**
 * Hebrew typing is messy: niqqud, geresh/gershayim in several Unicode flavours,
 * and final letters that differ from their regular form (בז' / ירוק זית / שלום־שלם).
 * Normalising all of it means "בז" finds "בז'" and "ניקבצים" finds "נקבצים".
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[֑-ׇ]/g, '')           // niqqud + cantillation
    .replace(/['"׳״`’”]/g, '')                 // quotes in all their forms
    .replace(/[־–—]/g, ' ')                    // Hebrew maqaf and dashes
    .replace(/[ךםןףץ]/g, m => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }[m] as string))
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')          // punctuation → space
    .replace(/\s+/g, ' ')
    .trim();
}

const tokenize = (q: string) => normalize(q).split(' ').filter(t => t.length > 0);

/**
 * How well a single term matches a single word, 0–1.
 * Hebrew inflects heavily (הרכבה / הרכבת / להרכיב), so a long shared prefix
 * counts as a real match rather than a near miss.
 */
function wordScore(term: string, word: string): number {
  if (word === term) return 1;
  if (word.startsWith(term)) return 0.92;
  if (term.startsWith(word) && word.length >= 3) return 0.8;
  const need = Math.max(3, term.length - 2);
  if (term.length >= 4 && word.length >= need) {
    let i = 0;
    while (i < term.length && i < word.length && term[i] === word[i]) i++;
    if (i >= need) return 0.7;
  }
  if (term.length >= 4 && word.includes(term)) return 0.5;
  return 0;
}

/** Hebrew glues prefixes onto words: להרכיב / בהרכבה / כשמרכיבים. */
const PREFIX_LETTERS = 'לבכמשהוו';
const stripPrefix = (t: string) =>
  t.length >= 5 && PREFIX_LETTERS.includes(t[0]) ? t.slice(1) : null;

/** Best match of a term anywhere in a field, weighted by how important the field is. */
function fieldScore(term: string, words: string[], weight: number): number {
  let best = 0;
  for (const w of words) {
    const s = wordScore(term, w);
    if (s > best) best = s;
    if (best === 1) break;
  }
  if (best === 0) {
    const bare = stripPrefix(term);
    if (bare) {
      for (const w of words) {
        const s = wordScore(bare, w) * 0.85;
        if (s > best) best = s;
      }
    }
  }
  return best * weight;
}

/** Slight preference for the pages people are usually after. */
const TYPE_BOOST = { product: 6, page: 4, guide: 3, faq: 2 } as const;

/** Pull ~140 chars around the first match so the user sees why it matched. */
function makeSnippet(doc: SearchDoc, terms: string[]): string {
  const source = doc.summary || doc.body;
  const normSource = normalize(source);
  const hit = terms.map(t => normSource.indexOf(t)).filter(i => i >= 0).sort((a, b) => a - b)[0];
  if (hit === undefined || hit < 90) return source.slice(0, 150);
  // Indices drift after normalising, so land on a nearby word boundary.
  const start = Math.max(0, source.lastIndexOf(' ', hit - 40) + 1);
  return '…' + source.slice(start, start + 150);
}

type Prepared = { title: string[]; keywords: string[]; summary: string[]; body: string[] };
const prepared = new Map<string, Prepared>();

function prepare(doc: SearchDoc): Prepared {
  let p = prepared.get(doc.id);
  if (!p) {
    const words = (s: string) => normalize(s).split(' ').filter(Boolean);
    p = {
      title: words(doc.title),
      keywords: words((doc.keywords ?? []).join(' ')),
      summary: words(doc.summary),
      body: words(doc.body),
    };
    prepared.set(doc.id, p);
  }
  return p;
}

export function search(query: string, limit = 8): SearchHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const doc of searchIndex) {
    const p = prepare(doc);

    let total = 0;
    let matched = 0;

    for (const term of terms) {
      const s = Math.max(
        fieldScore(term, p.title, 100),
        fieldScore(term, p.keywords, 62),
        fieldScore(term, p.summary, 34),
        fieldScore(term, p.body, 18),
      );
      if (s > 0) { matched++; total += s; }
    }

    // A doc must cover at least half the query. Filler words ("אני 183",
    // "אחריות על צבע") therefore cannot wipe out an otherwise good result,
    // while covering more terms still outranks covering fewer.
    if (matched === 0 || matched < Math.ceil(terms.length / 2)) continue;

    hits.push({
      doc,
      score: total + matched * 45 + TYPE_BOOST[doc.type],
      snippet: makeSnippet(doc, terms),
    });
  }

  return hits.sort((a, b) => b.score - a.score || a.doc.title.length - b.doc.title.length).slice(0, limit);
}

/** Split text into matched / unmatched parts for highlighting in the UI. */
export function highlight(text: string, query: string): { text: string; hit: boolean }[] {
  const terms = tokenize(query).filter(t => t.length > 1);
  if (terms.length === 0) return [{ text, hit: false }];

  const norm = normalize(text);
  const marks: boolean[] = new Array(text.length).fill(false);
  // normalize() keeps a 1:1 character mapping for everything except collapsed
  // whitespace, which is close enough to mark the right span in practice.
  for (const term of terms) {
    let from = 0;
    for (;;) {
      const i = norm.indexOf(term, from);
      if (i < 0) break;
      for (let k = i; k < i + term.length && k < marks.length; k++) marks[k] = true;
      from = i + term.length;
    }
  }

  const parts: { text: string; hit: boolean }[] = [];
  let buf = '';
  let cur = marks[0] ?? false;
  for (let i = 0; i < text.length; i++) {
    if ((marks[i] ?? false) !== cur) { parts.push({ text: buf, hit: cur }); buf = ''; cur = marks[i] ?? false; }
    buf += text[i];
  }
  if (buf) parts.push({ text: buf, hit: cur });
  return parts;
}
