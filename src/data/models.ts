export interface BikeModel {
  id: string;
  name: string;
  tagline: string;
  image: string;
  price: number;
  features: { label: string; value: string }[];
  accentColor: string;
}

// Legacy export kept for cart compatibility
const models: BikeModel[] = [
  {
    id: 'spinz-54',
    name: 'SPINZ 54',
    tagline: 'מידה S – גובה 160–175 ס"מ',
    image: '/assets/bike-black.png',
    price: 2290,
    accentColor: '#C9A870',
    features: [
      { label: 'שלדה', value: 'אלומיניום 54' },
      { label: 'גלגלים', value: '700c' },
      { label: 'מנגנון', value: 'סינגל ספיד' },
    ],
  },
  {
    id: 'spinz-57',
    name: 'SPINZ 57',
    tagline: 'מידה L – גובה 175–190 ס"מ',
    image: '/assets/bike-black.png',
    price: 2290,
    accentColor: '#C9A870',
    features: [
      { label: 'שלדה', value: 'אלומיניום 57' },
      { label: 'גלגלים', value: '700c' },
      { label: 'מנגנון', value: 'סינגל ספיד' },
    ],
  },
];

export const colorVariants = [
  { id: 'mat',   label: 'שחור מט',  image: '/assets/bike-mat-new.png',   hex: '#1A1A1A', skuCode: 'MAT', slug: 'mat'   },
  { id: 'beige', label: "בז'",      image: '/assets/bike-beige-new.png', hex: '#C4A882', skuCode: 'BEI', slug: 'beige' },
  { id: 'olive', label: 'ירוק זית', image: '/assets/bike-olive-new.png', hex: '#7D9168', skuCode: 'OLG', slug: 'olive' },
];

export const sizeVariants = [
  { id: '54', label: '54', range: 'גובה 160–175 ס"מ' },
  { id: '57', label: '57', range: 'גובה 175–190 ס"מ' },
];

export default models;
