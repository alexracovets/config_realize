const mergeMaskChannel = (targetCtx: CanvasRenderingContext2D, sourceCtx: CanvasRenderingContext2D, channel: 0 | 1 | 2 | 3) => {
  const width = sourceCtx.canvas.width;
  const height = sourceCtx.canvas.height;

  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const targetData = targetCtx.getImageData(0, 0, width, height);

  for (let index = 0; index < sourceData.data.length; index += 4) {
    const alpha = Math.max(sourceData.data[index], sourceData.data[index + 1], sourceData.data[index + 2], sourceData.data[index + 3]);
    if (alpha > targetData.data[index + channel]) {
      targetData.data[index + channel] = alpha;
      targetData.data[index + 3] = Math.max(targetData.data[index + 3], alpha);
    }
  }

  targetCtx.putImageData(targetData, 0, 0);
};

export { mergeMaskChannel };
