'use client';

import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import type { logoListRowPropsType } from '@types';

const LogoListRow = ({ part, onEdit, onDelete }: logoListRowPropsType) => (
  <Grid className="grid-cols-[1fr_auto] items-center min-h-[24px] max-xl:min-h-5 px-2 max-xl:px-1.5 gap-5 max-xl:gap-4 w-full">
    <Grid className="grid-cols-[auto_1fr] items-center gap-2 max-xl:gap-1.5 min-w-0">
      <AtomImage src={part.src} alt={part.fileName} width={16} height={16} className="object-contain shrink-0 max-xl:w-3.25 max-xl:h-3.25" />
      <Text className="text-[16px] max-xl:text-[13px] text-black-10 tracking-wide font-semibold line-clamp-1">{part.fileName}</Text>
    </Grid>
    {onEdit && onDelete && (
      <Flex className="gap-1 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-[26px] h-[26px] max-xl:w-5.25 max-xl:h-5.25 border border-gray-30 hover:bg-white"
          onClick={onEdit}
          aria-label="Modifica logo"
        >
          <SvgIcon name="edit" className="max-xl:size-3.25" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-[26px] h-[26px] max-xl:w-5.25 max-xl:h-5.25 border border-error text-error hover:bg-white hover:text-error"
          onClick={onDelete}
          aria-label="Elimina logo"
        >
          <SvgIcon name="delete" className="max-xl:size-3.25" />
        </Button>
      </Flex>
    )}
  </Grid>
);

export { LogoListRow };
