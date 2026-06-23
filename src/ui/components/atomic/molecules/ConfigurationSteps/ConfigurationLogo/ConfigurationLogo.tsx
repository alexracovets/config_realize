'use client';

import { type ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';

import { Flex } from '@atoms';
import { useLogoFileHandler, useStepLogo } from '@hooks';
import { HiddenLogoFileInput, LogoEditPanel, LogoUpload, LogoUploadedFilesSection } from '../../ConfigurationTools';
import type { filePickContextType } from '@types';

const ConfigurationLogo = () => {
  const parts = useStepLogo((state) => state.parts);
  const positions = useStepLogo((state) => state.positions);
  const canAddUserLogo = useStepLogo((state) => state.canAddUserLogo);
  const removePart = useStepLogo((state) => state.removePart);
  const { uploadLogo, loading, error } = useLogoFileHandler();

  const [editingPartId, setEditingPartId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickContextRef = useRef<filePickContextType>({ mode: 'upload' });

  const userLogos = useMemo(() => parts.filter((part) => !part.isDefault), [parts]);
  const editingPart = useMemo(() => (editingPartId ? parts.find((part) => part.id === editingPartId && !part.isDefault) : undefined), [editingPartId, parts]);

  const freeInteractivePosition = useMemo(() => {
    const interactive = positions.filter((position) => position.interactive);
    const usedKeys = new Set(parts.filter((part) => !part.isDefault).map((part) => part.positionKey));
    return interactive.find((position) => !usedKeys.has(position.key));
  }, [parts, positions]);

  const canUpload = canAddUserLogo();

  const handleUploadFile = async (file: File) => {
    await uploadLogo(file, freeInteractivePosition ? { position: freeInteractivePosition } : undefined);
  };

  const handleInputChange = async (file: File | undefined) => {
    if (!file) return;

    const context = pickContextRef.current;

    if (context.mode === 'replace') {
      await uploadLogo(file, { partId: context.partId });
      return;
    }

    await handleUploadFile(file);
  };

  const openFilePicker = () => {
    if (loading || !canUpload) return;
    pickContextRef.current = { mode: 'upload' };
    fileInputRef.current?.click();
  };

  const openReplaceFilePicker = (partId: string) => {
    if (loading) return;
    pickContextRef.current = { mode: 'replace', partId };
    fileInputRef.current?.click();
  };

  const handleDelete = useCallback(
    (partId: string) => {
      removePart(partId);
      if (editingPartId === partId) setEditingPartId(null);
    },
    [editingPartId, removePart],
  );

  const handleEdit = useCallback((partId: string) => {
    setEditingPartId(partId);
  }, []);

  if (editingPart) {
    return (
      <>
        <HiddenLogoFileInput
          ref={fileInputRef}
          disabled={loading}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            void handleInputChange(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <Flex variant="step_design" className="w-full min-h-0 flex-col items-start justify-start gap-4">
          <LogoEditPanel
            partId={editingPart.id}
            onClose={() => setEditingPartId(null)}
            onReplaceImage={() => openReplaceFilePicker(editingPart.id)}
            replacing={loading}
          />
        </Flex>
      </>
    );
  }

  return (
    <>
      <HiddenLogoFileInput
        ref={fileInputRef}
        disabled={loading}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          void handleInputChange(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <Flex variant="step_design" className="w-full min-h-0 flex-col items-start justify-start gap-4">
        <LogoUpload canUpload={canUpload} loading={loading} error={error} onOpenFilePicker={openFilePicker} onFileSelected={handleUploadFile} />
        <LogoUploadedFilesSection userLogos={userLogos} onEdit={handleEdit} onDelete={handleDelete} />
      </Flex>
    </>
  );
};

export { ConfigurationLogo };
