import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
      default: "apps-outline",
    },
    color: {
      type: String,
      required: true,
      trim: true,
      default: "#2563EB",
    },
    dailyGoal: {
      type: Number,
      required: true,
      min: 1,
    },
    currentValue: {
      type: Number,
      min: 0,
      required: true,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

counterSchema.index({ deviceId: 1, isArchived: 1 });
counterSchema.index({ deviceId: 1, createdAt: -1 });

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
