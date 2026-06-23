const LOGO_MAX_FILE_SIZE = 10 * 1024 * 1024;

const LOGO_ACCEPTED_INPUT = '.eps,.ps,.pdf,.ai,.svg,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.webp';

const LOGO_SUPPORTED_LABEL = 'eps, ps, pdf, ai, svg, png, jpg, jpeg, bmp, tiff, tif';

const LOGO_ACCEPTED_EXTENSIONS = new Set(['eps', 'ps', 'pdf', 'ai', 'svg', 'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif', 'webp']);

const LOGO_ACCEPTED_MIMES = new Set([
  'application/postscript',
  'application/eps',
  'application/pdf',
  'application/illustrator',
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/tiff',
  'image/webp',
  '',
]);

export { LOGO_ACCEPTED_EXTENSIONS, LOGO_ACCEPTED_INPUT, LOGO_ACCEPTED_MIMES, LOGO_MAX_FILE_SIZE, LOGO_SUPPORTED_LABEL };
