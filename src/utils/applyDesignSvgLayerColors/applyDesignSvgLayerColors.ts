const SHAPE_SELECTOR = 'path, rect, polygon, circle, ellipse, polyline';

const matchesColorLayer = (id: string, layerIndex: number) => {
  const layerName = `color${layerIndex + 1}`;
  return id === layerName || id.startsWith(`${layerName}_`);
};

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

const applyDesignSvgLayerColors = (svgText: string, layerColors: string[]): string => {
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return svgText;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const groups = [...doc.querySelectorAll('g')];

  layerColors.forEach((color, layerIndex) => {
    if (!color) return;

    groups.filter((group) => matchesColorLayer(group.id, layerIndex)).forEach((group) => applyFillToShapes(group, color));
  });

  return new XMLSerializer().serializeToString(doc.documentElement);
};

const designSvgTextToDataUrl = (svgText: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

export { applyDesignSvgLayerColors, designSvgTextToDataUrl };
