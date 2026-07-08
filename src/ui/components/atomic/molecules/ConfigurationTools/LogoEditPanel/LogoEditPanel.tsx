'use client';

import type { logoEditPanelPropsType } from '@types';
import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import { useStepLogo } from '@hooks';
import { RangeControl } from '@molecules/ConfigurationTools/RangeControl';
const LogoEditPanel = ({ partId, onClose, onReplaceImage, replacing = false }: logoEditPanelPropsType) => {
  const part = useStepLogo((state) => state.parts.find((item) => item.id === partId));
  const updatePart = useStepLogo((state) => state.updatePart);

  if (!part || part.isDefault) return null;

  const opacity = part.opacity ?? 1;
  const opacityPercent = Math.round(opacity * 100);
  const scale = part.scale ?? 1;
  const scalePercent = Math.round(scale * 100);

  return (
    <Flex className="w-full flex-col items-start justify-start gap-5">
      <Grid className="grid-cols-[1fr_auto] items-center w-full gap-2">
        <Text className="text-[14px] leading-[15px] text-gray">File caricati</Text>
        <Button
          type="button"
          variant="outline"
          className="h-auto gap-1 px-0 py-0 text-[16px] font-semibold hover:text-error bg-transparent"
          onClick={onClose}
        >
          Chiudi
          <SvgIcon name="close" />
        </Button>
      </Grid>

      <Button
        type="button"
        variant="outline"
        disabled={replacing}
        onClick={onReplaceImage}
        aria-label="Sostituisci immagine"
        className="grid h-auto w-full min-w-0 grid-cols-[auto_1fr] items-center justify-start gap-2 bg-transparent"
      >
        <AtomImage src={part.src} alt={part.fileName} width={24} height={24} className="object-contain shrink-0" />
        <Text className="text-[16px] leading-[20px] font-semibold text-black-10 tracking-wide line-clamp-2 text-left">{part.fileName}</Text>
      </Button>
      <RangeControl label="Dimensione" value={scalePercent} onChange={(value) => updatePart(part.id, { scale: value / 100 })} min={25} max={300} unit="%" />
      <RangeControl label="Rotazione" value={part.rotation} onChange={(rotation) => updatePart(part.id, { rotation })} min={0} max={360} unit="°" />
      <RangeControl label="Trasparenza" value={opacityPercent} onChange={(value) => updatePart(part.id, { opacity: value / 100 })} min={0} max={100} unit="%" />
    </Flex>
  );
};

export { LogoEditPanel };
