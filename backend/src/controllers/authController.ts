import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const generateToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: "7d"
  });

export const register = async (req: any, res: any) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashed });

  res.json({ token: generateToken(user._id.toString(), user.role) });
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  res.json({ token: generateToken(user._id.toString(), user.role) });
};