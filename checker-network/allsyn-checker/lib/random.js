import { randomBytes } from "../vendor/deps.js";

/**
 * Picks a random bigint between min and max (inclusive) using @stablelib/random.
 *
 * @param {bigint} min - Lower bound of the range.
 * @param {bigint} max - Upper bound of the range.
 * @returns {bigint} - A random big integer between min and max.
 */
export const randomBigInt = (min, max) => {
  min = BigInt(min);
  max = BigInt(max);

  if (min > max) {
    throw new Error(
      "Minimum value must be less than or equal to the maximum value",
    );
  }

  const range = max - min + 1n;

  // Determine the number of bytes needed to represent the range
  const bytesNeeded = Math.ceil(range.toString(2).length / 8);

  let randomValue;
  while (true) {
    // Generate cryptographically secure random bytes
    const randomBytesArray = randomBytes(bytesNeeded);

    // Convert random bytes to a BigInt
    randomValue = BigInt(
      "0x" +
        Array.from(randomBytesArray, (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join(""),
    );

    if (randomValue < range) {
      break;
    }
  }

  return min + randomValue;
};
