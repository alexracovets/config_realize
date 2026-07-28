'use client';

import { type PointerEvent as ReactPointerEvent, useRef } from 'react';

import { ImArrowLeft, ImArrowRight } from 'react-icons/im';
import { LuCircleMinus, LuCirclePlus } from 'react-icons/lu';

import { Button } from '@atoms';
import { cn } from '@utils';

const HOLD_DELAY_MS = 300;
const ICON_BUTTON_CLASS = 'hover:scale-[1.1] transition-all duration-200 ease-in';

type canvasButtonsDirectionType = 1 | -1;

type canvasButtonsPropsType = {
  camera: {
    rotate: (direction: canvasButtonsDirectionType) => void;
    zoom: (direction: canvasButtonsDirectionType) => void;
    startRotate: (direction: canvasButtonsDirectionType) => void;
    stopRotate: () => void;
  };
};

const CanvasButtons = ({ camera }: canvasButtonsPropsType) => {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginRotate = (direction: canvasButtonsDirectionType, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    camera.rotate(direction);

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => camera.startRotate(direction), HOLD_DELAY_MS);
  };

  const endRotate = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    camera.stopRotate();
  };

  return (
    <div
      className={cn(
        'absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto',
        'max-sm:static max-sm:left-auto max-sm:translate-x-0 max-sm:mt-1.5 max-sm:shrink-0 max-sm:justify-center max-sm:gap-2',
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(ICON_BUTTON_CLASS, 'max-sm:size-5 max-sm:p-0 max-sm:bg-transparent')}
        onPointerDown={(event) => beginRotate(-1, event)}
        onPointerUp={endRotate}
        onPointerCancel={endRotate}
      >
        <ImArrowLeft className="w-[25px] h-[25px] text-primary-10 max-sm:w-5 max-sm:h-5" />
      </Button>
      <Button variant="ghost" size="icon" className={cn(ICON_BUTTON_CLASS, 'max-sm:size-5 max-sm:p-0 max-sm:bg-transparent')} onClick={() => camera.zoom(-1)}>
        <LuCircleMinus className="size-6 text-primary-10 max-sm:size-5" />
      </Button>
      <Button variant="ghost" size="icon" className={cn(ICON_BUTTON_CLASS, 'max-sm:size-5 max-sm:p-0 max-sm:bg-transparent')} onClick={() => camera.zoom(1)}>
        <LuCirclePlus className="size-6 text-primary-10 max-sm:size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(ICON_BUTTON_CLASS, 'max-sm:size-5 max-sm:p-0 max-sm:bg-transparent')}
        onPointerDown={(event) => beginRotate(1, event)}
        onPointerUp={endRotate}
        onPointerCancel={endRotate}
      >
        <ImArrowRight className="w-[25px] h-[25px] text-primary-10 max-sm:w-5 max-sm:h-5" />
      </Button>
    </div>
  );
};

export { CanvasButtons };
