require("dotenv").config();
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import mongoose, { Schema } from "mongoose";
import { HouseModel } from "./model/House";
import { DistrictModel } from "./model/Districts";
import { CityModel } from "./model/City";
import cityCrawl from "./crawl-functions/cityCrawl";
import districtCrawl from "./crawl-functions/districtCrawl";
import houseCrawl from "./crawl-functions/houseCrawl";

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dngkg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to Mongoose");
  });

const seenUrls: any = {};
const ROOT_LINK = "https://muaban.net/ban-nha-toan-quoc-l0-c32";

const removeDecimalPoints = (num: string) => {
  return num.replace(".", "").replace(",", "");
};

const getUrl = (link: string) => {
  if (link.includes("https://") || link.includes("http://")) {
    return link;
  } else if (link.startsWith("https://") || link.startsWith("http://")) {
    return `${ROOT_LINK}${link}`;
  } else {
    return `${ROOT_LINK}${link}`;
  }
};

const formatPrice = (price: string) => {
  if (!price) return null;
  let billions = 0;
  let millions = 0;
  let thousands = 0;
  const priceItems = price.split(" ");
  for (let i = 0; i < priceItems.length; i++) {
    if (priceItems[i + 1] === "tỷ") {
      billions = +priceItems[i] * 1000000000;
    } else if (priceItems[i + 1] === "triệu") {
      millions = +priceItems[i] * 1000000;
    } else if (priceItems[i + 1] === "nghìn" || priceItems[i + 1] === "ngàn") {
      thousands = +priceItems[i] * 1000;
    }
  }
  const formattedPrice = billions + millions + thousands;
  return formattedPrice;
};

const formatArea = (area: string) => {
  if (!area) return null;
  const areaComponents = area
    .toLocaleLowerCase()
    .replace("Diện tích: ".toLocaleLowerCase(), "")
    .trim()
    .split(" ");
  return {
    value: +removeDecimalPoints(areaComponents[0]),
    unit: areaComponents[1],
  };
};

const formatApiVariable = (variable: string) => {
  return variable
    .toLocaleLowerCase()
    .trim()
    .replace(/\s/g, "%20")
    .replace(".", "%20")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/ *\([^)]*\) */g, "");
};

const seenLocation: any = {};

const fetchAPI = async (args: { url: string }) => {
  try {
    console.log("crawling", args.url);

    if (seenUrls[args.url]) return;
    seenUrls[args.url] = true;

    const response = await axios.get(args.url);
    const html = response.data;
    const $ = cheerio.load(html);
    const paginationLinks = $("a[class='pagination__link']")
      .map((index, link) => link.attribs.href)
      .get();

    $("div[class='list-item-container']")
      .map(async (i, section) => {
        try {
          const cityVariable = formatApiVariable(
            $(section)
              .find("span[class='list-item__location']")
              .text()
              .trim()
              .split(",")[1]
              .trim()
          );

          const districtVariable = formatApiVariable(
            $(section)
              .find("span[class='list-item__location']")
              .text()
              .trim()
              .split(",")[0]
              .trim()
          );

          const cityName = $(section)
            .find("span[class='list-item__location']")
            .text()
            .trim()
            .split(",")[1]
            .trim();

          const districtName = $(section)
            .find("span[class='list-item__location']")
            .text()
            .trim()
            .split(",")[0]
            .trim();

          const formattedDate = (date: string) => {
            const dateArray = date.split("/");
            const newDateArray = [dateArray[2], dateArray[1], dateArray[0]];
            return newDateArray.join("/");
          };

          const house = {
            title: $(section).find("h2").text(),
            price: formatPrice(
              $(section).find("span[class='list-item__price']").text()
            ),
            area: formatArea(
              $(section).find("span[class='list-item__area']").text()
            ),
            date: $(section)
              .find("span[class='list-item__date']")
              .text()
              .trim(),
            url: $(section).find("a").attr("href"),
            unixTime: new Date(
              formattedDate(
                $(section).find("span[class='list-item__date']").text().trim()
              )
            ).getTime(),
          };

          //uncomment below to crawl city data
          // cityCrawl(cityVariable, cityName, seenLocation);

          //uncomment below to crawl district data
          // districtCrawl(
          //   districtVariable,
          //   cityVariable,
          //   districtName,
          //   seenLocation
          // );

          //uncomment below to crawl house data
          houseCrawl(house, districtVariable);
        } catch (err) {
          console.log("Error: ", err);
        }
      })
      .get();

    paginationLinks.map((link) => {
      fetchAPI({ url: getUrl(link) });
    });
  } catch (e) {
    console.log(e);
  }
};

fetchAPI({
  url: ROOT_LINK,
});
