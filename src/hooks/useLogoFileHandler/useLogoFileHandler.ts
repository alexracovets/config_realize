'use client';

import { useCallback, useState } from 'react';

import { useConfiguratorProduct, useGarmentLogo } from '@store';
import type { stepLogoPositionStateType } from '@types';
import { LogoFileError, logoFileToDisplayUrl, preloadLogoDisplayUrl, yieldToMain } from '@utils';

interface UploadLogoOptions {
  position?: stepLogoPositionStateType;
  partId?: string;
}

const useLogoFileHandler = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const addUserInstance = useGarmentLogo((state) => state.addUserInstance);
  const addFreeUserInstance = useGarmentLogo((state) => state.addFreeUserInstance);
  const replaceInstanceImage = useGarmentLogo((state) => state.replaceInstanceImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    const src = await logoFileToDisplayUrl(file);
    await preloadLogoDisplayUrl(src);
    await yieldToMain();
    return src;
  }, []);

  const uploadLogo = useCallback(
    async (file: File, options?: UploadLogoOptions) => {
      setLoading(true);
      setError(null);

      try {
        const src = await processFile(file);

        if (options?.partId) {
          await replaceInstanceImage(options.partId, src, file.name);
          return;
        }

        if (options?.position) {
          const logoPosition = useGarmentLogo.getState().positions.find((position) => position.key === options.position!.key);

          if (!logoPosition) {
            throw new LogoFileError('Nessuna posizione disponibile');
          }

          await addUserInstance(logoPosition, src, file.name);
          return;
        }

        await addFreeUserInstance(product, src, file.name);
      } catch (uploadError) {
        const message = uploadError instanceof LogoFileError ? uploadError.message : 'Impossibile caricare il file';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [addFreeUserInstance, addUserInstance, processFile, product, replaceInstanceImage],
  );

  return { uploadLogo, loading, error, setError };
};

export { useLogoFileHandler };
