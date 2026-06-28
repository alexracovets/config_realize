'use client';

import { cva } from 'class-variance-authority';
import type { CSSProperties, ImgHTMLAttributes } from 'react';

import { cn } from '@utils';
import type { atomImagePropsType } from '@types';

// Transparent 1x1 GIF. Used instead of an empty src="" which makes the browser
// re-request the current document (in an embedded iframe this re-downloads the whole app).
const EMPTY_IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const variantAtomImage = cva('', {
  variants: {
    variant: {
      default: 'w-full h-full',
      logo: 'relative h-[109px] aspect-[143/154] shrink-0',
      logo_full: 'relative h-[38px] aspect-[170/38] shrink-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const AtomImage = ({
  src,
  alt,
  variant = 'default',
  priority = false,
  fit = 'contain',
  loading,
  className,
  width,
  height,
  'data-active': dataActive,
  style,
  ...props
}: atomImagePropsType) => {
  const hasDimensions = width != null && height != null;
  const useFill = !hasDimensions;
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy');

  const imageStyle: CSSProperties = useFill ? { ...style, position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit } : (style ?? {});

  const imageElement = (
    // Native img: data/blob URLs, arbitrary external src, and fill layout without next/image loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || EMPTY_IMAGE_SRC}
      alt={alt || 'image'}
      width={hasDimensions ? width : undefined}
      height={hasDimensions ? height : undefined}
      loading={resolvedLoading}
      fetchPriority={priority ? 'high' : undefined}
      className={cn(useFill && (fit === 'cover' ? 'object-cover' : 'object-contain'), !useFill && className)}
      style={imageStyle}
      {...(props as ImgHTMLAttributes<HTMLImageElement>)}
    />
  );

  if (useFill) {
    return (
      <div data-active={dataActive} className={cn('relative', variantAtomImage({ variant }), className)}>
        {imageElement}
      </div>
    );
  }

  return imageElement;
};

export { AtomImage };
