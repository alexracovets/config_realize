import { type Mesh, MeshStandardMaterial, type Object3D, type Scene, type Vector4 } from 'three';
import { NAME_SLOT_COUNT } from '@configurator/constants';

type numberUniformType = { value: number };
type numberArrayUniformType = { value: number[] };
type vec4ArrayUniformType = { value: Vector4[] };

const readLogoGChannel = (uniform: vec4ArrayUniformType | undefined, channel: 'x' | 'y' | 'z') =>
  uniform ? uniform.value.map((vec) => vec[channel]) : undefined;

const zeroLogoGChannel = (uniform: vec4ArrayUniformType | undefined, channel: 'x' | 'y' | 'z') => {
  if (!uniform) return;
  uniform.value.forEach((vec) => {
    vec[channel] = 0;
  });
};

const restoreLogoGChannel = (uniform: vec4ArrayUniformType | undefined, values: number[] | undefined, channel: 'x' | 'y' | 'z') => {
  if (!uniform || !values) return;
  values.forEach((value, index) => {
    if (uniform.value[index]) uniform.value[index][channel] = value;
  });
};

interface garmentGizmoUniformSnapshotType {
  material: MeshStandardMaterial;
  nameEnabled?: number;
  numberEnabled?: number;
  testoEnabled?: number;
  logoEnabled?: number;
  nameFrameActive?: number[];
  numberFrameActive?: number[];
  testoFrameActive?: number[];
  logoFrameActive?: number[];
  nameButtonsActive?: number[];
  numberButtonsActive?: number[];
  testoButtonsActive?: number[];
  logoButtonsActive?: number[];
  nameButtonsReveal?: number[];
  numberButtonsReveal?: number[];
  testoButtonsReveal?: number[];
  logoButtonsReveal?: number[];
  hoverSlot?: number;
  hoverCorner?: number;
  hoverScale?: number;
}

const readNumberUniform = (uniform: numberUniformType | undefined) => (uniform ? uniform.value : undefined);

const readArrayUniform = (uniform: numberArrayUniformType | undefined) => (uniform ? [...uniform.value] : undefined);

const writeNumberUniform = (uniform: numberUniformType | undefined, value: number) => {
  if (uniform) uniform.value = value;
};

const zeroArrayUniform = (uniform: numberArrayUniformType | undefined, length: number) => {
  if (!uniform) return;

  for (let index = 0; index < length; index += 1) {
    uniform.value[index] = 0;
  }
};

const restoreArrayUniform = (uniform: numberArrayUniformType | undefined, values: number[] | undefined) => {
  if (!uniform || !values) return;

  values.forEach((value, index) => {
    uniform.value[index] = value;
  });
};

const isGarmentPrintMaterial = (material: unknown): material is MeshStandardMaterial =>
  material instanceof MeshStandardMaterial && Boolean(material.userData.uNameGizmoEnabledUniform);

const collectGarmentMaterials = (scene: Scene) => {
  const materials = new Set<MeshStandardMaterial>();

  scene.traverse((object: Object3D) => {
    if (!('isMesh' in object) || !(object as Mesh).isMesh) return;

    const meshMaterials = (object as Mesh).material;
    const materialList = Array.isArray(meshMaterials) ? meshMaterials : [meshMaterials];

    for (const material of materialList) {
      if (isGarmentPrintMaterial(material)) {
        materials.add(material);
      }
    }
  });

  return [...materials];
};

const snapshotGarmentGizmoUniforms = (material: MeshStandardMaterial): garmentGizmoUniformSnapshotType => ({
  material,
  nameEnabled: readNumberUniform(material.userData.uNameGizmoEnabledUniform as numberUniformType | undefined),
  numberEnabled: readNumberUniform(material.userData.uNumberGizmoEnabledUniform as numberUniformType | undefined),
  testoEnabled: readNumberUniform(material.userData.uTestoGizmoEnabledUniform as numberUniformType | undefined),
  logoEnabled: readNumberUniform(material.userData.uLogoGizmoEnabledUniform as numberUniformType | undefined),
  nameFrameActive: readArrayUniform(material.userData.uNameGizmoFrameActiveUniform as numberArrayUniformType | undefined),
  numberFrameActive: readArrayUniform(material.userData.uNumberGizmoFrameActiveUniform as numberArrayUniformType | undefined),
  testoFrameActive: readArrayUniform(material.userData.uTestoGizmoFrameActiveUniform as numberArrayUniformType | undefined),
  logoFrameActive: readLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, 'x'),
  nameButtonsActive: readArrayUniform(material.userData.uNameGizmoButtonsActiveUniform as numberArrayUniformType | undefined),
  numberButtonsActive: readArrayUniform(material.userData.uNumberGizmoButtonsActiveUniform as numberArrayUniformType | undefined),
  testoButtonsActive: readArrayUniform(material.userData.uTestoGizmoButtonsActiveUniform as numberArrayUniformType | undefined),
  logoButtonsActive: readLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, 'y'),
  nameButtonsReveal: readArrayUniform(material.userData.uNameGizmoButtonsRevealUniform as numberArrayUniformType | undefined),
  numberButtonsReveal: readArrayUniform(material.userData.uNumberGizmoButtonsRevealUniform as numberArrayUniformType | undefined),
  testoButtonsReveal: readArrayUniform(material.userData.uTestoGizmoButtonsRevealUniform as numberArrayUniformType | undefined),
  logoButtonsReveal: readLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, 'z'),
  hoverSlot: readNumberUniform(material.userData.uNameGizmoHoverSlotUniform as numberUniformType | undefined),
  hoverCorner: readNumberUniform(material.userData.uNameGizmoHoverCornerUniform as numberUniformType | undefined),
  hoverScale: readNumberUniform(material.userData.uNameGizmoHoverScaleUniform as numberUniformType | undefined),
});

const suppressGarmentGizmoUniforms = (material: MeshStandardMaterial) => {
  writeNumberUniform(material.userData.uNameGizmoEnabledUniform as numberUniformType | undefined, 0);
  writeNumberUniform(material.userData.uNumberGizmoEnabledUniform as numberUniformType | undefined, 0);
  writeNumberUniform(material.userData.uTestoGizmoEnabledUniform as numberUniformType | undefined, 0);
  writeNumberUniform(material.userData.uLogoGizmoEnabledUniform as numberUniformType | undefined, 0);

  zeroArrayUniform(material.userData.uNameGizmoFrameActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uNumberGizmoFrameActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uTestoGizmoFrameActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, 'x');

  zeroArrayUniform(material.userData.uNameGizmoButtonsActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uNumberGizmoButtonsActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uTestoGizmoButtonsActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, 'y');

  zeroArrayUniform(material.userData.uNameGizmoButtonsRevealUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uNumberGizmoButtonsRevealUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uTestoGizmoButtonsRevealUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, 'z');

  writeNumberUniform(material.userData.uNameGizmoHoverSlotUniform as numberUniformType | undefined, -1);
  writeNumberUniform(material.userData.uNameGizmoHoverCornerUniform as numberUniformType | undefined, -1);
  writeNumberUniform(material.userData.uNameGizmoHoverScaleUniform as numberUniformType | undefined, 1);
};

const restoreGarmentGizmoUniforms = (snapshot: garmentGizmoUniformSnapshotType) => {
  const { material } = snapshot;

  writeNumberUniform(material.userData.uNameGizmoEnabledUniform as numberUniformType | undefined, snapshot.nameEnabled ?? 0);
  writeNumberUniform(material.userData.uNumberGizmoEnabledUniform as numberUniformType | undefined, snapshot.numberEnabled ?? 0);
  writeNumberUniform(material.userData.uTestoGizmoEnabledUniform as numberUniformType | undefined, snapshot.testoEnabled ?? 0);
  writeNumberUniform(material.userData.uLogoGizmoEnabledUniform as numberUniformType | undefined, snapshot.logoEnabled ?? 0);

  restoreArrayUniform(material.userData.uNameGizmoFrameActiveUniform as numberArrayUniformType | undefined, snapshot.nameFrameActive);
  restoreArrayUniform(material.userData.uNumberGizmoFrameActiveUniform as numberArrayUniformType | undefined, snapshot.numberFrameActive);
  restoreArrayUniform(material.userData.uTestoGizmoFrameActiveUniform as numberArrayUniformType | undefined, snapshot.testoFrameActive);
  restoreLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, snapshot.logoFrameActive, 'x');

  restoreArrayUniform(material.userData.uNameGizmoButtonsActiveUniform as numberArrayUniformType | undefined, snapshot.nameButtonsActive);
  restoreArrayUniform(material.userData.uNumberGizmoButtonsActiveUniform as numberArrayUniformType | undefined, snapshot.numberButtonsActive);
  restoreArrayUniform(material.userData.uTestoGizmoButtonsActiveUniform as numberArrayUniformType | undefined, snapshot.testoButtonsActive);
  restoreLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, snapshot.logoButtonsActive, 'y');

  restoreArrayUniform(material.userData.uNameGizmoButtonsRevealUniform as numberArrayUniformType | undefined, snapshot.nameButtonsReveal);
  restoreArrayUniform(material.userData.uNumberGizmoButtonsRevealUniform as numberArrayUniformType | undefined, snapshot.numberButtonsReveal);
  restoreArrayUniform(material.userData.uTestoGizmoButtonsRevealUniform as numberArrayUniformType | undefined, snapshot.testoButtonsReveal);
  restoreLogoGChannel(material.userData.uLogoGUniform as vec4ArrayUniformType | undefined, snapshot.logoButtonsReveal, 'z');

  writeNumberUniform(material.userData.uNameGizmoHoverSlotUniform as numberUniformType | undefined, snapshot.hoverSlot ?? -1);
  writeNumberUniform(material.userData.uNameGizmoHoverCornerUniform as numberUniformType | undefined, snapshot.hoverCorner ?? -1);
  writeNumberUniform(material.userData.uNameGizmoHoverScaleUniform as numberUniformType | undefined, snapshot.hoverScale ?? 1);
};

const withGarmentGizmoSuppressedForCapture = <T>(scene: Scene, render: () => T) => {
  const snapshots = collectGarmentMaterials(scene).map((material) => {
    const snapshot = snapshotGarmentGizmoUniforms(material);
    suppressGarmentGizmoUniforms(material);
    return snapshot;
  });

  try {
    return render();
  } finally {
    snapshots.forEach(restoreGarmentGizmoUniforms);
  }
};

export { withGarmentGizmoSuppressedForCapture };
