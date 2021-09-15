import axios from "axios";
import { CityModel } from "../model/City";
import { DistrictModel } from "../model/Districts";

const districtCrawl = async (
  districtVariable: string,
  cityVariable: string,
  districtName: string,
  seenLocation: any[]
) => {
  if (seenLocation[districtVariable]) return;
  seenLocation[districtVariable] = true;
  const cityPlacesUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${cityVariable}&key=${process.env.GOOGLE_API_KEY_PLACES}`;
  const cityGeoLocationResponse = await axios.get(cityPlacesUrl);
  const cityPlaceId = cityGeoLocationResponse.data.results[0].place_id;

  const districtPlacesUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${districtVariable}&key=${process.env.GOOGLE_API_KEY_PLACES}`;
  const districtGeoLocationResponse = await axios.get(districtPlacesUrl);
  const districtCoordinates =
    districtGeoLocationResponse.data.results[0].geometry.location;
  const districtPlaceId = districtGeoLocationResponse.data.results[0].place_id;

  const city = await CityModel.findOne({
    place_id: cityPlaceId,
  }).exec();
  console.log(city?.id, districtVariable, cityVariable);
  const formattedDistrict = {
    name: districtName,
    city: city?.id,
    coordinates: districtCoordinates,
    place_id: districtPlaceId,
  };
  const newDistrict = Object.assign({}, formattedDistrict);
  DistrictModel.create(newDistrict);
  console.log("syncing...: ", newDistrict);
};

export default districtCrawl;
