'use client';

import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import type { logoListRowPropsType } from '@types';

const LogoListRow = ({ part, onEdit, onDelete }: logoListRowPropsType) => (
  <Grid className="grid-cols-[1fr_auto] items-center min-h-[24px] px-2 gap-5 w-full">
    <Grid className="grid-cols-[auto_1fr] items-center gap-2 min-w-0">
      <AtomImage src={part.src} alt={part.fileName} width={16} height={16} className="object-contain shrink-0" />
      <Text className="text-[16px] text-black-10 tracking-wide font-semibold line-clamp-1">{part.fileName}</Text>
    </Grid>
    {onEdit && onDelete && (
      <Flex className="gap-1 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-[26px] h-[26px] border border-gray-30 hover:bg-white"
          onClick={onEdit}
          aria-label="Modifica logo"
        >
          <SvgIcon name="edit" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-[26px] h-[26px] border border-error text-error hover:bg-white hover:text-error"
          onClick={onDelete}
          aria-label="Elimina logo"
        >
          <SvgIcon name="delete" />
        </Button>
      </Flex>
    )}
  </Grid>
);

export { LogoListRow };
