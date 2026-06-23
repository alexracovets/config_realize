type captureConfiguratorPreviewFnType = () => string | null;

let captureConfiguratorPreviewFn: captureConfiguratorPreviewFnType | null = null;

const registerConfiguratorPreviewCapture = (capture: captureConfiguratorPreviewFnType) => {
  captureConfiguratorPreviewFn = capture;
};

const unregisterConfiguratorPreviewCapture = () => {
  captureConfiguratorPreviewFn = null;
};

const captureConfiguratorPreviewSnapshot = () => captureConfiguratorPreviewFn?.() ?? null;

export { captureConfiguratorPreviewSnapshot, registerConfiguratorPreviewCapture, unregisterConfiguratorPreviewCapture };
