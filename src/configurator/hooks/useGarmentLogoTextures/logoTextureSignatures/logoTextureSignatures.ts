import type { resolveLogoInstancesForRender } from '@store';

const buildLogoStampSignature = (instances: ReturnType<typeof resolveLogoInstancesForRender>) =>
  JSON.stringify(
    instances.map((instance) => ({
      id: instance.id,
      src: instance.src,
      opacity: instance.opacity,
      naturalWidth: instance.naturalWidth,
      naturalHeight: instance.naturalHeight,
      scale: instance.scale,
    })),
  );

const buildLogoStyleSignature = (instances: ReturnType<typeof resolveLogoInstancesForRender>) =>
  JSON.stringify(
    instances.map((instance) => ({
      id: instance.id,
      uv: instance.uv,
      rotation: instance.rotation,
      uploadRotation: instance.uploadRotation ?? 0,
      scale: instance.scale,
      partId: instance.partId,
      showFrame: instance.showFrame,
      showGizmo: instance.showGizmo,
    })),
  );

export { buildLogoStampSignature, buildLogoStyleSignature };
