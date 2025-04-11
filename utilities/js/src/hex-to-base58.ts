import bs58 from "bs58";

/**
 * Converts a hexadecimal string to base58 encoding
 *
 * @returns The base58 encoded string
 */
export function hexToBase58(): string {
  // Get the HEX_STRING from environment variables
  const hexString = process.env.HEX_STRING;

  // Check if HEX_STRING is defined
  if (!hexString) {
    throw new Error("HEX_STRING environment variable is not defined");
  }

  // Convert the hex string to a Buffer
  const buffer = Buffer.from(hexString, "hex");

  // Convert the Buffer to base58
  const base58String = bs58.encode(buffer);

  return base58String;
}

// Export a function that both converts and logs the result
export function convertAndLog(): void {
  try {
    const base58Result = hexToBase58();
    console.log(`Base58 result: ${base58Result}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

convertAndLog();
