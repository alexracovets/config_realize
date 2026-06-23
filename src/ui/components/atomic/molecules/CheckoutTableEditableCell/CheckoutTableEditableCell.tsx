'use client';

import { useCallback, useState } from 'react';

import { AtomInput, Button, Flex, SvgIcon } from '@atoms';

import type { checkoutTableEditableCellPropsType } from '@types';
import { cn } from '@utils';

import { CheckoutTablePlaceholder } from '../CheckoutTablePlaceholder';

const CheckoutTableEditableCell = ({
  value,
  placeholder,
  onChange,
  formatValue,
  inputMode = 'text',
  maxLength,
  layout = 'centered',
  canEdit = true,
}: checkoutTableEditableCellPropsType) => {
  const isSpreadLayout = layout === 'spread';
  const [isEditing, setIsEditing] = useState(false);
  const isEmpty = value.trim() === '';

  const handleActivate = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    setIsEditing(false);
  }, [onChange]);

  const handleChange = useCallback(
    (nextValue: string) => {
      onChange(formatValue ? formatValue(nextValue) : nextValue);
    },
    [formatValue, onChange],
  );

  if (!isEditing && isEmpty) {
    if (!canEdit) {
      return <CheckoutTablePlaceholder className={isSpreadLayout ? 'justify-start' : undefined} />;
    }

    return (
      <Flex className={cn('w-full items-center', isSpreadLayout ? 'justify-start' : 'justify-center')}>
        <button type="button" className="text-[16px] leading-none text-default" onClick={handleActivate} aria-label={`Modifica ${placeholder}`}>
          -
        </button>
      </Flex>
    );
  }

  if (!isEditing) {
    return (
      <Flex className={cn('w-full items-center gap-1.5', isSpreadLayout ? 'justify-between' : 'justify-center')}>
        <button
          type="button"
          className={cn('text-[16px] leading-none text-default', isSpreadLayout ? 'min-w-0 flex-1 truncate text-left' : 'text-center')}
          onClick={handleActivate}
        >
          {value}
        </button>
        <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0" onClick={handleClear} aria-label={`Cancella ${placeholder}`}>
          <SvgIcon name="delete" className="size-3.5 text-error" />
        </Button>
      </Flex>
    );
  }

  return (
    <AtomInput
      // Inline table edit: focus the cell input when entering edit mode.
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      aria-label={placeholder}
      variant="checkout"
      className={cn('w-full', isSpreadLayout ? 'text-left placeholder:text-left' : 'text-center placeholder:text-center')}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      maxLength={maxLength}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={handleBlur}
    />
  );
};

export { CheckoutTableEditableCell };
