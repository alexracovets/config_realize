'use client';

import type { filePickContextType } from '@types';
import { Flex } from '@atoms';
import { LOGO_MAX_USER_FILES } from '@constants';
import { focusGarmentCamera, useLogoFileHandler, useStepLogo } from '@hooks';
import { HiddenLogoFileInput, LogoEditPanel, LogoUpload, LogoUploadedFilesSection } from '@molecules/ConfigurationTools';
import { useGarmentLogo } from '@store';
import { type ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
const ConfigurationLogo = () => {
  const parts = useStepLogo((state) => state.parts);
  const canAddUserLogo = useStepLogo((state) => state.canAddUserLogo);
  const removePart = useStepLogo((state) => state.removePart);
  const setSelectedInstance = useGarmentLogo((state) => state.setSelectedInstance);
  const { uploadLogo, loading, error } = useLogoFileHandler();

  const [editingPartId, setEditingPartId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickContextRef = useRef<filePickContextType>({ mode: 'upload' });

  const userLogos = useMemo(() => parts.filter((part) => !part.isDefault), [parts]);
  const editingPart = useMemo(() => (editingPartId ? parts.find((part) => part.id === editingPartId && !part.isDefault) : undefined), [editingPartId, parts]);

  const canUpload = canAddUserLogo && userLogos.length < LOGO_MAX_USER_FILES;

  const handleUploadFile = async (file: File) => {
    if (!canUpload) return;
    await uploadLogo(file);
  };

  const handleInputChange = async (file: File | undefined) => {
    if (!file) return;

    const context = pickContextRef.current;

    if (context.mode === 'replace') {
      await uploadLogo(file, { partId: context.partId });
      return;
    }

    if (!canUpload) return;
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

  const handleEdit = useCallback(
    (partId: string) => {
      setEditingPartId(partId);
      setSelectedInstance(partId);
      const part = parts.find((item) => item.id === partId);
      if (!part) return;
      focusGarmentCamera({ partId: part.partId, uv: part.uv });
    },
    [parts, setSelectedInstance],
  );

  const fileInput = (
    <HiddenLogoFileInput
      ref={fileInputRef}
      disabled={loading || (!canUpload && !editingPart)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        void handleInputChange(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  if (editingPart) {
    return (
      <>
        {fileInput}
        <Flex variant="step_design_logo_column">
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
      {fileInput}

      <Flex variant="step_design_logo_column">
        <LogoUpload canUpload={canUpload} loading={loading} error={error} onOpenFilePicker={openFilePicker} onFileSelected={handleUploadFile} />
        <LogoUploadedFilesSection userLogos={userLogos} onEdit={handleEdit} onDelete={handleDelete} />
      </Flex>
    </>
  );
};

export { ConfigurationLogo };
