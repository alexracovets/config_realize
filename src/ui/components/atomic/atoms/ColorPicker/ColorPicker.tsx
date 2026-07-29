'use client';

import { useEffect, useRef, useState } from 'react';

import { AtomInputHex, AtomPopover, AtomPopoverContent, AtomPopoverTrigger } from '@atoms';
import type { colorPickerPropsType } from '@types';

import { hexToHsva, hsvaToHex, ShadeSlider, Wheel } from '@uiw/react-color';

const isValidHex = (hex: string) => /^#?[0-9a-fA-F]{3,8}$/.test(hex);

const DESKTOP_WHEEL_SIZE = 241;
const MOBILE_WHEEL_SIZE = 165;
const MOBILE_MEDIA_QUERY = '(max-width: 639px)';

const ColorPicker = ({ color, onChange, onPreviewChange, trigger }: colorPickerPropsType) => {
  const safeColor = isValidHex(color) ? color : '#000000';
  const [wheelHsva, setWheelHsva] = useState(() => ({ ...hexToHsva(safeColor), v: 100 }));
  const [brightness, setBrightness] = useState(() => hexToHsva(safeColor).v);
  const [wheelSize, setWheelSize] = useState(DESKTOP_WHEEL_SIZE);
  const latestHexRef = useRef(safeColor);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const syncWheelSize = () => {
      setWheelSize(mediaQuery.matches ? MOBILE_WHEEL_SIZE : DESKTOP_WHEEL_SIZE);
    };

    syncWheelSize();
    mediaQuery.addEventListener('change', syncWheelSize);
    return () => mediaQuery.removeEventListener('change', syncWheelSize);
  }, []);

  useEffect(() => {
    if (isDraggingRef.current) return;
    const hsva = hexToHsva(safeColor);
    setWheelHsva({ ...hsva, v: 100 });
    setBrightness(hsva.v);
    latestHexRef.current = safeColor;
  }, [safeColor]);

  const emitPreview = (hex: string) => {
    latestHexRef.current = hex;
    onPreviewChange?.(hex);
  };

  const emitCommit = (hex: string) => {
    latestHexRef.current = hex;
    onChange(hex);
  };

  const handleWheelChange = (newColor: { hsva: { h: number; s: number; v: number; a: number } }) => {
    isDraggingRef.current = true;
    const next = { ...newColor.hsva, v: 100 };
    setWheelHsva(next);
    emitPreview(hsvaToHex({ ...next, v: brightness }));
  };

  const handleShadeChange = (newShade: { v: number }) => {
    isDraggingRef.current = true;
    setBrightness(newShade.v);
    emitPreview(hsvaToHex({ ...wheelHsva, v: newShade.v }));
  };

  const handleHexChange = (hex: string) => {
    const hsva = hexToHsva(hex);
    setWheelHsva({ ...hsva, v: 100 });
    setBrightness(hsva.v);
    emitPreview(hex);
    emitCommit(hex);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    emitCommit(latestHexRef.current);
  };

  const liveHsva = { ...wheelHsva, v: brightness };
  const liveHex = hsvaToHex(liveHsva);

  return (
    <AtomPopover>
      <AtomPopoverTrigger asChild>{trigger}</AtomPopoverTrigger>
      <AtomPopoverContent
        variant="color_picker"
        align="center"
        collisionPadding={16}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <style>
          {`
            .w-color-wheel-fill { width: 25px!important; height: 25px!important; border: 2px solid #fff!important;}
            .w-color-alpha-horizontal div {border-radius: 999px!important;}
            .w-color-interactive {left: 0!important; top: -20%!important;}
            @media (max-width: 639px) {
              .w-color-wheel-fill { width: 18px!important; height: 18px!important; border: 2px solid #fff!important;}
            }
          `}
        </style>
        <Wheel color={liveHsva} onChange={handleWheelChange} width={wheelSize} height={wheelSize} />
        <ShadeSlider hsva={liveHsva} onChange={handleShadeChange} style={{ width: '100%', height: 12 }} />
        <div className="hidden w-full max-sm:block">
          <AtomInputHex value={liveHex} onChange={handleHexChange} />
        </div>
      </AtomPopoverContent>
    </AtomPopover>
  );
};

export { ColorPicker };
