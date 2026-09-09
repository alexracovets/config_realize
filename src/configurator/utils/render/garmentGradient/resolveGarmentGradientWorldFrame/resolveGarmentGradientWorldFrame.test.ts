import { BoxGeometry, Mesh, Scene } from 'three';
import {
  evaluateGarmentGradientUvT,
  evaluateGarmentGradientWorldT,
  isSleeveGarmentPart,
  resolveGarmentGradientWorldFrame,
  resolveGarmentPartGradientFrame,
} from '@configurator/utils';
import { describe, expect, it } from 'vitest';

const torsoFrame = {
  origin: { x: 0, y: 0, z: 0 },
  extent: { x: 0.5, y: 1, z: 0.2 },
};

const addGarmentMesh = (scene: Scene, name: string, geometry: BoxGeometry, x: number, y: number, z: number) => {
  const mesh = new Mesh(geometry);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.userData.configuratorGarment = true;
  scene.add(mesh);
  return mesh;
};

describe('evaluateGarmentGradientWorldT', () => {
  it('puts the hem and collar on the same vertical scale', () => {
    expect(evaluateGarmentGradientWorldT({ x: 0.4, y: 1, z: 0 }, torsoFrame, 0)).toBeCloseTo(0);
    expect(evaluateGarmentGradientWorldT({ x: -0.4, y: -1, z: 0 }, torsoFrame, 0)).toBeCloseTo(1);
  });

  it('keeps front and back samples at the same height on one line', () => {
    const front = evaluateGarmentGradientWorldT({ x: 0, y: 0.2, z: 0.3 }, torsoFrame, 0);
    const back = evaluateGarmentGradientWorldT({ x: 0, y: 0.2, z: -0.3 }, torsoFrame, 0);
    expect(front).toBeCloseTo(back);
  });

  it('runs a sleeve gradient from armhole to cuff instead of world height', () => {
    const sleeveFrame = {
      origin: { x: 0.8, y: 0.5, z: 0 },
      extent: { x: 0.3, y: 0.12, z: 0.12 },
      dir: { x: 1, y: 0, z: 0 },
    };

    const armhole = evaluateGarmentGradientWorldT({ x: 0.5, y: 0.5, z: 0 }, sleeveFrame, 0);
    const cuff = evaluateGarmentGradientWorldT({ x: 1.1, y: 0.5, z: 0 }, sleeveFrame, 0);
    const top = evaluateGarmentGradientWorldT({ x: 0.8, y: 0.62, z: 0 }, sleeveFrame, 0);
    const bottom = evaluateGarmentGradientWorldT({ x: 0.8, y: 0.38, z: 0 }, sleeveFrame, 0);

    expect(armhole).toBeCloseTo(0);
    expect(cuff).toBeCloseTo(1);
    expect(top).toBeCloseTo(bottom);
  });
});

describe('evaluateGarmentGradientUvT', () => {
  it('keeps a straight UV hem edge on one station', () => {
    const bounds = { minX: 0.44, minY: 0.01, maxX: 0.542, maxY: 0.67 };

    expect(evaluateGarmentGradientUvT({ u: 0.542, v: 0.14 }, { x: 1, y: 0 }, bounds)).toBeCloseTo(1);
    expect(evaluateGarmentGradientUvT({ u: 0.542, v: 0.51 }, { x: 1, y: 0 }, bounds)).toBeCloseTo(1);
    expect(evaluateGarmentGradientUvT({ u: 0.44, v: 0.33 }, { x: 1, y: 0 }, bounds)).toBeCloseTo(0);
  });
});

describe('isSleeveGarmentPart', () => {
  it('detects sleeve ids and Manica labels', () => {
    expect(isSleeveGarmentPart({ id: 'bernardi_calcio_sleeve_left', label: 'Manica 1' })).toBe(true);
    expect(isSleeveGarmentPart({ id: 'front', label: 'Davanti' })).toBe(false);
  });
});

describe('resolveGarmentPartGradientFrame', () => {
  it('keeps torso on the shared garment frame and sleeves on the cuff axis', () => {
    const scene = new Scene();
    addGarmentMesh(scene, 'model_front', new BoxGeometry(0.4, 2, 0.2), 0, 0, 0.1);
    addGarmentMesh(scene, 'model_sleeve_left', new BoxGeometry(0.7, 0.22, 0.22), 0.55, 0.55, 0);
    scene.updateMatrixWorld(true);

    const garmentFrame = resolveGarmentGradientWorldFrame(scene);
    const torso = resolveGarmentPartGradientFrame(scene, { id: 'front', label: 'Davanti', meshNames: ['model_front'] }, garmentFrame);
    const sleeve = resolveGarmentPartGradientFrame(
      scene,
      { id: 'bernardi_calcio_sleeve_left', label: 'Manica 1', meshNames: ['model_sleeve_left'] },
      garmentFrame,
    );

    expect(torso.dir).toBeUndefined();
    expect(sleeve.dir?.x ?? 0).toBeGreaterThan(0.9);
    expect(sleeve.dir?.y ?? 1).toBeCloseTo(0);

    const armhole = evaluateGarmentGradientWorldT({ x: 0.2, y: 0.66, z: 0 }, sleeve, 0);
    const cuff = evaluateGarmentGradientWorldT({ x: 0.9, y: 0.44, z: 0 }, sleeve, 0);
    const top = evaluateGarmentGradientWorldT({ x: 0.55, y: 0.66, z: 0 }, sleeve, 0);
    const bottom = evaluateGarmentGradientWorldT({ x: 0.55, y: 0.44, z: 0 }, sleeve, 0);
    expect(armhole).toBeLessThan(cuff);
    expect(top).toBeCloseTo(bottom);
  });

  it('keeps short-sleeve stations the same color from top to bottom', () => {
    const scene = new Scene();
    addGarmentMesh(scene, 'model_front', new BoxGeometry(0.38, 0.62, 0.18), 0, 1.31, 0.06);
    addGarmentMesh(scene, 'model_sleeve_left', new BoxGeometry(0.27, 0.26, 0.16), 0.22, 1.51, -0.03);
    scene.updateMatrixWorld(true);

    const garmentFrame = resolveGarmentGradientWorldFrame(scene);
    const sleeve = resolveGarmentPartGradientFrame(
      scene,
      { id: 'bernardi_calcio_sleeve_left', label: 'Manica 1', meshNames: ['model_sleeve_left'] },
      garmentFrame,
    );

    expect(sleeve.dir?.x ?? 0).toBeGreaterThan(0.5);
    expect(sleeve.dir?.y ?? 1).toBeLessThanOrEqual(0.05);

    const armhole = evaluateGarmentGradientWorldT({ x: 0.09, y: 1.51, z: -0.03 }, sleeve, 0);
    const cuff = evaluateGarmentGradientWorldT({ x: 0.35, y: 1.51, z: -0.03 }, sleeve, 0);
    expect(armhole).toBeLessThan(cuff);
  });

  it('maps a short womens cap sleeve from body to cuff instead of along the armhole height', () => {
    const scene = new Scene();
    addGarmentMesh(scene, 'crewneck_womans_front', new BoxGeometry(0.38, 0.62, 0.18), 0, 1.49, 0.06);
    addGarmentMesh(scene, 'crewneck_womans_sleeve_left', new BoxGeometry(0.08, 0.2, 0.08), 0.2, 1.5, -0.05);
    scene.updateMatrixWorld(true);

    const garmentFrame = resolveGarmentGradientWorldFrame(scene);
    const sleeve = resolveGarmentPartGradientFrame(
      scene,
      { id: 'sylla_pallavolo_sleeve_left', label: 'Manica 1', meshNames: ['crewneck_womans_sleeve_left'] },
      garmentFrame,
    );

    expect(sleeve.dir?.x ?? 0).toBeGreaterThan(0.85);
    expect(Math.abs(sleeve.dir?.y ?? 1)).toBeLessThan(0.25);

    const bodySide = evaluateGarmentGradientWorldT({ x: 0.16, y: 1.5, z: -0.05 }, sleeve, 0);
    const cuff = evaluateGarmentGradientWorldT({ x: 0.24, y: 1.5, z: -0.05 }, sleeve, 0);
    expect(bodySide).toBeLessThan(cuff);
  });

  it('follows a hanging set-in sleeve along its long axis', () => {
    const scene = new Scene();
    addGarmentMesh(scene, 'model_front', new BoxGeometry(0.38, 0.62, 0.18), 0, 1.31, 0.06);
    const sleeveMesh = addGarmentMesh(scene, 'model_sleeve_left', new BoxGeometry(0.28, 0.1, 0.1), 0.26, 1.5, 0);
    sleeveMesh.rotation.z = -Math.atan2(0.89, 0.44);
    scene.updateMatrixWorld(true);

    const garmentFrame = resolveGarmentGradientWorldFrame(scene);
    const sleeve = resolveGarmentPartGradientFrame(
      scene,
      { id: 'federer_calcio_sleeve_left', label: 'Manica 1', meshNames: ['model_sleeve_left'] },
      garmentFrame,
    );

    expect(sleeve.dir?.x ?? 0).toBeGreaterThan(0.3);
    expect(sleeve.dir?.y ?? 0).toBeLessThan(-0.6);

    const dir = sleeve.dir ?? { x: 1, y: 0, z: 0 };
    const cuff = {
      x: sleeve.origin.x + dir.x * 0.1,
      y: sleeve.origin.y + dir.y * 0.1,
      z: sleeve.origin.z,
    };
    const perpX = -dir.y;
    const perpY = dir.x;
    const cuffTop = evaluateGarmentGradientWorldT({ x: cuff.x + perpX * 0.04, y: cuff.y + perpY * 0.04, z: cuff.z }, sleeve, 0);
    const cuffBottom = evaluateGarmentGradientWorldT({ x: cuff.x - perpX * 0.04, y: cuff.y - perpY * 0.04, z: cuff.z }, sleeve, 0);
    expect(cuffTop).toBeCloseTo(cuffBottom);
  });

  it('follows a raglan sleeve so the cuff edge stays one station', () => {
    const scene = new Scene();
    addGarmentMesh(scene, 'model_front', new BoxGeometry(0.4, 1.2, 0.2), 0, 0.6, 0);
    const sleeveMesh = addGarmentMesh(scene, 'model_sleeve_left', new BoxGeometry(0.7, 0.18, 0.18), 0.45, 0.85, 0);
    sleeveMesh.rotation.z = -Math.PI / 5;
    scene.updateMatrixWorld(true);

    const garmentFrame = resolveGarmentGradientWorldFrame(scene);
    const sleeve = resolveGarmentPartGradientFrame(
      scene,
      { id: 'bernardi_calcio_sleeve_left', label: 'Manica 1', meshNames: ['model_sleeve_left'] },
      garmentFrame,
    );

    expect(sleeve.dir?.x ?? 0).toBeGreaterThan(0.6);
    expect(sleeve.dir?.y ?? 0).toBeLessThan(-0.3);

    const dir = sleeve.dir ?? { x: 1, y: 0, z: 0 };
    const cuff = {
      x: sleeve.origin.x + dir.x * 0.25,
      y: sleeve.origin.y + dir.y * 0.25,
      z: sleeve.origin.z,
    };
    const armhole = {
      x: sleeve.origin.x - dir.x * 0.25,
      y: sleeve.origin.y - dir.y * 0.25,
      z: sleeve.origin.z,
    };
    const perpX = -dir.y;
    const perpY = dir.x;
    const cuffTop = evaluateGarmentGradientWorldT({ x: cuff.x + perpX * 0.06, y: cuff.y + perpY * 0.06, z: cuff.z }, sleeve, 0);
    const cuffBottom = evaluateGarmentGradientWorldT({ x: cuff.x - perpX * 0.06, y: cuff.y - perpY * 0.06, z: cuff.z }, sleeve, 0);

    expect(evaluateGarmentGradientWorldT(armhole, sleeve, 0)).toBeLessThan(evaluateGarmentGradientWorldT(cuff, sleeve, 0));
    expect(cuffTop).toBeCloseTo(cuffBottom);
  });
});
