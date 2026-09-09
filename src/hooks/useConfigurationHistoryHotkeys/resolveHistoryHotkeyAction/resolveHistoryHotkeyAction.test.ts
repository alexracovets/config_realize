import { describe, expect, it } from 'vitest';

import { resolveHistoryHotkeyAction } from '@hooks/useConfigurationHistoryHotkeys/resolveHistoryHotkeyAction/resolveHistoryHotkeyAction';
import type { historyHotkeyEventType } from '@hooks/useConfigurationHistoryHotkeys/resolveHistoryHotkeyAction/resolveHistoryHotkeyAction';

const buildEvent = (overrides: Partial<historyHotkeyEventType>): historyHotkeyEventType => ({
  code: 'KeyZ',
  key: 'z',
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...overrides,
});

describe('resolveHistoryHotkeyAction', () => {
  it('undoes on Ctrl+Z and redoes on Ctrl+Shift+Z', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true }))).toBe('undo');
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true, shiftKey: true }))).toBe('redo');
  });

  it('accepts Cmd on macOS', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({ metaKey: true }))).toBe('undo');
    expect(resolveHistoryHotkeyAction(buildEvent({ metaKey: true, shiftKey: true }))).toBe('redo');
  });

  it('works on a Cyrillic layout, where the Z key reports "я"', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true, key: 'я' }))).toBe('undo');
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true, key: 'я', shiftKey: true }))).toBe('redo');
  });

  it('works on layouts that move Z to another physical key', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true, code: 'Slash', key: 'z' }))).toBe('undo');
  });

  it('treats Ctrl+Y as redo', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true, code: 'KeyY', key: 'y' }))).toBe('redo');
  });

  it('ignores the key without a modifier', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({}))).toBeNull();
  });

  it('ignores Alt combinations so it never shadows other shortcuts', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true, altKey: true }))).toBeNull();
  });

  it('ignores unrelated keys', () => {
    expect(resolveHistoryHotkeyAction(buildEvent({ ctrlKey: true, code: 'KeyS', key: 's' }))).toBeNull();
  });
});
