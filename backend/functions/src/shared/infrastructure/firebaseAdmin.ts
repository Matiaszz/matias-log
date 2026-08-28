import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const firebaseAdminAuth = admin.auth();
export const firestoreDb = admin.firestore();
export const firebaseStorage = admin.storage();

export default admin;
