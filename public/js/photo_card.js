"use strict";

/**
 * Import
 */
import { ripple } from "./utils/ripple.js";
import { favorite } from "./favorite.js";

/**
 * Create photo card
 * @param {Object} photo Photo object
 * @returns {Node} Photo card
 */
export const photoCard = (photo) => {
  const root = window.location.origin;

  // Destructure properties with fallbacks:
  // - Use photo.key as id if id isn't provided.
  // - Use photo.url as the fallback for src.large.
  // - Provide defaults for alt, avg_color, width, height if they don't exist.
  const {
    alt = 'Water Image',
    avg_color: backdropColor = 'rgba(255,255,255,0.1)',
    width = 800,
    height = 600,
    id = photo.key,
    src,
  } = photo;
  
  // Use the new API's url property if src or src.large is missing.
  const large = src && src.large ? src.large : photo.url;
  
  // Create a slug from id only if id is a string containing a slash.
  const slug = (typeof id === 'string' && id.includes('/')) ? id.split('/').pop() : id;

  const $card = document.createElement("div");
  $card.classList.add("card", "grid-item");
  $card.style.backgroundColor = backdropColor;

  const favoriteObj = JSON.parse(window.localStorage.getItem("favorite") || "{}");

  $card.innerHTML = `
    <figure
      class="card-banner"
      style="--width: ${width}; --height: ${height}"
    >
      <img
        src="${large}"
        width="${width}"
        height="${height}"
        loading="lazy"
        alt="${alt}"
        class="img-cover"
      />
    </figure>

    <div class="card-content">
      <button
        class="icon-btn small ${favoriteObj.photos && favoriteObj.photos[id] ? "active" : ""}"
        aria-label="Add to favorite"
        data-ripple
        data-favorite-btn
      >
        <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
        <div class="state-layer"></div>
      </button>
    </div>

    <a href="${root}/pages/photos/photo_detail.html?id=${slug}" class="state-layer"></a>
  `;

  const $cardBanner = $card.querySelector("img");
  $cardBanner.style.opacity = 0;

  $cardBanner.addEventListener("load", function () {
    this.animate(
      { opacity: 1 },
      { duration: 400, fill: "forwards" }
    );
  });

  const $rippleElems = [
    $card,
    $card.querySelector("[data-ripple]"),
  ];
  $rippleElems.forEach(($rippleElem) => ripple($rippleElem));

  const $favoriteBtn = $card.querySelector("[data-favorite-btn]");
  favorite($favoriteBtn, "photos", id);

  return $card;
};
