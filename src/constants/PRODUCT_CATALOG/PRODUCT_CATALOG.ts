import type { catalogProductEntryType, productCollectionType } from '@types';

const PRODUCT_COLLECTIONS: productCollectionType[] = [
  {
    id: 'first',
    label: 'Calcio',
    galleryTitle: 'COMPLETO GARA CALCIO',
    coverSrc: '/png/products/calcio.png',
  },
  {
    id: 'second',
    label: 'Pallavolo',
    galleryTitle: 'Completo gara pallavolo',
    coverSrc: '/png/products/pallavolo.png',
  },
  {
    id: 'third',
    label: 'Basket',
    galleryTitle: 'COMPLETO GARA basket',
    coverSrc: '/png/products/basket.png',
  },
  {
    id: 'fourd',
    label: 'Altro',
    galleryTitle: 'COMPLETO',
    coverSrc: '/png/products/altro.png',
  },
];

const CATALOG_PRODUCT_ENTRIES: catalogProductEntryType[] = [
  { collection: 'first', slug: 'baggio', name: 'Baggio', modelId: 'baggio_calcio', configurable: true },
  {
    collection: 'first',
    slug: 'cruijff',
    name: 'Shorts Cruijff',
    modelId: 'cruijff_calcio',
    configurable: true,
  },
  { collection: 'first', slug: 'federer', name: 'Federer', configurable: false },
  { collection: 'first', slug: 'bernardi', name: 'Bernardi', modelId: 'bernardi_calcio', configurable: true },

  {
    collection: 'second',
    slug: 'bernardi_p',
    name: 'Bernardi PallaVolo',
    configurable: false,
  },
  {
    collection: 'second',
    slug: 'federer_p',
    name: 'Maglia Federer',
    modelId: 'federer_calcio',
    configurable: true,
  },
  { collection: 'second', slug: 'cruijff_p', name: 'Cruijff PallaVolo', configurable: false },
  { collection: 'second', slug: 'malone_p', name: 'Malone PallaVolo', configurable: false },
  { collection: 'second', slug: 'picci', name: 'Picci', configurable: false },
  { collection: 'second', slug: 'sylla_p', name: 'Sylla PallaVolo', configurable: false },
  { collection: 'second', slug: 'lollo_p', name: 'Lollo PallaVolo', configurable: false },

  { collection: 'third', slug: 'canotta_mb', name: 'Canotta Basket', configurable: false },
  { collection: 'third', slug: 'malone_b', name: 'Malone Basket', configurable: false },

  { collection: 'fourd', slug: 'federer_c', name: 'Federer Completo', configurable: false },
  { collection: 'fourd', slug: 'cruijff_c', name: 'Cruijff Completo', configurable: false },
];

const DEFAULT_CATALOG_PRODUCT = CATALOG_PRODUCT_ENTRIES.find((entry) => entry.slug === 'federer_p')!;

export { CATALOG_PRODUCT_ENTRIES, DEFAULT_CATALOG_PRODUCT, PRODUCT_COLLECTIONS };
