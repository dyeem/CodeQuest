import { auth, db } from "../config/firebaseAdmin.js";

// Verify Firebase ID token sent from frontend
export const verifyFirebaseToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    // Verify token with Firebase
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email;

    // Optional: Fetch admin profile from Firestore
    const adminDoc = await db.collection("admins").doc(email).get();
    if (!adminDoc.exists) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.admin = { email, ...adminDoc.data() };
    res.json({ admin: req.admin });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
