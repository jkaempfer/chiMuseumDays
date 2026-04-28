# Chicago Free Museums — Claude Context

> For what the product should do, see REQUIREMENTS.md.
> For what has been built and why, see task.md.

## Stack
- React + Vite, single `src/App.jsx` file (all components in one file by design)
- Tailwind CSS — utility classes only, no config extensions
- Lucide React for icons
- No backend; data is entirely local

## Key files
- `src/App.jsx` — data transform + App, MuseumCard, MuseumDetailModal, WelcomeModal
- `src/data.json` — source of truth for all museum data
- `public/images/{id}.jpg` — locally stored museum images (800px, JPEG q=75)

## Data shape

### src/data.json (raw)
Each museum entry has top-level fields plus an `admission` object, and closed days arrays:
```
admission.always_free         bool
admission.always_free_groups  [{category, link}]
admission.free_days           [{date, eligibility, link}]  — date is ISO "YYYY-MM-DD"
closedDays                    [string] — array of ISO "YYYY-MM-DD" specific dates
closedRecurring               [string] — array of weekday names (e.g., "Monday")
```

### Post-transform (what components receive)
The module-level transform in App.jsx flattens admission and maps closed dates into:
```
alwaysFree          bool
alwaysFreeGroups    [{category, link}]
scheduledFreeDays   [{date, eligibility, link}]
scheduleMap         { "YYYY-MM-DD": eligibility }   — for O(1) free date lookup
closedMap           { "YYYY-MM-DD": true }          — for O(1) closed date lookup
closedRecurring     [string]                        — carried over directly
```
Plus all original fields: `id`, `name`, `type`, `mustSee`, `isKidFriendly`, `neighborhood`, `address`, `image`, `basePrice`, `url`, `rating`.

## UI behaviour rules (do not change without updating REQUIREMENTS.md)
- **Free filter**: pre-selected `true` on launch — users land on today's free museums
- **Filter label**: the free filter button reads "Free" (not "Free Today")
- **Welcome modal**: shown once per browser; `onClose` writes `localStorage.setItem('chicago-museums-visited', 'true')` — do not remove this call
- **ESC key**: closes `MuseumDetailModal` via `keydown` useEffect; listener cleaned up on unmount
- **Arrow keys**: Left/Right arrows navigate `MuseumDetailModal` via `keydown` useEffect, unless typing in an `input`; listener cleaned up on unmount
- **Eligibility in free-dates list**: inline `<span>` after the date, `text-[9px] text-slate-300` — intentionally tiny and low-contrast; do not put on a new line
- **Calendar column headers**: three lines — large day number / short month / short weekday
- **Calendar navigation**: ← / → arrows + native `<input type="date">` above the table; both set `calendarBaseDate` and reset `calendarOffset` to 0

## Known constraints and gotchas

### Calendar table layout
- Container: `overflow-auto max-h-[65vh]` — this makes it the vertical scroll context so `sticky top-0` on `<thead>` works correctly. Do not change to `overflow-hidden` or remove the height constraint.
- `calendarBaseDate` + `calendarOffset` together define the visible week. Navigation always resets `calendarOffset` to 0 and moves `calendarBaseDate` — keeps them in sync.
- **Calendar Cell Colors**: Muted scheme for clear status indication:
  - **Always Free**: `bg-emerald-400` (muted green)
  - **Check Free (Limited)**: `bg-emerald-100` (lighter green)
  - **Closed**: `bg-slate-400` (muted gray)
  - **Normal**: `bg-white` (white)

### Calendar cell tooltips
- Use `position: fixed` (coordinates from `getBoundingClientRect`) rendered at page level to escape the container's `overflow: auto` clipping (this applies to both the main calendar and the modal calendar).
- The container's `onScroll` dismisses them so they don't go stale.

### Z-index layering
| Element | z-index |
|---|---|
| App header | 100 |
| Museum detail modal | 200 |
| Welcome modal | 300 |
| Calendar cell tooltip | 9999 |

### Images
- All images are local (`public/images/{id}.jpg`). No external image requests at runtime.
- **UI Constraints**: The image container uses `max-w-2xl` and `h-40 md:h-48` with `object-cover`, resulting in a roughly **3.5:1 landscape ratio**.
- **Generation Guidelines**: When generating new images, use a **16:9 landscape aspect ratio** (or wider) with centered subjects to prevent awkward vertical cropping.
- **File Specs**: Target 800px width, JPEG format (`q=75`). 
- To refresh/fallback: use Wikimedia Commons API (`prop=imageinfo&iiurlwidth=800`) or generate custom photorealistic images.

### Email capture
- POSTs to `SCRIPT_URL` (Google Apps Script) with `{ email, source }` using `mode: "no-cors"`.
- No response can be read back; always assume success for UX purposes.
