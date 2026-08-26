/* =========================================================================
   OS ARCHIVE — DESKTOP GALLERY
   No screenshots are hotlinked from third-party sites (licensing varies
   per source). Each entry instead gets a stylized representative tile
   plus a caption and a direct link to a verified historical source.
   ========================================================================= */

const GALLERY_CATEGORIES = [
  { key: "Windows", label: "Windows" },
  { key: "Classic Mac", label: "Classic Mac", match: o => o.family === "Apple" && o.releaseYear < 2001 },
  { key: "macOS", label: "macOS / OS X", match: o => o.family === "Apple" && o.releaseYear >= 2001 },
  { key: "Linux", label: "Linux", match: o => o.family === "Linux Distribution" },
  { key: "UNIX", label: "UNIX", match: o => o.family === "UNIX" },
  { key: "BSD", label: "BSD", match: o => o.family === "BSD" },
  { key: "Mobile", label: "Mobile", match: o => o.family === "Mobile" },
  { key: "Experimental", label: "Experimental & Other", match: o => o.family === "Other" }
];

function renderGallery() {
  return `
  <div class="gallery-page">
    <header class="page-head container">
      <p class="eyebrow">DESKTOP GALLERY</p>
      <h1>Historical Desktop Gallery</h1>
      <p class="page-head__sub">A visual reference across interface eras. To respect image licensing, each tile is a stylized stand-in with a direct link to a verified historical source rather than a hotlinked screenshot.</p>
    </header>
    <div class="container gallery-categories" id="gallery-body"></div>
  </div>`;
}

function galleryTile(os) {
  const m = familyMeta(os.family);
  return `
  <figure class="gallery-tile" style="--tile-color:${m.color}">
    <a href="#/archive/${os.id}" class="gallery-tile__visual" aria-label="View ${escapeHTML(os.name)} details">
      ${logoTile(os, "lg")}
    </a>
    <figcaption>
      <p class="gallery-tile__name">${escapeHTML(os.name)} <span>${escapeHTML(os.version)}</span></p>
      <p class="gallery-tile__year">${os.releaseYear || "Unverified"} &middot; ${escapeHTML(os.developer)}</p>
      <a class="gallery-tile__source" href="${escapeHTML(os.sourceLinks[0]?.url || "#")}" target="_blank" rel="noopener">VIEW SOURCE</a>
    </figcaption>
  </figure>`;
}

function initGallery() {
  const body = document.getElementById("gallery-body");
  body.innerHTML = GALLERY_CATEGORIES.map(cat => {
    const items = OS_DATA.filter(cat.match || (o => o.family === cat.key));
    if (!items.length) return "";
    return `
    <section class="gallery-category">
      <h2>${escapeHTML(cat.label)}</h2>
      <div class="gallery-grid">${items.map(galleryTile).join("")}</div>
    </section>`;
  }).join("");
}
