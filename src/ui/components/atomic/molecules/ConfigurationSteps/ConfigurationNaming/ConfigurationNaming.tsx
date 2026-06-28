'use client';

import type { namePartFormPropsType, namePositionType } from '@types';
import { AccordionAtom, Button, Flex, SvgIcon, Text } from '@atoms';
import { CONFIGURATOR_NAME_POSITION_SELECT_LABEL } from '@constants';
import { useConfigurationPositionPicker } from '@hooks';
import { ColorTabControl, ConfigurationPositionSelect, FontSelectRow, PartColorSwitch, RangeControl } from '@molecules/ConfigurationTools';
import { createNameInstance, resolveNameDefaults, resolveNameLimits, useConfiguratorProduct, useGarmentName } from '@store';
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
        <Text variant="configurator_control_label">Carattere</Text>
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

      <RangeControl
        label="Dimensione testo"
        value={previewFontSize ?? instance.fontSize}
        onChange={(fontSize) => setPreview(instanceId, { fontSize })}
        onCommit={commitFromPreview}
        min={limits.fontSizeMin}
        max={limits.fontSizeMax}
        unit="px"
      />

      <RangeControl
        label="Spessore contorno"
        value={previewStrokeWidth ?? instance.strokeWidth}
        onChange={(strokeWidth) => setPreview(instanceId, { strokeWidth })}
        onCommit={commitFromPreview}
        min={0}
        max={limits.strokeWidthMax}
        unit="px"
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
  const positions = useGarmentName((state) => state.positions);
  const instances = useGarmentName((state) => state.instances);
  const addInstance = useGarmentName((state) => state.addInstance);

  const nameDefaults = useMemo(() => (positions.length > 0 ? resolveNameDefaults(product) : null), [positions.length, product]);
  const limits = useMemo(() => (positions.length > 0 ? resolveNameLimits(product) : null), [positions.length, product]);

  const handleAddInstance = useCallback(
    (position: namePositionType, instanceId: string) => {
      addInstance(createNameInstance(product, position, instanceId));
    },
    [addInstance, product],
  );

  const { availablePositions, openItems, handleOpenItemsChange, handlePositionSelect } = useConfigurationPositionPicker({
    positions,
    instances,
    onAddInstance: handleAddInstance,
  });

  const items = useMemo(
    () =>
      instances.map((instance) => ({
        value: instance.id,
        trigger: <PartColorSwitch color={instance.textColor} label={instance.label} />,
        content: <NamePartForm instanceId={instance.id} limits={limits!} placeholder={nameDefaults?.text ?? ''} />,
      })),
    [instances, limits, nameDefaults?.text],
  );

  if (positions.length === 0 || !limits || !nameDefaults) return null;

  return (
    <Flex key={product.path} variant="step_design" className="gap-3">
      <ConfigurationPositionSelect label={CONFIGURATOR_NAME_POSITION_SELECT_LABEL} positions={availablePositions} onSelect={handlePositionSelect} />

      {instances.length > 0 && <AccordionAtom items={items} value={openItems} onValueChange={handleOpenItemsChange} multiple className="gap-2" />}
    </Flex>
  );
};

export { ConfigurationNaming };
