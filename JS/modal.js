/**
 * js/modal.js
 * Rating modal — shared between index.html and my-list.html.
 */

function showRatingModal(dramaTitle, existingRating, onSave) {
  const existing = document.getElementById('rating-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'rating-modal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">Rate this drama</div>
      <div class="modal-drama-name">${dramaTitle}</div>
      <p class="modal-subtitle">How would you rate it? (optional)</p>
      <div class="rating-stars" id="modal-stars">
        ${Array.from({ length: 10 }, (_, i) =>
          `<span class="rating-star" data-value="${i + 1}">★</span>`
        ).join('')}
      </div>
      <div class="rating-label" id="rating-label">&nbsp;</div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="modal-skip">Skip</button>
        <button class="btn btn-primary" id="modal-save">Save Rating</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  let selectedRating = existingRating || null;
  const stars        = overlay.querySelectorAll('.rating-star');
  const label        = overlay.querySelector('#rating-label');

  function highlight(upTo) {
    stars.forEach((s, i) => s.classList.toggle('active', i < upTo));
  }

  function setLabel(val) {
    const labels = ['', 'Appalling', 'Horrible', 'Very Bad', 'Bad', 'Average',
                    'Fine', 'Good', 'Very Good', 'Great', 'Masterpiece'];
    label.textContent = val ? `${val}/10 — ${labels[val]}` : ' ';
  }

  if (selectedRating) {
    highlight(selectedRating);
    setLabel(selectedRating);
  }

  stars.forEach(star => {
    const val = parseInt(star.dataset.value);
    star.addEventListener('mouseover', () => highlight(val));
    star.addEventListener('mouseleave', () => { highlight(selectedRating || 0); setLabel(selectedRating); });
    star.addEventListener('click', () => {
      selectedRating = val;
      highlight(val);
      setLabel(val);
    });
  });

  overlay.querySelector('#modal-skip').addEventListener('click', () => {
    overlay.remove();
    onSave(null);
  });

  overlay.querySelector('#modal-save').addEventListener('click', () => {
    overlay.remove();
    onSave(selectedRating);
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { overlay.remove(); onSave(null); }
  });
}
