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
    tagline: 'מידה S — גובה 160–175 ס"מ',
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
    tagline: 'מידה L — גובה 175–190 ס"מ',
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
  { id: 'rust',  label: 'ראסט',        image: '/assets/bike-rust.png',  hex: '#A0431A', slug: 'rust' },
  { id: 'green', label: 'ירוק זית',    image: '/assets/bike-green.png', hex: '#6B7C5C', slug: 'green' },
  { id: 'gray',  label: 'אפור עירוני', image: '/assets/bike-gray.png',  hex: '#808080', slug: 'gray' },
];

export const sizeVariants = [
  { id: '54', label: '54', range: 'גובה 160–175 ס"מ' },
  { id: '57', label: '57', range: 'גובה 175–190 ס"מ' },
];

export default models;
