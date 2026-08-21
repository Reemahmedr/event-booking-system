import mongoose from "mongoose";

const saveForLaterModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

saveForLaterModel.index({ user: 1, event: 1 }, { unique: true }); // same user cannot function the save for later for same event

const saveForLater = mongoose.model("saveForLater", saveForLaterModel);
export default saveForLater;
