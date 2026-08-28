/* =========================================================================
   OS ARCHIVE — WINDOWS CODENAME ARCHIVE
   A curated, verified reference of Microsoft/Windows development codenames,
   kept separate from OS_DATA since codenames are a different kind of
   record (a naming/project history, not an operating system release).
   ========================================================================= */

const CODENAME_TYPE_COLOR = {
  "Development codename": "#39ff88",
  "Cancelled project": "#ff6767",
  "Cancelled / superseded project": "#ff6767",
  "Cancelled / partially released project": "#ffb238",
  "Combined product bundle": "#4fd8ff",
  "Renamed then absorbed": "#ffb238"
};

function renderCodenames() {
  return `
  <div class="codenames-page">
    <header class="page-head container">
      <p class="eyebrow">WINDOWS CODENAME ARCHIVE</p>
      <h1>Development Codenames</h1>
      <p class="page-head__sub">A curated, historically verified set of Microsoft development codenames and the products they became — or didn't. This is not an exhaustive catalogue: codenames are only listed here where their product association could be verified against a reputable source, and unverifiable requested entries have been left out rather than invented.</p>
    </header>

    <div class="container codenames-timeline" id="codenames-timeline"></div>

    <div class="container section">
      <h2>Full Reference Table</h2>
      <div class="codenames-table-wrap">
        <table class="codenames-table">
          <thead>
            <tr><th>Codename</th><th>Associated Product</th><th>Build Range</th><th>Period</th><th>Status</th></tr>
          </thead>
          <tbody id="codenames-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function codenameCard(c) {
  const color = CODENAME_TYPE_COLOR[c.type] || "#9fe7ff";
  return `
  <article class="codename-card" style="--tile-color:${color}">
    <p class="codename-card__name">${escapeHTML(c.codename)}</p>
    <p class="codename-card__product">${escapeHTML(c.product)}</p>
    <p class="codename-card__period">${escapeHTML(c.period)}</p>
    <span class="chip" style="--chip-color:${color}">${escapeHTML(c.type)}</span>
    <p class="codename-card__notes">${escapeHTML(c.notes)}</p>
    <a class="codename-card__source" href="${escapeHTML(c.source.url)}" target="_blank" rel="noopener">Source: ${escapeHTML(c.source.name)}</a>
  </article>`;
}

function initCodenames() {
  document.getElementById("codenames-timeline").innerHTML = WINDOWS_CODENAMES.map(codenameCard).join("");
  document.getElementById("codenames-tbody").innerHTML = WINDOWS_CODENAMES.map(c => `
    <tr>
      <td><strong>${escapeHTML(c.codename)}</strong></td>
      <td>${escapeHTML(c.product)}</td>
      <td>${escapeHTML(c.buildRange)}</td>
      <td>${escapeHTML(c.period)}</td>
      <td>${escapeHTML(c.status)}</td>
    </tr>`).join("");
}
