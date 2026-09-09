'use client';

import { Plus } from 'lucide-react';

import { AtomDialog, AtomDialogContent, AtomDialogTitle, AtomInput, Box, Button, Flex, SvgIcon, Text } from '@atoms';
import { CheckoutQuantityStepper } from '@molecules/CheckoutQuantityStepper';
import { CheckoutSizePopover } from '@molecules/CheckoutSizePopover';
import type { checkoutRowEditModalPropsType } from '@types';
import { NUMBER_MAX_LENGTH, sanitizeNumberText } from '@store';
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
  <Box variant="checkout_row_field_shell">
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
  </Box>
);

const CheckoutRowEditModal = ({ open, onOpenChange, row, printAvailability, onPatchRow, onRemoveRow }: checkoutRowEditModalPropsType) => {
  if (!row) return null;

  const showName = printAvailability?.hasName ?? false;
  const showNumber = printAvailability?.hasNumber ?? false;

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

        <Flex variant="checkout_modal_content_column">
          <Flex variant="checkout_modal_field_group">
            <Text variant="checkout_modal_field_label">Taglia</Text>
            <Box
              variant="checkout_row_field_shell"
              className="[&_button]:relative [&_button]:h-[35px] [&_button]:min-h-[35px] [&_button]:justify-center [&_button]:px-3 [&_button]:py-0 [&_svg]:absolute [&_svg]:right-3"
            >
              <CheckoutSizePopover value={row.size} onChange={(size) => onPatchRow(row.id, { size })} />
            </Box>
          </Flex>

          {showName && (
            <Flex variant="checkout_modal_field_group">
              <Text variant="checkout_modal_field_label">Nome</Text>
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
            <Flex variant="checkout_modal_field_group">
              <Text variant="checkout_modal_field_label">Numero</Text>
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

          <Flex variant="checkout_modal_field_group">
            <Text variant="checkout_modal_field_label">Quantità</Text>
            <Box variant="checkout_row_field_shell_center">
              <CheckoutQuantityStepper
                quantity={row.quantity}
                onDecrease={() => onPatchRow(row.id, { quantity: row.quantity - 1 })}
                onIncrease={() => onPatchRow(row.id, { quantity: row.quantity + 1 })}
                decreaseIconClassName="text-[#CDCDCD]"
                increaseIconClassName="text-primary-10"
              />
            </Box>
          </Flex>
        </Flex>

        <Flex variant="checkout_modal_actions_column">
          <Button
            type="button"
            variant="default"
            className="h-9 w-full justify-center gap-2 rounded-lg text-[14px] font-semibold text-default"
            onClick={() => onOpenChange(false)}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            Salva le modifiche
          </Button>
          <Button type="button" variant="delete" className="h-9 w-full justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold" onClick={handleRemove}>
            <SvgIcon name="delete" className="h-4 w-3.5 shrink-0 text-white" />
            Elimina prodotto
          </Button>
        </Flex>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { CheckoutRowEditModal };
