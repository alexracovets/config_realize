'use client';

import { type KeyboardEvent, lazy, type ReactElement, Suspense, type SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { cva } from 'class-variance-authority';

import { Box } from '@atoms';
import { VIDEO_PLAYER_DEFAULT_VOLUME, VIDEO_PLAYER_YOUTUBE_CONFIG } from '@constants';
import type { videoPlayerPropsType } from '@types';
import { cn } from '@utils';

const ReactPlayerLazy = lazy(() => import('react-player'));

const variantVideoPlayer = cva('flex w-full flex-col overflow-hidden', {
  variants: {
    variant: {
      default: 'rounded-[8px] bg-black/5',
      tutorial: 'border-2 border-input-border bg-white shadow-sm rounded-[8px]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const playerSurfaceClassName = cn(
  'absolute inset-0 size-full',
  '[&>*]:size-full',
  '[&_youtube-video]:absolute [&_youtube-video]:inset-0 [&_youtube-video]:block [&_youtube-video]:size-full [&_youtube-video]:min-h-0 [&_youtube-video]:min-w-0',
  '[&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full',
);

const normalizeVideoSrc = (src?: string) => {
  if (!src) return src;

  if (/youtu(\.be|be\.com)/i.test(src) && !src.includes('youtube-nocookie')) {
    return src.replace(/youtube\.com/g, 'youtube-nocookie.com');
  }

  return src;
};

const isCustomPoster = (poster: videoPlayerPropsType['poster']): poster is ReactElement =>
  poster !== false && poster !== undefined && typeof poster !== 'string';

const VideoPlayer = ({
  src,
  variant = 'default',
  className,
  poster = false,
  playsInline = true,
  volume = VIDEO_PLAYER_DEFAULT_VOLUME,
  controls = true,
  playing,
  onClickPreview,
  onReady,
  config,
  ...props
}: videoPlayerPropsType) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const normalizedSrc = normalizeVideoSrc(src);
  const customPoster = isCustomPoster(poster) ? poster : null;
  const showPosterOverlay = Boolean(customPoster && (!hasStarted || !isPlayerReady));

  useEffect(() => {
    if (!hasStarted) return;

    void import('react-player');
  }, [hasStarted]);

  const lightMode = useMemo((): boolean | string | ReactElement | undefined => {
    if (hasStarted || poster === false || customPoster) return undefined;
    if (typeof poster === 'string') return poster;

    return undefined;
  }, [customPoster, hasStarted, poster]);

  const effectivePlaying = playing === false ? false : (playing ?? hasStarted);

  const handlePreviewClick = useCallback(
    (event: SyntheticEvent) => {
      setHasStarted(true);
      onClickPreview?.(event);
    },
    [onClickPreview],
  );

  const handlePreviewKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      handlePreviewClick(event);
    },
    [handlePreviewClick],
  );

  const handlePlayerReady = useCallback(() => {
    setIsPlayerReady(true);
    onReady?.();
  }, [onReady]);

  const playerConfig = useMemo(() => {
    const pageOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const pageHref = typeof window !== 'undefined' ? window.location.href : undefined;

    return {
      ...config,
      youtube: {
        ...VIDEO_PLAYER_YOUTUBE_CONFIG,
        origin: pageOrigin,
        widget_referrer: pageHref,
        ...config?.youtube,
      },
    };
  }, [config]);

  return (
    <Box className={cn(variantVideoPlayer({ variant }), className)}>
      <Box variant="video_player_frame">
        {hasStarted ? (
          <Box className={playerSurfaceClassName}>
            <Suspense fallback={null}>
              <ReactPlayerLazy
                {...props}
                src={normalizedSrc}
                config={playerConfig}
                controls={controls}
                disableRemotePlayback
                playsInline={playsInline}
                playing={effectivePlaying}
                volume={volume}
                pip={false}
                light={lightMode}
                fallback={false}
                width="100%"
                height="100%"
                style={{ width: '100%', height: '100%' }}
                onReady={handlePlayerReady}
                onClickPreview={handlePreviewClick}
                playIcon={customPoster && !hasStarted ? <></> : undefined}
              />
            </Suspense>
          </Box>
        ) : null}

        {showPosterOverlay ? (
          <Box
            variant="video_player_overlay"
            role="button"
            tabIndex={0}
            aria-label="Ð’Ñ–Ð´Ñ‚Ð²Ð¾Ñ€Ð¸Ñ‚Ð¸ Ð²Ñ–Ð´ÐµÐ¾"
            onClick={handlePreviewClick}
            onKeyDown={handlePreviewKeyDown}
          >
            {customPoster}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export { VideoPlayer };
