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
  activePreviewSrc: string | null;
};

type homePageCollectionType = {
  id: string;
  title: string;
  handle: string;
  products: homePageProductType[];
};

type homePagePropsType = {
  collections: homePageCollectionType[];
};

export type { homePageCollectionType, homePageProductType, homePagePropsType };
