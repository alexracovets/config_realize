'use client';

import { useEffect } from 'react';

import { resolveHistoryHotkeyAction } from '@hooks/useConfigurationHistoryHotkeys/resolveHistoryHotkeyAction';
import { redoConfiguration, undoConfiguration } from '@store';

const TEXT_ENTRY_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

const isTextEntryTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || TEXT_ENTRY_TAGS.includes(target.tagName));

const useConfigurationHistoryHotkeys = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextEntryTarget(event.target)) return;

      const action = resolveHistoryHotkeyAction(event);
      if (!action) return;

      event.preventDefault();
      if (action === 'redo') redoConfiguration();
      else undoConfiguration();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};

export { useConfigurationHistoryHotkeys };
