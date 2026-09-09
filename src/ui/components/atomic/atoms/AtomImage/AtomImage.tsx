'use client';

import { cva } from 'class-variance-authority';
import Image from 'next/image';
import type { CSSProperties } from 'react';

import { cn } from '@utils';
import type { atomImagePropsType } from '@types';

const EMPTY_IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const variantAtomImage = cva('', {
  variants: {
    variant: {
      default: 'w-full h-full',
      logo: 'relative h-[109px] aspect-[143/154] shrink-0',
      logo_full: 'relative h-[38px] aspect-[170/38] shrink-0 max-sm:h-[22px]',
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
  const resolvedSrc = src || EMPTY_IMAGE_SRC;
  const isLocalStaticSrc = resolvedSrc.startsWith('/');
  const isSvgSrc = /\.svg(?:$|\?)/i.test(resolvedSrc);
  const shouldDisableOptimization = !isLocalStaticSrc || isSvgSrc;

  const imageStyle: CSSProperties = useFill ? { ...style, objectFit: fit } : { width: 'auto', height: 'auto', ...style };

  const imageElement = (
    <Image
      src={resolvedSrc}
      alt={alt || 'image'}
      fill={useFill}
      width={hasDimensions ? width : undefined}
      height={hasDimensions ? height : undefined}
      loading={resolvedLoading}
      priority={priority}
      unoptimized={shouldDisableOptimization}
      className={cn(useFill && (fit === 'cover' ? 'object-cover' : 'object-contain'), !useFill && className)}
      style={imageStyle}
      {...props}
    />
  );

  if (useFill) {
    return (
      <section data-active={dataActive} className={cn('relative', variantAtomImage({ variant }), className)}>
        {imageElement}
      </section>
    );
  }

  return imageElement;
};

export { AtomImage };
