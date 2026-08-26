/* =========================================================================
   OS ARCHIVE — FILTERS
   Builds the filter panel markup and applies the current filter state to
   the dataset. Used by archive.js's explorer view.
   ========================================================================= */

const Filters = (() => {
  let state = {
    q: "",
    family: "all",
    category: "all",
    deviceType: "all",
    developer: "all",
    yearMin: null,
    yearMax: null
  };

  function reset(presetFamily) {
    const years = OS_DATA.map(o => o.releaseYear).filter(Boolean);
    state = {
      q: "",
      family: presetFamily || "all",
      category: "all",
      deviceType: "all",
      developer: "all",
      yearMin: Math.min(...years),
      yearMax: Math.max(...years)
    };
  }

  function options(field) {
    return [...new Set(OS_DATA.map(o => o[field]).filter(Boolean))].sort();
  }

  function developerOptions() {
    // Collapse long developer strings to a readable top-level name for the dropdown
    const set = new Set();
    OS_DATA.forEach(o => {
      const first = (o.developer || "").split(/[\/(]/)[0].trim();
      if (first) set.add(first);
    });
    return [...set].sort();
  }

  function panelHTML() {
    const years = OS_DATA.map(o => o.releaseYear).filter(Boolean);
    const min = Math.min(...years), max = Math.max(...years);
    if (state.yearMin === null) reset();
    return `
    <div class="filter-panel" id="filter-panel">
      <div class="filter-panel__head">
        <h2>Filter the Archive</h2>
        <button class="btn btn--ghost btn--small" id="filters-reset" type="button">RESET FILTERS</button>
      </div>

      <div class="filter-group">
        <label for="f-family">Family</label>
        <select id="f-family">
          <option value="all">All families</option>
          ${options("family").map(f => `<option value="${escapeHTML(f)}" ${state.family===f?"selected":""}>${escapeHTML(f)}</option>`).join("")}
        </select>
      </div>

      <div class="filter-group">
        <label for="f-category">Category</label>
        <select id="f-category">
          <option value="all">All categories</option>
          ${options("category").map(c => `<option value="${escapeHTML(c)}" ${state.category===c?"selected":""}>${escapeHTML(c)}</option>`).join("")}
        </select>
      </div>

      <div class="filter-group">
        <label for="f-device">Device Type</label>
        <select id="f-device">
          <option value="all">All device types</option>
          ${options("deviceType").map(d => `<option value="${escapeHTML(d)}" ${state.deviceType===d?"selected":""}>${escapeHTML(d)}</option>`).join("")}
        </select>
      </div>

      <div class="filter-group">
        <label for="f-developer">Developer</label>
        <select id="f-developer">
          <option value="all">All developers</option>
          ${developerOptions().map(d => `<option value="${escapeHTML(d)}" ${state.developer===d?"selected":""}>${escapeHTML(d)}</option>`).join("")}
        </select>
      </div>

      <div class="filter-group filter-group--range">
        <label for="f-year-min">Year range</label>
        <div class="range-row">
          <input type="range" id="f-year-min" min="${min}" max="${max}" value="${state.yearMin}">
          <input type="range" id="f-year-max" min="${min}" max="${max}" value="${state.yearMax}">
        </div>
        <p class="range-readout"><span id="f-year-min-label">${state.yearMin}</span> — <span id="f-year-max-label">${state.yearMax}</span></p>
      </div>
    </div>`;
  }

  function wirePanel(onChange) {
    reset(state.family !== "all" ? state.family : null);
    const $ = id => document.getElementById(id);
    $("f-family").value = state.family;
    $("f-category").addEventListener("change", e => { state.category = e.target.value; onChange(); });
    $("f-family").addEventListener("change", e => { state.family = e.target.value; onChange(); });
    $("f-device").addEventListener("change", e => { state.deviceType = e.target.value; onChange(); });
    $("f-developer").addEventListener("change", e => { state.developer = e.target.value; onChange(); });
    $("f-year-min").addEventListener("input", e => {
      state.yearMin = Math.min(+e.target.value, state.yearMax);
      $("f-year-min-label").textContent = state.yearMin;
      onChange();
    });
    $("f-year-max").addEventListener("input", e => {
      state.yearMax = Math.max(+e.target.value, state.yearMin);
      $("f-year-max-label").textContent = state.yearMax;
      onChange();
    });
    $("filters-reset").addEventListener("click", () => {
      const keepFamily = state.family;
      reset();
      onChange();
      renderPanelInPlace(onChange);
    });
  }

  function renderPanelInPlace(onChange) {
    const host = document.getElementById("filter-panel");
    if (!host || !host.parentNode) return;
    host.outerHTML = panelHTML();
    wirePanel(onChange);
  }

  function setQuery(q) { state.q = q; }
  function setFamily(f) { state.family = f; }

  function apply(list) {
    return list.filter(o => {
      if (state.family !== "all" && o.family !== state.family) return false;
      if (state.category !== "all" && o.category !== state.category) return false;
      if (state.deviceType !== "all" && o.deviceType !== state.deviceType) return false;
      if (state.developer !== "all" && !(o.developer || "").startsWith(state.developer)) return false;
      if (state.yearMin !== null && o.releaseYear && o.releaseYear < state.yearMin) return false;
      if (state.yearMax !== null && o.releaseYear && o.releaseYear > state.yearMax) return false;
      if (state.q) {
        const hay = [o.name, o.version, o.developer, o.family, o.category, o.releaseYear, ...(o.tags||[])].join(" ").toLowerCase();
        if (!hay.includes(state.q.toLowerCase())) return false;
      }
      return true;
    });
  }

  return { panelHTML, wirePanel, apply, setQuery, setFamily, reset, get state() { return state; } };
})();

window.Filters = Filters;
