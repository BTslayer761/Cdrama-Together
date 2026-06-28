# DramaList — CDrama Tracker
A MyAnimeList-inspired website for tracking Chinese dramas.

---

## Project Structure

```
dramalist/
│
├── index.html              ← Homepage (entry point)
│
├── css/
│   ├── variables.css       ← Design tokens: colours, fonts, spacing
│   ├── base.css            ← Browser resets + global element defaults
│   ├── components.css      ← Reusable UI pieces: cards, buttons, tags, widgets
│   └── layout.css          ← Page structure: nav, hero, grid, sidebar, footer
│
├── js/
│   ├── data.js             ← All site data (dramas, genres, activity feed)
│   ├── dramas.js           ← Drama card rendering + grid logic + filter tabs
│   └── ui.js               ← Sidebar widgets + search bar interaction
│
├── pages/
│   ├── browse.html         ← (To build) Search + filter all dramas
│   ├── drama-detail.html   ← (To build) Single drama page
│   ├── my-list.html        ← (To build) User's personal tracking list
│   ├── top-rated.html      ← (To build) Full rankings table
│   ├── seasonal.html       ← (To build) Dramas by season/year
│   ├── login.html          ← (To build) Login form
│   └── register.html       ← (To build) Registration form
│
└── assets/
    └── images/             ← Drama poster images (add here later)
```

---

## How the CSS is organised

| File | Responsibility |
|---|---|
| `variables.css` | Single source of truth for all colours, fonts, and sizes. Change a value here and it updates everywhere. |
| `base.css` | Resets browser defaults (margins, padding, list styles) so the site looks the same in every browser. |
| `components.css` | Styles for reusable pieces: `.drama-card`, `.btn`, `.widget`, `.genre-tag`, etc. |
| `layout.css` | Styles for page-level structure: `.nav`, `.hero`, `.main-grid`, `.sidebar`, `footer`, and responsive breakpoints. |

**Loading order matters** — always load them in this order in your HTML `<head>`:
`variables.css` → `base.css` → `components.css` → `layout.css`

---

## How the JavaScript is organised

| File | Responsibility |
|---|---|
| `data.js` | Defines arrays of drama data. No DOM interaction — pure data. |
| `dramas.js` | Reads from `data.js`, builds card HTML, inserts into the page, handles filter tabs. |
| `ui.js` | Renders sidebar widgets (genre cloud, score bars, activity feed), wires up the search bar. |

**Loading order matters** — always load in this order at the bottom of `<body>`:
`data.js` → `dramas.js` → `ui.js`

---

## Next steps to build out the site

### 1. Create the missing pages
Start with `pages/browse.html` — it's the most useful next page.
Copy the nav and footer from `index.html`, then add a search input
and a full drama grid that reads from `AIRING_DRAMAS` + `TOP_RATED_DRAMAS`.

### 2. Add a drama detail page
`pages/drama-detail.html` — reads a `?id=4` URL parameter to know
which drama to show. Add synopsis, full cast list, episode tracker,
and a rating widget.

### 3. Connect a real database
Replace the arrays in `data.js` with `fetch()` calls to an API.
**Supabase** is the easiest option — free, gives you a Postgres database,
user auth, and auto-generated REST API. See: https://supabase.com

### 4. Add real poster images
Store images in `assets/images/` locally, or in a cloud bucket
(Cloudflare R2 is free). Update `createDramaCard()` in `dramas.js`
to use `<img src="${drama.posterUrl}" alt="${drama.title}" />` instead
of the placeholder character.

### 5. Save user lists
When the user clicks "Watch" or "Done", the button currently only
changes appearance. To persist the choice, you need:
  - A user account system (Supabase Auth handles this)
  - A `user_lists` database table: `(user_id, drama_id, status, score)`
  - A `fetch()` POST call inside `handleWatchToggle()` in `dramas.js`

---

## Tech stack used
- **HTML5** — semantic markup
- **CSS3** — custom properties (variables), flexbox, CSS grid
- **Vanilla JavaScript** — no frameworks, easy to read and learn from
- **Google Fonts** — Noto Serif SC (display) + Inter (body)
