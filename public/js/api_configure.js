"use strict";

/**
 * Import helper for URL encoding parameters
 */
import { urlEncode } from "./utils/urlEncode.js";

// We no longer need to fetch the API key on the client side,
// as our server will securely inject the key when proxying requests.
// All requests will be made to our local proxy endpoints.
const requestOptions = {
  // No need for client-side Authorization header
};

/**
 * Generic function to fetch data from our proxy endpoints.
 * @param {string} url - The local API endpoint URL
 * @param {Function} successCallback - Callback to handle the response data
 */
const fetchData = async function (url, successCallback) {
  const response = await fetch(url, requestOptions);

  if (response.ok) {
    const data = await response.json();
    successCallback(data);
  } else {
    console.error("Request failed with status:", response.status);
  }
};

let requestUrl = "";

// Update the root endpoints to point to our Express server proxy endpoints.
const root = {
  photos: "/api/photos/",
  videos: "/api/videos/",
  collections: "/api/collections/",
};

export const client = {
  photos: {
    /**
     * Search photos via the server proxy.
     * @param {Object} parameters - URL parameters as an object.
     * @param {Function} callback - Callback function to handle the data.
     */
    search(parameters, callback) {
      requestUrl = `${root.photos}search?${urlEncode(parameters)}`;
      fetchData(requestUrl, callback);
    },

    /**
     * Retrieve curated photos via the server proxy.
     * @param {Object} parameters - URL parameters as an object.
     * @param {Function} callback - Callback function to handle the data.
     */
    curated(parameters, callback) {
      requestUrl = `${root.photos}curated?${urlEncode(parameters)}`;
      fetchData(requestUrl, callback);
    },

    /**
     * Get details for a single photo via the server proxy.
     * @param {String} id - Photo ID.
     * @param {Function} callback - Callback function to handle the data.
     */
    detail(id, callback) {
      requestUrl = `${root.photos}${id}`;
      fetchData(requestUrl, callback);
    },
  },

  videos: {
    /**
     * Search videos via the server proxy.
     * @param {Object} parameters - URL parameters as an object.
     * @param {Function} callback - Callback function to handle the data.
     */
    search(parameters, callback) {
      requestUrl = `${root.videos}search?${urlEncode(parameters)}`;
      fetchData(requestUrl, callback);
    },

    /**
     * Retrieve popular videos via the server proxy.
     * @param {Object} parameters - URL parameters as an object.
     * @param {Function} callback - Callback function to handle the data.
     */
    popular(parameters, callback) {
      requestUrl = `${root.videos}popular?${urlEncode(parameters)}`;
      fetchData(requestUrl, callback);
    },

    /**
     * Get details for a single video via the server proxy.
     * @param {String} id - Video ID.
     * @param {Function} callback - Callback function to handle the data.
     */
    detail(id, callback) {
      requestUrl = `${root.videos}videos/${id}`;
      fetchData(requestUrl, callback);
    },
  },

  collections: {
    /**
     * Retrieve featured collections via the server proxy.
     * @param {Object} parameters - URL parameters as an object.
     * @param {Function} callback - Callback function to handle the data.
     */
    featured(parameters, callback) {
      requestUrl = `${root.collections}featured?${urlEncode(parameters)}`;
      fetchData(requestUrl, callback);
    },

    /**
     * Get details of a specific collection via the server proxy.
     * @param {String} id - Collection ID.
     * @param {Object} parameters - Additional URL parameters.
     * @param {Function} callback - Callback function to handle the data.
     */
    detail(id, parameters, callback) {
      requestUrl = `${root.collections}${id}?${urlEncode(parameters)}`;
      fetchData(requestUrl, callback);
    },
  },
};
