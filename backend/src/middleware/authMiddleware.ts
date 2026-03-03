import jwt from "jsonwebtoken";

export const protect = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
};