'use client';

import { requestConfiguratorCameraFocus } from '@configurator';
import { useGarmentLogo } from '@store';
import { useCallback } from 'react';

const useGarmentLogoCameraFocus = () =>
  useCallback((instanceId: string) => {
    const instance = useGarmentLogo.getState().instances.find((item) => item.id === instanceId);
    if (!instance) return;

    requestConfiguratorCameraFocus({ partId: instance.partId, uv: instance.uv });
  }, []);

export { useGarmentLogoCameraFocus };
