/**
 * converts a passed bigint to Uint8Array
 *
 * @param {bigint} bigint
 * @returns {Uint8Array}
 */
export const bigintToUint8Array = (bigint) => {
  // This uses little-endian format
  const byteArray = [];
  while (bigint > 0) {
    byteArray.push(Number(bigint % 256n));
    bigint = bigint / 256n;
  }
  return Uint8Array.from(byteArray.reverse()); // reverse to big-endian for encoding
};
