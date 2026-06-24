const COLOR_LAYER_GROUP_MATCHERS: Array<(id: string) => boolean> = [
  (id) => id === 'color1' || id.startsWith('color1_'),
  (id) => id === 'color2' || id.startsWith('color2_'),
];

const SHAPE_SELECTOR = 'path, rect, polygon, circle, ellipse, polyline';

const applyFillToShapes = (container: Element, color: string) => {
  container.querySelectorAll(SHAPE_SELECTOR).forEach((shape) => {
    shape.setAttribute('fill', color);

    const style = shape.getAttribute('style');
    if (style) {
      const withoutFill = style.replace(/fill:\s*[^;]+;?/gi, '').trim();
      shape.setAttribute('style', withoutFill ? `${withoutFill};fill:${color}` : `fill:${color}`);
    }
  });
};

/** Tint shared `/svg/design` preview layers (`color1`, `color2`) to match pattern part colors. */
const applyDesignSvgLayerColors = (svgText: string, layerColors: string[]): string => {
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return svgText;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const groups = [...doc.querySelectorAll('g')];

  layerColors.forEach((color, layerIndex) => {
    const matchesLayer = COLOR_LAYER_GROUP_MATCHERS[layerIndex];
    if (!matchesLayer || !color) return;

    groups.filter((group) => matchesLayer(group.id)).forEach((group) => applyFillToShapes(group, color));
  });

  const root = doc.documentElement;
  return new XMLSerializer().serializeToString(root);
};

const designSvgTextToDataUrl = (svgText: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

export { applyDesignSvgLayerColors, designSvgTextToDataUrl };
