import mongoose, { Schema, Document } from "mongoose";
import { VerificationTypeEnum } from "../enums/user-type.enum";

// Interface for TypeScript typing
export interface IVerification extends Document {
  type: VerificationTypeEnum;
  email: string;
  code?: string;
  is_valid: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const VerificationsSchema: Schema<IVerification> = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(VerificationTypeEnum), // Fix: Directly use enum values
      default: VerificationTypeEnum.EMAIL,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Ensures case-insensitive email handling
    },
    code: {
      type: String,
      required: false,
    },
    is_valid: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // Set expiration 5 minutes from now
      index: { expires: "5m" }, // TTL Index for automatic deletion
    },
    // expiresAt: {
    //   type: Date,
    //   default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   index: { expires: "7d" },
    // },
  },
  { timestamps: false }, // Disable automatic `createdAt` & `updatedAt` if not needed
);

export const VerificationsModel = mongoose.model<IVerification>("verifications", VerificationsSchema);
