import { create, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand';

type singletonStoreGlobalType = typeof globalThis & Record<symbol, UseBoundStore<StoreApi<unknown>> | undefined>;

/**
 * Zustand `create()` at module scope is evaluated once per bundled copy of the file.
 * Production chunk splitting can instantiate `@store` twice (UI tree vs R3F/runtime tree),
 * so route hydration updates one store while GarmentRuntime still reads the default other —
 * colors/patterns/logos/text never reach the on-screen materials. Pinning on globalThis
 * keeps every copy on one store instance (same pattern as garmentMaterialRegistry).
 */
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
