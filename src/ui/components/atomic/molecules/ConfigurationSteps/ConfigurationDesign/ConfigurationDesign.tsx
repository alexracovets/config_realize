'use client';

import { useCallback, useState } from 'react';

import { AtomImage, Button, Flex, Grid, SvgIcon } from '@atoms';
import { ColorControl } from '../../ConfigurationTools/ColorControl';
import { ColorTabControl } from '../../ConfigurationTools/ColorTabControl';
import { PatternLayerColorControl } from '../../ConfigurationTools/PatternLayerColorControl';
import { RangeControl } from '../../ConfigurationTools/RangeControl';
import { PALETTE_COLORS } from '@constants';
import { useConfiguratorProduct, useGarmentDesign } from '@store';
import type { designPatternPartType } from '@types';
import { PatternPreviewSkeleton } from '@skeletons';
import { cn } from '@utils';

const DEFAULT_PART_COLOR = PALETTE_COLORS[1];

const getPatternPreviewKey = (parts: designPatternPartType[]) => parts.map((part) => `${part.key}:${part.previewSrc}`).join('|');

const PatternPreviewContent = ({ parts, eager }: { parts: designPatternPartType[]; eager?: boolean }) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const isLoaded = loadedCount >= parts.length;

  return (
    <div className="relative h-full w-full">
      {!isLoaded && <PatternPreviewSkeleton />}
      {parts.map((part, index) => (
        <AtomImage
          key={part.key}
          src={part.previewSrc}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'low'}
          className={cn(index > 0 && 'absolute inset-0', !isLoaded && 'opacity-0')}
          draggable={false}
          onLoad={() => setLoadedCount((count) => count + 1)}
        />
      ))}
    </div>
  );
};

const PatternPreview = ({ parts, eager }: { parts: designPatternPartType[]; eager?: boolean }) => (
  <PatternPreviewContent key={getPatternPreviewKey(parts)} parts={parts} eager={eager} />
);

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
      <Grid variant="select_parts">
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
            <PatternPreview parts={pattern.parts} eager={index < 2} />
          </Button>
        ))}
      </Grid>

      {activePattern && activePattern.parts.length === 1 && (
        <ColorControl
          color={getPartColor(activePattern.parts[0].key)}
          onSelect={(color) => setPartColor(activePattern.parts[0].key, color)}
          onPreviewSelect={(color) => setPartColor(activePattern.parts[0].key, color)}
          label="Colore design"
        />
      )}

      {activePattern && activePattern.parts.length === 2 && (
        <ColorTabControl
          textColor={getPartColor(activePattern.parts[0].key)}
          strokeColor={getPartColor(activePattern.parts[1].key)}
          onTextColor={(color) => setPartColor(activePattern.parts[0].key, color)}
          onStrokeColor={(color) => setPartColor(activePattern.parts[1].key, color)}
          onPreviewTextColor={(color) => setPartColor(activePattern.parts[0].key, color)}
          onPreviewStrokeColor={(color) => setPartColor(activePattern.parts[1].key, color)}
          label="Colore design"
        />
      )}

      {activePattern && activePattern.parts.length > 2 && (
        <PatternLayerColorControl
          layers={activePattern.parts.map((part, index) => ({
            key: part.key,
            label: `Colore ${index + 1}`,
          }))}
          colors={Object.fromEntries(activePattern.parts.map((part) => [part.key, getPartColor(part.key)]))}
          onColorChange={(partKey, color) => setPartColor(partKey, color)}
          onPreviewColorChange={(partKey, color) => setPartColor(partKey, color)}
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
