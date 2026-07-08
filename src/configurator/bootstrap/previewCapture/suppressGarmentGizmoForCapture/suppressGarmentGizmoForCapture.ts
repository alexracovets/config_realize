import { type Mesh, MeshStandardMaterial, type Object3D, type Scene } from 'three';
import { LOGO_SLOT_COUNT, NAME_SLOT_COUNT } from '@configurator/constants';

type numberUniformType = { value: number };
type numberArrayUniformType = { value: number[] };

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
  logoFrameActive: readArrayUniform(material.userData.uLogoGizmoFrameActiveUniform as numberArrayUniformType | undefined),
  nameButtonsActive: readArrayUniform(material.userData.uNameGizmoButtonsActiveUniform as numberArrayUniformType | undefined),
  numberButtonsActive: readArrayUniform(material.userData.uNumberGizmoButtonsActiveUniform as numberArrayUniformType | undefined),
  testoButtonsActive: readArrayUniform(material.userData.uTestoGizmoButtonsActiveUniform as numberArrayUniformType | undefined),
  logoButtonsActive: readArrayUniform(material.userData.uLogoGizmoButtonsActiveUniform as numberArrayUniformType | undefined),
  nameButtonsReveal: readArrayUniform(material.userData.uNameGizmoButtonsRevealUniform as numberArrayUniformType | undefined),
  numberButtonsReveal: readArrayUniform(material.userData.uNumberGizmoButtonsRevealUniform as numberArrayUniformType | undefined),
  testoButtonsReveal: readArrayUniform(material.userData.uTestoGizmoButtonsRevealUniform as numberArrayUniformType | undefined),
  logoButtonsReveal: readArrayUniform(material.userData.uLogoGizmoButtonsRevealUniform as numberArrayUniformType | undefined),
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
  zeroArrayUniform(material.userData.uLogoGizmoFrameActiveUniform as numberArrayUniformType | undefined, LOGO_SLOT_COUNT);

  zeroArrayUniform(material.userData.uNameGizmoButtonsActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uNumberGizmoButtonsActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uTestoGizmoButtonsActiveUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uLogoGizmoButtonsActiveUniform as numberArrayUniformType | undefined, LOGO_SLOT_COUNT);

  zeroArrayUniform(material.userData.uNameGizmoButtonsRevealUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uNumberGizmoButtonsRevealUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uTestoGizmoButtonsRevealUniform as numberArrayUniformType | undefined, NAME_SLOT_COUNT);
  zeroArrayUniform(material.userData.uLogoGizmoButtonsRevealUniform as numberArrayUniformType | undefined, LOGO_SLOT_COUNT);

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
  restoreArrayUniform(material.userData.uLogoGizmoFrameActiveUniform as numberArrayUniformType | undefined, snapshot.logoFrameActive);

  restoreArrayUniform(material.userData.uNameGizmoButtonsActiveUniform as numberArrayUniformType | undefined, snapshot.nameButtonsActive);
  restoreArrayUniform(material.userData.uNumberGizmoButtonsActiveUniform as numberArrayUniformType | undefined, snapshot.numberButtonsActive);
  restoreArrayUniform(material.userData.uTestoGizmoButtonsActiveUniform as numberArrayUniformType | undefined, snapshot.testoButtonsActive);
  restoreArrayUniform(material.userData.uLogoGizmoButtonsActiveUniform as numberArrayUniformType | undefined, snapshot.logoButtonsActive);

  restoreArrayUniform(material.userData.uNameGizmoButtonsRevealUniform as numberArrayUniformType | undefined, snapshot.nameButtonsReveal);
  restoreArrayUniform(material.userData.uNumberGizmoButtonsRevealUniform as numberArrayUniformType | undefined, snapshot.numberButtonsReveal);
  restoreArrayUniform(material.userData.uTestoGizmoButtonsRevealUniform as numberArrayUniformType | undefined, snapshot.testoButtonsReveal);
  restoreArrayUniform(material.userData.uLogoGizmoButtonsRevealUniform as numberArrayUniformType | undefined, snapshot.logoButtonsReveal);

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
