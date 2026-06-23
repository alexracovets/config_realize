'use client';

import { createElement, useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaRegTrashAlt } from 'react-icons/fa';
import { GoCopy } from 'react-icons/go';
import { IoResizeOutline } from 'react-icons/io5';
import { MdOutlineCropRotate } from 'react-icons/md';
import type { IconType } from 'react-icons';
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace, type Texture } from 'three';

// Single horizontal atlas with the four tool icons, in this order. The garment shader samples a cell
// per frame corner so the buttons are painted onto the fabric exactly like the selection frame.
const GIZMO_ICONS = [
  { kind: 'duplicate', Icon: GoCopy },
  { kind: 'delete', Icon: FaRegTrashAlt },
  { kind: 'rotate', Icon: MdOutlineCropRotate },
  { kind: 'scale', Icon: IoResizeOutline },
] as const satisfies ReadonlyArray<{ kind: string; Icon: IconType }>;

// Keep in sync with GIZMO_ICON_CELL_FILL in garmentShaders.ts (icon inset within each atlas cell).
const GIZMO_ICON_CELL_FILL = 0.62;
const ATLAS_DPI = 4;
const CELL = Math.round(120 * ATLAS_DPI);
const ICON_SIZE = Math.round(CELL * GIZMO_ICON_CELL_FILL);
const ICON_COLOR = '#1a1a1a';
// UV print space is rotated vs screen; bake icons 90° so they read upright on the garment.
const ICON_ROTATION = Math.PI / 2;

const loadSvgImage = (svg: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

const drawIconCell = async (ctx: CanvasRenderingContext2D, Icon: IconType, ox: number) => {
  const svg = renderToStaticMarkup(createElement(Icon, { color: ICON_COLOR, size: ICON_SIZE }));
  const img = await loadSvgImage(svg);
  const cx = ox + CELL / 2;
  const cy = CELL / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ICON_ROTATION);
  ctx.drawImage(img, -ICON_SIZE / 2, -ICON_SIZE / 2, ICON_SIZE, ICON_SIZE);
  ctx.restore();
};

const buildGizmoIconAtlas = async (): Promise<Texture | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = CELL * GIZMO_ICONS.length;
  canvas.height = CELL;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  await Promise.all(GIZMO_ICONS.map(({ Icon }, index) => drawIconCell(ctx, Icon, index * CELL)));

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
};

const useGizmoIconAtlas = (): Texture | null => {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let disposed = false;
    let built: Texture | null = null;

    void buildGizmoIconAtlas().then((tex) => {
      if (disposed) {
        tex?.dispose();
        return;
      }
      built = tex;
      setTexture(tex);
    });

    return () => {
      disposed = true;
      built?.dispose();
      setTexture((prev) => {
        prev?.dispose();
        return null;
      });
    };
  }, []);

  return texture;
};

export { useGizmoIconAtlas };
