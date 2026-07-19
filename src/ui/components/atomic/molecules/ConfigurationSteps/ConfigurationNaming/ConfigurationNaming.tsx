'use client';

import type { configurationPositionPickerInstanceType, namePartFormPropsType, namePositionType } from '@types';
import { AccordionAtom, Button, Flex, SvgIcon, Text } from '@atoms';
import { CONFIGURATOR_NAME_POSITION_SELECT_LABEL } from '@constants';
import { useConfigurationPositionPicker, usePrintCmScale, usePrintUnits } from '@hooks';
import { ColorTabControl, ConfigurationPositionSelect, FontSelectRow, PartColorSwitch, RangeControl, TextSizeControl } from '@molecules/ConfigurationTools';
import { createNameInstance, resolveNameDefaults, resolveNamePositionLimits, useConfiguratorProduct, useGarmentName } from '@store';
import { useCallback, useMemo } from 'react';
const NamePartForm = ({ instanceId, limits, placeholder }: namePartFormPropsType) => {
  const instance = useGarmentName((state) => state.instances.find((item) => item.id === instanceId));
  const updateInstance = useGarmentName((state) => state.updateInstance);
  const removeInstance = useGarmentName((state) => state.removeInstance);
  const setPreview = useGarmentName((state) => state.setPreview);
  const clearPreview = useGarmentName((state) => state.clearPreview);
  const previewPatch = useGarmentName((state) => (state.preview?.instanceId === instanceId ? state.preview.patch : null));
  const sharedPreviewText = useGarmentName((state) => {
    const text = state.preview?.patch.text;
    return text !== undefined ? text : null;
  });
  const previewText = previewPatch?.text;
  const previewTextColor = previewPatch?.textColor;
  const previewStrokeColor = previewPatch?.strokeColor;
  const previewFontSize = previewPatch?.fontSize;
  const previewStrokeWidth = previewPatch?.strokeWidth;

  const { y: unitY } = usePrintUnits();

  const commit = useCallback(
    (patch: Parameters<typeof updateInstance>[1]) => {
      const preview = useGarmentName.getState().preview;
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
    const preview = useGarmentName.getState().preview;
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
          value={sharedPreviewText ?? previewText ?? instance.text}
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
        text={sharedPreviewText ?? previewText ?? instance.text}
        font={instance.font}
        fontSize={previewFontSize ?? instance.fontSize}
        heightMin={limits.heightMin}
        heightMax={limits.heightMax}
        widthMin={limits.widthMin}
        widthMax={limits.widthMax}
        onPreviewFontSize={(fontSize) => setPreview(instanceId, { fontSize })}
        onCommitFontSize={commitFromPreview}
      />

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

const ConfigurationNaming = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const cmScale = usePrintCmScale();
  const positions = useGarmentName((state) => state.positions);
  const instances = useGarmentName((state) => state.instances);
  const addInstance = useGarmentName((state) => state.addInstance);
  const removeInstance = useGarmentName((state) => state.removeInstance);

  const nameDefaults = useMemo(() => (positions.length > 0 ? resolveNameDefaults(product) : null), [positions.length, product]);

  const limitsByPositionKey = useMemo(() => {
    if (positions.length === 0) return null;
    return new Map(positions.map((position) => [position.key, resolveNamePositionLimits(product, position, cmScale)]));
  }, [cmScale, positions, product]);

  const handleAddInstance = useCallback(
    (position: namePositionType, instanceId: string) => {
      addInstance(createNameInstance(product, position, instanceId));
    },
    [addInstance, product],
  );

  const resolveFocusFromPosition = useCallback((position: namePositionType) => ({ partId: position.partId, uv: position.uv }), []);

  const resolveFocusFromInstance = useCallback((instance: configurationPositionPickerInstanceType) => {
    const item = useGarmentName.getState().instances.find((entry) => entry.id === instance.id);
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
          content: <NamePartForm instanceId={instance.id} limits={limits} placeholder={nameDefaults?.text ?? ''} />,
          onDelete: () => removeInstance(instance.id),
        },
      ];
    });
  }, [instances, limitsByPositionKey, nameDefaults?.text, removeInstance]);

  if (positions.length === 0 || !limitsByPositionKey || !nameDefaults) return null;

  return (
    <Flex key={product.path} variant="step_design" className="gap-3">
      <ConfigurationPositionSelect
        label={CONFIGURATOR_NAME_POSITION_SELECT_LABEL}
        title={nameDefaults.title}
        description={nameDefaults.description}
        positions={pickerPositions}
        onSelect={handlePositionSelect}
      />

      {instances.length > 0 && (
        <AccordionAtom items={items} value={openItems} onValueChange={handleOpenItemsChange} onItemActivate={handleItemActivate} multiple className="gap-2" />
      )}
    </Flex>
  );
};

export { ConfigurationNaming };
