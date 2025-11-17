import bcrypt from "bcrypt";

const password = "tntsadmin1"; // Replace with the password you want
const saltRounds = 10;

const hashPassword = async (password) => {
  const hashed = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:", hashed);
};

hashPassword(password);
