'use client';

import { Plus } from 'lucide-react';

import { AtomDialog, AtomDialogContent, AtomDialogTitle, AtomInput, Button, Flex, SvgIcon, Text } from '@atoms';
import { CheckoutQuantityStepper } from '@molecules/CheckoutQuantityStepper';
import { CheckoutSizePopover } from '@molecules/CheckoutSizePopover';
import type { checkoutRowEditModalPropsType } from '@types';
import { NUMBER_MAX_LENGTH, sanitizeNumberText } from '@store';
import { cn } from '@utils';

const fieldLabelClassName = 'text-[14px] font-medium text-gray';
const fieldShellClassName = 'flex h-[35px] w-full items-center overflow-hidden rounded-[7.5px] border border-input-border bg-white';

const ClearableField = ({
  value,
  placeholder,
  inputMode,
  maxLength,
  onChange,
  onClear,
  ariaLabel,
}: {
  value: string;
  placeholder: string;
  inputMode?: 'text' | 'numeric';
  maxLength?: number;
  onChange: (value: string) => void;
  onClear: () => void;
  ariaLabel: string;
}) => (
  <div className={fieldShellClassName}>
    <AtomInput
      variant="ghost"
      className="h-full min-w-0 flex-1 rounded-none border-0 px-3 text-left text-sm text-default placeholder:text-left"
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
    />
    <span aria-hidden className="h-4 w-px shrink-0 bg-[#CDCDCD]" />
    <Button type="button" variant="ghost" size="icon" className="mx-1.5 size-8 shrink-0 bg-transparent" onClick={onClear} aria-label={`Cancella ${ariaLabel}`}>
      <SvgIcon name="delete" className="h-4 w-3.5 [&_path]:fill-[url(#checkout-row-edit-delete-gradient)]" />
    </Button>
  </div>
);

const CheckoutRowEditModal = ({ open, onOpenChange, row, printAvailability, onPatchRow, onRemoveRow }: checkoutRowEditModalPropsType) => {
  if (!row) return null;

  const showName = printAvailability?.hasName ?? false;
  const showNumber = printAvailability?.hasNumber ?? false;
  const showTesto = printAvailability?.hasTesto ?? false;

  const handleRemove = () => {
    onRemoveRow(row.id);
    onOpenChange(false);
  };

  return (
    <AtomDialog open={open} onOpenChange={onOpenChange}>
      <AtomDialogContent
        aria-describedby={undefined}
        aria-label="Modifica riga"
        className="h-auto max-h-none w-full max-w-[320px] gap-5 shadow-[0_0_8px_rgba(0,0,0,0.25)]"
        closeButtonClassName="top-3 right-3 bg-transparent opacity-100"
      >
        <AtomDialogTitle className="sr-only">Modifica riga</AtomDialogTitle>

        <svg width="0" height="0" aria-hidden className="absolute">
          <defs>
            <linearGradient id="checkout-row-edit-delete-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#D15252" />
              <stop offset="1" stopColor="#912222" />
            </linearGradient>
          </defs>
        </svg>

        <Flex className="w-full flex-col items-stretch gap-4">
          <Flex className="w-full flex-col items-start gap-1.5">
            <Text className={fieldLabelClassName}>Taglia</Text>
            <div className={cn(fieldShellClassName, '[&_button]:relative [&_button]:h-[35px] [&_button]:min-h-[35px] [&_button]:justify-center [&_button]:px-3 [&_button]:py-0 [&_svg]:absolute [&_svg]:right-3')}>
              <CheckoutSizePopover value={row.size} onChange={(size) => onPatchRow(row.id, { size })} />
            </div>
          </Flex>

          {showName && (
            <Flex className="w-full flex-col items-start gap-1.5">
              <Text className={fieldLabelClassName}>Nome</Text>
              <ClearableField
                value={row.name}
                placeholder="Nome"
                ariaLabel="Nome"
                onChange={(name) => onPatchRow(row.id, { name })}
                onClear={() => onPatchRow(row.id, { name: '' })}
              />
            </Flex>
          )}

          {showNumber && (
            <Flex className="w-full flex-col items-start gap-1.5">
              <Text className={fieldLabelClassName}>Numero</Text>
              <ClearableField
                value={row.number}
                placeholder="00"
                ariaLabel="Numero"
                inputMode="numeric"
                maxLength={NUMBER_MAX_LENGTH}
                onChange={(number) => onPatchRow(row.id, { number: sanitizeNumberText(number) })}
                onClear={() => onPatchRow(row.id, { number: '' })}
              />
            </Flex>
          )}

          {showTesto && (
            <Flex className="w-full flex-col items-start gap-1.5">
              <Text className={fieldLabelClassName}>Testo</Text>
              <ClearableField
                value={row.testoTexts[0] ?? ''}
                placeholder="Testo"
                ariaLabel="Testo"
                onChange={(testoText) => onPatchRow(row.id, { testoTextIndex: 0, testoText })}
                onClear={() => onPatchRow(row.id, { testoTextIndex: 0, testoText: '' })}
              />
            </Flex>
          )}

          <Flex className="w-full flex-col items-start gap-1.5">
            <Text className={fieldLabelClassName}>Quantità</Text>
            <div className={cn(fieldShellClassName, 'justify-center')}>
              <CheckoutQuantityStepper
                quantity={row.quantity}
                onDecrease={() => onPatchRow(row.id, { quantity: row.quantity - 1 })}
                onIncrease={() => onPatchRow(row.id, { quantity: row.quantity + 1 })}
                decreaseIconClassName="text-[#CDCDCD]"
                increaseIconClassName="text-primary-10"
              />
            </div>
          </Flex>
        </Flex>

        <Flex className="w-full flex-col gap-2">
          <Button
            type="button"
            variant="default"
            className="h-9 w-full justify-center gap-2 rounded-lg text-[14px] font-semibold text-default"
            onClick={() => onOpenChange(false)}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Salva le modifiche
          </Button>
          <Button
            type="button"
            variant="delete"
            className="h-9 w-full justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold"
            onClick={handleRemove}
          >
            <SvgIcon name="delete" className="h-4 w-3.5 shrink-0 text-white" />
            Elimina prodotto
          </Button>
        </Flex>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { CheckoutRowEditModal };
