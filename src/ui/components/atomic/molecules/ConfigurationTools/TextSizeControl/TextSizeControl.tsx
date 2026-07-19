'use client';

import { usePrintUnits, useTextFit } from '@hooks';
import type { textSizeControlPropsType } from '@types';
import { RangeControl } from '@molecules/ConfigurationTools';

const TextSizeControl = ({
  text,
  font,
  letterSpacing,
  lineHeight,
  fontSize,
  heightMin,
  heightMax,
  widthMin,
  widthMax,
  onPreviewFontSize,
  onCommitFontSize,
}: textSizeControlPropsType) => {
  const { x: unitX, y: unitY } = usePrintUnits();
  const { measureWidth, fitFromHeight, fitFromWidth } = useTextFit();

  const limits = { heightMin, heightMax, widthMin, widthMax };
  const measureOptions = { letterSpacing, lineHeight };
  const width = measureWidth(text, font, fontSize, measureOptions);

  const handleHeightChange = (heightCm: number) => {
    const fit = fitFromHeight(text, font, unitY.toPx(heightCm), limits, measureOptions);
    onPreviewFontSize(fit.fontSize);
  };

  const handleWidthChange = (widthCm: number) => {
    const fit = fitFromWidth(text, font, unitX.toPx(widthCm), limits, measureOptions);
    onPreviewFontSize(fit.fontSize);
  };

  return (
    <>
      <RangeControl
        label="Altezza testo"
        value={unitY.toUnit(fontSize)}
        onChange={handleHeightChange}
        onCommit={onCommitFontSize}
        min={unitY.toUnit(heightMin)}
        max={unitY.toUnit(heightMax)}
        step={unitY.step}
        formatValue={unitY.formatUnit}
      />

      <RangeControl
        label="Larghezza testo"
        value={unitX.toUnit(width)}
        onChange={handleWidthChange}
        onCommit={onCommitFontSize}
        min={unitX.toUnit(widthMin)}
        max={unitX.toUnit(widthMax)}
        step={unitX.step}
        formatValue={unitX.formatUnit}
      />
    </>
  );
};

export { TextSizeControl };
