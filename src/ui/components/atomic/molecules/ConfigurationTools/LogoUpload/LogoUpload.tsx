'use client';

import { useState } from 'react';

import { Box, Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import { LogoUploadSkeleton } from '@skeletons';
import type { logoUploadPropsType } from '@types';
import { LOGO_MAX_FILE_SIZE, LOGO_SUPPORTED_LABEL } from '@constants';
import { cn, warmupGhostscriptWorker } from '@utils';

const LogoUpload = ({ canUpload, loading, error, onOpenFilePicker, onFileSelected }: logoUploadPropsType) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || loading || !canUpload) return;
    await onFileSelected(file);
  };

  const openFilePicker = () => {
    if (loading || !canUpload) return;
    onOpenFilePicker();
  };

  const warmupOnIntent = () => {
    if (!loading && canUpload) warmupGhostscriptWorker();
  };

  if (loading) {
    return <LogoUploadSkeleton />;
  }

  return (
    <Flex className="flex w-full flex-col items-start justify-start gap-2 max-xl:gap-1.5">
      <Text className="text-[14px] leading-[15px] max-xl:text-[11px] max-xl:leading-3 text-gray-10">Logo</Text>
      <div
        role="button"
        tabIndex={!canUpload || loading ? -1 : 0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;

          e.preventDefault();
          openFilePicker();
        }}
        onMouseEnter={warmupOnIntent}
        onFocus={warmupOnIntent}
        onDragOver={(e) => {
          e.preventDefault();
          if (!loading && canUpload) setDragOver(true);
          warmupOnIntent();
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cn('w-full cursor-pointer', !canUpload && 'cursor-not-allowed opacity-60', dragOver && 'ring-2 ring-active/30 rounded-[8px]')}
      >
        <Button variant="upload" type="button" disabled={!canUpload} className="pointer-events-none whitespace-normal">
          <SvgIcon name="upload" />
          <Box>
            <Text className="text-[11px] leading-[15px] max-xl:text-[9px] max-xl:leading-3 font-medium text-center text-wrap">
              Trascina qui il tuo logo o fai click per caricare un elemento
            </Text>
            <Text className="text-[10px] leading-[15px] max-xl:text-[8px] max-xl:leading-3 text-center text-gray-10 text-wrap">
              (Dimensione max {Math.round(LOGO_MAX_FILE_SIZE / (1024 * 1024))} MB — form. {LOGO_SUPPORTED_LABEL})
            </Text>
          </Box>
        </Button>
      </div>

      {error && <Text className="text-xs text-error">{error}</Text>}

      <Grid className="grid-cols-[auto_1fr] gap-2.5 max-xl:gap-2 items-center px-3 max-xl:px-2.5 p-2 max-xl:py-1.5 rounded-[4px] bg-primary w-full">
        <SvgIcon name="info" className="max-xl:size-3.25" />
        <Text className="text-[12px] max-xl:text-[10px] text-gray">Per una qualità di stampa ottimale si consiglia l&apos;utilizzo di file vettoriali.</Text>
      </Grid>
    </Flex>
  );
};

export { LogoUpload };
