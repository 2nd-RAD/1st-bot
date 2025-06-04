export default async function handler(req, res) {
  const { uid } = req.body;

  const docRef = db.collection('users').doc(uid);
  const doc = await docRef.get();

  if (!doc.exists) return res.status(404).json({ error: "User not found" });

  const data = doc.data();
  const points = data.points || 0;

  if (points < 7) return res.status(400).json({ error: "Not enough points to claim" });

  await docRef.update({
    points: 0,
    claimed: (data.claimed || 0) + points,
  });

  return res.json({ claimed: points });
}
