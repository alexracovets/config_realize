type homePageProductType = {
  id: string;
  title: string;
  handle: string;
  status: string;

  modelId: string | null;
  price: number | null;
  currencyCode: string | null;
  previewSrc: string | null;

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
