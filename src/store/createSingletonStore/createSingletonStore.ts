import { create, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand';

type singletonStoreGlobalType = typeof globalThis & Record<symbol, UseBoundStore<StoreApi<unknown>> | undefined>;

const createSingletonStore = <T>(key: string, initializer: StateCreator<T>): UseBoundStore<StoreApi<T>> => {
  const storeKey = Symbol.for(`realize.zustand.${key}`);
  const storeGlobal = globalThis as singletonStoreGlobalType;
  const existing = storeGlobal[storeKey] as UseBoundStore<StoreApi<T>> | undefined;
  if (existing) return existing;

  const store = create<T>()(initializer);
  storeGlobal[storeKey] = store as UseBoundStore<StoreApi<unknown>>;
  return store;
};

export { createSingletonStore };
