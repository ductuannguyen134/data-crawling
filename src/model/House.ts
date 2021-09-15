import mongoose from "mongoose";
const { Schema } = mongoose;

const houseSchema = new Schema({
  title: String,
  price: {
    required: false,
    type: Number,
  },
  area: {
    value: Number,
    unit: String,
  },
  date: String,
  location: { type: Schema.Types.ObjectId, ref: "Location" },
  url: String,
  unixTime: Date,
});

export const HouseModel = mongoose.model("House", houseSchema);
