import { db } from "../config/firebaseAdmin.js";

// Fetch all users from Firestore
export const getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    
    if (usersSnapshot.empty) {
      return res.status(200).json([]);
    }

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
