/* =========================================================================
   OS ARCHIVE — SEARCH
   ========================================================================= */

function searchOS(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return OS_DATA.filter(o => {
    const hay = [
      o.name, o.version, o.developer, o.publisher, o.family, o.category,
      o.releaseYear, o.kernel, o.interface, ...(o.tags || []), ...(o.majorFeatures||[])
    ].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

function highlightMatch(text, query) {
  if (!query) return escapeHTML(text);
  const safe = escapeHTML(text);
  const q = escapeHTML(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${q})`, "ig"), "<mark>$1</mark>");
}

function renderSearchView() {
  return `
  <div class="container section">
    <header class="page-head">
      <p class="eyebrow">GLOBAL SEARCH</p>
      <h1>Search OS Archive</h1>
      <form id="search-page-form" class="search-page-form" role="search">
        <label class="sr-only" for="search-page-input">Search operating systems</label>
        <input type="search" id="search-page-input" placeholder="Search by name, developer, family, tag…" autocomplete="off">
        <button type="submit" class="btn btn--primary">SEARCH</button>
      </form>
      <p id="search-result-count" class="page-head__sub"></p>
    </header>
    <div id="search-results"></div>
  </div>`;
}

function initSearchView() {
  const params = new URLSearchParams((currentHash().split("?")[1] || ""));
  const q = params.get("q") || "";
  const input = document.getElementById("search-page-input");
  input.value = q;

  const run = (query) => {
    const results = searchOS(query);
    document.getElementById("search-result-count").textContent =
      query ? `${results.length} result${results.length===1?"":"s"} found for "${query}".` : "Start typing to search across every OS in the archive.";
    const host = document.getElementById("search-results");
    if (!query) { host.innerHTML = ""; return; }
    if (!results.length) { host.innerHTML = `<p class="empty-state">No matches. Try a different name, developer, or family.</p>`; return; }
    host.innerHTML = `<div class="cards-grid">${results.map(o => searchResultCard(o, query)).join("")}</div>`;
  };

  document.getElementById("search-page-form").addEventListener("submit", e => {
    e.preventDefault();
    const v = input.value.trim();
    history.replaceState(null, "", `#/search?q=${encodeURIComponent(v)}`);
    run(v);
  });

  run(q);
}

function searchResultCard(os, query) {
  const m = familyMeta(os.family);
  return `
  <article class="os-card" style="--tile-color:${m.color}">
    <a class="os-card__link" href="#/archive/${os.id}">
      <div class="os-card__top">${logoTile(os)}</div>
      <h3 class="os-card__name">${highlightMatch(os.name, query)} ${highlightMatch(os.version, query)}</h3>
      <p class="os-card__meta">${highlightMatch(os.developer, query)} &middot; ${os.releaseYear || "—"}</p>
      <div class="os-card__tags">
        <span class="chip" style="--chip-color:${m.color}">${escapeHTML(m.short)}</span>
        <span class="chip chip--outline">${escapeHTML(os.category)}</span>
      </div>
      <span class="os-card__explore">EXPLORE →</span>
    </a>
  </article>`;
}
