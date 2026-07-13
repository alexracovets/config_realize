'use client';

import { AtomDialog, AtomDialogContent, AtomDialogTitle, AtomImage } from '@atoms';
import type { configurationPositionPickerModalPropsType } from '@types';
import { cn } from '@utils';

const ConfigurationPositionPickerModal = ({ open, onOpenChange, title, description, positions, onSelect }: configurationPositionPickerModalPropsType) => {
  return (
    <AtomDialog open={open} onOpenChange={onOpenChange}>
      <AtomDialogContent aria-describedby={undefined} aria-label={title} className="h-auto max-h-[80dvh] w-full max-w-[620px] gap-6">
        <div className="flex flex-col gap-2 text-left">
          <AtomDialogTitle size="lg" className="text-left">
            {title}
          </AtomDialogTitle>
          {description && <p className="text-sm text-gray-30 text-left" dangerouslySetInnerHTML={{ __html: description }} />}
        </div>

        <div className="grid grid-cols-3 gap-4 overflow-y-auto">
          {positions.map((position) => (
            <button
              key={position.key}
              type="button"
              disabled={position.disabled}
              onClick={() => onSelect(position.key)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-[8px] border-2 border-gray-200 p-3 shadow-sm transition-all duration-200 ease-in',
                position.disabled ? 'grayscale opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-active hover:shadow-md',
              )}
            >
              <AtomImage src={position.src ?? ''} alt={position.label} className="h-[130px] w-full" />
              <span className="text-center text-sm text-default">{position.label}</span>
            </button>
          ))}
        </div>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { ConfigurationPositionPickerModal };
