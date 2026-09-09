'use client';

import type { logoEditPanelPropsType } from '@types';
import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import { useLogoSizeCm, useStepLogo } from '@hooks';
import { RangeControl } from '@molecules/ConfigurationTools/RangeControl';
const LogoEditPanel = ({ partId, onClose, onReplaceImage, replacing = false }: logoEditPanelPropsType) => {
  const part = useStepLogo((state) => state.parts.find((item) => item.id === partId));
  const updatePart = useStepLogo((state) => state.updatePart);

  const size = useLogoSizeCm(part ?? { scale: 1, naturalWidth: 1, naturalHeight: 1 });

  if (!part || part.isDefault) return null;

  const opacity = part.opacity ?? 1;
  const opacityPercent = Math.round(opacity * 100);

  return (
    <Flex variant="logo_edit_panel_column">
      <Grid variant="logo_edit_header">
        <Text variant="logo_uploaded_label">File caricati</Text>
        <Button
          type="button"
          variant="outline"
          className="h-auto gap-1 px-0 py-0 text-[16px] max-xl:text-[13px] font-semibold hover:text-error bg-transparent"
          onClick={onClose}
        >
          Chiudi
          <SvgIcon name="close" className="max-xl:size-3.25" />
        </Button>
      </Grid>

      <Button
        type="button"
        variant="outline"
        disabled={replacing}
        onClick={onReplaceImage}
        aria-label="Sostituisci immagine"
        className="grid h-auto w-full min-w-0 grid-cols-[auto_1fr] items-center justify-start gap-2 max-xl:gap-1.5 bg-transparent"
      >
        <Grid className="relative size-6 shrink-0 max-xl:size-5">
          <AtomImage src={part.src} alt={part.fileName} />
        </Grid>
        <Text variant="logo_uploaded_file_name">{part.fileName}</Text>
      </Button>
      <RangeControl
        label="Altezza"
        value={size.heightCm}
        onChange={(heightCm) => updatePart(part.id, { scale: size.scaleFromHeightCm(heightCm) })}
        min={size.heightMinCm}
        max={size.heightMaxCm}
        step={size.step}
        formatValue={(value) => `${value.toFixed(1)} cm`}
      />
      <RangeControl
        label="Larghezza"
        value={size.widthCm}
        onChange={(widthCm) => updatePart(part.id, { scale: size.scaleFromWidthCm(widthCm) })}
        min={size.widthMinCm}
        max={size.widthMaxCm}
        step={size.step}
        formatValue={(value) => `${value.toFixed(1)} cm`}
      />
      <RangeControl label="Rotazione" value={part.rotation} onChange={(rotation) => updatePart(part.id, { rotation })} min={0} max={360} unit="°" />
      <RangeControl label="Trasparenza" value={opacityPercent} onChange={(value) => updatePart(part.id, { opacity: value / 100 })} min={0} max={100} unit="%" />
    </Flex>
  );
};

export { LogoEditPanel };
