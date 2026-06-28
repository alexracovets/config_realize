'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';

import { AtomImage } from '@atoms';
import { useAppNavigate, useGarmentCatalogPreload } from '@hooks';
import type { productFlipCardPropsType } from '@types';
import { cn, resolveProductFlipCardSrc } from '@utils';

const ProductFlipCard = ({ collection, slug, alt, previewSrc, activePreviewSrc, className }: productFlipCardPropsType) => {
  const { toAppPath } = useAppNavigate();
  const cardRef = useRef<HTMLAnchorElement>(null);
  const isWarmedRef = useRef(false);
  const isEagerWarmRef = useRef(false);
  const { warmBySlug, warmBySlugEager } = useGarmentCatalogPreload();
  const hasRemoteImages = previewSrc != null || activePreviewSrc != null;
  const frontSrc = previewSrc ?? (hasRemoteImages ? '' : resolveProductFlipCardSrc(collection, slug, 'front'));
  const backSrc = activePreviewSrc ?? previewSrc ?? (hasRemoteImages ? '' : resolveProductFlipCardSrc(collection, slug, 'back'));

  const warmProductAssets = useCallback(() => {
    if (isWarmedRef.current) return;
    isWarmedRef.current = true;
    warmBySlug(slug);
  }, [slug, warmBySlug]);

  const warmProductAssetsEager = useCallback(() => {
    if (isEagerWarmRef.current) return;
    isEagerWarmRef.current = true;

    const scheduleEagerWarm = () => {
      void warmBySlugEager(slug);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(scheduleEagerWarm, { timeout: 2_000 });
      return;
    }

    requestAnimationFrame(scheduleEagerWarm);
  }, [slug, warmBySlugEager]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        warmProductAssets();
        observer.disconnect();
      },
      { rootMargin: '240px' },
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, [warmProductAssets]);

  return (
    <Link
      ref={cardRef}
      href={toAppPath(`/${slug}`)}
      prefetch={false}
      tabIndex={0}
      onPointerEnter={warmProductAssets}
      onFocus={warmProductAssets}
      onTouchStart={warmProductAssets}
      onPointerDown={warmProductAssetsEager}
      className={cn(
        'group/card aspect-3/4 w-full cursor-pointer outline-none perspective-[1000px]',
        'focus-visible:ring-2 focus-visible:ring-default focus-visible:ring-offset-2',
        className,
      )}
    >
      <div
        className={cn(
          'relative size-full transform-3d transition-transform duration-600 ease-in-out',
          'group-hover/card:transform-[rotateY(180deg)] group-focus-within/card:transform-[rotateY(180deg)]',
        )}
      >
        <div className="absolute inset-0 backface-hidden">
          <AtomImage src={frontSrc} alt={alt} priority loading="eager" className="size-full rounded-[8px] bg-gray-20 backface-hidden" />
        </div>
        <div className="absolute inset-0 transform-[rotateY(180deg)] backface-hidden">
          <AtomImage src={backSrc} alt={alt} loading="eager" className="size-full rounded-[8px] bg-gray-20 backface-hidden" />
        </div>
      </div>
    </Link>
  );
};

export { ProductFlipCard };
