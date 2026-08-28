/* =========================================================================
   OS ARCHIVE — HOME, EVOLUTION OF THE DESKTOP, ABOUT
   ========================================================================= */

/* ------------------------------ HOME ------------------------------ */

function pickOSOfDay() {
  const seen = new Set(Storage.getOSOfDaySeen());
  let pool = OS_DATA.filter(o => !seen.has(o.id));
  if (!pool.length) pool = OS_DATA;
  // Deterministic-ish per-day pick so it doesn't change on every reload
  const dayKey = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const ch of dayKey) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const os = pool[hash % pool.length];
  return os;
}

function renderHome() {
  const stats = archiveStats();
  const osOfDay = pickOSOfDay();
  return `
  <div class="home">
    <section class="hero">
      <div class="hero__scanlines" aria-hidden="true"></div>
      <div class="hero__grid" aria-hidden="true"></div>
      <div class="container hero__inner">
        <p class="hero__terminal" aria-hidden="true">C:\\ARCHIVE&gt; <span class="cursor-blink">_</span></p>
        <h1 class="hero__title">OS ARCHIVE</h1>
        <p class="hero__tagline">"A living museum of operating systems."</p>
        <p class="hero__sub">Explore decades of computing history — from command-line systems and early graphical interfaces to modern desktops, mobile platforms, kernels, distributions, and experimental operating systems.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#/archive">EXPLORE THE ARCHIVE</a>
          <a class="btn btn--outline" href="#/timeline">ENTER TIMELINE</a>
        </div>
      </div>
    </section>

    <section class="stats-strip container">
      <div class="stat"><p class="stat__num">${stats.total}</p><p class="stat__label">OS ENTRIES</p></div>
      <div class="stat"><p class="stat__num">${stats.windows}</p><p class="stat__label">WINDOWS RELEASES</p></div>
      <div class="stat"><p class="stat__num">${stats.apple}</p><p class="stat__label">APPLE RELEASES</p></div>
      <div class="stat"><p class="stat__num">${stats.linux}</p><p class="stat__label">LINUX &amp; DISTROS</p></div>
      <div class="stat"><p class="stat__num">${stats.other}</p><p class="stat__label">OTHER SYSTEMS</p></div>
      <div class="stat"><p class="stat__num">${stats.decades}</p><p class="stat__label">HISTORICAL ERAS</p></div>
    </section>

    <section class="container section os-of-day">
      <div class="panel-head">
        <h2>OS OF THE DAY</h2>
        <button class="btn btn--outline btn--small" id="os-of-day-next" type="button">NEXT OS</button>
      </div>
      <div id="os-of-day-body">${osOfDayCard(osOfDay)}</div>
    </section>

    <section class="container section random-os">
      <div class="panel-head">
        <h2>RANDOM OS</h2>
      </div>
      <div class="random-os__panel">
        <p>Feeling curious? Let the archive pick for you.</p>
        <button class="btn btn--primary" id="random-os-btn" type="button">RANDOM OS</button>
        <div id="random-os-result" aria-live="polite"></div>
      </div>
    </section>

    <section class="container section home-links">
      <div class="panel-head"><h2>KEEP EXPLORING</h2></div>
      <div class="home-links__grid">
        <a class="home-link-card" href="#/evolution"><h3>Evolution of the Desktop</h3><p>Ten chronological stages of GUI history.</p></a>
        <a class="home-link-card" href="#/gallery"><h3>Desktop Gallery</h3><p>A visual reference across interface eras.</p></a>
        <a class="home-link-card" href="#/compare"><h3>Compare Systems</h3><p>Windows XP vs 7? Ubuntu vs Fedora? You choose.</p></a>
        <a class="home-link-card" href="#/quiz"><h3>Guess the OS</h3><p>Test your interface knowledge across four difficulty levels.</p></a>
      </div>
    </section>
  </div>`;
}

function osOfDayCard(os) {
  const m = familyMeta(os.family);
  return `
  <article class="os-of-day-card" style="--tile-color:${m.color}">
    ${logoTile(os, "lg")}
    <div class="os-of-day-card__body">
      <h3>${escapeHTML(os.name)} <span>${escapeHTML(os.version)}</span></h3>
      <p class="os-of-day-card__meta">${os.releaseYear || "Unverified"} &middot; ${escapeHTML(os.interface)}</p>
      <p class="os-of-day-card__fact">${escapeHTML(os.interestingFacts[0] || "")}</p>
      <a class="btn btn--outline btn--small" href="#/archive/${os.id}">EXPLORE →</a>
    </div>
  </article>`;
}

function initHome() {
  Storage.markOSOfDaySeen(pickOSOfDay().id);

  document.getElementById("os-of-day-next").addEventListener("click", () => {
    const seen = new Set(Storage.getOSOfDaySeen());
    let pool = OS_DATA.filter(o => !seen.has(o.id));
    if (!pool.length) pool = OS_DATA;
    const os = pool[Math.floor(Math.random() * pool.length)];
    Storage.markOSOfDaySeen(os.id);
    document.getElementById("os-of-day-body").innerHTML = osOfDayCard(os);
  });

  document.getElementById("random-os-btn").addEventListener("click", () => {
    const resultHost = document.getElementById("random-os-result");
    resultHost.innerHTML = `<p class="random-os__searching">THE ARCHIVE HAS SELECTED...</p>`;
    resultHost.classList.add("is-searching");
    setTimeout(() => {
      const os = OS_DATA[Math.floor(Math.random() * OS_DATA.length)];
      resultHost.classList.remove("is-searching");
      resultHost.innerHTML = osOfDayCard(os);
    }, 700);
  });
}

/* ------------------------------ EVOLUTION OF THE DESKTOP ------------------------------ */

const EVOLUTION_STAGES = [
  {
    title: "Command Line",
    years: "1960s–1981",
    description: "Before graphical interfaces, users typed commands into a text-only terminal or teletype. Every action — running a program, listing files — meant typing an exact instruction.",
    innovations: ["Text-based shells and batch processing", "Hierarchical file systems", "Pipes and composable command tools (UNIX)"],
    systems: ["unix-original", "cpm-1", "msdos-1"]
  },
  {
    title: "Early Graphical Interfaces",
    years: "1973–1983",
    description: "Research labs, especially Xerox PARC, prototyped windows, icons, menus and pointers (WIMP) — ideas that wouldn't reach the mass market for another decade.",
    innovations: ["Mouse-driven pointer interaction", "Overlapping windows (research prototypes)", "Bitmap displays with icons"],
    systems: []
  },
  {
    title: "Desktop Metaphor",
    years: "1984",
    description: "The original Macintosh brought the desktop metaphor — folders, trash can, menu bar — to a mainstream consumer product for the first time.",
    innovations: ["Finder desktop metaphor", "Menu bar with pull-down menus", "Mouse-driven point-and-click interaction"],
    systems: ["mac-system1"]
  },
  {
    title: "Windowed Computing",
    years: "1985–1990",
    description: "Microsoft and others raced to bring overlapping, resizable windows to IBM-compatible PCs, while Commodore's Amiga pushed true multitasking years ahead of its rivals.",
    innovations: ["Overlapping, resizable windows", "Preemptive multitasking (Amiga)", "Program Manager-style application launchers"],
    systems: ["win-2", "amigaos-1"]
  },
  {
    title: "1990s Desktop Era",
    years:"1990–1999",
    description: "Windows 3.x and 95 cemented the Start menu, taskbar and Windows Explorer, while Mac System 7 brought color and multitasking to the Mac, and X11-based desktops matured on UNIX and early Linux.",
    innovations: ["Start menu and taskbar (Windows 95)", "Color desktop interfaces as standard", "Plug and Play hardware detection"],
    systems: ["win-95", "mac-system7"]
  },
  {
    title: "Early 2000s",
    years: "2000–2006",
    description: "Apple rebuilt its OS from the ground up as the Unix-based Mac OS X with the translucent Aqua interface, while Windows XP unified Microsoft's consumer and business lines on the stable NT kernel.",
    innovations: ["Aqua interface and the Dock (Mac OS X)", "Unified NT-kernel consumer OS (Windows XP)", "Desktop search tools (Spotlight)"],
    systems: ["mac-osx-10.0", "win-xp"]
  },
  {
    title: "Modern Desktop",
    years: "2007–2011",
    description: "Interfaces matured toward glass/translucency effects (Vista's Aero, OS X's continued refinement) and desktop Linux environments like GNOME and KDE became genuinely polished daily drivers.",
    innovations: ["Aero Glass translucency", "Widget/gadget panels", "Mature open-source desktop environments"],
    systems: ["win-vista", "win-7"]
  },
  {
    title: "Touch-Oriented Interfaces",
    years: "2007–2013",
    description: "The iPhone's multi-touch interface, followed by Android, reinvented interaction around direct manipulation with fingers rather than a mouse pointer — and Windows 8 attempted to bring that model to the PC.",
    innovations: ["Multi-touch gestures (pinch, swipe)", "Full-screen, app-grid home screens", "Tile-based Start screens on PCs (Windows 8)"],
    systems: ["ios-1", "android-1", "win-8"]
  },
  {
    title: "Modern Hybrid Interfaces",
    years: "2014–2021",
    description: "Desktop operating systems settled into a hybrid model: touch-capable where useful, but still built around windows, a taskbar or Dock, and keyboard-and-mouse precision.",
    innovations: ["Continuum/adaptive layouts for 2-in-1 devices", "Snap/tiling window management", "Cross-device continuity features"],
    systems: ["win-10", "macos-bigsur"]
  },
  {
    title: "Future Desktop Concepts",
    years: "2022–present",
    description: "Current interfaces increasingly blend translucent 'glass' materials, on-device AI assistance, and deeper cross-device continuity — directions still actively evolving.",
    innovations: ["Translucent 'Liquid Glass'-style materials", "On-device AI-assisted system features", "Deeper phone-to-desktop continuity"],
    systems: ["macos-tahoe", "win-11-25h2"]
  }
];

function renderEvolution() {
  return `
  <div class="evolution-page">
    <header class="page-head container">
      <p class="eyebrow">EVOLUTION OF THE DESKTOP</p>
      <h1>How Graphical Interfaces Evolved</h1>
      <p class="page-head__sub">Ten chronological stages, from blinking text cursors to translucent, AI-assisted modern desktops.</p>
    </header>

    <div class="container evolution-nav" id="evolution-nav">
      ${EVOLUTION_STAGES.map((s, i) => `<button class="evolution-nav__step" data-step="${i}">${i+1}<span>${escapeHTML(s.title)}</span></button>`).join("")}
    </div>

    <div class="container" id="evolution-stage"></div>
  </div>`;
}

function initEvolution() {
  let current = 0;
  const draw = () => {
    const s = EVOLUTION_STAGES[current];
    const systems = s.systems.map(osById).filter(Boolean);
    document.querySelectorAll(".evolution-nav__step").forEach((b, i) => b.classList.toggle("is-active", i === current));

    const host = document.getElementById("evolution-stage");
    host.classList.remove("is-visible");
    setTimeout(() => {
      host.innerHTML = `
      <article class="evolution-card">
        <p class="eyebrow">STAGE ${current + 1} OF ${EVOLUTION_STAGES.length} &middot; ${escapeHTML(s.years)}</p>
        <h2>${escapeHTML(s.title)}</h2>
        <p class="evolution-card__desc">${escapeHTML(s.description)}</p>
        <div class="evolution-card__visual" aria-hidden="true">
          <div class="evolution-mock evolution-mock--${current}">
            <div class="evolution-mock__bar"></div>
            <div class="evolution-mock__body"></div>
          </div>
        </div>
        <h3>Major Innovations</h3>
        <ul class="feature-list">${s.innovations.map(i => `<li>${escapeHTML(i)}</li>`).join("")}</ul>
        ${systems.length ? `
          <h3>Representative Systems</h3>
          <div class="cards-grid cards-grid--compact">${systems.map(osCard).join("")}</div>` : ""}
      </article>`;
      requestAnimationFrame(() => host.classList.add("is-visible"));
    }, 120);
  };

  document.getElementById("evolution-nav").addEventListener("click", e => {
    const btn = e.target.closest("[data-step]");
    if (!btn) return;
    current = +btn.dataset.step;
    draw();
  });

  draw();
}

/* ------------------------------ ABOUT ------------------------------ */

function renderAbout() {
  const stats = archiveStats();
  return `
  <div class="container section about-page">
    <header class="page-head">
      <p class="eyebrow">ABOUT</p>
      <h1>About OS Archive</h1>
    </header>

    <section class="detail-section">
      <h2>About the Website</h2>
      <p>OS Archive is a digital museum created to document and explore the evolution of operating systems. The project focuses on computing history, operating systems, user interfaces, software evolution, digital preservation, and historical exploration.</p>
      <p>The archive currently holds ${stats.total} entries spanning ${stats.decades} historical decades, covering Windows, Apple/Mac, Linux kernels and distributions, UNIX and BSD, mobile and console platforms, and a range of experimental and hobbyist systems.</p>
      <p>OS Archive is an independent educational project and is not affiliated with Microsoft, Apple, the Linux Foundation, Canonical, Red Hat, Google, or any other company or project referenced within it, unless explicitly stated.</p>
      <p class="about-disclaimer">OS Archive is an independent educational project. Product names, logos, trademarks, and historical materials belong to their respective owners. This website is not affiliated with Microsoft, Apple, Google, the Linux Foundation, or any other referenced organisation unless explicitly stated.</p>
    </section>

    <section class="detail-section developer-section">
      <h2>About the Developer</h2>
      <div class="developer-card">
        <div class="developer-card__avatar" aria-hidden="true">MZ</div>
        <div>
          <h3>Syed Muntasir Muhammad</h3>
          <p class="developer-card__handle">Known online as Mint / Minteez</p>
          <p>Syed Muntasir Muhammad, known online as Mint or Minteez, is a student and technology enthusiast interested in computers, operating systems, cybersecurity, mathematics, and software development. He enjoys exploring technology, experimenting with digital projects, and building educational and interactive web experiences.</p>
        </div>
      </div>
      <h3>Connect with the Developer</h3>
      <div class="connect-grid">
        <a class="connect-card" href="https://www.instagram.com/sudo.minteez" target="_blank" rel="noopener">
          <span class="connect-card__icon" aria-hidden="true">◈</span> Instagram
        </a>
        <a class="connect-card" href="https://www.youtube.com/@thecubermint" target="_blank" rel="noopener">
          <span class="connect-card__icon" aria-hidden="true">▶</span> YouTube
        </a>
        <a class="connect-card" href="https://github.com/minteez" target="_blank" rel="noopener">
          <span class="connect-card__icon" aria-hidden="true">⌥</span> GitHub
        </a>
        <a class="connect-card" href="https://minteez.lovable.app" target="_blank" rel="noopener">
          <span class="connect-card__icon" aria-hidden="true">◍</span> Portfolio
        </a>
      </div>
    </section>
  </div>`;
}
