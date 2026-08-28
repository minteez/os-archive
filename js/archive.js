/* =========================================================================
   OS ARCHIVE — EXPLORER, DETAIL PAGES, FAMILY PAGES, FAVORITES
   ========================================================================= */

const PAGE_SIZE = 24;
let explorerRenderCount = PAGE_SIZE;

function renderArchiveExplorer(pathOnly, params) {
  const presetFamily = null;
  return `
  <div class="explorer-page">
    <header class="page-head container">
      <p class="eyebrow">OS ARCHIVE EXPLORER</p>
      <h1>Browse the Collection</h1>
      <p class="page-head__sub">Every system in the archive, filterable by family, category, device type, developer and release year.</p>
    </header>
    <div class="container explorer-layout">
      <aside class="explorer-layout__filters">
        ${Filters.panelHTML()}
      </aside>
      <div class="explorer-layout__results">
        <div class="explorer-toolbar">
          <p id="explorer-count" class="explorer-count"></p>
        </div>
        <div id="explorer-grid"></div>
        <div class="explorer-load-more">
          <button class="btn btn--outline" id="explorer-load-more" type="button">LOAD MORE</button>
        </div>
      </div>
    </div>
  </div>`;
}

function initArchiveExplorer(presetFamily) {
  explorerRenderCount = PAGE_SIZE;
  if (presetFamily) Filters.setFamily(decodeURIComponent(presetFamily));
  else Filters.reset();

  const draw = () => {
    const results = Filters.apply(OS_DATA).sort((a, b) => (a.releaseYear||0) - (b.releaseYear||0));
    document.getElementById("explorer-count").textContent = `${results.length} result${results.length===1?"":"s"} found.`;
    const slice = results.slice(0, explorerRenderCount);
    document.getElementById("explorer-grid").innerHTML = cardsGrid(slice, "No systems match these filters — try widening your search.");
    const loadMoreBtn = document.getElementById("explorer-load-more");
    loadMoreBtn.style.display = results.length > slice.length ? "" : "none";
  };

  Filters.wirePanel(() => { explorerRenderCount = PAGE_SIZE; draw(); });
  document.getElementById("explorer-load-more").addEventListener("click", () => {
    explorerRenderCount += PAGE_SIZE;
    draw();
  });
  draw();
}

/* ------------------------------ OS DETAIL PAGE ------------------------------ */

function renderOSDetail(id) {
  const os = osById(id);
  if (!os) {
    return `<div class="container section"><h1>System not found</h1><p>We couldn't find that entry in the archive.</p><a class="btn btn--outline" href="#/archive">BACK TO ARCHIVE</a></div>`;
  }
  const m = familyMeta(os.family);
  const pred = OS_DATA.find(o => o.name === os.predecessor) || null;
  const succ = OS_DATA.find(o => o.name === os.successor) || null;

  return `
  <article class="detail-page" style="--tile-color:${m.color}">
    <header class="detail-hero">
      <div class="container detail-hero__inner">
        ${logoTile(os, "lg")}
        <div>
          <p class="eyebrow">${escapeHTML(os.family)} &middot; ${escapeHTML(os.category)}</p>
          <h1>${escapeHTML(os.name)}</h1>
          <p class="detail-hero__version">${escapeHTML(os.version)} &middot; ${os.releaseYear || "Unverified"}</p>
        </div>
        <button class="fav-btn fav-btn--large ${Storage.isFavorite(os.id)?"is-active":""}" data-fav-toggle="${os.id}" aria-pressed="${Storage.isFavorite(os.id)}" onclick="AppUI.toggleFav('${os.id}', this)">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3l2.7 5.9 6.3.8-4.6 4.5 1.2 6.3L12 17.5 6.4 20.5l1.2-6.3L3 9.7l6.3-.8z"/></svg>
          <span>${Storage.isFavorite(os.id) ? "Saved" : "Save to My Archive"}</span>
        </button>
      </div>
    </header>

    <div class="container detail-grid">
      <div class="detail-main">
        <section class="detail-section">
          <h2>Overview</h2>
          <p>${escapeHTML(os.description)}</p>
        </section>

        <section class="detail-section">
          <h2>Major Features</h2>
          <ul class="feature-list">
            ${os.majorFeatures.map(f => `<li>${escapeHTML(f)}</li>`).join("")}
          </ul>
        </section>

        ${releaseHistorySection(os)}

        <section class="detail-section">
          <h2>Interface</h2>
          <p>${escapeHTML(os.interface || "Unverified")}${os.desktopEnvironment ? ` — shell/environment: ${escapeHTML(os.desktopEnvironment)}` : ""}</p>
        </section>

        <section class="detail-section">
          <h2>Historical Significance</h2>
          <p>${escapeHTML(os.historicalImportance)}</p>
        </section>

        <section class="detail-section">
          <h2>Interesting Facts</h2>
          <ul class="facts-list">
            ${os.interestingFacts.map(f => `<li>${escapeHTML(f)}</li>`).join("")}
          </ul>
        </section>

        <section class="detail-section">
          <h2>Timeline</h2>
          <div class="pred-succ">
            <div class="pred-succ__item">
              <p class="pred-succ__label">Predecessor</p>
              ${pred ? `<a href="#/archive/${pred.id}">${escapeHTML(pred.name)} ${escapeHTML(pred.version)}</a>` : `<p>${escapeHTML(os.predecessor || "None / original system")}</p>`}
            </div>
            <div class="pred-succ__arrow" aria-hidden="true">→</div>
            <div class="pred-succ__item">
              <p class="pred-succ__label">Successor</p>
              ${succ ? `<a href="#/archive/${succ.id}">${escapeHTML(succ.name)} ${escapeHTML(succ.version)}</a>` : `<p>${escapeHTML(os.successor || "None")}</p>`}
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h2>Screenshots / Gallery</h2>
          ${screenshotsSection(os)}
        </section>

        <section class="detail-section">
          <h2>Sources</h2>
          <ul class="sources-list">
            ${os.sourceLinks.map(s => `<li><a href="${escapeHTML(s.url)}" target="_blank" rel="noopener">${escapeHTML(s.name)}</a></li>`).join("")}
          </ul>
        </section>

        <div class="detail-actions">
          <a class="btn btn--outline" href="#/archive">BACK TO ARCHIVE</a>
          <a class="btn btn--primary" href="#/compare/${os.id}">COMPARE THIS OS</a>
        </div>
      </div>

      <aside class="detail-side">
        <div class="spec-card">
          <h2>Specifications</h2>
          <dl class="spec-list">
            <dt>Developer</dt><dd>${escapeHTML(os.developer)}</dd>
            <dt>Publisher</dt><dd>${escapeHTML(os.publisher)}</dd>
            <dt>Platform</dt><dd>${escapeHTML(os.platform)}</dd>
            <dt>Architecture</dt><dd>${escapeHTML(os.architecture)}</dd>
            <dt>Kernel</dt><dd>${escapeHTML(os.kernel)}</dd>
            <dt>Device Type</dt><dd>${escapeHTML(os.deviceType)}</dd>
            <dt>Status</dt><dd>${escapeHTML(os.status)}</dd>
            <dt>Release Date</dt><dd>${escapeHTML(os.releaseDate)}</dd>
          </dl>
        </div>
      </aside>
    </div>
  </article>`;
}

function releaseHistorySection(os) {
  if (!os.releases || !os.releases.length) return "";
  return `
  <section class="detail-section">
    <h2>Release History</h2>
    <p class="release-history__intro">${os.releases.length} tracked releases. Expand any entry for its build, codename and date.</p>
    <div class="release-history">
      ${os.releases.map((r, i) => `
        <details class="release-item" ${i === os.releases.length - 1 ? "open" : ""}>
          <summary>
            <span class="release-item__version">${escapeHTML(r.version)}</span>
            <span class="release-item__date">${escapeHTML(r.date)}</span>
            <span class="release-item__status chip chip--outline">${escapeHTML(r.status)}</span>
          </summary>
          <dl class="release-item__body">
            <dt>Codename</dt><dd>${escapeHTML(r.codename || "—")}</dd>
            <dt>Build</dt><dd>${escapeHTML(r.build || "—")}</dd>
            <dt>Notes</dt><dd>${escapeHTML(r.notes || "—")}</dd>
          </dl>
        </details>`).join("")}
    </div>
  </section>`;
}

function screenshotsSection(os) {
  if (!os.screenshots || !os.screenshots.length) {
    return `
    <div class="screenshot-fallback">
      <p>No screenshot has been added for this entry yet. View verified imagery at the source below.</p>
      <a class="btn btn--outline btn--small" href="${os.sourceLinks[0] ? escapeHTML(os.sourceLinks[0].url) : "#"}" target="_blank" rel="noopener">VIEW SOURCE</a>
    </div>`;
  }
  return `
  <div class="screenshot-gallery">
    ${os.screenshots.map(s => `
      <figure class="screenshot-item">
        <img src="assets/images/screenshots/${escapeHTML(s.file)}" alt="${escapeHTML(s.caption || os.name + " " + os.version)}" loading="lazy"
             onerror="this.closest('.screenshot-item').style.display='none'">
        <figcaption>
          <span>${escapeHTML(s.caption || "")}</span>
          ${s.source ? `<a href="${escapeHTML(s.source)}" target="_blank" rel="noopener">Source</a>` : ""}
        </figcaption>
      </figure>`).join("")}
  </div>`;
}

function initDetailPage() {
  const id = currentHash().split("/")[2];
  if (osById(id)) Storage.addRecentlyViewed(id);
}

/* ------------------------------ FAMILY PAGES ------------------------------ */

const FAMILY_INTRO = {
  "Windows": { title: "Windows", blurb: "From MS-DOS's command line to the Fluent-design Windows 11, trace Microsoft's operating system through five decades of PC computing." },
  "Windows Mobile": { title: "Windows Mobile History", blurb: "Windows CE, Pocket PC, Windows Mobile, Windows Phone, and Windows 10 Mobile are related but distinct products — Microsoft's two-decade, ultimately unsuccessful attempt at a mobile platform." },
  "Apple": { title: "Apple / Mac", blurb: "From the original 1984 Macintosh System software through the Unix-based transformation of Mac OS X and today's Apple Silicon macOS." },
  "Linux Kernel": { title: "Linux Kernel", blurb: "The kernel Linus Torvalds began in 1991, now the most widely deployed kernel on Earth — from servers to smartphones." },
  "Linux Distribution": { title: "Linux Distributions", blurb: "Hundreds of distinct operating systems share the Linux kernel. Explore the major families and how they relate to one another." },
  "UNIX": { title: "UNIX & Research Systems", blurb: "The operating system philosophy born at Bell Labs in 1971 that shaped nearly everything that followed it." },
  "BSD": { title: "BSD", blurb: "Berkeley's UNIX derivative gave the world TCP/IP networking and lives on in FreeBSD, OpenBSD, NetBSD — and even game consoles." },
  "Mobile": { title: "Mobile Operating Systems", blurb: "From stylus-driven PDAs to the multi-touch smartphone platforms that now outnumber every desktop OS combined." },
  "Console": { title: "Console Operating Systems", blurb: "The operating systems, often invisible to players, running inside PlayStation, Xbox and Nintendo hardware." },
  "Capability-based": { title: "Capability-based Systems", blurb: "Systems where access to any resource requires holding an explicit, unforgeable capability token — from 1970s research machines to Fuchsia and HarmonyOS NEXT today." },
  "Other": { title: "Experimental & Other Systems", blurb: "Historical, hobbyist, embedded and research operating systems that don't fit neatly into the major families — but matter all the same." }
};

function renderFamilyPage(familyKey) {
  const family = decodeURIComponent(familyKey);
  const info = FAMILY_INTRO[family] || { title: family, blurb: "" };
  return `
  <div class="family-page">
    <header class="page-head container">
      <p class="eyebrow">FAMILY ARCHIVE</p>
      <h1>${escapeHTML(info.title)}</h1>
      <p class="page-head__sub">${escapeHTML(info.blurb)}</p>
    </header>
    ${renderArchiveExplorer()}
  </div>`;
}

/* ------------------------------ FAVORITES / MY ARCHIVE ------------------------------ */

function renderFavorites() {
  const ids = Storage.getFavorites();
  const list = ids.map(osById).filter(Boolean);
  return `
  <div class="container section">
    <header class="page-head">
      <p class="eyebrow">MY ARCHIVE</p>
      <h1>Saved Systems</h1>
      <p class="page-head__sub">Operating systems you've bookmarked for later. Stored locally in your browser only.</p>
    </header>
    ${cardsGrid(list, "You haven't saved any systems yet. Tap the star on any OS card to add it here.")}
  </div>`;
}
