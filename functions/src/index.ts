/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {create, IPFSHTTPClient} from "ipfs-http-client";
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
export const addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({original: original});
  // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

/**
 * create an ipfs client
 * @return {IPFSHTTPClient}
 */
function createIpfsClient(): IPFSHTTPClient {
  const endpoint = new URL("https://ipfs.infura.io:5001");
  const auth =
    `Basic ${Buffer.from("IPFS_USERNAME:IPFS_PASSWORD").toString("base64")}`;
  return create({
    host: endpoint.host,
    port: Number(endpoint.port),
    protocol: endpoint.protocol,
    headers: {
      authorization: auth,
    },
  });
}


// Listens for new messages added to /messages/:documentId/original
// and creates an uppercase version of the message
// to /messages/:documentId/uppercase
export const makeUppercase = functions.firestore
  .document("/messages/{documentId}")
  .onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const original = snap.data().original;

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log("Uppercasing", context.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing asynchronous tasks inside
    // a Functions such as writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({uppercase}, {merge: true});
  });

  export const createIpfs = functions.https.onRequest(async (req, res) => {
    const client = createIpfsClient();
    logger.info(client);
  });

