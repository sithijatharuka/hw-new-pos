import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";
import { sendSmsViaNotify } from "../services/notifySmsService.js";
import { toE164FromAny } from "../utils/phone.js";

// POST /api/otp/reset-password

// POST /api/otp/send
export const sendOtp = async (req, res) => {
  try {
    const { phone, purpose = "FORGOT_PASSWORD" } = req.body || {};
    console.log("[OTP] /send called with phone:", phone, "purpose:", purpose);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const phoneE164 = toE164FromAny(phone);
    console.log("[OTP] normalized phoneE164:", phoneE164);

    if (!phoneE164) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 300 * 1000); // 5 minutes
    console.log("[OTP] generated OTP:", otp, "expiresAt:", expiresAt);

    try {
      const otpDoc = await Otp.create({
        phone: phoneE164,
        otp: otp,
        purpose,
        expiresAt,
        used: false,
      });
      console.log("[OTP] saved OTP to DB:", otpDoc);
    } catch (err) {
      console.error("[OTP] ERROR saving OTP to DB:", err);
      if (err.errors) {
        for (const [field, error] of Object.entries(err.errors)) {
          console.error(`[OTP] Validation error for ${field}:`, error.message);
        }
      }
      return res.status(500).json({
        success: false,
        message: "Failed to save OTP to DB",
        error: err.message,
      });
    }

    const smsText = `Use ${otp} to verify your POS account. otp expires in 30 seconds.`;
    console.log("[OTP] calling sendSmsViaNotify...");

    await sendSmsViaNotify(phoneE164, smsText);

    console.log("[OTP] sendSmsViaNotify done, sending success response");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresInSeconds: 30,
    });
  } catch (err) {
    console.error("[OTP] Error in /api/otp/send:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// POST /api/otp/verify
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, purpose = "FORGOT_PASSWORD" } = req.body || {};
    console.log("[OTP] /verify called with phone:", phone, "purpose:", purpose);

    if (!phone || !otp) {
      console.log("1st error");
      return res.status(400).json({
        success: false,
        message: "Phone and otp are required",
      });
    }

    const phoneE164 = toE164FromAny(phone);
    if (!phoneE164) {
      console.log("2nd error");
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const now = new Date();
    const otpDoc = await Otp.findOne({
      phone: phoneE164,
      otp: String(otp),
      purpose,
      used: false,
      expiresAt: { $gt: now },
    });

    if (!otpDoc) {
      console.log("3rd error");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark as used
    otpDoc.used = true;
    await otpDoc.save();
    console.log("GBU mamey");
    console.log("1st success");
    return res.status(200).json({
      success: true,
      message: "OTP verified",
      phoneE164: phoneE164 || (otpDoc && otpDoc.phone) || null,
    });
  } catch (err) {
    console.log("last error");
    console.error("[OTP] Error in /api/otp/verify:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};
