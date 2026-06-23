import type { composePrintAtlasFboInputType, designPatternItemType, printAtlasConfigType } from '@types';
import {
  Color,
  LinearFilter,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  Uniform,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

import { printAtlasTintFragmentShader, printAtlasTintVertexShader } from '@shaders';
import { imageToTexture } from '../../garmentPrint/imageToTexture';

class PrintAtlasFbo {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: OrthographicCamera;
  private readonly material: ShaderMaterial;
  private readonly mesh: Mesh;
  private readonly renderTarget: WebGLRenderTarget;

  constructor(renderer: WebGLRenderer, size: printAtlasConfigType) {
    this.renderer = renderer;
    this.renderTarget = new WebGLRenderTarget(size.width, size.height, {
      format: RGBAFormat,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.renderTarget.texture.colorSpace = SRGBColorSpace;
    this.renderTarget.texture.flipY = false;

    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.material = new ShaderMaterial({
      vertexShader: printAtlasTintVertexShader,
      fragmentShader: printAtlasTintFragmentShader,
      uniforms: {
        uMap: new Uniform<Texture | null>(null),
        uTint: new Uniform(new Color(0xffffff)),
        uOpacity: new Uniform(1),
        uUseTint: new Uniform(0),
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material);
    this.scene.add(this.mesh);
  }

  get texture() {
    return this.renderTarget.texture;
  }

  async compose(input: composePrintAtlasFboInputType) {
    const { width, height } = input.atlasSize;

    if (this.renderTarget.width !== width || this.renderTarget.height !== height) {
      this.renderTarget.setSize(width, height);
    }

    const previousTarget = this.renderer.getRenderTarget();

    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();

    if (input.activePattern) {
      await this.drawPattern(input.activePattern, input.patternColors, input.activeOpacity, true);
    }

    if (input.defaultPattern) {
      await this.drawPattern(input.defaultPattern, {}, 1, false);
    }

    this.renderer.setRenderTarget(previousTarget);

    return this.renderTarget.texture;
  }

  private async drawPattern(pattern: designPatternItemType, colors: Record<string, string>, opacity: number, allowTint: boolean) {
    for (const part of pattern.parts) {
      const map = await imageToTexture(part.src);
      map.colorSpace = NoColorSpace;

      const tintColor = colors[part.key];
      const useTint = allowTint && Boolean(tintColor);

      this.material.uniforms.uMap.value = map;
      this.material.uniforms.uOpacity.value = opacity;
      this.material.uniforms.uUseTint.value = useTint ? 1 : 0;

      if (useTint && tintColor) {
        this.material.uniforms.uTint.value.set(tintColor);
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.renderTarget.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}

export { PrintAtlasFbo };
