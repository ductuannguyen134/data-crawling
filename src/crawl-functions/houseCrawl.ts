import axios from "axios";
import { DistrictModel } from "../model/Districts";
import { HouseModel } from "../model/House";

const houseCrawl = async (house: any, districtVariable: string) => {
  const districtPlacesUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${districtVariable}&key=${process.env.GOOGLE_API_KEY_PLACES}`;
  const districtGeoLocationResponse = await axios.get(districtPlacesUrl);
  const districtPlaceId = districtGeoLocationResponse.data.results[0].place_id;

  const district = await DistrictModel.findOne({
    place_id: districtPlaceId,
  }).exec();

  const location = { location: district?._id };
  const newHouse = Object.assign({}, house, location);
  HouseModel.create(newHouse);
  console.log("syncing... ", newHouse);
};

export default houseCrawl;
