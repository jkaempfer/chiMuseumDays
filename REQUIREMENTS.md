# Chicago Free Museums — Product Requirements

## Purpose
Help Chicago residents quickly find which museums are free on any given day, understand eligibility restrictions, and plan visits around scheduled free days.

## Target users
Chicago-area residents and visitors who want to visit museums without paying full admission. Particularly relevant for families, students, and budget-conscious visitors.

---

## Core features

### Museum listing
- Show all Chicago-area museums (currently ~50) with name, type, neighborhood, description, rating, and base admission price
- Each card shows whether the museum is free today and the standard admission price
- Cards are ordered: Must See first, then by rating, then alphabetically

### Filters
- **Free** — show only museums with free or partially-free admission today (pre-selected on launch)
- **Must See** — highlight editor-curated top picks
- **Kids** — filter to museums genuinely suitable for children (interactive, engaging for young visitors — not just "kids allowed")
- **Category** — Art / Nature / Science / Culture / Zoo/Garden
- **Search** — by museum name

### Views
- **Today** (default) — card grid showing free status for today
- **Weekend** — same card grid, highlighting weekend free status
- **Calendar** — scrollable week grid: museums as rows, 7 days as columns, each cell showing free status. Navigable by week via arrows and a date picker.

### Museum detail modal
- Opens from any card or calendar row
- Shows: image, name, address, external website link, description, standard admission price
- Two panels: "Always free for" (eligible groups) and "Upcoming free dates" (specific scheduled days with eligibility restrictions inline)
- Mini 7-day calendar strip showing the next 7 days' free status, navigable by week
- If a future free date exists: prompt to enter email for a reminder
- ESC key closes the modal

### Welcome modal (first visit only)
- Shows on first visit to the site
- Displays count of museums free today vs total
- Prompts for email signup to receive free day notifications
- Dismissed via subscribe or "Skip for now"; never shown again on the same browser

### Email capture
- Two entry points: welcome modal (general list) and museum detail modal (per-museum reminder)
- Posts to a Google Apps Script endpoint; requires no backend

---

## Data rules

### Free admission types
- **Always free**: no cost for everyone (or specific groups) every day
- **Scheduled free days**: specific dates, often with eligibility restrictions (e.g. Illinois residents only, specific time windows)
- **Standard admission**: museum charges full price

### Kid-friendly criteria
A museum is `isKidFriendly` only if it offers meaningful engagement for young children — not just "children are permitted." Examples of qualifying: interactive exhibits, animals, hands-on science, dedicated children's sections, nature/outdoor exploration. Fine arts galleries, heritage/cultural museums, historical houses, and heavy-subject institutions (e.g. Holocaust museum) do not qualify.

### Must See criteria
Editor-curated. Reserved for institutions of national or international significance with broad appeal.

---

## Design principles
- Information density over decoration — users come to answer a specific question ("what's free today?")
- Free status is the primary signal; show it prominently and first
- Eligibility restrictions must always accompany free dates — many are Illinois-resident-only or time-limited
- Mobile-first; calendar view requires horizontal scroll on small screens
