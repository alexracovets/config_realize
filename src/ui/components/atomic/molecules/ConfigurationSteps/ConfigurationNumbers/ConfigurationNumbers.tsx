'use client';

import type { numberPartFormPropsType, numberPositionType } from '@types';
import { AccordionAtom, Button, Flex, SvgIcon, Text } from '@atoms';
import { CONFIGURATOR_NUMBER_POSITION_SELECT_LABEL } from '@constants';
import { useConfigurationPositionPicker } from '@hooks';
import { ColorTabControl, ConfigurationPositionSelect, FontSelectRow, PartColorSwitch, RangeControl } from '@molecules/ConfigurationTools';
import {
  createNumberInstance,
  resolveNumberDefaults,
  resolveNumberLimits,
  resolveNumberLineHeightShow,
  sanitizeNumberText,
  useConfiguratorProduct,
  useGarmentNumber,
} from '@store';
import { useCallback, useMemo } from 'react';
const NumberPartForm = ({ instanceId, limits, placeholder, lineHeightShow }: numberPartFormPropsType) => {
  const instance = useGarmentNumber((state) => state.instances.find((item) => item.id === instanceId));
  const updateInstance = useGarmentNumber((state) => state.updateInstance);
  const removeInstance = useGarmentNumber((state) => state.removeInstance);
  const setPreview = useGarmentNumber((state) => state.setPreview);
  const clearPreview = useGarmentNumber((state) => state.clearPreview);
  const previewPatch = useGarmentNumber((state) => (state.preview?.instanceId === instanceId ? state.preview.patch : null));
  const sharedPreviewText = useGarmentNumber((state) => {
    const text = state.preview?.patch.text;
    return text !== undefined ? text : null;
  });
  const previewText = previewPatch?.text;
  const previewTextColor = previewPatch?.textColor;
  const previewStrokeColor = previewPatch?.strokeColor;
  const previewFontSize = previewPatch?.fontSize;
  const previewStrokeWidth = previewPatch?.strokeWidth;
  const previewLineHeight = previewPatch?.lineHeight;

  const commit = useCallback(
    (patch: Parameters<typeof updateInstance>[1]) => {
      const preview = useGarmentNumber.getState().preview;
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
    const preview = useGarmentNumber.getState().preview;
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
          inputMode="numeric"
          pattern="[0-9]*"
          value={sharedPreviewText ?? previewText ?? instance.text}
          maxLength={limits.maxLength}
          onChange={(e) => setPreview(instanceId, { text: sanitizeNumberText(e.target.value) })}
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

const ConfigurationNumbers = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const positions = useGarmentNumber((state) => state.positions);
  const instances = useGarmentNumber((state) => state.instances);
  const addInstance = useGarmentNumber((state) => state.addInstance);

  const numberDefaults = useMemo(() => (positions.length > 0 ? resolveNumberDefaults(product) : null), [positions.length, product]);
  const limits = useMemo(() => (positions.length > 0 ? resolveNumberLimits(product) : null), [positions.length, product]);
  const lineHeightShow = useMemo(() => (positions.length > 0 ? resolveNumberLineHeightShow(product) : false), [positions.length, product]);

  const handleAddInstance = useCallback(
    (position: numberPositionType, instanceId: string) => {
      addInstance(createNumberInstance(product, position, instanceId));
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
        content: <NumberPartForm instanceId={instance.id} limits={limits!} placeholder={numberDefaults?.text ?? '00'} lineHeightShow={lineHeightShow} />,
      })),
    [instances, limits, lineHeightShow, numberDefaults?.text],
  );

  if (positions.length === 0 || !limits || !numberDefaults) return null;

  return (
    <Flex key={product.path} variant="step_design" className="gap-3">
      <ConfigurationPositionSelect label={CONFIGURATOR_NUMBER_POSITION_SELECT_LABEL} positions={availablePositions} onSelect={handlePositionSelect} />

      {instances.length > 0 && <AccordionAtom items={items} value={openItems} onValueChange={handleOpenItemsChange} multiple className="gap-2" />}
    </Flex>
  );
};

export { ConfigurationNumbers };
