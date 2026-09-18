# OS Archive

## Gallery
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/9c0567fe-17ba-42e1-8d61-a5aece16cc38" />
<img width="1593" height="896" alt="image" src="https://github.com/user-attachments/assets/16a83a85-2c0c-4195-880a-f207a013edfd" />
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/a26ef222-a0a2-46d4-9e36-f29ca54b4a17" />
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/c49647ed-788b-4bbd-a905-30e72873f783" />
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/ff006af8-cb00-40a9-ba34-da918362dba6" />
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/be92fd73-c01d-4c73-b762-edbbcbc36aef" />
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/fe900a54-384c-46e1-90a4-b8051ac5826e" />

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
