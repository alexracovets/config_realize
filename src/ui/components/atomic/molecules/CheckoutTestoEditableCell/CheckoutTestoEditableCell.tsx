'use client';

import { CheckoutTableEditableCell } from '@molecules/CheckoutTableEditableCell';
import { CheckoutTablePlaceholder } from '@molecules/CheckoutTablePlaceholder';
import type { checkoutTestoEditableCellPropsType } from '@types';
import { Flex } from '@atoms';
const CheckoutTestoEditableCell = ({ texts, maxLength, canEdit = true, onChangeText }: checkoutTestoEditableCellPropsType) => {
  if (!canEdit || texts.length === 0) {
    return <CheckoutTablePlaceholder />;
  }

  if (texts.length === 1) {
    return (
      <CheckoutTableEditableCell value={texts[0]} placeholder="Testo" maxLength={maxLength} canEdit={canEdit} onChange={(value) => onChangeText(0, value)} />
    );
  }

  return (
    <Flex className="w-full flex-col gap-2 py-1">
      {texts.map((text, index) => (
        <Flex key={`${index}-${text}`} className="w-full items-center gap-2">
          <span className="w-6 shrink-0 text-right text-[16px] tabular-nums leading-none text-default">{index + 1}:</span>
          <div className="min-w-0 flex-1">
            <CheckoutTableEditableCell
              value={text}
              placeholder="Testo"
              maxLength={maxLength}
              layout="spread"
              canEdit={canEdit}
              onChange={(value) => onChangeText(index, value)}
            />
          </div>
        </Flex>
      ))}
    </Flex>
  );
};

export { CheckoutTestoEditableCell };
