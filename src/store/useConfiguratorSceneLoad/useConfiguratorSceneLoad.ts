'use client';

import { create } from 'zustand';

const MIN_LOADER_VISIBLE_MS = 400;

type LoaderKind = 'initial' | 'transition';

type SceneTransitionOptions = {
  affectsConfigurationPanel?: boolean;
};

interface ConfiguratorSceneLoadState {
  isInitialSceneLoading: boolean;
  isSceneTransitionLoading: boolean;
  transitionAffectsConfigurationPanel: boolean;
  loaderSession: number;
  loaderVisibleUntil: number;
  transitionSession: number;
  transitionVisibleUntil: number;
  beginInitialSceneLoad: () => void;
  markInitialSceneLoaded: () => void;
  beginSceneTransitionLoad: (options?: SceneTransitionOptions) => void;
  markSceneTransitionLoaded: () => void;
}

const loaderTimeouts: Record<LoaderKind, ReturnType<typeof setTimeout> | null> = {
  initial: null,
  transition: null,
};

const scheduleLoaderHide = (
  kind: LoaderKind,
  session: number,
  visibleUntil: number,
  isActive: (state: ConfiguratorSceneLoadState) => boolean,
  hide: () => void,
  get: () => ConfiguratorSceneLoadState,
) => {
  if (loaderTimeouts[kind]) {
    clearTimeout(loaderTimeouts[kind]!);
    loaderTimeouts[kind] = null;
  }

  const complete = () => {
    const state = get();
    const sessionKey = kind === 'initial' ? 'loaderSession' : 'transitionSession';
    if (!isActive(state) || state[sessionKey] !== session) return;
    hide();
  };

  const remaining = visibleUntil - Date.now();

  if (remaining > 0) {
    loaderTimeouts[kind] = setTimeout(() => {
      loaderTimeouts[kind] = null;
      complete();
    }, remaining);
    return;
  }

  complete();
};

const beginLoader = (
  kind: LoaderKind,
  get: () => ConfiguratorSceneLoadState,
  patch: (session: number, visibleUntil: number) => Partial<ConfiguratorSceneLoadState>,
) => {
  if (loaderTimeouts[kind]) {
    clearTimeout(loaderTimeouts[kind]!);
    loaderTimeouts[kind] = null;
  }

  const session = (kind === 'initial' ? get().loaderSession : get().transitionSession) + 1;
  const visibleUntil = Date.now() + MIN_LOADER_VISIBLE_MS;

  return { session, visibleUntil, patch: patch(session, visibleUntil) };
};

const useConfiguratorSceneLoad = create<ConfiguratorSceneLoadState>((set, get) => ({
  isInitialSceneLoading: true,
  isSceneTransitionLoading: false,
  transitionAffectsConfigurationPanel: false,
  loaderSession: 0,
  loaderVisibleUntil: 0,
  transitionSession: 0,
  transitionVisibleUntil: 0,
  beginInitialSceneLoad: () => {
    const { patch } = beginLoader('initial', get, (loaderSession, loaderVisibleUntil) => ({
      isInitialSceneLoading: true,
      loaderSession,
      loaderVisibleUntil,
    }));

    set(patch);
  },
  markInitialSceneLoaded: () => {
    const state = get();
    if (!state.isInitialSceneLoading) return;

    scheduleLoaderHide(
      'initial',
      state.loaderSession,
      state.loaderVisibleUntil,
      (currentState) => currentState.isInitialSceneLoading,
      () => set({ isInitialSceneLoading: false }),
      get,
    );
  },
  beginSceneTransitionLoad: (options) => {
    const affectsConfigurationPanel = options?.affectsConfigurationPanel ?? false;
    const { patch } = beginLoader('transition', get, (transitionSession, transitionVisibleUntil) => ({
      isSceneTransitionLoading: true,
      transitionSession,
      transitionVisibleUntil,
    }));

    set({
      ...patch,
      transitionAffectsConfigurationPanel: get().transitionAffectsConfigurationPanel || affectsConfigurationPanel,
    });
  },
  markSceneTransitionLoaded: () => {
    const { isSceneTransitionLoading, transitionSession, transitionVisibleUntil } = get();
    if (!isSceneTransitionLoading) return;

    scheduleLoaderHide(
      'transition',
      transitionSession,
      transitionVisibleUntil,
      (state) => state.isSceneTransitionLoading,
      () => set({ isSceneTransitionLoading: false, transitionAffectsConfigurationPanel: false }),
      get,
    );
  },
}));

export { useConfiguratorSceneLoad };
