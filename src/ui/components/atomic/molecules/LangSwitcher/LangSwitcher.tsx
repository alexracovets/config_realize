'use client';

import { useState } from 'react';

import { AtomSelect } from '@atoms';

const options = [
  {
    label: 'Italiano',
    value: 'it',
  },
  {
    label: 'English',
    value: 'en',
  },
];

// onLanguageChange is used when the configurator is embedded in the storefront —
// the host store owns localization, so the selection is forwarded to it.
const LangSwitcher = ({ onLanguageChange }: { onLanguageChange?: (value: string) => void } = {}) => {
  const [selected, setSelected] = useState(options[0]);

  return (
    <AtomSelect
      options={options}
      value={selected}
      onChange={(next) => {
        setSelected(next);
        onLanguageChange?.(next.value);
      }}
      variant="leng_switcher"
    />
  );
};

export { LangSwitcher };
