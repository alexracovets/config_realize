'use client';

import { useEffect, useState } from 'react';

import { Box, Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import { LogoUploadSkeleton } from '@skeletons';
import type { logoUploadPropsType } from '@types';
import { LOGO_MAX_FILE_SIZE, LOGO_SUPPORTED_LABEL } from '@constants';
import { cn, warmupGhostscriptWorker } from '@utils';

const LogoUpload = ({ canUpload, loading, error, onOpenFilePicker, onFileSelected }: logoUploadPropsType) => {
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    warmupGhostscriptWorker();
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file || loading || !canUpload) return;
    await onFileSelected(file);
  };

  const openFilePicker = () => {
    if (loading || !canUpload) return;
    onOpenFilePicker();
  };

  if (loading) {
    return <LogoUploadSkeleton />;
  }

  return (
    <Flex className="flex w-full flex-col items-start justify-start gap-2">
      <Text className="text-[14px] leading-[15px] text-gray-10">Logo</Text>

      <div
        role="button"
        tabIndex={!canUpload || loading ? -1 : 0}
        onClick={openFilePicker}
        onKeyDown={(e) => e.key === 'Enter' && openFilePicker()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!loading && canUpload) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cn('w-full cursor-pointer', !canUpload && 'cursor-not-allowed opacity-60', dragOver && 'ring-2 ring-active/30 rounded-[8px]')}
      >
        <Button variant="upload" type="button" disabled={!canUpload} className="pointer-events-none">
          <SvgIcon name="upload" />
          <Box>
            <Text className="text-[11px] leading-[15px] font-medium text-center">Trascina qui il tuo logo o fai click per caricare un elemento</Text>
            <Text className="text-[10px] leading-[15px] text-center text-gray-10 text-wrap">
              (Dimensione max {Math.round(LOGO_MAX_FILE_SIZE / (1024 * 1024))} MB — form. {LOGO_SUPPORTED_LABEL})
            </Text>
          </Box>
        </Button>
      </div>

      {error && <Text className="text-xs text-error">{error}</Text>}

      <Grid className="grid-cols-[auto_1fr] gap-2.5 items-center px-3 p-2 rounded-[4px] bg-primary w-full">
        <SvgIcon name="info" />
        <Text className="text-[12px] text-gray">Per una qualità di stampa ottimale si consiglia l&apos;utilizzo di file vettoriali.</Text>
      </Grid>
    </Flex>
  );
};

export { LogoUpload };
