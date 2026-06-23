import { PRINT_UPLOAD_ROTATION_DEG } from '../NAME_STAMP_CONSTANTS';

const LOGO_SLOT_COUNT = 4;

/** Corrects uploaded image orientation relative to the print UV space on the garment. */
const LOGO_UPLOAD_ROTATION_DEG = PRINT_UPLOAD_ROTATION_DEG;
const LOGO_SCALE_MIN = 0.25;
const LOGO_SCALE_MAX = 3;
/** Base logo size on the garment at instance scale = 1 (front width / back height in reference stamp px). */
const LOGO_DEFAULT_SIZE_SCALE = 3;
const LOGO_MARK_REF_WIDTH = 283 * LOGO_DEFAULT_SIZE_SCALE;
const LOGO_VERTICAL_REF_HEIGHT = 482 * LOGO_DEFAULT_SIZE_SCALE;
const LOGO_ATLAS_REF_WIDTH = 9331;
const LOGO_ATLAS_REF_HEIGHT = 4900;

export {
  LOGO_ATLAS_REF_HEIGHT,
  LOGO_ATLAS_REF_WIDTH,
  LOGO_DEFAULT_SIZE_SCALE,
  LOGO_MARK_REF_WIDTH,
  LOGO_SCALE_MAX,
  LOGO_SCALE_MIN,
  LOGO_SLOT_COUNT,
  LOGO_UPLOAD_ROTATION_DEG,
  LOGO_VERTICAL_REF_HEIGHT,
};
