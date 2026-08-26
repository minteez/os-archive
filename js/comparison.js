/* =========================================================================
   OS ARCHIVE — COMPARISON TOOL
   ========================================================================= */

const COMPARE_FIELDS = [
  ["name", "Name"], ["version", "Version"], ["releaseYear", "Release Year"],
  ["developer", "Developer"], ["platform", "Platform"], ["architecture", "Architecture"],
  ["kernel", "Kernel"], ["interface", "Interface"], ["deviceType", "Device Type"],
  ["predecessor", "Predecessor"], ["successor", "Successor"], ["status", "Status"]
];

function osPickerOptions(selectedId) {
  const sorted = [...OS_DATA].sort((a,b) => a.name.localeCompare(b.name) || (a.releaseYear||0)-(b.releaseYear||0));
  return sorted.map(o => `<option value="${o.id}" ${o.id===selectedId?"selected":""}>${escapeHTML(o.name)} — ${escapeHTML(o.version)}</option>`).join("");
}

function renderComparison(idA, idB) {
  return `
  <div class="container section compare-page">
    <header class="page-head">
      <p class="eyebrow">COMPARE OPERATING SYSTEMS</p>
      <h1>Side-by-Side Comparison</h1>
      <p class="page-head__sub">Choose any two systems in the archive to see how they differ.</p>
    </header>

    <div class="compare-picker">
      <div class="compare-picker__select">
        <label for="compare-a">System A</label>
        <select id="compare-a"><option value="">Choose a system…</option>${osPickerOptions(idA)}</select>
      </div>
      <button class="btn btn--ghost" id="compare-swap" type="button" aria-label="Swap systems">⇄ SWAP</button>
      <div class="compare-picker__select">
        <label for="compare-b">System B</label>
        <select id="compare-b"><option value="">Choose a system…</option>${osPickerOptions(idB)}</select>
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

function drawComparison(a, b) {
  const host = document.getElementById("compare-output");
  if (!a && !b) { host.innerHTML = `<p class="empty-state">Pick two systems above to compare them — try Windows XP vs Windows 7, or Ubuntu vs Fedora.</p>`; return; }
  if (!a || !b) { host.innerHTML = `<p class="empty-state">Choose one more system to complete the comparison.</p>`; return; }

  const ma = familyMeta(a.family), mb = familyMeta(b.family);
  host.innerHTML = `
    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th scope="col">Attribute</th>
            <th scope="col"><div class="compare-head" style="--tile-color:${ma.color}">${logoTile(a,"sm")}<a href="#/archive/${a.id}">${escapeHTML(a.name)}</a></div></th>
            <th scope="col"><div class="compare-head" style="--tile-color:${mb.color}">${logoTile(b,"sm")}<a href="#/archive/${b.id}">${escapeHTML(b.name)}</a></div></th>
          </tr>
        </thead>
        <tbody>
          ${COMPARE_FIELDS.map(([field, label]) => compareRow(label, a, b, field)).join("")}
          <tr>
            <th scope="row">Major Features</th>
            <td><ul>${a.majorFeatures.slice(0,4).map(f=>`<li>${escapeHTML(f)}</li>`).join("")}</ul></td>
            <td><ul>${b.majorFeatures.slice(0,4).map(f=>`<li>${escapeHTML(f)}</li>`).join("")}</ul></td>
          </tr>
          <tr>
            <th scope="row">Historical Significance</th>
            <td>${escapeHTML(a.historicalImportance)}</td>
            <td>${escapeHTML(b.historicalImportance)}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
}

function initComparison() {
  const selA = document.getElementById("compare-a");
  const selB = document.getElementById("compare-b");

  const sync = (push) => {
    const a = osById(selA.value), b = osById(selB.value);
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
