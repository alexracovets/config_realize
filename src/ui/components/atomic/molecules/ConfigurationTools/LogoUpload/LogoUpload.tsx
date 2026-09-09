'use client';

import { useState } from 'react';

import { Box, Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import type { logoUploadPropsType } from '@types';
import { LOGO_MAX_FILE_SIZE, LOGO_MAX_USER_FILES, LOGO_SUPPORTED_LABEL } from '@constants';
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

  const isDisabled = !canUpload || loading;

  return (
    <Flex variant="logo_upload_section">
      <Text variant="logo_uploaded_label_dark">Logo</Text>
      <div
        role="button"
        data-testid="logo-upload-dropzone"
        tabIndex={isDisabled ? -1 : 0}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled}
        onClick={
          isDisabled
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
              }
            : openFilePicker
        }
        onKeyDown={
          isDisabled
            ? undefined
            : (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;

                e.preventDefault();
                openFilePicker();
              }
        }
        onMouseEnter={isDisabled ? undefined : warmupOnIntent}
        onFocus={isDisabled ? undefined : warmupOnIntent}
        onDragOver={
          isDisabled
            ? (e) => e.preventDefault()
            : (e) => {
                e.preventDefault();
                setDragOver(true);
                warmupOnIntent();
              }
        }
        onDragLeave={isDisabled ? undefined : () => setDragOver(false)}
        onDrop={
          isDisabled
            ? (e) => e.preventDefault()
            : (e) => {
                e.preventDefault();
                setDragOver(false);
                void handleFile(e.dataTransfer.files[0]);
              }
        }
        className={cn(
          'w-full shrink-0',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          dragOver && !isDisabled && 'ring-2 ring-active/30 rounded-lg',
        )}
      >
        <Button
          variant="upload"
          type="button"
          disabled={isDisabled}
          data-testid="logo-upload-button"
          className="pointer-events-none whitespace-normal disabled:opacity-100"
        >
          <SvgIcon name="upload" />
          <Box>
            <Text variant="logo_upload_cta_primary">Trascina qui il tuo logo o fai click per caricare un elemento</Text>
            <Text variant="logo_upload_cta_secondary">
              (Massimo {LOGO_MAX_USER_FILES} file — dimensione max {Math.round(LOGO_MAX_FILE_SIZE / (1024 * 1024))} MB — form. {LOGO_SUPPORTED_LABEL})
            </Text>
          </Box>
        </Button>
      </div>

      {error && <Text variant="error_xs">{error}</Text>}

      <Grid variant="logo_info_panel">
        <SvgIcon name="info" className="max-xl:size-3.25" />
        <Text variant="logo_uploaded_hint">Per una qualità di stampa ottimale si consiglia l&apos;utilizzo di file vettoriali.</Text>
      </Grid>
    </Flex>
  );
};

export { LogoUpload };
