import type { printCmScaleType, textPositionConfigType } from '@types';
import { resolveCmLimitPx } from '@configurator/mappers';

interface textPrintStepLimitsType {
  heightMin: number;
  heightMax: number;
  widthMin: number;
  widthMax: number;
}

const TEXT_PRINT_MIN_CM = 1;

const TEXT_PRINT_UNBOUNDED_CM = 200;

const resolveTextPrintPositionLimits = (
  position: Pick<textPositionConfigType, 'heightMinCm' | 'heightMaxCm' | 'widthMinCm' | 'widthMaxCm'>,
  cmScale: printCmScaleType | null | undefined,
  fallback: { heightMinCm: number; heightMaxCm: number; widthMinCm: number; widthMaxCm: number },
): textPrintStepLimitsType => ({
  heightMin: resolveCmLimitPx(position.heightMinCm ?? fallback.heightMinCm, fallback.heightMinCm, cmScale?.cmPerPxVertical),
  heightMax: resolveCmLimitPx(position.heightMaxCm ?? fallback.heightMaxCm, fallback.heightMaxCm, cmScale?.cmPerPxVertical),
  widthMin: resolveCmLimitPx(position.widthMinCm ?? fallback.widthMinCm, fallback.widthMinCm, cmScale?.cmPerPxHorizontal),
  widthMax: resolveCmLimitPx(position.widthMaxCm ?? fallback.widthMaxCm, fallback.widthMaxCm, cmScale?.cmPerPxHorizontal),
});

export { resolveTextPrintPositionLimits, TEXT_PRINT_MIN_CM, TEXT_PRINT_UNBOUNDED_CM };
export type { textPrintStepLimitsType };
