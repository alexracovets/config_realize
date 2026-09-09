import { resolveLogoStampAtlasGrid } from '@configurator/utils';
import { useGarmentLogo } from '@store';

type garmentLogoE2eLogoType = {
  id: string;
  fileName: string;
  positionKey: string;
  uv: { x: number; y: number };
};

type garmentLogoE2eStampMetaType = {
  grid: number;
  canvasWidth: number;
  canvasHeight: number;
  cellWidth: number;
  cellHeight: number;
};

type garmentLogoE2eApiType = {
  getUserLogos: () => garmentLogoE2eLogoType[];
  canAddUserLogo: () => boolean;
  getOccupiedStampSlots: () => number;
  getStampMeta: () => garmentLogoE2eStampMetaType | null;
  bringUserLogoToFront: (id: string) => void;
};

declare global {
  interface Window {
    __garmentLogoE2e?: garmentLogoE2eApiType;
  }
}

let stampAtlasCanvas: HTMLCanvasElement | null = null;
let stampAtlasMeta: garmentLogoE2eStampMetaType | null = null;

const setGarmentLogoE2eStampCanvas = (canvas: HTMLCanvasElement | null, meta?: garmentLogoE2eStampMetaType | null) => {
  stampAtlasCanvas = canvas;
  stampAtlasMeta = canvas ? (meta ?? stampAtlasMeta) : null;
};

const countOccupiedStampSlots = (canvas: HTMLCanvasElement, instanceCount: number): number => {
  if (instanceCount <= 0) return 0;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || canvas.width === 0 || canvas.height === 0) return 0;

  const grid = stampAtlasMeta?.grid ?? resolveLogoStampAtlasGrid();
  const cellWidth = Math.max(1, stampAtlasMeta?.cellWidth ?? Math.floor(canvas.width / grid));
  const cellHeight = Math.max(1, stampAtlasMeta?.cellHeight ?? Math.floor(canvas.height / grid));

  let occupied = 0;

  for (let index = 0; index < instanceCount; index += 1) {
    const column = index % grid;
    const row = Math.floor(index / grid);
    const pixels = context.getImageData(column * cellWidth, row * cellHeight, cellWidth, cellHeight).data;

    for (let offset = 3; offset < pixels.length; offset += 4) {
      if (pixels[offset]! > 8) {
        occupied += 1;
        break;
      }
    }
  }

  return occupied;
};

const getUserLogos = (): garmentLogoE2eLogoType[] =>
  useGarmentLogo
    .getState()
    .instances.filter((instance) => !instance.isDefault && instance.src.trim())
    .map((instance) => ({
      id: instance.id,
      fileName: instance.fileName,
      positionKey: instance.positionKey,
      uv: { x: instance.uv.x, y: instance.uv.y },
    }));

const registerGarmentLogoE2eDebug = () => {
  if (process.env.NODE_ENV === 'production') {
    return () => undefined;
  }

  window.__garmentLogoE2e = {
    getUserLogos,
    canAddUserLogo: () => useGarmentLogo.getState().canAddUserLogo(),
    getOccupiedStampSlots: () => {
      if (!stampAtlasCanvas) return 0;
      const renderableCount = useGarmentLogo.getState().getInstancesForRender().length;
      return countOccupiedStampSlots(stampAtlasCanvas, renderableCount);
    },
    getStampMeta: () => stampAtlasMeta,
    bringUserLogoToFront: (id: string) => {
      useGarmentLogo.getState().bringInstanceToFront(id);
    },
  };

  return () => {
    delete window.__garmentLogoE2e;
  };
};

export { registerGarmentLogoE2eDebug, setGarmentLogoE2eStampCanvas };
export type { garmentLogoE2eApiType, garmentLogoE2eLogoType, garmentLogoE2eStampMetaType };
