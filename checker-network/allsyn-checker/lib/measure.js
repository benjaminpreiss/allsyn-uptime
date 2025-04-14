import pTimeout from "../vendor/p-timeout.js";
import { RETRIEVE_TIMEOUT } from "./constants.js";
// import { net } from "../vendor/deps.js";

// This doesnt work sadly, due to restrictions in zinnia

// const testPort = (host, port) => {
//   return new Promise((resolve, reject) => {
//     const socket = new net.Socket();

//     const timeout = 2000; // 2 seconds
//     socket.setTimeout(timeout);

//     socket.on("connect", () => {
//       socket.destroy();
//       resolve(true); // Port is open
//     });

//     socket.on("error", (err) => {
//       reject(err); // Port is not open
//     });

//     socket.on("timeout", () => {
//       socket.destroy();
//       reject(new Error("Request timed out")); // Timeout indicates port is likely not open
//     });

//     socket.connect(port, host);
//   });
// };

const deducePort = (metadata) => {
  if (metadata.subject.authority.port !== undefined)
    return metadata.subject.authority.port;
  if (metadata.subject.scheme === "https") return 443;
};

// export const measurePort = async (metadata) => {
//   const subjectJson = JSON.stringify(metadata.subject);
//   const deducedPort = deducePort(metadata);
//   try {
//     // test port
//     if (deducedPort && metadata.subject.authority.host) {
//       console.log(
//         `Testing port ${deducedPort} on ${metadata.subject.authority.host}`,
//       );
//       await pTimeout(testPort(metadata.subject.authority.host, deducedPort), {
//         milliseconds: RETRIEVE_TIMEOUT,
//       });
//       return {
//         checkKey: "port",
//         checkSubject: subjectJson,
//         success: true,
//         result: "",
//         averageable: false,
//       };
//     }
//     console.log(
//       `Success for port ${deducedPort} on ${metadata.subject.authority.host}.`,
//     );
//   } catch (err) {
//     console.log(
//       `Error for port ${deducedPort} on ${metadata.subject.authority.host}: ${err}`,
//     );
//     return {
//       checkKey: "port",
//       checkSubject: subjectJson,
//       success: false,
//       result: "",
//       averageable: false,
//     };
//   }
// };

export const measureStatus = async (metadata, fetch = globalThis.fetch) => {
  const subjectJson = JSON.stringify(metadata.subject);
  try {
    if (metadata.keys.status) {
      const port = metadata.subject.authority.port
        ? ":" + metadata.subject.authority.port
        : "";
      const url =
        metadata.subject.scheme +
        "://" +
        metadata.subject.authority.host +
        port +
        (metadata.subject.path ?? "") +
        (metadata.subject.query ?? "") +
        (metadata.subject.fragment ?? "");
      console.log(
        `Testing url ${url} for status code ${metadata.keys.status}.`,
      );
      const response = await pTimeout(fetch(url), {
        milliseconds: RETRIEVE_TIMEOUT,
      });
      console.log(`Tested url ${url} for status code ${metadata.keys.status}.`);
      return {
        checkKey: "status",
        checkSubject: subjectJson,
        success: response.status === metadata.keys.status,
        result: response.status,
        averageable: false,
      };
    }
  } catch (err) {
    return {
      checkKey: "status",
      checkSubject: subjectJson,
      success: false,
      result: err.message,
      averageable: false,
    };
  }
};

/**
 * Performs a retrieval for given node and blob and returns measurement results.
 *
 * @param {{subject: {scheme: "https", authority: {host: string, port?: number}, path?: string, query?: string, fragment?: string}, keys: {port?: boolean, status?: number}}} metadata
 * @param {typeof globalThis.fetch} fetch
 * @returns {Promise<{checkKey: "status"|"port",checkSubject: string, success: boolean, result: string | number, averageable: boolean }[]> }
 */
export const measure = async (metadata, fetch = globalThis.fetch) => {
  //const portMeasurement = await measurePort(metadata);
  const statusMeasurement = await measureStatus(metadata, fetch);
  return statusMeasurement ? [statusMeasurement] : [];
};
