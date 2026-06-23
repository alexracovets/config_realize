import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import type { catalogProductRefType, productCollectionIdType } from '@types';
import type { ReactPlayerProps } from 'react-player/types';

type videoPlayerVariantType = 'default' | 'tutorial';

type videoPlayerPropsType = Omit<ReactPlayerProps, 'width' | 'height' | 'style' | 'wrapper' | 'light' | 'poster'> & {
  variant?: videoPlayerVariantType;
  className?: string;
  poster?: string | false | ReactElement;
};

interface productCatalogOptionPropsType {
  name: string;
  previewSrc: string;
  disabled?: boolean;
  onSelect: () => void;
}

interface productCatalogPopoverPropsType {
  activeCollection: productCollectionIdType;
  onSelect: (product: Pick<catalogProductRefType, 'collection' | 'slug' | 'modelId'>) => void;
  children: ReactNode;
  contentSide?: 'top' | 'right' | 'bottom' | 'left';
  contentAlign?: 'start' | 'center' | 'end';
}

type productSessionAddButtonPropsType = ButtonHTMLAttributes<HTMLButtonElement>;

interface productSessionRowPropsType {
  name: string;
  previewSrc: string;
  active?: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

interface productFlipCardPropsType {
  collection: string;
  slug: string;
  alt: string;
  previewSrc?: string | null;
  activePreviewSrc?: string | null;
  className?: string;
}

interface productGalleryBlockPropsType {
  title: string;
  items: Array<{
    collection: string;
    slug: string;
    alt: string;
    previewSrc?: string | null;
    activePreviewSrc?: string | null;
  }>;
  className?: string;
}

export type {
  productCatalogOptionPropsType,
  productCatalogPopoverPropsType,
  productFlipCardPropsType,
  productGalleryBlockPropsType,
  productSessionAddButtonPropsType,
  productSessionRowPropsType,
  videoPlayerPropsType,
  videoPlayerVariantType,
};
