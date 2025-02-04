// Firebase Admin SDK settings
import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The Render.com put secret file in /etc/secrets/
// For local run secret file in /gitignore
const renderSecretPath = "/etc/secrets/dixiumFirebaseKeyAdminSdk.json";
const localSecretPath = path.join(
  __dirname,
  "secrets",
  "dixiumFirebaseKeyAdminSdk.json",
);

const firebaseKeyJson = existsSync(renderSecretPath)
  ? renderSecretPath
  : localSecretPath;

// Reading key
const serviceAccount = JSON.parse(readFileSync(firebaseKeyJson, "utf8"));

const { FIREBASE_ID } = process.env;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${FIREBASE_ID}.appspot.com`, // Firebase Storage
});

// Експортуємо Firestore і Storage Bucket
export const db = admin.firestore();
export const bucket = admin.storage().bucket();
