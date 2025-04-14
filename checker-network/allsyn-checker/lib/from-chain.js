import { bs58 } from "../vendor/deps.js";
import { assertOkResponse } from "./http-assertions.js";
import { bigintToUint8Array } from "./helpers.js";

/**
 * Fetches the size of the active_checks mapping from aleo chain
 *
 * @param {typeof globalThis.fetch} [fetch=globalThis.fetch]
 * @returns {Promise<bigint>}
 */
export const getActiveChecksMappingSize = async (fetch = globalThis.fetch) => {
  const res = await fetch(
    "http://localhost:3030/testnet/program/allsyn.aleo/mapping/active_checks_size/0u8",
    { method: "GET" },
  );
  await assertOkResponse(res, "Failed to retrieve active checks mapping size");
  // will be a number but with u64 suffixed "...u64"
  const u64String = await res.json();
  return BigInt(u64String.replace(/u64$/, ""));
};

/**
 * Fetches nft_commit for a specific active_check index
 *
 * @param {bigint} index of active_checks mapping to fetch
 * @param {typeof globalThis.fetch} [fetch=globalThis.fetch]
 * @returns {Promise<string>}
 */
export const getNftCommit = async (index, fetch = globalThis.fetch) => {
  const queryParam = index.toString() + "u64";
  const res = await fetch(
    `http://localhost:3030/testnet/program/allsyn.aleo/mapping/active_checks/${queryParam}`,
    { method: "GET" },
  );
  await assertOkResponse(res, "Failed to retrieve nft_commit");
  // will be a string but with field suffixed "...field"
  const field = await res.json();
  if (typeof field !== "string")
    throw new Error("Unable to fetch desired nft_commit.");
  return field;
};

/**
 * Fetches the irysTxId as base58 encoded string for the check receipt nft_commit (token_id)
 *
 * @param {string} nftCommit check receipt nft_commit (token_id)
 * @param {typeof globalThis.fetch} [fetch=globalThis.fetch]
 * @returns {Promise<string>}
 */
export const getIrysTxId = async (nftCommit, fetch = globalThis.fetch) => {
  const res = await fetch(
    `http://localhost:3030/testnet/program/allsyn.aleo/mapping/receipt_data/${nftCommit}`,
    { method: "GET" },
  );
  await assertOkResponse(res, "Failed to retrieve receipt data");
  // will be a string but with field suffixed "...field"
  const data = await res.json();
  if (typeof data !== "string")
    throw new Error("Unable to fetch desired receipt data");
  const regex = /\d+u128/g;
  const matches = data.match(regex);
  const irysTxId = matches.map((m) => BigInt(m.replace(/u128$/, "")));
  const irysTxIdBytes = new Uint8Array(32);
  irysTxId.forEach((bi, i) => {
    irysTxIdBytes.set(bigintToUint8Array(bi), i * 16);
  });
  return bs58.encode(irysTxIdBytes);
};

/**
 * Load the nft metadata from irys
 *
 * @param {string} bs58IrysTxId  base58 encoded irys tx id
 * @param {typeof globalThis.fetch} [fetch=globalThis.fetch]
 * @returns {Promise<{subject: {scheme: "https", authority: {host: string, port?: number}, path?: string, query?: string, fragment?: string}, keys: {port?: boolean, status?: number}}>}
 */
export const loadMetadataFromIrys = async (
  bs58IrysTxId,
  fetch = globalThis.fetch,
) => {
  const res = await fetch(`https://gateway.irys.xyz/${bs58IrysTxId}`, {
    method: "GET",
  });
  await assertOkResponse(res, "Failed to retrieve metadata from irys.");
  // will be a string but with field suffixed "...field"
  return await res.json();
};
