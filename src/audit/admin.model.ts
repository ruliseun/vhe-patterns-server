import mongoose, { Schema } from "mongoose";

const AdminVerificationSchema: Schema<any> = new mongoose.Schema({
  email: {
    type: String,
    required: false,
  },
  uniqueCode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 10,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
});

AdminVerificationSchema.index({ email: 1 });
export const AdminVerificationModel = mongoose.model<any>("admin", AdminVerificationSchema);
