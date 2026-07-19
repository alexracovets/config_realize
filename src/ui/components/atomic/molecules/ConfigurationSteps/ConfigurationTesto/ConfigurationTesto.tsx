'use client';

import type { configurationPositionPickerInstanceType, testoPartFormPropsType, testoPositionType } from '@types';
import { AccordionAtom, Button, Flex, SvgIcon, Text } from '@atoms';
import { CONFIGURATOR_TESTO_POSITION_SELECT_LABEL } from '@constants';
import { useConfigurationPositionPicker, usePrintCmScale, usePrintUnits } from '@hooks';
import { ColorTabControl, ConfigurationPositionSelect, FontSelectRow, PartColorSwitch, RangeControl, TextSizeControl } from '@molecules/ConfigurationTools';
import {
  createTestoInstance,
  resolveTestoDefaults,
  resolveTestoLetterSpacingShow,
  resolveTestoLineHeightShow,
  resolveTestoPositionLimits,
  useConfiguratorProduct,
  useGarmentTesto,
} from '@store';
import { useCallback, useMemo } from 'react';
const TestoPartForm = ({ instanceId, limits, placeholder, lineHeightShow, letterSpacingShow }: testoPartFormPropsType) => {
  const instance = useGarmentTesto((state) => state.instances.find((item) => item.id === instanceId));
  const updateInstance = useGarmentTesto((state) => state.updateInstance);
  const removeInstance = useGarmentTesto((state) => state.removeInstance);
  const setPreview = useGarmentTesto((state) => state.setPreview);
  const clearPreview = useGarmentTesto((state) => state.clearPreview);
  const previewPatch = useGarmentTesto((state) => (state.preview?.instanceId === instanceId ? state.preview.patch : null));
  const previewText = previewPatch?.text;
  const previewTextColor = previewPatch?.textColor;
  const previewStrokeColor = previewPatch?.strokeColor;
  const previewFontSize = previewPatch?.fontSize;
  const previewStrokeWidth = previewPatch?.strokeWidth;
  const previewLineHeight = previewPatch?.lineHeight;
  const previewLetterSpacing = previewPatch?.letterSpacing;

  const { x: unitX, y: unitY } = usePrintUnits();

  const commit = useCallback(
    (patch: Parameters<typeof updateInstance>[1]) => {
      const preview = useGarmentTesto.getState().preview;
      if (preview?.instanceId === instanceId) {
        updateInstance(instanceId, { ...preview.patch, ...patch });
      } else {
        updateInstance(instanceId, patch);
      }
      clearPreview();
    },
    [clearPreview, instanceId, updateInstance],
  );

  const commitFromPreview = useCallback(() => {
    const preview = useGarmentTesto.getState().preview;
    if (preview?.instanceId === instanceId) {
      updateInstance(instanceId, preview.patch);
    }
    clearPreview();
  }, [clearPreview, instanceId, updateInstance]);

  if (!instance) return null;

  return (
    <Flex variant="configurator_part" className="gap-5 pt-2">
      <Flex variant="configurator_part">
        <Text variant="configurator_control_label">Testo</Text>
        <input
          type="text"
          value={previewText ?? instance.text}
          maxLength={limits.maxLength}
          onChange={(e) => setPreview(instanceId, { text: e.target.value })}
          onBlur={commitFromPreview}
          className="w-full h-10 bg-white border border-input-border rounded-[8px] px-3 text-sm font-inter text-default outline-none focus:border-active transition-colors"
          placeholder={placeholder}
        />
      </Flex>
      <FontSelectRow font={instance.font} onChange={(font) => commit({ font })} />

      <ColorTabControl
        tabVariant="text"
        textColor={previewTextColor ?? instance.textColor}
        strokeColor={previewStrokeColor ?? instance.strokeColor}
        onTextColor={(textColor) => commit({ textColor })}
        onStrokeColor={(strokeColor) => commit({ strokeColor })}
        onPreviewTextColor={(textColor) => setPreview(instanceId, { textColor })}
        onPreviewStrokeColor={(strokeColor) => setPreview(instanceId, { strokeColor })}
      />

      <TextSizeControl
        text={previewText ?? instance.text}
        font={instance.font}
        letterSpacing={previewLetterSpacing ?? instance.letterSpacing}
        lineHeight={previewLineHeight ?? instance.lineHeight}
        fontSize={previewFontSize ?? instance.fontSize}
        heightMin={limits.heightMin}
        heightMax={limits.heightMax}
        widthMin={limits.widthMin}
        widthMax={limits.widthMax}
        onPreviewFontSize={(fontSize) => setPreview(instanceId, { fontSize })}
        onCommitFontSize={commitFromPreview}
      />

      {lineHeightShow && (
        <RangeControl
          label="Altezza carattere"
          value={Math.round((previewLineHeight ?? instance.lineHeight ?? 1.5) * 100)}
          onChange={(percent) => setPreview(instanceId, { lineHeight: percent / 100 })}
          onCommit={commitFromPreview}
          min={Math.round(limits.lineHeightMin * 100)}
          max={Math.round(limits.lineHeightMax * 100)}
          unit="%"
        />
      )}

      {letterSpacingShow && (
        <RangeControl
          label="Spaziatura lettere"
          value={unitX.toUnit(previewLetterSpacing ?? instance.letterSpacing ?? 0)}
          onChange={(letterSpacing) => setPreview(instanceId, { letterSpacing: unitX.toPx(letterSpacing) })}
          onCommit={commitFromPreview}
          min={unitX.toUnit(limits.letterSpacingMin)}
          max={unitX.toUnit(limits.letterSpacingMax)}
          step={unitX.step}
          formatValue={unitX.formatUnit}
        />
      )}

      <RangeControl
        label="Spessore contorno"
        value={unitY.toUnit(previewStrokeWidth ?? instance.strokeWidth)}
        onChange={(strokeWidth) => setPreview(instanceId, { strokeWidth: unitY.toPx(strokeWidth) })}
        onCommit={commitFromPreview}
        min={0}
        max={unitY.toUnit(limits.strokeWidthMax)}
        step={unitY.step}
        formatValue={unitY.formatUnit}
      />

      <Button variant="delete" size="delete" onClick={() => removeInstance(instanceId)}>
        <SvgIcon name="delete" className="w-[14px] h-[15.75px]" />
        Eliminare
      </Button>
    </Flex>
  );
};

const ConfigurationTesto = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const cmScale = usePrintCmScale();
  const positions = useGarmentTesto((state) => state.positions);
  const instances = useGarmentTesto((state) => state.instances);
  const addInstance = useGarmentTesto((state) => state.addInstance);
  const removeInstance = useGarmentTesto((state) => state.removeInstance);

  const testoDefaults = useMemo(() => (positions.length > 0 ? resolveTestoDefaults(product) : null), [positions.length, product]);
  const limitsByPositionKey = useMemo(() => {
    if (positions.length === 0) return null;
    return new Map(positions.map((position) => [position.key, resolveTestoPositionLimits(product, position, cmScale)]));
  }, [cmScale, positions, product]);
  const lineHeightShow = useMemo(() => (positions.length > 0 ? resolveTestoLineHeightShow(product) : false), [positions.length, product]);
  const letterSpacingShow = useMemo(() => (positions.length > 0 ? resolveTestoLetterSpacingShow(product) : false), [positions.length, product]);

  const handleAddInstance = useCallback(
    (position: testoPositionType, instanceId: string) => {
      addInstance(createTestoInstance(product, position, instanceId));
    },
    [addInstance, product],
  );

  const resolveFocusFromPosition = useCallback((position: testoPositionType) => ({ partId: position.partId, uv: position.uv }), []);

  const resolveFocusFromInstance = useCallback((instance: configurationPositionPickerInstanceType) => {
    const item = useGarmentTesto.getState().instances.find((entry) => entry.id === instance.id);
    return item ? { partId: item.partId, uv: item.uv } : null;
  }, []);

  const { openItems, handleItemActivate, handleOpenItemsChange, handlePositionSelect } = useConfigurationPositionPicker({
    positions,
    instances,
    onAddInstance: handleAddInstance,
    resolveFocusFromPosition,
    resolveFocusFromInstance,
  });

  const pickerPositions = useMemo(() => {
    const usedKeys = new Set(instances.map((instance) => instance.positionKey));
    return positions
      .filter((position) => position.interactive)
      .map((position) => ({ key: position.key, label: position.label, src: position.src, disabled: usedKeys.has(position.key) }));
  }, [instances, positions]);

  const items = useMemo(() => {
    if (!limitsByPositionKey) return [];

    return instances.flatMap((instance) => {
      const limits = limitsByPositionKey.get(instance.positionKey);
      if (!limits) return [];

      return [
        {
          value: instance.id,
          trigger: <PartColorSwitch color={instance.textColor} label={instance.label} />,
          content: (
            <TestoPartForm
              instanceId={instance.id}
              limits={limits}
              placeholder={testoDefaults?.text ?? ''}
              lineHeightShow={lineHeightShow}
              letterSpacingShow={letterSpacingShow}
            />
          ),
          onDelete: () => removeInstance(instance.id),
        },
      ];
    });
  }, [instances, letterSpacingShow, limitsByPositionKey, lineHeightShow, removeInstance, testoDefaults?.text]);

  if (positions.length === 0 || !limitsByPositionKey || !testoDefaults) return null;

  return (
    <Flex key={product.path} variant="step_design" className="gap-3">
      <ConfigurationPositionSelect
        label={CONFIGURATOR_TESTO_POSITION_SELECT_LABEL}
        title={testoDefaults.title}
        description={testoDefaults.description}
        positions={pickerPositions}
        onSelect={handlePositionSelect}
      />

      {instances.length > 0 && (
        <AccordionAtom items={items} value={openItems} onValueChange={handleOpenItemsChange} onItemActivate={handleItemActivate} multiple className="gap-2" />
      )}
    </Flex>
  );
};

export { ConfigurationTesto };
