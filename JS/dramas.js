/**
 * js/dramas.js
 * ─────────────────────────────────────────────────────────────
 * DRAMA RENDERING — builds drama card HTML and populates grids.
 *
 * DEPENDS ON:
 *   js/config.js → TMDB_API_KEY, TMDB_BASE, TMDB_IMG
 *   js/data.js   → fetchAiringDramas(), fetchTopRatedDramas()
 * ─────────────────────────────────────────────────────────────
 */


// Holds the current airing dramas so filter tabs can re-filter without refetching.
let airingDramas = [];


/**
 * createDramaCard(drama)
 * ─────────────────────
 * Turns one drama object into an HTML string for a single card.
 */
function createDramaCard(drama) {

  const statusBadge = drama.status === 'airing'
    ? `<span class="drama-card-badge badge-airing">Airing</span>`
    : `<span class="drama-card-badge badge-completed">Completed</span>`;

  const watchButton = drama.watching
    ? `<button class="action-btn watching">Watching</button>`
    : `<button class="action-btn" onclick="handleWatchToggle(this, ${drama.id})">+ Watch</button>`;

  // Show real poster image when available, fall back to placeholder character
  const posterContent = drama.posterUrl
    ? `<img src="${drama.posterUrl}" alt="${drama.title}" />`
    : `<div class="drama-card-poster-placeholder">映</div>`;

  const epsMeta = drama.eps ? `${drama.eps} eps` : 'TV Series';

  return `
    <div class="drama-card" data-id="${drama.id}" data-genre="${drama.genre}">

      <div class="drama-card-poster">
        ${posterContent}
        ${statusBadge}
        <div class="drama-card-score">★ ${drama.score}</div>
      </div>

      <div class="drama-card-info">
        <div class="drama-card-title">${drama.title}</div>
        <div class="drama-card-meta">${drama.year} · ${drama.genre} · ${epsMeta}</div>

        <div class="drama-card-actions">
          ${watchButton}
          <button class="action-btn" onclick="handleDoneToggle(this, ${drama.id})">Done</button>
        </div>
      </div>

    </div>
  `;
}


/**
 * renderGrid(dramas, containerId)
 * ────────────────────────────────
 * Injects an array of drama cards into a container element.
 */
function renderGrid(dramas, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`renderGrid: no element found with id "${containerId}"`);
    return;
  }

  if (dramas.length === 0) {
    container.innerHTML = `
      <p style="color: var(--ink-3); font-size: 0.875rem; padding: 1rem 0;">
        No dramas found for this filter.
      </p>`;
    return;
  }

  container.innerHTML = dramas.map(createDramaCard).join('');
}


/**
 * buildFilterTabs(dramas)
 * ────────────────────────
 * Dynamically creates filter tabs from the genres present in the
 * fetched dramas, then wires up click handlers.
 */
function buildFilterTabs(dramas) {
  const tabsEl = document.getElementById('filter-tabs');
  if (!tabsEl) return;

  const uniqueGenres = [...new Set(dramas.map(d => d.genre).filter(Boolean))].sort();
  const allGenres    = ['all', ...uniqueGenres];

  tabsEl.innerHTML = allGenres.map((genre, i) =>
    `<button class="filter-tab${i === 0 ? ' active' : ''}" data-genre="${genre}">
      ${genre === 'all' ? 'All' : genre}
    </button>`
  ).join('');

  tabsEl.querySelectorAll('.filter-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabsEl.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selected = tab.dataset.genre;
      const filtered = selected === 'all'
        ? airingDramas
        : airingDramas.filter(d => d.genre === selected);

      renderGrid(filtered, 'airing-grid');
    });
  });
}


/**
 * handleWatchToggle / handleDoneToggle
 * ─────────────────────────────────────
 * Button click handlers. Will later call the Supabase API to persist state.
 */
function handleWatchToggle(button, dramaId) {
  button.classList.add('watching');
  button.textContent = 'Watching';
  button.onclick = null;
  console.log(`Added drama ${dramaId} to Watch list`);
}

function handleDoneToggle(button, dramaId) {
  button.classList.add('completed');
  button.textContent = '✓ Done';
  button.onclick = null;
  console.log(`Marked drama ${dramaId} as completed`);
}


// ══════════════════════════════════════════════════════════════
// INITIALISATION
// Fetches data from TMDB then renders both grids and the filter tabs.
// ══════════════════════════════════════════════════════════════

async function initDramas() {
  // Show loading placeholders while data loads
  document.getElementById('airing-grid').innerHTML =
    '<p style="color: var(--ink-3); font-size: 0.875rem; padding: 1rem 0;">Loading dramas…</p>';
  document.getElementById('top-rated-grid').innerHTML =
    '<p style="color: var(--ink-3); font-size: 0.875rem; padding: 1rem 0;">Loading dramas…</p>';

  try {
    const [airing, topRated] = await Promise.all([
      fetchAiringDramas(),
      fetchTopRatedDramas(),
    ]);

    airingDramas = airing;
    renderGrid(airingDramas, 'airing-grid');
    renderGrid(topRated, 'top-rated-grid');
    buildFilterTabs(airingDramas);
  } catch (err) {
    console.error('Failed to load dramas from TMDB:', err);
    document.getElementById('airing-grid').innerHTML =
      '<p style="color: var(--ink-3); font-size: 0.875rem; padding: 1rem 0;">Could not load dramas. Check your API key in js/config.js.</p>';
  }
}

initDramas();
