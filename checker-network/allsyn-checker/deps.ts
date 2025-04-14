// 3rd-party dependencies from Denoland
//
// Run the following script after making change in this file:
//   deno bundle deps.ts vendor/deno-deps.js
//
// You must use a 1.x version of Deno, e.g. v1.43.1
//
// Deno Bundle does not support npm dependencies, we have to load them via CDN
export { default as bs58 } from "bs58";
export { randomBytes } from "@stablelib/random";
