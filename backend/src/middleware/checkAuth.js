import Admin from "../models/Admin.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    // console.log("Received Token:", auth);

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }
    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    req.userId = decoded.id;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const userAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    // console.log("Received Token:", auth);

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }
    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { adminAuth, userAuth };
