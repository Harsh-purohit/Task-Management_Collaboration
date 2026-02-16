import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import sendEmail from "../utils/sendEmail.js";
import { authLoginsTotal, authRegistersTotal } from "../metrics/index.js";

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      authRegistersTotal.inc({ role: role || "unknown", status: "error" });
      return res.status(400).json({ message: "Email and Password required.." });
    }

    const hashPwd = await bcrypt.hash(password, 10);

    // Admin registration is stored in Admin collection.
    if (role === "admin") {
      const admin = await Admin.create({
        name,
        email,
        password: hashPwd,
      });
      await admin.save();

      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "10d",
      });

      sendEmail({
        to: admin.email,
        subject: `Welcome ${admin.name} to WorkSync 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
            <h2 style="color:#2563eb;">Welcome to WorkSync, ${admin.name}! 🎉</h2>
      
            <p style="font-size:14px; color:#374151;">
              Your account has been successfully created.
            </p>

            <p style="font-size:14px; color:#374151;">
              You can now log in and start managing your <b>projects, tasks, and teams</b> efficiently.
            </p>

            <div style="margin:20px 0;">
              <a href="${process.env.FRONTEND_URL}/login"
                style="background:#2563eb; color:white; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block;">
                Login to Dashboard
              </a>
            </div>

            <p style="font-size:13px; color:#6b7280;">
              Need help? Just reply to this email — we’re here for you.
            </p>

            <hr style="margin-top:20px"/>

            <p style="font-size:12px; color:#9ca3af;">
              © ${new Date().getFullYear()} WorkSync. All rights reserved.
            </p>
          </div>
        `,
      });

      // Successful register metric for admin path.
      authRegistersTotal.inc({ role: "admin", status: "success" });
      return res.json({
        token,
        admin,
        role,
      });
    }

    // Default register path stores account in User collection.
    const user = await User.create({
      name,
      email,
      password: hashPwd,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    res.cookie("token", token, {
      httpOnly: true, // cannot access via JS (security)
      secure: false, // true in production (https)
      sameSite: "lax",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    sendEmail({
      to: user.email,
      subject: `Welcome ${user.name} to WorkSync 🎉`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
            <h2 style="color:#2563eb;">Welcome to WorkSync, ${user.name}! 🎉</h2>
      
            <p style="font-size:14px; color:#374151;">
              Your account has been successfully created.
            </p>

            <p style="font-size:14px; color:#374151;">
              You can now log in and start managing your <b>projects, tasks, and teams</b> efficiently.
            </p>

            <div style="margin:20px 0;">
              <a href="${process.env.FRONTEND_URL}/login"
                style="background:#2563eb; color:white; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block;">
                Login to Dashboard
              </a>
            </div>

            <p style="font-size:13px; color:#6b7280;">
              Need help? Just reply to this email — we’re here for you.
            </p>

            <hr style="margin-top:20px"/>

            <p style="font-size:12px; color:#9ca3af;">
              © ${new Date().getFullYear()} WorkSync. All rights reserved.
            </p>
          </div>
        `,
    });

    // Successful register metric for user path.
    authRegistersTotal.inc({ role: role || "user", status: "success" });
    return res.json({
      token,
      user,
      role,
    });
  } catch (err) {
    console.log(err);
    // Catch-all register failure metric.
    authRegistersTotal.inc({
      role: req?.body?.role || "unknown",
      status: "error",
    });
    return res.status(500).json({ message: err?.message || "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);

    if (!email || !password) {
      authLoginsTotal.inc({ role: "unknown", status: "error" });
      return res.status(400).json({ message: "email & password required" });
    }

    // Check user collection first; fallback to admin collection.
    let role;
    let user_or_admin = await User.findOne({ email, isDeleted: false }).lean();
    if (user_or_admin) role = "user";

    if (!user_or_admin) {
      user_or_admin = await Admin.findOne({ email }).lean();
      role = "admin";
    }
    // console.log(user_or_admin);
    // console.log(role);

    if (!user_or_admin) {
      authLoginsTotal.inc({ role: "unknown", status: "error" });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user_or_admin.password);
    if (!ok) {
      authLoginsTotal.inc({ role: role || "unknown", status: "error" });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user_or_admin._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "10d",
    });

    res.cookie("token", token, {
      httpOnly: true, // cannot access via JS (security)
      secure: false, // true in production (https)
      sameSite: "lax",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    // Successful login metric with resolved role.
    authLoginsTotal.inc({ role: role || "unknown", status: "success" });
    return res.json({
      token,
      user_or_admin,
      role,
    });
  } catch (err) {
    // Catch-all login failure metric.
    authLoginsTotal.inc({ role: "unknown", status: "error" });
    return res.status(500).json({ message: "Server error" });
  }
};

export { register, login };
