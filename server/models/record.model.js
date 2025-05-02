import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  artist: String,
  genre: String,
  mood: String,
  year: Number,
  price: Number,
  discogsId: String,
  collections: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Collection",
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Record = mongoose.model("Record", recordSchema);
export default Record;
