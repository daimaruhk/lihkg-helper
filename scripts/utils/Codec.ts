import { compressToBase64, decompressFromBase64 } from 'lz-string';

export class Codec {
  public static encode(input: string) {
    return compressToBase64(input);
  }

  public static decode(input: string) {
    return decompressFromBase64(input);
  }
}