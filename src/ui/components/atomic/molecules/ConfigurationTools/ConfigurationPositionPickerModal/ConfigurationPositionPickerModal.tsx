'use client';

import { AtomDialog, AtomDialogContent, AtomDialogTitle, AtomImage } from '@atoms';
import type { configurationPositionPickerModalPropsType } from '@types';
import { cn } from '@utils';

const ConfigurationPositionPickerModal = ({ open, onOpenChange, title, description, positions, onSelect }: configurationPositionPickerModalPropsType) => {
  return (
    <AtomDialog open={open} onOpenChange={onOpenChange}>
      <AtomDialogContent
        aria-describedby={undefined}
        aria-label={title}
        className="h-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] min-w-0 max-w-155 gap-4 overflow-hidden p-4 pt-10 max-sm:gap-3"
        closeButtonClassName="top-3 right-3 bg-transparent opacity-100"
      >
        <div className="flex flex-col gap-2 text-left">
          <AtomDialogTitle size="lg" className="text-left max-sm:text-[18px]">
            {title}
          </AtomDialogTitle>
          {description && <p className="text-left text-sm text-gray-30" dangerouslySetInnerHTML={{ __html: description }} />}
        </div>

        <div className="grid max-h-[calc(100dvh-160px)] grid-cols-3 gap-3 overflow-y-auto overscroll-contain pr-1 max-sm:gap-2 sm:gap-4">
          {positions.map((position) => (
            <button
              key={position.key}
              type="button"
              disabled={position.disabled}
              onClick={() => onSelect(position.key)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-2 shadow-sm transition-all duration-200 ease-in max-sm:p-1.5 sm:p-3',
                position.disabled ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer hover:border-active hover:shadow-md',
              )}
            >
              <AtomImage src={position.src ?? ''} alt={position.label} className="h-32.5 w-full max-sm:h-22" />
              <span className="text-center text-sm text-default max-sm:text-[12px] max-sm:leading-4">{position.label}</span>
            </button>
          ))}
        </div>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { ConfigurationPositionPickerModal };
