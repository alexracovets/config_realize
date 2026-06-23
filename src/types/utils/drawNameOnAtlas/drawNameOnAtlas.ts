interface drawNameMaskGeometryInputType {
  text: string;
  font: string;
  letterSpacing?: number;
}

interface drawNameStrokeMaskGeometryInputType {
  text: string;
  font: string;
  strokeWidth: number;
  fontSize: number;
  letterSpacing?: number;
}

interface textCanvasDrawOptionsType {
  letterSpacing?: number;
}

export type { drawNameMaskGeometryInputType, drawNameStrokeMaskGeometryInputType, textCanvasDrawOptionsType };
