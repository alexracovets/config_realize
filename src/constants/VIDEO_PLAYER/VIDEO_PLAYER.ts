const VIDEO_PLAYER_DEFAULT_VOLUME = 0.2;

const VIDEO_PLAYER_YOUTUBE_CONFIG = {
  enablejsapi: 1,
  rel: 0,
  iv_load_policy: 3,
  cc_load_policy: 0,
  fs: 0,
  disablekb: 1,
  playsinline: 1,
  color: 'white',
} as const;

export { VIDEO_PLAYER_DEFAULT_VOLUME, VIDEO_PLAYER_YOUTUBE_CONFIG };
