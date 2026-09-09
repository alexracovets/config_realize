type historyHotkeyActionType = 'undo' | 'redo' | null;

type historyHotkeyEventType = Pick<KeyboardEvent, 'code' | 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>;

const matchesKey = (event: historyHotkeyEventType, code: string, letter: string) => event.code === code || event.key.toLowerCase() === letter;

const resolveHistoryHotkeyAction = (event: historyHotkeyEventType): historyHotkeyActionType => {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return null;

  const isRedoKey = matchesKey(event, 'KeyY', 'y');
  if (!isRedoKey && !matchesKey(event, 'KeyZ', 'z')) return null;

  return isRedoKey || event.shiftKey ? 'redo' : 'undo';
};

export { resolveHistoryHotkeyAction };
export type { historyHotkeyActionType, historyHotkeyEventType };
