'use client';

import { DFRNC_LOGO_SRC, DFRNC_LOGO_URL } from '@constants';
import { cn } from '@utils';

const LOGO_MASK_STYLE = {
  backgroundColor: 'var(--color-primary-10)',
  maskImage: `url(${DFRNC_LOGO_SRC})`,
  WebkitMaskImage: `url(${DFRNC_LOGO_SRC})`,
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
} as const;

const CanvasBrandLogo = ({ className }: { className?: string }) => {
  return (
    <a
      href={DFRNC_LOGO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="DFRNC"
      className={cn(
        'pointer-events-auto absolute right-8 bottom-8 z-30',
        'opacity-60 transition-opacity duration-200 ease-in hover:opacity-90',
        'max-xl:right-4 max-xl:bottom-8',
        'max-sm:right-5 max-sm:bottom-1',
        className,
      )}
    >
      <span role="img" aria-hidden className="block h-8 aspect-312/392 shrink-0 max-sm:h-6" style={LOGO_MASK_STYLE} />
    </a>
  );
};

export { CanvasBrandLogo };
