// Налаштування Firebase Admin SDK
import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("firebase-key-dixium-ua-adminsdk.json", "utf8"),
);
const { FIREBASE_ID, FIREBASE_KEY } = process.env;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${FIREBASE_ID}.appspot.com`, // Firebase Storage
});

export const db = admin.firestore();
export const bucket = admin.storage().bucket();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
