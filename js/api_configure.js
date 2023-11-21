"use strict";

/**
 * Import
 */
import { urlEncode } from "./utils/urlEncode.js";
import { config } from "./config.js";

const /** {String} */ API_KEY = config.PEXELS_API_KEY;

const /** {Object} */ headers = new Headers();
headers.append("Authorization", API_KEY);

const /** {Object} */ requestOptions = { headers };

/**
 * Fetch data from Pexels
 * @param {string} url Fetch Url
 * @param {Function} successCallback Success callback function
 */

const fetchData = async function (url, successCallback) {
  const /** {Object} */ response = await fetch(url, requestOptions);

  if (response.ok) {
    const /** {Object} */ data = await response.json();
    successCallback(data);
  }
};

let /** {String} */ requestUrl = "";

const /** {Object} */ root = {
    default: "https://api.pexels.com/v1/",
    videos: "https://api.pexels.com/videos/",
  };

export const /** {Object} */ client = {
    photos: {
      /**
       * Search photos
       * @param {Object} parameters Url Object
       * @param {Function} callback Callback function
       */
      search(parameters, callback) {
        requestUrl = `${root.default}search?${urlEncode(parameters)}`;
        fetchData(requestUrl, callback);
      },

      /**
       * Curated photos
       * @param {Object} parameters Url Object
       * @param {Function} callback Callback function
       */
      curated(parameters, callback) {
        requestUrl = `${root.default}curated?${urlEncode(parameters)}`;
        fetchData(requestUrl, callback);
      },

      /**
       * Get single photo detail
       * @param {String} id Photo ID
       * @param {Function} callback Callback function
       */
      detail(id, callback) {
        requestUrl = `${root.default}photos/${id}`;
        fetchData(requestUrl, callback);
      },
    },

    videos: {
      /**
       * Search videos
       * @param {Object} parameters Url Object
       * @param {Function} callback Callback function
       */
      search(parameters, callback) {
        requestUrl = `${root.videos}search?${urlEncode(parameters)}`;
        fetchData(requestUrl, callback);
      },

      /**
       * Get Popular videos
       * @param {Object} parameters Url Object
       * @param {Function} callback Callback function
       */
      popular(parameters, callback) {
        requestUrl = `${root.videos}popular?${urlEncode(parameters)}`;
        fetchData(requestUrl, callback);
      },

      /**
       * Get single video detail
       * @param {String} id Video ID
       * @param {Function} callback Callback function
       */
      detail(id, callback) {
        requestUrl = `${root.videos}videos/${id}`;
        fetchData(requestUrl, callback);
      },
    },

    collections: {
      /**
       * Get featured collections
       * @param {Object} parameters Url Object
       * @param {Function} callback Callback function
       */
      featured(parameters, callback) {
        requestUrl = `${root.default}collections/featured?${urlEncode(
          parameters
        )}`;
        fetchData(requestUrl, callback);
      },

      /**
       * Get a collection medias
       * @param {String} id Collection ID
       * @param {Object} parameters Url object
       * @param {Function} callback Callback function
       */
      detail(id, parameters, callback) {
        requestUrl = `${root.default}collections/${id}?${urlEncode(
          parameters
        )}`;
        fetchData(requestUrl, callback);
      },
    },
  };
