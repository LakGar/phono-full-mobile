import mongoose from "mongoose";

const userRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    record: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: true,
    },
    storageLocation: {
      type: String,
      required: false,
      trim: true,
    },
    condition: {
      type: String,
      enum: ["Mint", "Near Mint", "Very Good", "Good", "Fair", "Poor"],
      required: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
    },
    isForSale: {
      type: Boolean,
      default: false,
    },
    askingPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can't have duplicate records
userRecordSchema.index({ user: 1, record: 1 }, { unique: true });

const UserRecord = mongoose.model("UserRecord", userRecordSchema);

export default UserRecord;
