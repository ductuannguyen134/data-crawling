import axios from "axios";
import { CityModel } from "../model/City";

const cityCrawl = async (
  cityVariable: string,
  cityName: string,
  seenLocation: any[]
) => {
  if (seenLocation[cityVariable]) return;
  seenLocation[cityVariable] = true;
  const cityPlacesUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${cityVariable}&key=${process.env.GOOGLE_API_KEY_PLACES}`;
  const cityGeoLocationResponse = await axios.get(cityPlacesUrl);
  const cityPlaceId = cityGeoLocationResponse.data.results[0].place_id;
  const cityCoordinates =
    cityGeoLocationResponse.data.results[0].geometry.location;
  const formattedCity = {
    name: cityName,
    coordinates: cityCoordinates,
    place_id: cityPlaceId,
  };
  const newCity = Object.assign({}, formattedCity);
  CityModel.create(newCity);
  console.log("syncing...:", newCity);
};

export default cityCrawl;
