import mongoose, { Schema } from "mongoose";

const OTPVerificationSchema: Schema<any> = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  otp: {
    type: String,
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  isTestMode: {
    type: Boolean,
    default: false,
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now,
  //   expires: 60 * 5,
  // },
  expiresAt: { type: Date, default: null },
});

OTPVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPVerificationModel = mongoose.model<any>("otp", OTPVerificationSchema);
