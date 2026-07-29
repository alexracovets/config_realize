'use client';

import { AtomDialog, AtomDialogContent, AtomDialogTitle, AtomInput, Button, Flex, Text } from '@atoms';
import { CheckoutQuantityStepper } from '@molecules/CheckoutQuantityStepper';
import { CheckoutSizePopover } from '@molecules/CheckoutSizePopover';
import type { checkoutRowEditModalPropsType } from '@types';
import { NUMBER_MAX_LENGTH, sanitizeNumberText } from '@store';

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
      <AtomDialogContent aria-describedby={undefined} aria-label="Modifica riga" className="h-auto max-h-none w-full max-w-[380px] gap-5">
        <AtomDialogTitle className="sr-only">Modifica riga</AtomDialogTitle>

        <Flex className="flex-col gap-4 w-full items-stretch">
          <Flex className="flex-col gap-1.5 items-start w-full">
            <Text className="text-[14px] font-medium text-gray-30">Taglia</Text>
            <div className="w-full rounded-[8px] border border-input-border">
              <CheckoutSizePopover value={row.size} onChange={(size) => onPatchRow(row.id, { size })} />
            </div>
          </Flex>

          {showName && (
            <Flex className="flex-col gap-1.5 items-start w-full">
              <Text className="text-[14px] font-medium text-gray-30">Nome</Text>
              <AtomInput
                variant="checkout"
                className="w-full text-left placeholder:text-left"
                value={row.name}
                placeholder="Nome"
                onChange={(event) => onPatchRow(row.id, { name: event.target.value })}
              />
            </Flex>
          )}

          {showNumber && (
            <Flex className="flex-col gap-1.5 items-start w-full">
              <Text className="text-[14px] font-medium text-gray-30">Numero</Text>
              <AtomInput
                variant="checkout"
                className="w-full text-left placeholder:text-left"
                value={row.number}
                placeholder="00"
                inputMode="numeric"
                maxLength={NUMBER_MAX_LENGTH}
                onChange={(event) => onPatchRow(row.id, { number: sanitizeNumberText(event.target.value) })}
              />
            </Flex>
          )}

          {showTesto && (
            <Flex className="flex-col gap-1.5 items-start w-full">
              <Text className="text-[14px] font-medium text-gray-30">Testo</Text>
              <AtomInput
                variant="checkout"
                className="w-full text-left placeholder:text-left"
                value={row.testoTexts[0] ?? ''}
                placeholder="Testo"
                onChange={(event) => onPatchRow(row.id, { testoTextIndex: 0, testoText: event.target.value })}
              />
            </Flex>
          )}

          <Flex className="flex-col gap-1.5 items-start w-full">
            <Text className="text-[14px] font-medium text-gray-30">Quantità</Text>
            <div className="w-full rounded-[8px] border border-input-border py-1">
              <CheckoutQuantityStepper
                quantity={row.quantity}
                onDecrease={() => onPatchRow(row.id, { quantity: row.quantity - 1 })}
                onIncrease={() => onPatchRow(row.id, { quantity: row.quantity + 1 })}
              />
            </div>
          </Flex>
        </Flex>

        <Flex className="flex-col gap-3 w-full">
          <Button type="button" size="sm" className="w-full bg-default text-white hover:bg-default/80" onClick={() => onOpenChange(false)}>
            Salva le modifiche
          </Button>
          <Button type="button" size="sm" className="w-full bg-error text-white hover:bg-error/80" onClick={handleRemove}>
            Elimina prodotto
          </Button>
        </Flex>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { CheckoutRowEditModal };
