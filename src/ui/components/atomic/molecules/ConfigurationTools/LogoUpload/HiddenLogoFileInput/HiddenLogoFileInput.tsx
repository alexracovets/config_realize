'use client';

import { forwardRef } from 'react';

import { LOGO_ACCEPTED_INPUT } from '@constants';
import type { hiddenLogoFileInputPropsType } from '@types';

const HiddenLogoFileInput = forwardRef<HTMLInputElement, hiddenLogoFileInputPropsType>(({ disabled, onChange }, ref) => (
  <input ref={ref} type="file" accept={LOGO_ACCEPTED_INPUT} className="hidden" disabled={disabled} onChange={onChange} />
));

HiddenLogoFileInput.displayName = 'HiddenLogoFileInput';

export { HiddenLogoFileInput };
