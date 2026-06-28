/**
 * js/ui.js
 * ─────────────────────────────────────────────────────────────
 * UI INTERACTIONS — sidebar widgets and general page behaviour.
 *
 * DEPENDS ON:
 *   js/data.js  → GENRES, SEASON_DRAMAS, ACTIVITY_FEED
 *
 * WHAT THIS FILE DOES:
 *   1. renderGenreCloud()   — builds the clickable genre tags widget
 *   2. renderSeasonBars()   — builds the score bar chart widget
 *   3. renderActivityFeed() — builds the community activity list
 *   4. initSearch()         — wires up the nav search bar
 *   5. An init block at the bottom that calls all of the above
 *
 * SEPARATION OF CONCERNS:
 *   dramas.js handles drama grids (the main content).
 *   ui.js handles everything else — sidebar widgets and interactions.
 *   This keeps each file focused on one responsibility.
 * ─────────────────────────────────────────────────────────────
 */


/**
 * renderGenreCloud()
 * ───────────────────
 * Builds the genre tag pills in the sidebar "Browse by Genre" widget.
 * Clicking a tag toggles it active/inactive.
 * (Later: clicking would also filter a browse page by genre.)
 */
function renderGenreCloud() {
  const container = document.getElementById('genre-cloud');
  if (!container) return;

  // Build one <span> per genre from the GENRES array in data.js
  // The first genre starts as active by default
  const html = GENRES.map(function(genre, index) {
    // index === 0 means it's the first item in the array
    const isActive = index === 0 ? 'active' : '';
    return `<span class="genre-tag ${isActive}" data-genre="${genre}">${genre}</span>`;
  }).join('');

  container.innerHTML = html;

  // After inserting the HTML, find all the new tags and add click handlers
  // (We can't add event listeners before the elements exist in the DOM)
  container.querySelectorAll('.genre-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
      // Toggle: if it's active, deactivate it; if inactive, activate it
      tag.classList.toggle('active');

      // TODO: when a real browse page exists, navigate to:
      // window.location.href = `pages/browse.html?genre=${tag.dataset.genre}`;
    });
  });
}


/**
 * renderSeasonBars(dramas)
 * ─────────────────────────
 * Builds the horizontal score bar chart in the "Top Picks" sidebar widget.
 * Accepts the dramas array directly so it works with async-fetched data.
 */
function renderSeasonBars(dramas) {
  const container = document.getElementById('season-bars');
  if (!container) return;

  const MAX_SCORE = 10;

  const html = dramas.map(function(drama) {
    const widthPercent = (drama.score / MAX_SCORE) * 100;
    return `
      <div class="season-bar-row">
        <div class="season-bar-labels">
          <span class="season-bar-name">${drama.title}</span>
          <span class="season-bar-score">${drama.score}</span>
        </div>
        <div class="season-bar-track">
          <div class="season-bar-fill" style="width: ${widthPercent}%"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}


/**
 * renderActivityFeed()
 * ─────────────────────
 * Builds the community activity list in the sidebar.
 * Each item shows: avatar initials | user action description | time
 */
function renderActivityFeed() {
  const container = document.getElementById('activity-feed');
  if (!container) return;

  const html = ACTIVITY_FEED.map(function(item) {
    // Build the activity sentence:
    // e.g. "YunLan rated The Story of Minglan ★9.2"
    //       user   action  drama               detail
    const detailText = item.detail ? ` ${item.detail}` : '';

    return `
      <div class="activity-item">

        <!-- Circular avatar showing the user's initials -->
        <div class="activity-avatar">${item.initials}</div>

        <!-- Activity description and timestamp -->
        <div class="activity-text">
          <strong>${item.user}</strong> ${item.action}
          <strong>${item.drama}</strong>${detailText}
          <div class="activity-time">${item.time}</div>
        </div>

      </div>
    `;
  }).join('');

  container.innerHTML = html;
}


/**
 * initSearch()
 * ─────────────
 * Wires up the nav search bar.
 * Pressing Enter takes the user to the browse page with a search query.
 *
 * In a more advanced implementation you could show live suggestions
 * in a dropdown as the user types (autocomplete).
 */
function initSearch() {
  const input = document.getElementById('nav-search');
  if (!input) return;

  input.addEventListener('keydown', function(event) {
    // event.key gives us the name of the key pressed
    if (event.key === 'Enter') {
      const query = input.value.trim();

      if (query.length === 0) return;  // don't search for nothing

      // Encode the query for safe use in a URL
      // e.g. "Nirvana in Fire" → "Nirvana%20in%20Fire"
      const encoded = encodeURIComponent(query);

      // Navigate to the browse page with the search query
      // TODO: create pages/browse.html to handle this parameter
      window.location.href = `pages/browse.html?q=${encoded}`;
    }
  });
}


// ══════════════════════════════════════════════════════════════
// INITIALISATION
// Runs all the sidebar render functions when this script loads.
// ══════════════════════════════════════════════════════════════

renderGenreCloud();
renderActivityFeed();
initSearch();

// Fetch live season data from TMDB then render the sidebar bars
fetchSeasonDramas().then(renderSeasonBars).catch(function() {
  const el = document.getElementById('season-bars');
  if (el) el.innerHTML = '<p style="color:var(--ink-3);font-size:0.8rem">Could not load.</p>';
});
