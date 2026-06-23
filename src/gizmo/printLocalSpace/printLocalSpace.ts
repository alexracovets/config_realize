const rotateLocalPx = (x: number, y: number, rotationDeg: number) => {
  const rad = (-rotationDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  return { x: cosA * x - sinA * y, y: sinA * x + cosA * y };
};

const toPrintLocalPx = (
  uv: { x: number; y: number },
  anchor: { x: number; y: number },
  atlasSize: { width: number; height: number },
  partRotationDeg: number,
  elementRotationDeg: number,
) => {
  const deltaX = (uv.x - anchor.x) * atlasSize.width;
  const deltaY = (uv.y - anchor.y) * atlasSize.height;
  const partLocal = rotateLocalPx(deltaX, deltaY, partRotationDeg);
  return rotateLocalPx(partLocal.x, partLocal.y, elementRotationDeg);
};

export { rotateLocalPx, toPrintLocalPx };
