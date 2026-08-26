# OS Archive

A static, client-side virtual museum documenting the history of operating systems — built with HTML5, CSS3, and vanilla JavaScript only. No build step, no backend, no dependencies. Works as-is on GitHub Pages.

## Running locally
Any static file server works, e.g.:
```
python3 -m http.server 8000
```
Then open http://localhost:8000

## Structure
- `index.html` — single-page shell; a hash router (`js/app.js`) swaps views into `#view`
- `css/style.css`, `css/responsive.css` — design system and layout
- `js/data.js` — the OS dataset (add new records here; nothing else needs to change)
- `js/storage.js` — localStorage wrapper (favorites, quiz scores, recently viewed)
- `js/filters.js`, `js/timeline.js`, `js/search.js`, `js/comparison.js`, `js/quiz.js`, `js/gallery.js`, `js/archive.js`, `js/content.js` — feature modules
- `js/app.js` — router, nav/footer, shared helpers (loaded last)

## Adding an OS
Append a new object to the `OS_DATA` array in `js/data.js` following the existing schema. It will automatically appear in the explorer, timeline, search, filters, comparison tool, gallery and quiz — no other file needs to change.

## Notes on images
No third-party screenshots are hotlinked, since licensing varies by source. Each entry instead uses a stylized monogram tile and links out to a verified historical source (Wikipedia, etc.) via "VIEW SOURCE".
