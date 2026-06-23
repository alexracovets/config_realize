declare module 'utif' {
  interface TiffIfd {
    width: number;
    height: number;
    [key: string]: unknown;
  }

  interface UtifApi {
    decode(buffer: ArrayBuffer): TiffIfd[];
    decodeImage(buffer: ArrayBuffer, ifd: TiffIfd): void;
    toRGBA8(ifd: TiffIfd): Uint8Array;
  }

  const UTIF: UtifApi;
  export default UTIF;
}
