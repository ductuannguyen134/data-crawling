import mongoose from "mongoose";
const { Schema } = mongoose;

const districtSchema = new Schema({
  city: { type: Schema.Types.ObjectId, ref: "City" },
  name: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  place_id: String,
});

export const DistrictModel = mongoose.model("District", districtSchema);
