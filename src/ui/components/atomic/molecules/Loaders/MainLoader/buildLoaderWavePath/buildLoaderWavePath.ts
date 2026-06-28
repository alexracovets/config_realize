const PATH_SAMPLES = 80;
const WAVE_AMPLITUDE = 3;
const WAVE_SPEED = 0.0022;
const WAVE_CYCLES = 2;
const TAU = Math.PI * 2;

const X_MIN = -3;
const X_MAX = 106;
const X_SPAN = X_MAX - X_MIN;

const buildBaseY = (t: number): number => {
  const rise = 1 - Math.pow(1 - t, 2.35);
  const y = 103 - rise * 53;
  const inflection = Math.sin(t * Math.PI) * 10 * (1 - t * 0.32);

  return y - inflection;
};

const buildLoaderWavePath = (phase: number): string => {
  const loopPhase = phase % TAU;
  const segments: string[] = [];

  for (let i = 0; i <= PATH_SAMPLES; i++) {
    const t = i / PATH_SAMPLES;
    const x = X_MIN + t * X_SPAN;
    const normalizedX = (x - X_MIN) / X_SPAN;
    const wave = Math.sin(TAU * WAVE_CYCLES * normalizedX - loopPhase) * WAVE_AMPLITUDE;
    const y = buildBaseY(t) + wave;

    segments.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  return `${segments.join(' ')} L ${X_MAX} 106 L ${X_MIN} 106 Z`;
};

export { buildLoaderWavePath, WAVE_SPEED };
