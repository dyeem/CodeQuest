import { db } from "../config/firebaseAdmin.js";
import { comparePassword, generateToken } from "../utils/auth.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const adminQuery = await db
        .collection("admins")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (adminQuery.empty) {
        return res.status(404).json({ message: "Admin not found" });
    }

    const adminData = adminQuery.docs[0].data();

    const match = await comparePassword(password, adminData.password);
    if (!match) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = generateToken(email);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentAdmin = async (req, res) => {
  try {
    const email = req.admin.email;

    const adminQuery = await db
      .collection("admins")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (adminQuery.empty) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const adminData = adminQuery.docs[0].data();

    delete adminData.password;

    return res.json({ admin: adminData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
