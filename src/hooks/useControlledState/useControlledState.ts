'use client';

import { useCallback, useState } from 'react';

interface UseControlledStateProps<T, Rest extends unknown[] = []> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T, ...args: Rest) => void;
}

const useControlledState = <T, Rest extends unknown[] = []>(props: UseControlledStateProps<T, Rest>): readonly [T, (next: T, ...args: Rest) => void] => {
  const { value, defaultValue, onChange } = props;

  const isControlled = value !== undefined;
  const [uncontrolledState, setUncontrolledState] = useState<T>(defaultValue as T);
  const state = isControlled ? value : uncontrolledState;

  const setState = useCallback(
    (next: T, ...args: Rest) => {
      if (!isControlled) setUncontrolledState(next);
      onChange?.(next, ...args);
    },
    [isControlled, onChange],
  );

  return [state, setState] as const;
};

export { useControlledState };
