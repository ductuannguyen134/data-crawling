import mongoose from "mongoose";
const { Schema } = mongoose;

const citySchema = new Schema({
  name: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  place_id: String,
});

export const CityModel = mongoose.model("City", citySchema);
