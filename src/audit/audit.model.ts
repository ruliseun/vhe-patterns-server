import mongoose, { Schema } from "mongoose";

const AuditLogSchema: Schema<any> = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    params: {
      type: String,
      required: false,
    },
    query: {
      type: String,
      required: false,
    },
    payload: {
      type: String,
      required: false,
    },
    initiator: {
      type: String,
      required: false,
    },
    response: {
      type: String,
      required: true,
    },
    orgId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: {
      currentTime: () => new Date().valueOf(),
    },
  },
);
export const AuditTrailModel = mongoose.model<any>("audit-logs", AuditLogSchema);
