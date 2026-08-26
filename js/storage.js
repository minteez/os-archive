/* =========================================================================
   OS ARCHIVE — STORAGE
   Thin wrapper around localStorage. Everything the site persists lives
   under a single namespaced key so it never collides with other sites.
   ========================================================================= */

const Storage = (() => {
  const KEY = "osarchive:v1";

  function readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      return Object.assign(defaults(), JSON.parse(raw));
    } catch (e) {
      console.warn("OS Archive: could not read localStorage, using defaults.", e);
      return defaults();
    }
  }

  function writeAll(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("OS Archive: could not write to localStorage.", e);
    }
  }

  function defaults() {
    return {
      favorites: [],
      recentlyViewed: [],
      quiz: { bestScore: 0, totalAnswered: 0, totalCorrect: 0 },
      osOfTheDaySeen: [],
      settings: { reducedMotion: false }
    };
  }

  return {
    getFavorites() { return readAll().favorites; },
    isFavorite(id) { return readAll().favorites.includes(id); },
    toggleFavorite(id) {
      const data = readAll();
      const i = data.favorites.indexOf(id);
      if (i === -1) data.favorites.push(id); else data.favorites.splice(i, 1);
      writeAll(data);
      return data.favorites.includes(id);
    },

    addRecentlyViewed(id) {
      const data = readAll();
      data.recentlyViewed = [id, ...data.recentlyViewed.filter(x => x !== id)].slice(0, 12);
      writeAll(data);
    },
    getRecentlyViewed() { return readAll().recentlyViewed; },

    getQuizStats() { return readAll().quiz; },
    recordQuizAnswer(correct) {
      const data = readAll();
      data.quiz.totalAnswered += 1;
      if (correct) data.quiz.totalCorrect += 1;
      writeAll(data);
    },
    recordQuizScore(score) {
      const data = readAll();
      if (score > data.quiz.bestScore) data.quiz.bestScore = score;
      writeAll(data);
      return data.quiz.bestScore;
    },

    markOSOfDaySeen(id) {
      const data = readAll();
      data.osOfTheDaySeen = [...new Set([...data.osOfTheDaySeen, id])];
      writeAll(data);
    },
    getOSOfDaySeen() { return readAll().osOfTheDaySeen; },

    getSettings() { return readAll().settings; },
    setSetting(key, value) {
      const data = readAll();
      data.settings[key] = value;
      writeAll(data);
    }
  };
})();

window.Storage = Storage;
