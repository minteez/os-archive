/* =========================================================================
   OS ARCHIVE — SEARCH
   ========================================================================= */

function searchOS(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const topLevelMatches = OS_DATA.filter(o => {
    const hay = [
      o.name, o.version, o.developer, o.publisher, o.family, o.category,
      o.releaseYear, o.kernel, o.interface, ...(o.tags || []), ...(o.majorFeatures||[])
    ].join(" ").toLowerCase();
    return hay.includes(q);
  }).map(o => ({ os: o, release: null }));

  // Also surface nested releases whose own version/codename/build matches,
  // even when the parent OS record itself doesn't — shown as "Parent → Release".
  const releaseMatches = [];
  OS_DATA.forEach(o => {
    if (!o.releases) return;
    o.releases.forEach(r => {
      const hay = [r.version, r.codename, r.build].join(" ").toLowerCase();
      if (hay.includes(q) && !topLevelMatches.find(m => m.os.id === o.id)) {
        releaseMatches.push({ os: o, release: r });
      }
    });
  });

  // Also check the Windows Codename Archive for a name match
  const codenameMatches = (window.WINDOWS_CODENAMES || []).filter(c =>
    [c.codename, c.product, c.notes].join(" ").toLowerCase().includes(q)
  );

  return { results: [...topLevelMatches, ...releaseMatches], codenames: codenameMatches };
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
    const data = query ? searchOS(query) : { results: [], codenames: [] };
    const { results, codenames } = data;
    const total = results.length + codenames.length;
    document.getElementById("search-result-count").textContent =
      query ? `${total} result${total===1?"":"s"} found for "${query}".` : "Start typing to search across every OS in the archive — including nested release histories and Windows codenames.";
    const host = document.getElementById("search-results");
    if (!query) { host.innerHTML = ""; return; }
    if (!total) { host.innerHTML = `<p class="empty-state">No matches. Try a different name, developer, codename, or family.</p>`; return; }
    const cards = results.map(m => searchResultCard(m.os, query, m.release)).join("");
    const codenameCards = codenames.length ? `
      <h3>Windows Codenames</h3>
      <div class="cards-grid cards-grid--compact">
        ${codenames.map(c => `
          <article class="os-card">
            <a class="os-card__link" href="#/codenames">
              <h3 class="os-card__name">${highlightMatch(c.codename, query)}</h3>
              <p class="os-card__meta">${highlightMatch(c.product, query)}</p>
              <span class="os-card__explore">VIEW CODENAME ARCHIVE →</span>
            </a>
          </article>`).join("")}
      </div>` : "";
    host.innerHTML = `<div class="cards-grid">${cards}</div>${codenameCards}`;
  };

  document.getElementById("search-page-form").addEventListener("submit", e => {
    e.preventDefault();
    const v = input.value.trim();
    history.replaceState(null, "", `#/search?q=${encodeURIComponent(v)}`);
    run(v);
  });

  run(q);
}

function searchResultCard(os, query, release) {
  const m = familyMeta(os.family);
  const titleLine = release
    ? `${highlightMatch(os.name, query)} <span class="os-card__release-arrow">→</span> ${highlightMatch(release.version, query)}`
    : `${highlightMatch(os.name, query)} ${highlightMatch(os.version, query)}`;
  return `
  <article class="os-card" style="--tile-color:${m.color}">
    <a class="os-card__link" href="#/archive/${os.id}">
      <div class="os-card__top">${logoTile(os)}</div>
      <h3 class="os-card__name">${titleLine}</h3>
      <p class="os-card__meta">${release ? escapeHTML(release.date) : `${highlightMatch(os.developer, query)} &middot; ${os.releaseYear || "—"}`}</p>
      <div class="os-card__tags">
        <span class="chip" style="--chip-color:${m.color}">${escapeHTML(m.short)}</span>
        <span class="chip chip--outline">${release ? "Nested release" : escapeHTML(os.category)}</span>
      </div>
      <span class="os-card__explore">EXPLORE →</span>
    </a>
  </article>`;
}
