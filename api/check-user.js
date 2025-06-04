import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const db = getFirestore();

export default async function handler(req, res) {
  const { uid } = req.query;

  if (!uid) return res.status(400).json({ error: "UID is required" });

  const docRef = db.collection('users').doc(uid);
  const doc = await docRef.get();

  if (!doc.exists) {
    // Create free user by default
    await docRef.set({
      paid: false,
      points: 0,
      claimed: 0,
      lastPressTime: null,
    });
    return res.json({ uid, paid: false });
  }

  return res.json(doc.data());
}
