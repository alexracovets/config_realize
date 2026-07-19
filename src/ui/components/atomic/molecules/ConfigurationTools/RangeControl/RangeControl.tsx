'use client';

import { useEffect, useRef, useState } from 'react';

import { Flex, Range, Text } from '@atoms';
import type { rangeControlPropsType } from '@types';

const clamp = (v: number, safeMin: number, safeMax: number) => Math.min(Math.max(v, safeMin), safeMax);

const RangeControl = ({ label, value, onChange, onCommit, min = 0, max = 100, step = 1, unit = '', formatValue }: rangeControlPropsType) => {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  const formatLabel = (labelValue: number) => (formatValue ? formatValue(labelValue) : `${labelValue}${unit}`);

  const [localValue, setLocalValue] = useState(() => clamp(value, safeMin, safeMax));
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) setLocalValue(clamp(value, safeMin, safeMax));
  }, [value, safeMin, safeMax]);

  const handleChange = (nextValue: number) => {
    const clamped = clamp(nextValue, safeMin, safeMax);
    setLocalValue(clamped);
    onChange(clamped);
  };

  const percent = ((localValue - safeMin) / (safeMax - safeMin)) * 100;
  const hideMin = percent < 12;
  const hideMax = percent > 83;

  return (
    <Flex variant="configurator_part" className="overflow-hidden">
      {label && <Text variant="configurator_control_label">{label}</Text>}
      <Range
        value={[localValue]}
        min={safeMin}
        max={safeMax}
        step={step}
        variant="default"
        onValueChange={(values) => handleChange(Array.isArray(values) ? (values[0] ?? safeMin) : values)}
        onValueCommitted={(committedValue) => {
          isDragging.current = false;
          const nextValue = Array.isArray(committedValue) ? (committedValue[0] ?? safeMin) : committedValue;
          onCommit?.(nextValue);
        }}
        onPointerDown={() => {
          isDragging.current = true;
        }}
        onPointerUp={() => {
          isDragging.current = false;
        }}
      />
      <Flex variant="slider_labels">
        <Text variant="slider_label" style={{ opacity: hideMin ? 0 : 1, transition: 'opacity 0.15s' }}>
          {formatLabel(safeMin)}
        </Text>
        <Text
          variant="slider_label"
          data-thumb={true}
          style={{
            left: `clamp(0%, ${percent}%, 100%)`,
            translate: percent < 5 ? '0' : percent > 95 ? '-100%' : '-50% 0',
          }}
        >
          {formatLabel(localValue)}
        </Text>
        <Text variant="slider_label" style={{ opacity: hideMax ? 0 : 1, transition: 'opacity 0.15s' }}>
          {formatLabel(safeMax)}
        </Text>
      </Flex>
    </Flex>
  );
};

export { RangeControl };
