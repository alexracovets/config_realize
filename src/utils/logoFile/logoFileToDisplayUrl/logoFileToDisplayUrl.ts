'use client';

import { convertEpsPsToDisplayUrl } from '@utils/logoFile/converters/ghostscript';
import { convertWithMagick } from '@utils/logoFile/converters/imagemagick';
import { nativeFileToDisplayUrl } from '@utils/logoFile/converters/nativeImage';
import { convertPdfToDisplayUrl } from '@utils/logoFile/converters/pdf';
import { convertTiffToDisplayUrl } from '@utils/logoFile/converters/tiff';
import { findPdfOffset, getExtension, isAcceptedLogoFile } from '@utils/logoFile/detectFormat';
import { LogoFileError } from '@utils/logoFile/logoFileError';
import { LOGO_MAX_FILE_SIZE } from '@constants';
const logoFileToDisplayUrl = async (file: File): Promise<string> => {
  if (file.size > LOGO_MAX_FILE_SIZE) {
    throw new LogoFileError('File troppo grande (max 10 MB)');
  }
  if (!isAcceptedLogoFile(file)) {
    throw new LogoFileError('Formato file non supportato');
  }

  const ext = getExtension(file.name);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) {
    return nativeFileToDisplayUrl(file);
  }

  if (ext === 'bmp') {
    try {
      return await nativeFileToDisplayUrl(file);
    } catch {
      return convertWithMagick(bytes);
    }
  }

  if (ext === 'pdf') {
    return convertPdfToDisplayUrl(buffer);
  }

  if (ext === 'ai') {
    const pdfOffset = findPdfOffset(bytes);
    if (pdfOffset >= 0) {
      try {
        return await convertPdfToDisplayUrl(buffer.slice(pdfOffset));
      } catch {
        // legacy AI (PostScript-based) → ImageMagick
      }
    }
    return convertWithMagick(bytes);
  }

  if (ext === 'tif' || ext === 'tiff') {
    return convertTiffToDisplayUrl(buffer);
  }

  if (ext === 'eps' || ext === 'ps') {
    return convertEpsPsToDisplayUrl(bytes, ext);
  }

  throw new LogoFileError('Formato file non supportato');
};

export { isAcceptedLogoFile, LogoFileError, logoFileToDisplayUrl };
