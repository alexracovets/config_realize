import type { Page } from '@playwright/test';

const FATAL_CONSOLE_PATTERN = /ERROR:\s*0:|Program Info Log|THREE\.WebGLProgram|Cannot read|undefined is not|shader compile|fragment shader|vertex shader/i;

const installWebglShaderTraps = () => {
  const patchContext = (prototype: WebGLRenderingContextBase | undefined) => {
    if (!prototype || (prototype as WebGLRenderingContextBase & { __logoShaderPatched?: boolean }).__logoShaderPatched) return;

    (prototype as WebGLRenderingContextBase & { __logoShaderPatched?: boolean }).__logoShaderPatched = true;

    const { compileShader, linkProgram } = prototype;

    prototype.compileShader = function compileShaderWithLog(shader: WebGLShader) {
      compileShader.call(this, shader);
      if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
        console.error(`ERROR: 0: shader compile failed\n${this.getShaderInfoLog(shader) ?? ''}`);
      }
    };

    prototype.linkProgram = function linkProgramWithLog(program: WebGLProgram) {
      linkProgram.call(this, program);
      if (!this.getProgramParameter(program, this.LINK_STATUS)) {
        console.error(`Program Info Log\n${this.getProgramInfoLog(program) ?? ''}`);
      }
    };
  };

  patchContext(WebGLRenderingContext.prototype);
  patchContext(WebGL2RenderingContext.prototype);
};

const attachShaderErrorGuard = async (page: Page) => {
  const fatalMessages: string[] = [];

  await page.addInitScript(installWebglShaderTraps);

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (FATAL_CONSOLE_PATTERN.test(text)) fatalMessages.push(text);
  });

  page.on('pageerror', (error) => {
    fatalMessages.push(error.message);
  });

  return {
    getFatalMessages: () => fatalMessages,
    assertClean: () => {
      if (fatalMessages.length === 0) return;
      throw new Error(`Shader or runtime errors:\n${fatalMessages.join('\n')}`);
    },
  };
};

export { attachShaderErrorGuard };
