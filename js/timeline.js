/* =========================================================================
   OS ARCHIVE — MASTER TIMELINE
   ========================================================================= */

function decadeLabel(year) {
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

function renderTimeline() {
  const families = [...new Set(OS_DATA.map(o => o.family))].sort();
  return `
  <div class="timeline-page">
    <header class="page-head container">
      <p class="eyebrow">THE OS TIMELINE</p>
      <h1>Decades of Computing History</h1>
      <p class="page-head__sub">From early command-line systems to modern desktops, mobiles and consoles. Filter by family, then click any marker to open its profile.</p>
    </header>

    <div class="container timeline-controls">
      <div class="timeline-legend" id="timeline-legend">
        <button class="legend-chip is-active" data-family="all" style="--chip-color:#9fe7ff">All Families</button>
        ${families.map(f => `<button class="legend-chip" data-family="${escapeHTML(f)}" style="--chip-color:${familyMeta(f).color}">${escapeHTML(f)}</button>`).join("")}
      </div>
    </div>

    <div class="container">
      <div class="timeline" id="timeline-track" role="list" aria-label="Operating system release timeline"></div>
    </div>
  </div>`;
}

function initTimeline() {
  let activeFamily = "all";

  const draw = () => {
    const sorted = [...OS_DATA].filter(o => o.releaseYear).sort((a, b) => a.releaseYear - b.releaseYear);
    const filtered = activeFamily === "all" ? sorted : sorted.filter(o => o.family === activeFamily);

    const byDecade = {};
    filtered.forEach(o => {
      const d = decadeLabel(o.releaseYear);
      (byDecade[d] = byDecade[d] || []).push(o);
    });

    const track = document.getElementById("timeline-track");
    track.innerHTML = Object.keys(byDecade).map(decade => `
      <div class="timeline-era" role="listitem">
        <div class="timeline-era__label"><span>${decade}</span></div>
        <div class="timeline-era__items">
          ${byDecade[decade].map(o => {
            const m = familyMeta(o.family);
            const hasReleases = o.releases && o.releases.length;
            return `
            <div class="timeline-item-wrap">
              <a class="timeline-item ${hasReleases ? "timeline-item--expandable" : ""}" href="#/archive/${o.id}" style="--tile-color:${m.color}" title="${escapeHTML(o.name)} ${escapeHTML(o.version)} (${o.releaseYear})">
                <span class="timeline-item__dot" aria-hidden="true"></span>
                <span class="timeline-item__year">${o.releaseYear}</span>
                <span class="timeline-item__name">${escapeHTML(o.name)}</span>
                <span class="timeline-item__version">${escapeHTML(o.version)}</span>
              </a>
              ${hasReleases ? `
                <button class="timeline-expand-btn" data-expand="${o.id}" aria-expanded="false">
                  ▸ ${o.releases.length} tracked releases
                </button>
                <div class="timeline-releases" id="timeline-releases-${o.id}" hidden>
                  ${o.releases.map(r => `<div class="timeline-release-chip"><span>${escapeHTML(r.version)}</span><span>${escapeHTML(r.date)}</span></div>`).join("")}
                </div>` : ""}
            </div>`;
          }).join("")}
        </div>
      </div>`).join("") || `<p class="empty-state">No systems in this filter.</p>`;
  };

  document.getElementById("timeline-legend").addEventListener("click", e => {
    const btn = e.target.closest(".legend-chip");
    if (!btn) return;
    activeFamily = btn.dataset.family;
    document.querySelectorAll(".legend-chip").forEach(c => c.classList.toggle("is-active", c === btn));
    draw();
  });

  document.getElementById("timeline-track").addEventListener("click", e => {
    const btn = e.target.closest("[data-expand]");
    if (!btn) return;
    const panel = document.getElementById(`timeline-releases-${btn.dataset.expand}`);
    const open = panel.hasAttribute("hidden");
    panel.toggleAttribute("hidden", !open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = btn.textContent.replace(/^[▸▾]/, open ? "▾" : "▸");
  });

  draw();
}
