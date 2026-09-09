'use client';

import { PatternLayerColorControl } from '@molecules/ConfigurationTools/PatternLayerColorControl';
import { RangeControl } from '@molecules/ConfigurationTools/RangeControl';
import { DesignPatternCarousel } from '@molecules/ConfigurationSteps/DesignPatternCarousel';
import type { designPatternItemType } from '@types';
import { AtomImage, Box, Button, Flex, Grid, SvgIcon } from '@atoms';
import { PALETTE_COLORS } from '@constants';
import { useTintedDesignSvgSrc } from '@hooks';
import { PatternPreviewSkeleton } from '@skeletons';
import { useConfiguratorProduct, useGarmentDesign } from '@store';
import { cn } from '@utils';
import { useCallback, useState } from 'react';

const DEFAULT_PART_COLOR = PALETTE_COLORS[1];

const DesignCardPreview = ({ src, layerColors, eager }: { src: string; layerColors?: string[]; eager?: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const displaySrc = useTintedDesignSvgSrc(src, layerColors);

  return (
    <Box key={displaySrc} variant="relative_fill">
      {!isLoaded && <PatternPreviewSkeleton />}
      <AtomImage
        src={displaySrc}
        alt=""
        fit="cover"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'low'}
        className={cn(!isLoaded && 'opacity-0')}
        draggable={false}
        onLoad={() => setIsLoaded(true)}
      />
    </Box>
  );
};

const resolvePreviewLayerColors = (pattern: designPatternItemType, activePattern: designPatternItemType | null, getPartColor: (partKey: string) => string) =>
  activePattern?.key === pattern.key ? pattern.colorParts.map((part) => getPartColor(part.key)) : undefined;

const ConfigurationDesign = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const patterns = useGarmentDesign((state) => state.patterns);
  const activePattern = useGarmentDesign((state) => state.activePattern);
  const patternColors = useGarmentDesign((state) => state.patternColors);
  const activeOpacity = useGarmentDesign((state) => state.activeOpacity);
  const setActivePattern = useGarmentDesign((state) => state.setActivePattern);
  const setPartColor = useGarmentDesign((state) => state.setPartColor);
  const setActiveOpacity = useGarmentDesign((state) => state.setActiveOpacity);

  const getPartColor = useCallback((partKey: string) => patternColors[partKey] ?? DEFAULT_PART_COLOR, [patternColors]);

  if (patterns.length === 0) return null;

  return (
    <Flex key={product.path} variant="step_design">
      <Grid variant="select_parts_mobile_hidden">
        <Button variant="select_none" title="Nessuno" data-active={activePattern === null} onClick={() => setActivePattern(null)}>
          <SvgIcon name="none" />
          Nessuno
        </Button>
        {patterns.map((pattern, index) => (
          <Button
            key={pattern.key}
            variant="select_part"
            className="transition-none will-change-auto"
            title={pattern.name}
            data-active={pattern.key === activePattern?.key}
            onClick={() => setActivePattern(pattern)}
            style={{ contentVisibility: 'auto', contain: 'layout paint style' }}
          >
            <DesignCardPreview src={pattern.cardPreviewSrc} layerColors={resolvePreviewLayerColors(pattern, activePattern, getPartColor)} eager={index < 2} />
          </Button>
        ))}
      </Grid>
      <Box variant="palette_carousel_mobile">
        <DesignPatternCarousel
          patterns={patterns}
          activePatternKey={activePattern?.key ?? null}
          onSelect={setActivePattern}
          renderPreview={(pattern, index) => (
            <DesignCardPreview src={pattern.cardPreviewSrc} layerColors={resolvePreviewLayerColors(pattern, activePattern, getPartColor)} eager={index < 2} />
          )}
        />
      </Box>

      {activePattern && (
        <PatternLayerColorControl
          key={activePattern.key}
          layers={activePattern.colorParts.map((part, index) => ({
            key: part.key,
            label: `Colore ${index + 1}`,
          }))}
          colors={Object.fromEntries(activePattern.colorParts.map((part) => [part.key, getPartColor(part.key)]))}
          onColorChange={setPartColor}
          onPreviewColorChange={setPartColor}
          label="Colore design"
        />
      )}

      {activePattern && (
        <RangeControl
          value={Math.round(activeOpacity * 100)}
          onChange={(value) => setActiveOpacity(value / 100)}
          min={0}
          max={100}
          unit="%"
          label="Trasparenza"
        />
      )}
    </Flex>
  );
};

export { ConfigurationDesign };
