/* =========================================================================
   OS ARCHIVE — COMPARISON TOOL
   Supports three comparison modes:
     - Two top-level operating systems (Windows 10 vs Windows 11)
     - A major OS against one of its own releases (Windows 10 vs Windows 10 22H2)
     - Two releases within the same or different families (Windows 10 22H2 vs Windows 11 24H2)
   Every selectable option is "flattened" into a comparable id: either the
   OS's own id, or "{osId}::{releaseIndex}" for a nested release.
   ========================================================================= */

const COMPARE_FIELDS = [
  ["name", "Name"], ["version", "Version"], ["releaseYear", "Release Year"],
  ["developer", "Developer"], ["platform", "Platform"], ["architecture", "Architecture"],
  ["kernel", "Kernel"], ["interface", "Interface"], ["deviceType", "Device Type"],
  ["predecessor", "Predecessor"], ["successor", "Successor"], ["status", "Status"]
];

const RELEASE_COMPARE_EXTRA = [
  ["codename", "Codename"], ["build", "Build"]
];

function comparablesList() {
  const out = [];
  OS_DATA.forEach(o => {
    out.push({ id: o.id, label: `${o.name} — ${o.version}`, isRelease: false, os: o, release: null });
    (o.releases || []).forEach((r, i) => {
      out.push({
        id: `${o.id}::${i}`,
        label: `${o.name} → ${r.version}`,
        isRelease: true, os: o, release: r
      });
    });
  });
  return out;
}

function resolveComparable(id) {
  if (!id) return null;
  const [osId, relIdx] = id.split("::");
  const os = osById(osId);
  if (!os) return null;
  if (relIdx === undefined) {
    return { id: os.id, isRelease: false, os, release: null, data: os };
  }
  const release = (os.releases || [])[+relIdx];
  if (!release) return null;
  const merged = {
    ...os,
    name: `${os.name} ${release.version}`,
    version: release.version,
    releaseYear: parseYearFromDate(release.date) || os.releaseYear,
    status: release.status,
    codename: release.codename,
    build: release.build,
    predecessor: os.name,
    successor: os.successor
  };
  return { id, isRelease: true, os, release, data: merged };
}

function parseYearFromDate(dateStr) {
  if (!dateStr) return null;
  const m = String(dateStr).match(/(19|20)\d{2}/);
  return m ? +m[0] : null;
}

function osPickerOptions(selectedId) {
  const items = comparablesList().sort((a, b) => a.os.name.localeCompare(b.os.name) || (a.os.releaseYear||0)-(b.os.releaseYear||0));
  return items.map(item =>
    `<option value="${item.id}" ${item.id===selectedId?"selected":""}>${escapeHTML(item.label)}</option>`
  ).join("");
}

function renderComparison(idA, idB) {
  return `
  <div class="container section compare-page">
    <header class="page-head">
      <p class="eyebrow">COMPARE OPERATING SYSTEMS</p>
      <h1>Side-by-Side Comparison</h1>
      <p class="page-head__sub">Compare two operating systems, or drill into specific releases — e.g. Windows 10 22H2 vs Windows 11 24H2, or Android 13 vs Android 14.</p>
    </header>

    <div class="compare-picker">
      <div class="compare-picker__select">
        <label for="compare-a">System A</label>
        <select id="compare-a"><option value="">Choose a system or release…</option>${osPickerOptions(idA)}</select>
      </div>
      <button class="btn btn--ghost" id="compare-swap" type="button" aria-label="Swap systems">⇄ SWAP</button>
      <div class="compare-picker__select">
        <label for="compare-b">System B</label>
        <select id="compare-b"><option value="">Choose a system or release…</option>${osPickerOptions(idB)}</select>
      </div>
      <button class="btn btn--outline" id="compare-clear" type="button">CLEAR COMPARISON</button>
    </div>

    <div id="compare-output"></div>
  </div>`;
}

function compareRow(label, a, b, field) {
  const va = a ? (a[field] ?? "—") : "—";
  const vb = b ? (b[field] ?? "—") : "—";
  const differ = a && b && String(va).toLowerCase() !== String(vb).toLowerCase();
  return `
  <tr class="${differ ? "row-diff" : ""}">
    <th scope="row">${escapeHTML(label)}</th>
    <td>${escapeHTML(String(va))}</td>
    <td>${escapeHTML(String(vb))}</td>
  </tr>`;
}

function drawComparison(compA, compB) {
  const host = document.getElementById("compare-output");
  if (!compA && !compB) { host.innerHTML = `<p class="empty-state">Pick two systems above to compare them — try Windows XP vs Windows 7, Ubuntu vs Fedora, or Windows 10 22H2 vs Windows 11 24H2.</p>`; return; }
  if (!compA || !compB) { host.innerHTML = `<p class="empty-state">Choose one more system to complete the comparison.</p>`; return; }

  const a = compA.data, b = compB.data;
  const ma = familyMeta(compA.os.family), mb = familyMeta(compB.os.family);
  const showExtra = compA.isRelease || compB.isRelease;

  host.innerHTML = `
    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th scope="col">Attribute</th>
            <th scope="col"><div class="compare-head" style="--tile-color:${ma.color}">${logoTile(compA.os,"sm")}<a href="#/archive/${compA.os.id}">${escapeHTML(a.name)}</a></div></th>
            <th scope="col"><div class="compare-head" style="--tile-color:${mb.color}">${logoTile(compB.os,"sm")}<a href="#/archive/${compB.os.id}">${escapeHTML(b.name)}</a></div></th>
          </tr>
        </thead>
        <tbody>
          ${COMPARE_FIELDS.map(([field, label]) => compareRow(label, a, b, field)).join("")}
          ${showExtra ? RELEASE_COMPARE_EXTRA.map(([field, label]) => compareRow(label, a, b, field)).join("") : ""}
          <tr>
            <th scope="row">Major Features</th>
            <td><ul>${compA.os.majorFeatures.slice(0,4).map(f=>`<li>${escapeHTML(f)}</li>`).join("")}</ul></td>
            <td><ul>${compB.os.majorFeatures.slice(0,4).map(f=>`<li>${escapeHTML(f)}</li>`).join("")}</ul></td>
          </tr>
          <tr>
            <th scope="row">Historical Significance</th>
            <td>${escapeHTML(compA.os.historicalImportance)}</td>
            <td>${escapeHTML(compB.os.historicalImportance)}</td>
          </tr>
          ${showExtra ? `
          <tr>
            <th scope="row">Release Notes</th>
            <td>${escapeHTML(compA.release ? compA.release.notes : "—")}</td>
            <td>${escapeHTML(compB.release ? compB.release.notes : "—")}</td>
          </tr>` : ""}
        </tbody>
      </table>
    </div>`;
}

function initComparison() {
  const selA = document.getElementById("compare-a");
  const selB = document.getElementById("compare-b");

  const sync = (push) => {
    const a = resolveComparable(selA.value), b = resolveComparable(selB.value);
    drawComparison(a, b);
    if (push) history.replaceState(null, "", `#/compare/${selA.value || ""}/${selB.value || ""}`);
  };

  selA.addEventListener("change", () => sync(true));
  selB.addEventListener("change", () => sync(true));

  document.getElementById("compare-swap").addEventListener("click", () => {
    const tmp = selA.value; selA.value = selB.value; selB.value = tmp;
    sync(true);
  });

  document.getElementById("compare-clear").addEventListener("click", () => {
    selA.value = ""; selB.value = "";
    sync(true);
  });

  sync(false);
}
