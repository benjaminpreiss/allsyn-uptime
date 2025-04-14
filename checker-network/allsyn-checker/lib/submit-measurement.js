import { assertOkResponse } from "./http-assertions.js";
/**
 *
 * @param {{checkKey: string, checkSubject: string, success: boolean, result: string, averageable: boolean}[]} measurements
 * @param {typeof globalThis.fetch} fetch
 */
export const submit = async (measurements, fetch = globalThis.fetch) => {
  const promises = measurements.map(async (measurement) => {
    const res = await fetch("http://127.0.0.1:8080/v2/allsyn/measurement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(measurement),
    });
    await assertOkResponse(res, "Failed to submit measurement");
  });
  await Promise.all(promises);
  // const res1 = await fetch("http://127.0.0.1:8080/v2/allsyn/measurement", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(measurement[0]),
  // });
  // await assertOkResponse(res1, "Failed to submit measurement 1");
  // const res2 = await fetch("http://127.0.0.1:8080/v2/allsyn/measurement", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(measurement[1]),
  // });
  // await assertOkResponse(res2, "Failed to submit measurement 2");
};
