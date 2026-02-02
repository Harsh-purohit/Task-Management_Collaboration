import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    // 🔥 WHO did it
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "actorModel",
    },

    actorModel: {
      type: String,
      required: true,
      enum: ["user", "admin"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
    },

    // 🔥 WHAT happened
    action: {
      type: String,
      required: true, // created, updated, deleted, etc
    },

    // 🔥 ON WHAT
    entity: {
      type: String, // project, task, comment
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    message: String,

    metadata: Object,
  },
  { timestamps: true },
);

export default mongoose.model("ActivityLog", activityLogSchema);
