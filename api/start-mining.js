export default async function handler(req, res) {
  const { uid } = req.body;

  if (!uid) return res.status(400).json({ error: "UID is required" });

  const docRef = db.collection('users').doc(uid);
  const doc = await docRef.get();

  if (!doc.exists) return res.status(404).json({ error: "User not found" });

  const data = doc.data();
  const now = Date.now();
  const last = data.lastPressTime ? new Date(data.lastPressTime).getTime() : 0;
  const isPaid = data.paid;

  // Free users wait 24h
  if (!isPaid && now - last < 24 * 60 * 60 * 1000) {
    return res.status(403).json({ error: "Wait 24h" });
  }

  // Add 7 points = $1
  await docRef.update({
    points: (data.points || 0) + 7,
    lastPressTime: new Date().toISOString(),
  });

  return res.json({ success: true, newPoints: (data.points || 0) + 7 });
}
