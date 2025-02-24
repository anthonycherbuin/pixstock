"use strict";

/**
 * Import
 */
import { ripple } from "./utils/ripple.js";
import { favorite } from "./favorite.js";
import { hoverOnPlay } from "./utils/hoverOnPlay.js";

/**
 * Create video card
 * @param {Object} video video object
 * @returns {Node} video card
 */
export const videoCard = (video) => {
  const root = window.location.origin;

  const { width, height, id, image, video_files } = video;
  
  // Try to find an "sd" video file; if not, fallback to the first available file.
  const sdVideo =
    video_files.find(item => item.quality === "sd" && item.width < 1000) ||
    video_files[0] ||
    {};
  
  // Provide default values if sdVideo is empty
  const { file_type = "video/mp4", link = "" } = sdVideo;

  const $card = document.createElement("div");
  $card.classList.add("card", "grid-item", "video");

  const favoriteObj = JSON.parse(window.localStorage.getItem("favorite") || "{}");

  $card.innerHTML = `
  <div class="card-banner" style="--width: ${width}; --height: ${height}">
    <video poster="${image}" muted loop preload="none" class="img-cover" data-video>
      <source
        src="${link}"
        type="${file_type}"
      />
    </video>
  </div>

  <div class="card-content">
    <button
      class="icon-btn small ${favoriteObj.videos && favoriteObj.videos[id] ? "active" : ""}"
      aria-label="Add to favorite"
      data-ripple
      data-favorite-btn
    >
      <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
      <div class="state-layer"></div>
    </button>
  </div>

  <span class="card-badge" data-card-badge>
    <span class="material-symbols-outlined" aria-hidden="true">play_arrow</span>
  </span>

  <a href="${root}/pages/videos/video_detail.html?id=${id}" class="state-layer"></a>
  `;

  const $rippleElems = [
    $card,
    $card.querySelector("[data-ripple]"),
  ];
  $rippleElems.forEach(($rippleElem) => ripple($rippleElem));

  const $favoriteBtn = $card.querySelector("[data-favorite-btn]");
  favorite($favoriteBtn, "videos", id);

  hoverOnPlay($card);

  return $card;
};
