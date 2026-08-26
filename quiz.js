/* =========================================================================
   OS ARCHIVE — "GUESS THE OS" QUIZ
   No screenshots are hotlinked (see image/source policy). Instead each
   round renders a stylized clue "screen" built from verified data — era
   color, interface style and a distinguishing fact — which keeps the quiz
   fully client-side and free of fabricated imagery.
   ========================================================================= */

const QUIZ_POOLS = {
  EASY:   OS_DATA.filter(o => o.tags.includes("iconic")),
  MEDIUM: OS_DATA.filter(o => !o.tags.includes("iconic") && ["Windows","Apple","Linux Distribution","Mobile"].includes(o.family)),
  HARD:   OS_DATA.filter(o => !o.tags.includes("iconic") && ["UNIX","BSD","Console","Linux Kernel"].includes(o.family)),
  EXPERT: OS_DATA.filter(o => !o.tags.includes("iconic") && o.family === "Other")
};

let quizState = null;

function newQuizQuestion(difficulty) {
  const pool = QUIZ_POOLS[difficulty].length ? QUIZ_POOLS[difficulty] : OS_DATA;
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const distractorsPool = OS_DATA.filter(o => o.id !== answer.id && o.family === answer.family);
  const fallbackPool = OS_DATA.filter(o => o.id !== answer.id);
  const distractors = [];
  const source = distractorsPool.length >= 3 ? distractorsPool : fallbackPool;
  const used = new Set([answer.id]);
  while (distractors.length < 3 && used.size < source.length + 1) {
    const pick = source[Math.floor(Math.random() * source.length)];
    if (!used.has(pick.id)) { used.add(pick.id); distractors.push(pick); }
  }
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  return { answer, options };
}

function renderQuiz() {
  const stats = Storage.getQuizStats();
  return `
  <div class="container section quiz-page">
    <header class="page-head">
      <p class="eyebrow">GUESS THE OS</p>
      <h1>Test Your Interface Knowledge</h1>
      <p class="page-head__sub">Study the clue screen, then pick the correct operating system. Best score: <strong id="quiz-best">${stats.bestScore}</strong></p>
    </header>

    <div class="quiz-difficulty" id="quiz-difficulty">
      <button class="btn btn--outline" data-diff="EASY">EASY</button>
      <button class="btn btn--outline" data-diff="MEDIUM">MEDIUM</button>
      <button class="btn btn--outline" data-diff="HARD">HARD</button>
      <button class="btn btn--outline" data-diff="EXPERT">EXPERT</button>
    </div>

    <div id="quiz-body"></div>
  </div>`;
}

function quizClueScreen(os) {
  const m = familyMeta(os.family);
  return `
  <div class="quiz-screen" style="--tile-color:${m.color}">
    <div class="quiz-screen__bar"><span></span><span></span><span></span></div>
    <div class="quiz-screen__body">
      <p class="quiz-screen__family">${escapeHTML(os.family)} &middot; ${escapeHTML(os.category)}</p>
      <p class="quiz-screen__clue">"${escapeHTML(os.interface || "Interface details unverified")}"</p>
      <p class="quiz-screen__hint">Era: ${os.releaseYear ? decadeLabel(os.releaseYear) : "Unknown"} &middot; Kernel: ${escapeHTML(os.kernel)}</p>
    </div>
  </div>`;
}

function initQuiz() {
  quizState = { difficulty: null, score: 0, answered: 0, current: null };

  document.getElementById("quiz-difficulty").addEventListener("click", e => {
    const btn = e.target.closest("[data-diff]");
    if (!btn) return;
    quizState.difficulty = btn.dataset.diff;
    quizState.score = 0;
    quizState.answered = 0;
    document.querySelectorAll("#quiz-difficulty button").forEach(b => b.classList.toggle("is-active", b === btn));
    nextQuizQuestion();
  });
}

function nextQuizQuestion() {
  const q = newQuizQuestion(quizState.difficulty);
  quizState.current = q;
  const body = document.getElementById("quiz-body");
  body.innerHTML = `
    <div class="quiz-round">
      <p class="quiz-round__meta">Question ${quizState.answered + 1} &middot; Score ${quizState.score} &middot; ${quizState.difficulty}</p>
      ${quizClueScreen(q.answer)}
      <h2 class="quiz-question">Which operating system is this?</h2>
      <div class="quiz-options" id="quiz-options">
        ${q.options.map(o => `<button class="quiz-option" data-id="${o.id}">${escapeHTML(o.name)} <span>${escapeHTML(o.version)}</span></button>`).join("")}
      </div>
      <div id="quiz-result"></div>
    </div>`;

  document.getElementById("quiz-options").addEventListener("click", handleQuizAnswer, { once: false });
}

function handleQuizAnswer(e) {
  const btn = e.target.closest(".quiz-option");
  if (!btn || btn.disabled) return;
  const q = quizState.current;
  const chosenId = btn.dataset.id;
  const correct = chosenId === q.answer.id;

  document.querySelectorAll(".quiz-option").forEach(b => {
    b.disabled = true;
    if (b.dataset.id === q.answer.id) b.classList.add("is-correct");
    else if (b === btn) b.classList.add("is-incorrect");
  });

  quizState.answered += 1;
  if (correct) quizState.score += 1;
  Storage.recordQuizAnswer(correct);
  const bestScore = Storage.recordQuizScore(quizState.score);
  const bestEl = document.getElementById("quiz-best");
  if (bestEl) bestEl.textContent = bestScore;

  const fact = q.answer.interestingFacts[0] || "";
  document.getElementById("quiz-result").innerHTML = `
    <div class="quiz-result ${correct ? "is-correct" : "is-incorrect"}">
      <p class="quiz-result__verdict">${correct ? "Correct!" : "Not quite."}</p>
      <p><strong>${escapeHTML(q.answer.name)} ${escapeHTML(q.answer.version)}</strong> &middot; ${q.answer.releaseYear} &middot; ${escapeHTML(q.answer.developer)}</p>
      <p class="quiz-result__fact">${escapeHTML(fact)}</p>
      <p class="quiz-result__source"><a href="${escapeHTML(q.answer.sourceLinks[0]?.url || "#")}" target="_blank" rel="noopener">Source: ${escapeHTML(q.answer.sourceLinks[0]?.name || "")}</a></p>
      <div class="quiz-result__actions">
        <button class="btn btn--primary" id="quiz-next">NEXT CHALLENGE</button>
        <a class="btn btn--outline" href="#/archive/${q.answer.id}">EXPLORE THIS OS</a>
      </div>
    </div>`;

  document.getElementById("quiz-next").addEventListener("click", nextQuizQuestion);
}
