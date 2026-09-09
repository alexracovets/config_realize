import { deflateSync } from 'node:zlib';

type rgbColorType = readonly [number, number, number];

const CRC_TABLE = new Uint32Array(256);

for (let index = 0; index < 256; index += 1) {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  CRC_TABLE[index] = crc;
}

const crc32 = (buffer: Buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type: string, data: Buffer) => {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
};

const createSolidPng = (color: rgbColorType, size = 64) => {
  const [red, green, blue] = color;
  const raw = Buffer.alloc(size * (1 + size * 3));

  for (let row = 0; row < size; row += 1) {
    const rowStart = row * (1 + size * 3);
    raw[rowStart] = 0;
    for (let column = 0; column < size; column += 1) {
      const offset = rowStart + 1 + column * 3;
      raw[offset] = red;
      raw[offset + 1] = green;
      raw[offset + 2] = blue;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
};

const LOGO_COLORS: rgbColorType[] = [
  [220, 32, 32],
  [32, 180, 64],
  [32, 96, 220],
  [240, 200, 16],
  [200, 32, 200],
  [16, 200, 200],
  [240, 120, 16],
  [120, 48, 220],
  [16, 140, 240],
  [240, 240, 240],
];

const createLogoPngFile = (index: number) => {
  const fileName = `logo-${String(index + 1).padStart(2, '0')}.png`;
  return {
    name: fileName,
    mimeType: 'image/png',
    buffer: createSolidPng(LOGO_COLORS[index % LOGO_COLORS.length]!),
  };
};

export { createLogoPngFile, createSolidPng };
export type { rgbColorType };
