export interface BikeModel {
  id: string;
  name: string;
  tagline: string;
  image: string;
  price: number;
  features: { label: string; value: string }[];
  accentColor: string;
}

const models: BikeModel[] = [
  {
    id: 'street-01',
    name: 'STREET 01',
    tagline: 'הקלאסיק של הרחוב',
    image: '/assets/model-1.png',
    price: 100000,
    accentColor: '#C5C9B5',
    features: [
      { label: 'פריים', value: 'Chromoly Steel' },
      { label: 'גלגלים', value: '700c' },
      { label: 'צבע', value: 'Army Green / Tan' },
    ],
  },
  {
    id: 'urban-x',
    name: 'URBAN X',
    tagline: 'אגרסיבי. קל. מהיר.',
    image: '/assets/model-2.png',
    price: 100000,
    accentColor: '#8B2020',
    features: [
      { label: 'פריים', value: 'Butted Aluminum' },
      { label: 'גלגלים', value: '700c Deep-V' },
      { label: 'צבע', value: 'Burgundy / Gold' },
    ],
  },
  {
    id: 'track-r',
    name: 'TRACK R',
    tagline: 'נולד בפיסטה. גדל בעיר.',
    image: '/assets/model-3.png',
    price: 100000,
    accentColor: '#3A5CA0',
    features: [
      { label: 'פריים', value: 'Hi-Ten Track Geo' },
      { label: 'גלגלים', value: '700c Deep-V' },
      { label: 'צבע', value: 'Graphite / Electric Blue' },
    ],
  },
];

export default models;
