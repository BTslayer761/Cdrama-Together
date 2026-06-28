/**
 * js/my-list.js
 * My List page logic — loads the user's drama list from Supabase,
 * renders it with filter tabs, and handles status changes / ratings / removals.
 * Depends on: config.js, supabase-client.js, auth.js, modal.js
 */

let allItems   = [];   // full list fetched from Supabase
let activeFilter = 'all';

async function initMyList() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('list-container').innerHTML =
    '<p style="color:var(--ink-3);padding:2rem 0">Loading your list…</p>';

  await loadList(user);
  updateNavAuth();
}

async function loadList(user) {
  const { data, error } = await db
    .from('user_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    document.getElementById('list-container').innerHTML =
      '<p style="color:var(--ink-3);padding:2rem 0">Could not load your list.</p>';
    return;
  }

  allItems = data || [];
  updateCounts();
  renderList();
}

function updateCounts() {
  const counts = { watching: 0, completed: 0, dropped: 0 };
  allItems.forEach(item => { if (counts[item.status] !== undefined) counts[item.status]++; });

  document.getElementById('count-all').textContent       = allItems.length;
  document.getElementById('count-watching').textContent  = counts.watching;
  document.getElementById('count-completed').textContent = counts.completed;
  document.getElementById('count-dropped').textContent   = counts.dropped;
}

function renderList() {
  const container = document.getElementById('list-container');
  const filtered  = activeFilter === 'all'
    ? allItems
    : allItems.filter(item => item.status === activeFilter);

  if (filtered.length === 0) {
    container.innerHTML =
      `<p style="color:var(--ink-3);padding:2rem 0">No dramas here yet.</p>`;
    return;
  }

  container.innerHTML = filtered.map(renderListItem).join('');
}

function renderListItem(item) {
  const poster = item.drama_poster_url
    ? `<img src="${item.drama_poster_url}" alt="${item.drama_title}" />`
    : `<div class="my-list-poster-placeholder">映</div>`;

  const tmdbBadge = item.tmdb_score
    ? `<span class="score-pill score-tmdb">★ ${item.tmdb_score}</span>`
    : '';

  const userBadge = (item.status === 'completed' && item.user_rating)
    ? `<span class="score-pill score-user">★ ${item.user_rating}</span>`
    : '';

  const rateBtn = (item.status === 'completed')
    ? `<button class="btn btn-ghost" style="font-size:0.75rem;padding:0.25rem 0.6rem"
         onclick="openRating(${item.drama_id}, '${item.drama_title.replace(/'/g, "\\'")}', ${item.user_rating || 'null'})">
         ${item.user_rating ? 'Re-rate' : 'Rate'}
       </button>`
    : '';

  const statusLabels = { watching: 'Watching', completed: 'Completed', dropped: 'Dropped' };

  return `
    <div class="my-list-item" data-id="${item.drama_id}">
      <div class="my-list-poster">${poster}</div>

      <div class="my-list-info">
        <div class="my-list-title">${item.drama_title}</div>
        <div class="my-list-meta">
          <span class="badge badge-${item.status}">${statusLabels[item.status]}</span>
        </div>
      </div>

      <div class="my-list-scores">
        ${tmdbBadge}
        ${userBadge}
        ${rateBtn}
      </div>

      <div class="my-list-actions">
        <select class="status-select status-${item.status}"
                data-drama-id="${item.drama_id}"
                onchange="handleListStatusChange(this)">
          <option value="watching"  ${item.status === 'watching'  ? 'selected' : ''}>Watching</option>
          <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="dropped"   ${item.status === 'dropped'   ? 'selected' : ''}>Dropped</option>
        </select>
        <button class="btn btn-ghost" style="padding:0.25rem 0.5rem;font-size:0.75rem"
                onclick="removeItem(${item.drama_id})">✕</button>
      </div>
    </div>
  `;
}

async function handleListStatusChange(select) {
  const user     = await getCurrentUser();
  const dramaId  = parseInt(select.dataset.dramaId);
  const newStatus = select.value;

  select.className = `status-select status-${newStatus}`;

  if (newStatus === 'completed') {
    const existing = allItems.find(i => i.drama_id === dramaId);
    openRating(dramaId, existing?.drama_title || '', existing?.user_rating || null, newStatus);
  } else {
    await updateStatus(user, dramaId, newStatus, null, false);
  }
}

function openRating(dramaId, title, existingRating, newStatus) {
  showRatingModal(title, existingRating, async rating => {
    const user = await getCurrentUser();
    await updateStatus(user, dramaId, newStatus || 'completed', rating, true);
  });
}

async function updateStatus(user, dramaId, status, userRating, withRating) {
  const updatePayload = { status, updated_at: new Date().toISOString() };
  if (withRating) updatePayload.user_rating = userRating;

  const { error } = await db
    .from('user_lists')
    .update(updatePayload)
    .eq('user_id', user.id)
    .eq('drama_id', dramaId);

  if (error) { console.error(error); return; }

  // Update in-memory and re-render
  const idx = allItems.findIndex(i => i.drama_id === dramaId);
  if (idx >= 0) {
    allItems[idx].status = status;
    if (withRating) allItems[idx].user_rating = userRating;
  }
  updateCounts();
  renderList();
}

async function removeItem(dramaId) {
  const user = await getCurrentUser();
  const { error } = await db
    .from('user_lists')
    .delete()
    .eq('user_id', user.id)
    .eq('drama_id', dramaId);

  if (error) { console.error(error); return; }

  allItems = allItems.filter(i => i.drama_id !== dramaId);
  updateCounts();
  renderList();
}

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('#list-filter-tabs .filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  renderList();
}

initMyList();
