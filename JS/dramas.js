/**
 * js/dramas.js
 * Drama card rendering + grid logic + status saving to Supabase.
 * Depends on: config.js, supabase-client.js, data.js, auth.js, modal.js
 */

// In-memory stores
let airingDramas = [];
const dramaCache = {};   // drama_id → drama object, for use in event handlers


// ── Card rendering ────────────────────────────────────────────

function createDramaCard(drama) {
  dramaCache[drama.id] = drama;

  const statusBadge = drama.status === 'airing'
    ? `<span class="drama-card-badge badge-airing">Airing</span>`
    : `<span class="drama-card-badge badge-completed">Completed</span>`;

  const poster = drama.posterUrl
    ? `<img src="${drama.posterUrl}" alt="${drama.title}" />`
    : `<div class="drama-card-poster-placeholder">映</div>`;

  const us = drama.userStatus || '';
  const selectClass = us ? `status-select status-${us}` : 'status-select';

  const epsMeta = drama.eps ? `${drama.eps} eps` : 'TV Series';

  return `
    <div class="drama-card" data-id="${drama.id}" data-genre="${drama.genre}">
      <div class="drama-card-poster">
        ${poster}
        ${statusBadge}
        <div class="drama-card-score">★ ${drama.score}</div>
      </div>
      <div class="drama-card-info">
        <div class="drama-card-title">${drama.title}</div>
        <div class="drama-card-meta">${drama.year} · ${drama.genre} · ${epsMeta}</div>
        <div class="drama-card-actions">
          <select class="${selectClass}"
                  data-drama-id="${drama.id}"
                  onchange="handleStatusSelect(this)">
            <option value="" ${!us ? 'selected' : ''}>＋ Add to List</option>
            <option value="watching"  ${us === 'watching'  ? 'selected' : ''}>Watching</option>
            <option value="completed" ${us === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="dropped"   ${us === 'dropped'   ? 'selected' : ''}>Dropped</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

function renderGrid(dramas, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (dramas.length === 0) {
    container.innerHTML =
      '<p style="color:var(--ink-3);font-size:0.875rem;padding:1rem 0">No dramas found.</p>';
    return;
  }

  container.innerHTML = dramas.map(createDramaCard).join('');
}


// ── Filter tabs ───────────────────────────────────────────────

function buildFilterTabs(dramas) {
  const tabsEl = document.getElementById('filter-tabs');
  if (!tabsEl) return;

  const genres = ['all', ...[...new Set(dramas.map(d => d.genre).filter(Boolean))].sort()];

  tabsEl.innerHTML = genres.map((g, i) =>
    `<button class="filter-tab${i === 0 ? ' active' : ''}" data-genre="${g}">
      ${g === 'all' ? 'All' : g}
    </button>`
  ).join('');

  tabsEl.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabsEl.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sel      = tab.dataset.genre;
      const filtered = sel === 'all' ? airingDramas : airingDramas.filter(d => d.genre === sel);
      renderGrid(filtered, 'airing-grid');
    });
  });
}


// ── Status handling ───────────────────────────────────────────

async function handleStatusSelect(select) {
  const user = await getCurrentUser();
  if (!user) {
    select.value = '';
    window.location.href = 'pages/login.html';
    return;
  }

  const status  = select.value;
  const dramaId = parseInt(select.dataset.dramaId);
  const drama   = dramaCache[dramaId];
  if (!drama) return;

  // Update visual class
  select.className = `status-select${status ? ' status-' + status : ''}`;

  if (!status) return; // user picked the placeholder "Add to List" option

  if (status === 'completed') {
    showRatingModal(drama.title, null, async rating => {
      await saveToList(user.id, drama, status, rating);
    });
  } else {
    await saveToList(user.id, drama, status, null);
  }
}

async function saveToList(userId, drama, status, userRating) {
  const { error } = await db.from('user_lists').upsert({
    user_id:         userId,
    drama_id:        drama.id,
    drama_title:     drama.title,
    drama_poster_url: drama.posterUrl || null,
    tmdb_score:      typeof drama.score === 'number' ? drama.score : null,
    status,
    user_rating:     userRating,
    updated_at:      new Date().toISOString(),
  }, { onConflict: 'user_id,drama_id' });

  if (error) console.error('Failed to save to list:', error);
}


// ── Initialisation ────────────────────────────────────────────

async function loadUserStatusMap() {
  const user = await getCurrentUser();
  if (!user) return {};

  const { data } = await db
    .from('user_lists')
    .select('drama_id, status, user_rating')
    .eq('user_id', user.id);

  if (!data) return {};
  return Object.fromEntries(data.map(r => [r.drama_id, r]));
}

async function initDramas() {
  document.getElementById('airing-grid').innerHTML =
    '<p style="color:var(--ink-3);font-size:0.875rem;padding:1rem 0">Loading dramas…</p>';
  document.getElementById('top-rated-grid').innerHTML =
    '<p style="color:var(--ink-3);font-size:0.875rem;padding:1rem 0">Loading dramas…</p>';

  try {
    const [airing, topRated, statusMap] = await Promise.all([
      fetchAiringDramas(),
      fetchTopRatedDramas(),
      loadUserStatusMap(),
    ]);

    const enrich = d => ({ ...d, userStatus: statusMap[d.id]?.status || null });

    airingDramas = airing.map(enrich);
    renderGrid(airingDramas, 'airing-grid');
    renderGrid(topRated.map(enrich), 'top-rated-grid');
    buildFilterTabs(airingDramas);
  } catch (err) {
    console.error('Failed to load dramas:', err);
    document.getElementById('airing-grid').innerHTML =
      '<p style="color:var(--ink-3);font-size:0.875rem;padding:1rem 0">Could not load dramas. Check your API key in JS/config.js.</p>';
  }
}

initDramas();
