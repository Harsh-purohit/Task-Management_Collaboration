import Admin from "../models/Admin.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const verifyToken = (req) => {
  const token = req.cookies.token;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export const adminAuth = async (req, res, next) => {
  const decoded = verifyToken(req);

  if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });

  const admin = await Admin.findById(decoded.id);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });

  req.userId = admin._id;
  req.role = "admin";

  next();
};

export const userAuth = async (req, res, next) => {
  const decoded = verifyToken(req);

  if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  req.userId = user._id;
  req.role = "user";

  next();
};

export const bothAuth = async (req, res, next) => {
  const decoded = verifyToken(req);

  if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });

  const admin = await Admin.findById(decoded.id);
  const user = await User.findById(decoded.id);

  if (!admin && !user) return res.status(401).json({ message: "Unauthorized" });

  // console.log(decoded.id)
  req.userId = decoded.id;
  req.role = admin ? "admin" : "user";

  next();
};

// import Admin from "../models/Admin.js";
// import User from "../models/User.js";
// import jwt from "jsonwebtoken";

// const adminAuth = async (req, res, next) => {
//   try {
//     // const auth = req.headers.authorization;
//     const auth = req.cookies.token;

//     // console.log("Received Token:", auth);

//     if (!auth || !auth.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Missing token" });
//     }
//     const token = auth.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // console.log("Decoded Token:", decoded);

//     if (!decoded || !decoded.id) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }

//     const admin = await Admin.findById(decoded.id);
//     if (!admin) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     req.userId = decoded.id;

//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// const userAuth = async (req, res, next) => {
//   try {
//     // const auth = req.headers.authorization;
//     const auth = req.cookies.token;

//     // console.log("Received Token:", auth);

//     if (!auth || !auth.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Missing token" });
//     }
//     const token = auth.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // console.log("Decoded Token:", decoded);

//     if (!decoded || !decoded.id) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     req.userId = decoded.id;
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// const bothAuth = async (req, res, next) => {
//   try {
//     // const auth = req.headers.authorization;
//     const auth = req.cookies.token;

//     // console.log("Received Token:", auth);
//     if (!auth || !auth.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Missing token" });
//     }
//     const token = auth.split(" ")[1];
//     // console.log("Token:", token);
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // console.log("Decoded Token:", decoded.id);
//     if (!decoded || !decoded.id) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     const admin = await Admin.findById(decoded.id);
//     const user = await User.findById(decoded.id);
//     // console.log("Admin:", admin);
//     // console.log("User:", user);
//     if (!admin && !user) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }
//     req.userId = decoded.id;
//     // console.log("User ID:", req.userId);
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// export { adminAuth, userAuth, bothAuth };
