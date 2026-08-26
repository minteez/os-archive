/* =========================================================================
   OS ARCHIVE — APP SHELL & ROUTER
   Hash-based router so the whole thing works as flat static files on
   GitHub Pages. Each route delegates rendering to a module-level function.
   ========================================================================= */

const BUILD_VERSION = "v1.0.0"; // <- single place to bump the build number

const FAMILY_META = {
  "Windows":            { color: "#00b7ff", short: "WIN" },
  "Apple":              { color: "#e0e0e0", short: "MAC" },
  "Linux Kernel":       { color: "#39ff88", short: "KRN" },
  "Linux Distribution": { color: "#39ff88", short: "DIST" },
  "UNIX":               { color: "#ffb238", short: "UNX" },
  "BSD":                { color: "#ff9d5c", short: "BSD" },
  "Mobile":             { color: "#c792ff", short: "MOB" },
  "Console":            { color: "#ff5c8a", short: "CON" },
  "Other":              { color: "#9fe7ff", short: "OTH" }
};

function familyMeta(family) {
  return FAMILY_META[family] || { color: "#9fe7ff", short: "OS" };
}

function osById(id) {
  return OS_DATA.find(o => o.id === id) || null;
}

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

/* ---------- logo tile: real image if provided, monogram fallback otherwise ---------- */
function logoTile(os, size = "md") {
  const m = familyMeta(os.family);
  const monogram = `<div class="logo-tile logo-tile--${size}" style="--tile-color:${m.color}" aria-hidden="true">${escapeHTML(initials(os.name))}</div>`;
  // Each OS record has a unique `id` (e.g. "win-95", "win-xp", "mac-osx-tiger") —
  // that's what the logo filename should match, NOT the shared `family` name,
  // since different releases of the same family have different logos.
  const src = `assets/images/logos/${os.id}.png`;
  const monogramEscaped = monogram.replace(/`/g, "\\`");
  return `<img class="logo-tile logo-tile--${size} logo-tile--img" style="--tile-color:${m.color}" src="${src}" alt="${escapeHTML(os.name + " " + os.version + " logo")}" loading="lazy" onerror="this.outerHTML=\`${monogramEscaped}\`">`;
}

/* ---------- OS card (used by explorer, search, favorites, related) ---------- */
function osCard(os) {
  const m = familyMeta(os.family);
  const fav = Storage.isFavorite(os.id);
  return `
  <article class="os-card" style="--tile-color:${m.color}">
    <a class="os-card__link" href="#/archive/${os.id}" aria-label="View details for ${escapeHTML(os.name)} ${escapeHTML(os.version)}">
      <div class="os-card__top">
        ${logoTile(os)}
        <button class="fav-btn ${fav ? "is-active" : ""}" data-fav-toggle="${os.id}" aria-pressed="${fav}" aria-label="${fav ? "Remove from" : "Add to"} My Archive" onclick="event.preventDefault(); event.stopPropagation(); AppUI.toggleFav('${os.id}', this);">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3l2.7 5.9 6.3.8-4.6 4.5 1.2 6.3L12 17.5 6.4 20.5l1.2-6.3L3 9.7l6.3-.8z"/></svg>
        </button>
      </div>
      <h3 class="os-card__name">${escapeHTML(os.name)}</h3>
      <p class="os-card__version">${escapeHTML(os.version)} &middot; ${os.releaseYear || "—"}</p>
      <p class="os-card__meta">${escapeHTML(os.developer)}</p>
      <div class="os-card__tags">
        <span class="chip" style="--chip-color:${m.color}">${escapeHTML(m.short)}</span>
        <span class="chip chip--outline">${escapeHTML(os.category)}</span>
      </div>
      <p class="os-card__desc">${escapeHTML(os.description.slice(0, 110))}${os.description.length > 110 ? "…" : ""}</p>
      <span class="os-card__explore">EXPLORE →</span>
    </a>
  </article>`;
}

function cardsGrid(list, emptyMessage = "No systems found.") {
  if (!list.length) return `<p class="empty-state">${escapeHTML(emptyMessage)}</p>`;
  return `<div class="cards-grid">${list.map(osCard).join("")}</div>`;
}

/* ---------- shared UI actions exposed for inline handlers ---------- */
const AppUI = {
  toggleFav(id, btn) {
    const active = Storage.toggleFavorite(id);
    if (btn) {
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    }
  }
};
window.AppUI = AppUI;

/* ================================ ROUTER ================================ */

const routes = [
  { test: h => h === "" || h === "/", render: renderHome },
  { test: h => h === "/archive", render: renderArchiveExplorer },
  { test: h => h.startsWith("/archive/"), render: h => renderOSDetail(h.split("/")[2]) },
  { test: h => h === "/timeline", render: renderTimeline },
  { test: h => h === "/evolution", render: renderEvolution },
  { test: h => h === "/gallery", render: renderGallery },
  { test: h => h === "/compare", render: () => renderComparison(null, null) },
  { test: h => h.startsWith("/compare/"), render: h => {
      const [, , a, b] = h.split("/");
      return renderComparison(a || null, b || null);
    } },
  { test: h => h === "/quiz", render: renderQuiz },
  { test: h => h === "/search", render: renderSearchView },
  { test: h => h === "/favorites", render: renderFavorites },
  { test: h => h === "/about", render: renderAbout },
  { test: h => h.startsWith("/family/"), render: h => renderFamilyPage(h.split("/")[2]) }
];

function currentHash() {
  return (location.hash || "").replace(/^#/, "") || "/";
}

function navigate(hash) {
  location.hash = hash;
}
window.navigate = navigate;

function router() {
  const raw = currentHash();
  const [pathOnly, query] = raw.split("?");
  const match = routes.find(r => r.test(pathOnly)) || routes[0];

  const view = document.getElementById("view");
  view.classList.add("is-loading");

  requestAnimationFrame(() => {
    try {
      view.innerHTML = match.render(pathOnly, new URLSearchParams(query || ""));
    } catch (err) {
      console.error(err);
      view.innerHTML = `<div class="container section"><h1>Something glitched</h1><p>This view hit an error. Try returning to the <a href="#/">archive home</a>.</p></div>`;
    }
    view.classList.remove("is-loading");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    highlightActiveNav(pathOnly);
    afterRender(pathOnly);
    view.focus({ preventScroll: true });
  });
}

function highlightActiveNav(pathOnly) {
  document.querySelectorAll("[data-nav-link]").forEach(a => {
    const target = a.getAttribute("href").replace(/^#/, "");
    const active = target === pathOnly || (target !== "/" && pathOnly.startsWith(target));
    a.classList.toggle("is-active", active);
  });
}

/* Hooks each view can rely on being called after its HTML is in the DOM */
function afterRender(pathOnly) {
  if (pathOnly === "/archive") initArchiveExplorer();
  if (pathOnly.startsWith("/archive/")) initDetailPage();
  if (pathOnly === "/timeline") initTimeline();
  if (pathOnly === "/evolution") initEvolution();
  if (pathOnly === "/gallery") initGallery();
  if (pathOnly === "/compare" || pathOnly.startsWith("/compare/")) initComparison();
  if (pathOnly === "/quiz") initQuiz();
  if (pathOnly === "/search") initSearchView();
  if (pathOnly === "/") initHome();
  if (pathOnly.startsWith("/family/")) initArchiveExplorer(pathOnly.split("/")[2]);
  document.body.classList.remove("nav-open");
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  buildNav();
  buildFooter();
  wireGlobalSearch();
  wireMobileNav();
  router();
});

/* ================================ NAV / FOOTER ================================ */

function buildNav() {
  const nav = document.getElementById("site-nav");
  nav.innerHTML = `
    <div class="nav__inner container">
      <a class="nav__brand" href="#/" data-nav-link>
        <span class="nav__brand-mark" aria-hidden="true">▮▯</span>
        <span class="nav__brand-text">OS ARCHIVE</span>
      </a>
      <button class="nav__hamburger" id="nav-hamburger" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle navigation menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav__links" id="nav-links">
        <a href="#/timeline" data-nav-link>TIMELINE</a>
        <a href="#/archive" data-nav-link>ARCHIVE</a>
        <a href="#/evolution" data-nav-link>EVOLUTION</a>
        <a href="#/gallery" data-nav-link>GALLERY</a>
        <a href="#/compare" data-nav-link>COMPARE</a>
        <a href="#/quiz" data-nav-link>QUIZ</a>
        <a href="#/about" data-nav-link>ABOUT</a>
      </div>
      <form class="nav__search" id="nav-search-form" role="search">
        <label class="sr-only" for="nav-search-input">Search the archive</label>
        <input type="search" id="nav-search-input" placeholder="Search OS Archive…" autocomplete="off">
        <button type="submit" aria-label="Search">
          <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </form>
    </div>`;
}

function wireMobileNav() {
  const btn = document.getElementById("nav-hamburger");
  btn.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", String(open));
  });
}

function wireGlobalSearch() {
  const form = document.getElementById("nav-search-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const q = document.getElementById("nav-search-input").value.trim();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  });
}

function buildFooter() {
  const footer = document.getElementById("site-footer");
  const stats = archiveStats();
  footer.innerHTML = `
    <div class="container footer__grid">
      <div class="footer__col">
        <p class="footer__brand">OS ARCHIVE</p>
        <p class="footer__tagline">"A living museum of operating systems."</p>
        <p class="footer__status"><span class="status-dot" aria-hidden="true"></span> ARCHIVE STATUS: ONLINE</p>
      </div>
      <nav class="footer__col" aria-label="Site sections">
        <p class="footer__heading">Explore</p>
        <a href="#/timeline">Timeline</a>
        <a href="#/archive">Archive Explorer</a>
        <a href="#/evolution">Evolution of the Desktop</a>
        <a href="#/gallery">Desktop Gallery</a>
        <a href="#/compare">Compare Operating Systems</a>
        <a href="#/quiz">Guess the OS</a>
      </nav>
      <nav class="footer__col" aria-label="Categories">
        <p class="footer__heading">Categories</p>
        <a href="#/family/Windows">Windows</a>
        <a href="#/family/Apple">Apple / Mac</a>
        <a href="#/family/Linux%20Distribution">Linux</a>
        <a href="#/family/UNIX">UNIX &amp; BSD</a>
        <a href="#/family/Mobile">Mobile</a>
        <a href="#/family/Other">Experimental &amp; Other</a>
      </nav>
      <div class="footer__col">
        <p class="footer__heading">Developer</p>
        <a href="https://github.com/minteez" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.instagram.com/sudo.minteez" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.youtube.com/@thecubermint" target="_blank" rel="noopener">YouTube</a>
        <a href="https://minteez.lovable.app" target="_blank" rel="noopener">Portfolio</a>
      </div>
    </div>
    <div class="container footer__legal">
      <p>Engineered by Minteez &amp; Gemini AI. © 2026. All data streams reserved.</p>
      <p class="footer__build">Build ${BUILD_VERSION} · ${stats.total} entries archived</p>
    </div>`;
}

/* ================================ SHARED STATS ================================ */

function archiveStats() {
  const total = OS_DATA.length;
  const windows = OS_DATA.filter(o => o.family === "Windows").length;
  const apple = OS_DATA.filter(o => o.family === "Apple").length;
  const linux = OS_DATA.filter(o => o.family === "Linux Kernel" || o.family === "Linux Distribution").length;
  const other = total - windows - apple - linux;
  const decades = new Set(OS_DATA.map(o => Math.floor((o.releaseYear || 0) / 10) * 10)).size;
  return { total, windows, apple, linux, other, decades };
}
