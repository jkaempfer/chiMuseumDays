# Task Log

Changelog of completed work, newest first. Each entry explains what changed and why — the "what it should do" lives in REQUIREMENTS.md; the "how it works" lives in CLAUDE.md.

---

## 2026-04-28

### Replaced low-quality and duplicate museum images
Audited the `public/images` directory to identify and replace low-quality, generic, or duplicate fallback images (such as Unsplash category placeholders). Generated 10 new 16:9 landscape images to replace duplicates: `brookfield.jpg`, `botanic.jpg`, `lpc.jpg`, `nmma.jpg`, `dusable.jpg`, `holocaust.jpg`, `chinese.jpg`, `swedish.jpg`, `hellenic.jpg`, and `maritime.jpg`. Future image generation should target a 16:9 aspect ratio and 800px width to properly accommodate the UI's 3.5:1 landscape crop constraint.

### Project architecture review
Performed a comprehensive review of the project structure, utility scripts (for image downloading and searching), and codebase state to understand its current architecture and determine the next logical steps for further development.

---

## 2026-04-27

### Audited isKidFriendly flags
Removed `isKidFriendly: true` from 20 museums that don't meet the criterion (genuine child engagement, not just "kids allowed"). See REQUIREMENTS.md for the definition.

Removed: AIC, NMMA, Puerto Rican Arts, Illinois Holocaust Museum, American Writers, Chicago Cultural Center, Poetry Foundation, Chinese American, Polish Museum, National Hellenic, Irish American Heritage, Chicago Maritime, Pritzker Military, Museum of Broadcast Communications, Busy Beaver Button, Chicago Architecture Center, Robie House, Hull-House, Pullman, Pullman Porter Museum.

Kept: Field, Shedd, MSI, Adler, Lincoln Park Zoo, Garfield Conservatory, Notebaert Nature, Chicago History, DuSable, Swedish American (has Kidseum section), Brookfield Zoo, Botanic Garden, Morton Arboretum, Lincoln Park Conservatory, Bronzeville Children's Museum, Chicago Children's Museum.

### "Free Today" filter label shortened to "Free"
Button reads "Free" — shorter and still clear in context. Filter logic unchanged (still evaluates today's date).

### Calendar week navigation and full date in column headers
Added a control bar above the calendar table: ← arrow, native `<input type="date">`, → arrow, and a "Month Year" label. Both arrows and the date picker set `calendarBaseDate` directly and reset `calendarOffset` to 0.

Column headers now show: large day number / short month ("Apr") / short weekday ("Mon"). Previously the month was missing.

### Eligibility shown inline after date (not on a new line)
In the modal's "Upcoming free dates" panel, eligibility is a `<span>` on the same line as the date — `text-[9px] text-slate-300`. Keeps the list compact while surfacing the restriction (most dates are IL-residents-only).

---

## 2026-04-26

### Images downloaded and served locally
All 50 museum images saved to `public/images/{id}.jpg` (800px wide, JPEG q=75, mozjpeg). `data.json` image fields now reference `/images/{id}.jpg` — no external image requests at runtime.

Strategy: Wikimedia Commons API (`imageinfo?iiurlwidth=800`) for rate-limit-safe thumbnail URLs; Unsplash category fallbacks (Art / Nature / Science / Culture / Zoo/Garden) for museums not found on Commons. `sharp` added as a dev dependency.

### ESC key closes museum detail modal
`MuseumDetailModal` registers a `keydown` listener on mount, calls `onClose` on Escape, cleans up on unmount.

### Welcome modal fixed and restored
Root cause: `localStorage.setItem` was never called, so the first-visit check was broken — browsers with the key (from earlier testing) never saw the modal; fresh browsers always saw it. `onClose` now writes the key before hiding.

### Eligibility added to upcoming free dates in modal
The "Upcoming free dates" panel now shows the `eligibility` string from `data.json` alongside each date. Previously dates were shown with no context, hiding the fact that most are restricted to Illinois residents.

### Calendar tooltip fix (was hidden behind container)
Root cause: `overflow-y: hidden` (from `overflow-hidden overflow-x-auto`) clipped upward-positioned absolute tooltips. Fix: tooltips now use `position: fixed` with coordinates from `getBoundingClientRect`, rendered at the page level (`z-[500]`). Container `onScroll` dismisses them.

### Sticky calendar header
Root cause: `position: sticky` doesn't work when the nearest overflow ancestor clips vertically. Fix: changed table container to `overflow-auto max-h-[65vh]`, making the container (not the page) the scroll context. `sticky top-0` on `<thead>` now sticks correctly.

### Free filter pre-selected on launch
`filterFreeOnly` initial state changed to `true`. Users land on today's free museums by default.

### Data source switched from Google Sheets CSV to local data.json
Removed remote CSV fetch, `parseCSVLine`, loading/error states. Added `import rawData from './data.json'` with a synchronous module-level transform. App renders immediately with no network dependency for data.
