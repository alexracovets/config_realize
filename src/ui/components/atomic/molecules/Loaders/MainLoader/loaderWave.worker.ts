import { buildLoaderWavePath, WAVE_SPEED } from './buildLoaderWavePath';

type InitMessage = {
  type: 'init';
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  devicePixelRatio: number;
};

type ResizeMessage = {
  type: 'resize';
  width: number;
  height: number;
  devicePixelRatio: number;
};

type StopMessage = {
  type: 'stop';
};

type ReadyMessage = {
  type: 'ready';
};

type WorkerMessage = InitMessage | ResizeMessage | StopMessage;

type WorkerOutMessage = ReadyMessage;

let frameId = 0;
let animationStart = 0;
let canvas: OffscreenCanvas | null = null;
let context: OffscreenCanvasRenderingContext2D | null = null;
let cssWidth = 0;
let cssHeight = 0;
let devicePixelRatio = 1;
let hasPostedReady = false;

const postReadyOnce = () => {
  if (hasPostedReady) return;
  hasPostedReady = true;
  self.postMessage({ type: 'ready' } satisfies WorkerOutMessage);
};

const renderWave = (phase: number) => {
  if (!canvas || !context) return;

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform((cssWidth / 100) * devicePixelRatio, 0, 0, (cssHeight / 100) * devicePixelRatio, 0, 0);
  context.fillStyle = '#d2d2d2';
  context.fill(new Path2D(buildLoaderWavePath(phase)));
  postReadyOnce();
};

const tick = (now: number) => {
  if (!context) return;

  renderWave((now - animationStart) * WAVE_SPEED);
  frameId = requestAnimationFrame(tick);
};

const applyCanvasSize = (width: number, height: number, dpr: number) => {
  if (!canvas || !context) return;

  cssWidth = width;
  cssHeight = height;
  devicePixelRatio = dpr;
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
};

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  if (message.type === 'stop') {
    cancelAnimationFrame(frameId);
    frameId = 0;
    canvas = null;
    context = null;
    hasPostedReady = false;
    return;
  }

  if (message.type === 'resize') {
    applyCanvasSize(message.width, message.height, message.devicePixelRatio);
    return;
  }

  canvas = message.canvas;
  context = canvas.getContext('2d');

  if (!context) return;

  applyCanvasSize(message.width, message.height, message.devicePixelRatio);
  animationStart = performance.now();
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(tick);
};
