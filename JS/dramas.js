/**
 * js/dramas.js
 * ─────────────────────────────────────────────────────────────
 * DRAMA RENDERING — builds drama card HTML and populates grids.
 *
 * DEPENDS ON:
 *   js/data.js  → must be loaded first (AIRING_DRAMAS, TOP_RATED_DRAMAS)
 *
 * WHAT THIS FILE DOES:
 *   1. createDramaCard(drama) — turns a drama data object into an
 *      HTML string for a single card.
 *   2. renderGrid(dramas, containerId) — inserts an array of cards
 *      into a container element on the page.
 *   3. initFilterTabs() — wires up the genre filter tabs to re-render
 *      the airing grid when clicked.
 *   4. An init block at the bottom that runs everything on page load.
 *
 * KEY CONCEPT — innerHTML vs createElement:
 *   We're using template literal strings + innerHTML to build HTML.
 *   This is quick and readable for a starter project. For a larger app
 *   you'd use createElement() or a framework like React instead.
 * ─────────────────────────────────────────────────────────────
 */


/**
 * createDramaCard(drama)
 * ─────────────────────
 * Takes one drama object from data.js and returns an HTML string
 * representing a single drama card.
 *
 * Template literals (backtick strings) let us embed variables with ${}.
 * This is like building a puzzle piece — we call this function once per
 * drama, then join all the pieces together.
 *
 * @param {Object} drama - a drama object from AIRING_DRAMAS or TOP_RATED_DRAMAS
 * @returns {string} - HTML string for one card
 */
function createDramaCard(drama) {

  // ── Status badge (top-left of poster) ──────────────────────
  // Ternary operator: condition ? valueIfTrue : valueIfFalse
  const statusBadge = drama.status === 'airing'
    ? `<span class="drama-card-badge badge-airing">Airing</span>`
    : `<span class="drama-card-badge badge-completed">Completed</span>`;

  // ── Watch button — shows current state and toggles on click ──
  // If the drama is already in the user's watching list, show it as active.
  // onclick is an inline event handler — when clicked, it:
  //   1. Adds the "watching" CSS class (changes colour)
  //   2. Updates the button text
  const watchButton = drama.watching
    ? `<button class="action-btn watching">Watching</button>`
    : `<button
         class="action-btn"
         onclick="handleWatchToggle(this, ${drama.id})"
       >+ Watch</button>`;

  // ── Assemble the full card HTML ─────────────────────────────
  // Each section is a named div — the CSS for each is in components.css
  return `
    <div class="drama-card" data-id="${drama.id}" data-genre="${drama.genre}">

      <!-- POSTER AREA — shows image or placeholder character -->
      <div class="drama-card-poster">

        <!-- Placeholder used when no real poster image is available yet.
             In the future: <img src="${drama.posterUrl}" alt="${drama.title}" /> -->
        <div class="drama-card-poster-placeholder">${drama.char}</div>

        <!-- Status badge: "Airing" or "Completed" -->
        ${statusBadge}

        <!-- Score badge: ★ 8.4 -->
        <div class="drama-card-score">★ ${drama.score}</div>

      </div>

      <!-- INFO AREA — title, metadata, action buttons -->
      <div class="drama-card-info">
        <div class="drama-card-title">${drama.title}</div>
        <div class="drama-card-meta">${drama.year} · ${drama.genre} · ${drama.eps} eps</div>

        <!-- Action buttons row -->
        <div class="drama-card-actions">
          ${watchButton}
          <button
            class="action-btn"
            onclick="handleDoneToggle(this, ${drama.id})"
          >Done</button>
        </div>
      </div>

    </div>
  `;
}


/**
 * renderGrid(dramas, containerId)
 * ────────────────────────────────
 * Takes an array of drama objects, converts each one to a card HTML string,
 * joins them all together, and injects the result into a container element.
 *
 * @param {Array}  dramas      - array of drama objects
 * @param {string} containerId - the id attribute of the target <div>
 */
function renderGrid(dramas, containerId) {
  // Find the container element in the DOM
  const container = document.getElementById(containerId);

  // Safety check: if the element doesn't exist, stop here and log a warning
  if (!container) {
    console.warn(`renderGrid: no element found with id "${containerId}"`);
    return;
  }

  if (dramas.length === 0) {
    // Show an empty state message if there are no dramas to display
    container.innerHTML = `
      <p style="color: var(--ink-3); font-size: 0.875rem; padding: 1rem 0;">
        No dramas found for this filter.
      </p>`;
    return;
  }

  // map() runs createDramaCard on each drama and returns a new array of strings.
  // join('') concatenates all strings with no separator between them.
  container.innerHTML = dramas.map(createDramaCard).join('');
}


/**
 * handleWatchToggle(button, dramaId)
 * ────────────────────────────────────
 * Called when a user clicks "Watch" on a drama card.
 * In a real app this would also save the status to a database.
 *
 * @param {HTMLElement} button  - the button element that was clicked
 * @param {number}      dramaId - the id of the drama
 */
function handleWatchToggle(button, dramaId) {
  button.classList.add('watching');   // triggers the red CSS style
  button.textContent = 'Watching';
  button.onclick = null;              // prevents clicking again

  // TODO: in a real app, call your API here:
  // fetch(`/api/list`, { method: 'POST', body: JSON.stringify({ dramaId, status: 'watching' }) });

  console.log(`Added drama ${dramaId} to Watch list`);
}


/**
 * handleDoneToggle(button, dramaId)
 * ────────────────────────────────────
 * Called when a user clicks "Done" to mark a drama as completed.
 *
 * @param {HTMLElement} button  - the button element that was clicked
 * @param {number}      dramaId - the id of the drama
 */
function handleDoneToggle(button, dramaId) {
  button.classList.add('completed');  // triggers the green CSS style
  button.textContent = '✓ Done';
  button.onclick = null;

  // TODO: API call to mark as completed
  console.log(`Marked drama ${dramaId} as completed`);
}


/**
 * initFilterTabs()
 * ──────────────────
 * Sets up the genre filter tabs above the airing grid.
 * When a tab is clicked:
 *   1. It becomes the "active" tab (red underline)
 *   2. The airing grid re-renders with only dramas matching that genre
 */
function initFilterTabs() {
  // querySelectorAll returns a NodeList of all matching elements
  const tabs = document.querySelectorAll('#filter-tabs .filter-tab');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {

      // Remove "active" class from every tab
      tabs.forEach(function(t) { t.classList.remove('active'); });

      // Add "active" class to the clicked tab
      tab.classList.add('active');

      // Read which genre this tab represents (stored in data-genre attribute)
      const selectedGenre = tab.dataset.genre;  // e.g. "Romance" or "all"

      // Filter the drama data array
      const filtered = selectedGenre === 'all'
        ? AIRING_DRAMAS                                                    // show everything
        : AIRING_DRAMAS.filter(function(d) { return d.genre === selectedGenre; }); // only matching genre

      // Re-render the grid with the filtered list
      renderGrid(filtered, 'airing-grid');
    });
  });
}


// ══════════════════════════════════════════════════════════════
// INITIALISATION
// This runs immediately when the browser loads this script.
// By the time this runs, data.js has already been parsed (it's
// loaded first in index.html), so AIRING_DRAMAS and TOP_RATED_DRAMAS
// are available.
// ══════════════════════════════════════════════════════════════

// Render both grids on page load
renderGrid(AIRING_DRAMAS, 'airing-grid');
renderGrid(TOP_RATED_DRAMAS, 'top-rated-grid');

// Wire up the filter tabs
initFilterTabs();
