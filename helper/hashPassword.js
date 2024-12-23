import bcrypt from "bcrypt";
export const hashedPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

export const comparePassword = async (password, hashPassword) => {
  try {
    const match = await bcrypt.compare(password, hashPassword);
    return match;
  } catch (error) {
    console.error("Error comparing password:", error);
  }
};
