/* global Zinnia */

import { measure } from "./lib/measure.js";
import { MEASUREMENT_DELAY } from "./lib/constants.js";
import { randomBigInt } from "./lib/random.js";
import { submit } from "./lib/submit-measurement.js";
import {
  getActiveChecksMappingSize,
  getIrysTxId,
  getNftCommit,
  loadMetadataFromIrys,
} from "./lib/from-chain.js";

while (true) {
  try {
    const activeChecksMappingSize = await getActiveChecksMappingSize();
    // fake randomness - we just pick the last element always
    const pickedCheck = randomBigInt(0n, activeChecksMappingSize - 1n);
    // retrieve nft commit
    const nftCommit = await getNftCommit(pickedCheck);
    // retrieve irys tx id as base58 encoded
    const irysTxIdBs58 = await getIrysTxId(nftCommit);
    // load metadata from irys
    const metadata = await loadMetadataFromIrys(irysTxIdBs58);
    const measurement = await measure(metadata);
    console.log("measurement:", measurement);
    await submit(measurement);
    Zinnia.jobCompleted();
  } catch (err) {
    console.error("Error:", err);
  }

  console.log(`Waiting ${MEASUREMENT_DELAY / 1_000} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, MEASUREMENT_DELAY));
}
