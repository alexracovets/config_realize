interface patternLayerType {
  key: string;
  label: string;
}

interface patternLayerColorControlPropsType {
  layers: patternLayerType[];
  colors: Record<string, string>;
  onColorChange: (layerKey: string, color: string) => void;
  onPreviewColorChange?: (layerKey: string, color: string) => void;
  label?: string;
}

export type { patternLayerColorControlPropsType };
