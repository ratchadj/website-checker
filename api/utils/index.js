import { URL } from "url";
import axios from "axios";

/**
 * Transform data from CSV format to be an Array
 *
 * @param {string} data
 * @param {string} delimiter
 * @returns {array} data without delimiter
 */
export function CSVToArray(data, delimiter = ",") {
  if (data) {
    const result = data.split(delimiter).filter(function (value, index, arr) {
      return value != "";
    });
    return result;
  }
  return [];
}

/**
 * Transform data from Buffer format to be an String format
 *
 * @param {buffer} data
 * @returns {string} utf8 or empty string
 */
export function bufferToString(data) {
  if (Buffer.isBuffer(data)) {
    const bufferOriginal = Buffer.from(data);
    return bufferOriginal.toString("utf8");
  }

  return "";
}

/**
 * Transform url string to be and URL object
 * for supporting case when the hostname was not identified
 *
 * @param {string} string
 * @returns {object} with https protocal
 */
const newURL = (string) => {
  let url;
  try {
    url = new URL(string);

    if (!url.hostname) {
      url = new URL("https://" + string);
    }
  } catch (error) {
    url = new URL("https://" + string);
  }

  return url;
};

/**
 * Success Status
 */
const WEBSITE_STATUS_UP = 200;

/**
 * For checking website by calling this url
 * And Verify successful cases status should be 200
 * Otherwise will be failed cases
 *
 * @param {string} url
 * @returns {promise}
 */
export function websiteChecker(url) {
  return new Promise(async (resolve, reject) => {
    const newUrl = newURL(url);
    url = newUrl.href;
    axios
      .get(url)
      .then(function (response) {
        const respData = {
          url: `${url}`,
          status: response.status,
          message: "",
        };
        if (response.status == WEBSITE_STATUS_UP) resolve(respData);
        else reject(respData);
      })
      .catch(function (e) {
        reject({ url: `${url}`, status: 500, message: e.code });
      });
  });
}
