'use client';

import { AtomSelect, Flex, Text } from '@atoms';
import type { fontSelectRowPropsType } from '@types';
import { FONTS_CONFIGURATION } from '@fonts';

const FontSelectRow = ({ font, onChange }: fontSelectRowPropsType) => {
  return (
    <Flex variant="configurator_part">
      <Text variant="configurator_control_label">Sfondo</Text>
      <AtomSelect
        variant="font"
        options={FONTS_CONFIGURATION.map((f) => ({ label: f.name, value: f.name, fontFamily: f.fontFamily }))}
        value={{ label: font, value: font, fontFamily: font }}
        onChange={({ value }) => onChange(value)}
        icon
      />
    </Flex>
  );
};

export { FontSelectRow };
