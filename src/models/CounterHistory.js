import mongoose from "mongoose";

const counterHistorySchema = new mongoose.Schema(
  {
    counterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counter",
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    goal: {
      type: Number,
      required: true,
      min: 1,
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

counterHistorySchema.index({ counterId: 1, date: 1 }, { unique: true });
counterHistorySchema.index({ deviceId: 1, date: 1 });

const CounterHistory = mongoose.model("CounterHistory", counterHistorySchema);

export default CounterHistory;
