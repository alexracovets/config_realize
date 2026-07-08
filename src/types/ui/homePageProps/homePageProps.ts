type homePageProductType = {
  id: string;
  title: string;
  handle: string;
  status: string;
  /** Local geometry model id (Shopify `custom.id`); `null` when not configured yet. */
  modelId: string | null;
  price: number | null;
  currencyCode: string | null;
  previewSrc: string | null;
  /** Shopify `custom.view_image` — front side of home flip cards. */
  flipPreviewSrc: string | null;
  activePreviewSrc: string | null;
};

type homePageCollectionType = {
  id: string;
  title: string;
  handle: string;
  imageSrc: string | null;
  products: homePageProductType[];
};

type homePageCollectionSummaryType = Pick<homePageCollectionType, 'id' | 'title' | 'handle' | 'imageSrc'>;

type homePagePropsType = {
  collections: homePageCollectionSummaryType[];
};

type collectionPagePropsType = {
  collection: homePageCollectionType;
};

export type { collectionPagePropsType, homePageCollectionSummaryType, homePageCollectionType, homePageProductType, homePagePropsType };
