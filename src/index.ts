import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const seenUrls: any = {};

const getUrl = (link: string) => {
  if (link.includes("https://") || link.includes("http://")) {
    return link;
  } else if (link.startsWith("https://") || link.startsWith("http://")) {
    return `https://kenh14.vn${link}`;
  } else {
    return `https://kenh14.vn/${link}`;
  }
};

const fetchAPI = async (args: { url: string }) => {
  try {
    console.log("crawling", args.url);
    if (seenUrls[args.url]) return;

    seenUrls[args.url] = true;
    const response = await axios.get(args.url);
    const html = response.data;
    const $ = cheerio.load(html);
    const links = $("a")
      .map((index, link) => link.attribs.href)
      .get();

    const imageUrls = $("img")
      .map((index, img) => img.attribs.src)
      .get();

    imageUrls.map((imageUrl) => {
      axios.get(getUrl(imageUrl)).then((res) => {
        const filename = path.basename(imageUrl);
        const dest = fs.createWriteStream(`images/${filename}`);
        res.data.pipe(dest);
      });
    });

    links.map((link) => {
      fetchAPI({ url: getUrl(link) });
    });
  } catch (e) {
    console.log(e);
  }
};

fetchAPI({ url: "https://kenh14.vn/" });
