/**
 * js/data.js
 * ─────────────────────────────────────────────────────────────
 * DATA LAYER — all the content/data the site needs to render.
 *
 * WHY SEPARATE THIS?
 *   Keeping data in its own file means:
 *   1. You can swap it out for a real API call later without
 *      touching any of the rendering logic.
 *   2. It's easy to find and edit the content without scrolling
 *      through UI code.
 *
 * FUTURE UPGRADE:
 *   Right now these are just JavaScript arrays defined directly
 *   in this file. Later you would replace them with fetch() calls
 *   to a backend API, e.g.:
 *     const dramas = await fetch('/api/dramas').then(r => r.json());
 *
 * NOTE ON `const`:
 *   const means the variable can't be reassigned, but arrays and
 *   objects declared with const can still have their contents changed.
 * ─────────────────────────────────────────────────────────────
 */


/**
 * AIRING_DRAMAS
 * Currently airing or recently completed dramas shown on the homepage.
 *
 * Each drama object has these fields:
 *   id       — unique number, used as a key when rendering
 *   title    — English title
 *   year     — year it started airing
 *   eps      — total episode count
 *   status   — "airing" or "completed"
 *   genre    — primary genre tag (used for filter tabs)
 *   score    — community score out of 10
 *   char     — a Chinese character used as the poster placeholder
 *   watching — whether the current user is watching (hardcoded for now;
 *              later this would come from the user's saved list)
 */
const AIRING_DRAMAS = [
  {
    id: 1,
    title: "Love You Seven Times",
    year: 2024,
    eps: 40,
    status: "airing",
    genre: "Xianxia",
    score: 8.4,
    char: "七",
    watching: false,
  },
  {
    id: 2,
    title: "The Longest Promise",
    year: 2023,
    eps: 40,
    status: "completed",
    genre: "Wuxia",
    score: 9.0,
    char: "诺",
    watching: true,
  },
  {
    id: 3,
    title: "Hidden Love",
    year: 2023,
    eps: 25,
    status: "completed",
    genre: "Romance",
    score: 8.7,
    char: "暗",
    watching: false,
  },
  {
    id: 4,
    title: "Nirvana in Fire",
    year: 2015,
    eps: 54,
    status: "completed",
    genre: "Historical",
    score: 9.5,
    char: "琅",
    watching: false,
  },
  {
    id: 5,
    title: "Who Rules the World",
    year: 2022,
    eps: 36,
    status: "completed",
    genre: "Wuxia",
    score: 8.1,
    char: "主",
    watching: false,
  },
  {
    id: 6,
    title: "Ashes of Love",
    year: 2018,
    eps: 63,
    status: "completed",
    genre: "Xianxia",
    score: 8.9,
    char: "香",
    watching: true,
  },
];


/**
 * TOP_RATED_DRAMAS
 * All-time highly rated dramas shown in the second section.
 * Same shape as AIRING_DRAMAS.
 */
const TOP_RATED_DRAMAS = [
  {
    id: 101,
    title: "Story of Minglan",
    year: 2018,
    eps: 73,
    status: "completed",
    genre: "Historical",
    score: 9.3,
    char: "明",
    watching: false,
  },
  {
    id: 102,
    title: "The Bad Kids",
    year: 2020,
    eps: 12,
    status: "completed",
    genre: "Thriller",
    score: 9.4,
    char: "坏",
    watching: false,
  },
  {
    id: 103,
    title: "Go Ahead",
    year: 2020,
    eps: 46,
    status: "completed",
    genre: "Family",
    score: 9.1,
    char: "以",
    watching: false,
  },
  {
    id: 104,
    title: "Love Like the Galaxy",
    year: 2022,
    eps: 56,
    status: "completed",
    genre: "Romance",
    score: 9.0,
    char: "星",
    watching: false,
  },
];


/**
 * SEASON_DRAMAS
 * Dramas featured in the "Summer 2025 — Top Picks" sidebar widget.
 * Simpler shape — we only need title and score for the bar chart.
 */
const SEASON_DRAMAS = [
  { title: "Love You Seven Times",    score: 8.4 },
  { title: "Fox Spirit Matchmaker",   score: 7.9 },
  { title: "Blossoms in Adversity",   score: 8.1 },
  { title: "The Substitute Princess", score: 7.6 },
];


/**
 * GENRES
 * All genre tags shown in the sidebar "Browse by Genre" widget.
 * These are also used as filter values for the filter tabs.
 */
const GENRES = [
  "Romance",
  "Wuxia",
  "Xianxia",
  "Historical",
  "Crime",
  "Comedy",
  "Family",
  "Mystery",
  "Sci-Fi",
  "School Life",
  "Idol",
  "Military",
];


/**
 * ACTIVITY_FEED
 * Mock community activity shown in the sidebar.
 *
 * Fields:
 *   initials — 2-letter abbreviation for the avatar circle
 *   user     — display name
 *   action   — what they did (plain text for now; could be an enum later)
 *   drama    — which drama they interacted with
 *   time     — how long ago (static string; later: real timestamps)
 */
const ACTIVITY_FEED = [
  {
    initials: "YL",
    user: "YunLan",
    action: "rated",
    drama: "The Story of Minglan",
    detail: "★9.2",
    time: "2 minutes ago",
  },
  {
    initials: "SS",
    user: "StarSienna",
    action: "started watching",
    drama: "Nirvana in Fire",
    detail: null,
    time: "14 minutes ago",
  },
  {
    initials: "XH",
    user: "XiaoHu",
    action: "added a review for",
    drama: "Love Like the Galaxy",
    detail: null,
    time: "32 minutes ago",
  },
  {
    initials: "DR",
    user: "DramaRain",
    action: "completed",
    drama: "Go Ahead",
    detail: null,
    time: "1 hour ago",
  },
];
