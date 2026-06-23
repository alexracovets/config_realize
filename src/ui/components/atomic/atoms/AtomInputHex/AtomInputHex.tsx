'use client';

import { useState } from 'react';

import { AtomInput } from '@atoms';
import type { atomInputHexPropsType } from '@types';

const AtomInputHex = ({ value, onChange }: atomInputHexPropsType) => {
  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft ?? value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const withHash = raw.startsWith('#') ? raw : '#' + raw;
    setDraft(withHash);
    if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
      onChange(withHash);
    }
  };

  const handleBlur = () => {
    if (draft !== null && !/^#[0-9a-fA-F]{6}$/.test(draft)) {
      setDraft(null);
    } else {
      setDraft(null);
    }
  };

  return (
    <AtomInput
      variant="color_picker"
      size="color_picker"
      type="text"
      aria-label="Codice colore esadecimale"
      autoComplete="off"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="#ffffff"
      maxLength={7}
      spellCheck={false}
    />
  );
};

export { AtomInputHex };
