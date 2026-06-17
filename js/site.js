

(() => {
  'use strict';

  /** Utility */
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Lightbox */
  function initLightbox() {
    const thumbnails = qsa('[data-lightbox]');
    if (!thumbnails.length) return;

    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="lightbox__panel">
        <button class="lightbox__close" type="button" aria-label="Close">✕</button>
        <img class="lightbox__img" alt="" />
        <div class="lightbox__caption"></div>
        <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous">‹</button>
        <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next">›</button>
      </div>
    `;

    document.body.appendChild(overlay);

    let index = 0;

    function setActive(i, items) {
      index = i;
      const item = items[index];
      const img = qs('.lightbox__img', overlay);
      const caption = qs('.lightbox__caption', overlay);
      img.src = item.getAttribute('data-lightbox');
      img.alt = item.getAttribute('data-alt') || '';
      caption.textContent = item.getAttribute('data-caption') || '';
    }

    function open(i = 0) {
      const items = thumbnails;
      setActive(i, items);
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const closeBtn = qs('.lightbox__close', overlay);
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    thumbnails.forEach((thumb, i) => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        open(i);
      });
    });

    const closeBtn = qs('.lightbox__close', overlay);
    closeBtn.addEventListener('click', close);

    const prevBtn = qs('.lightbox__nav--prev', overlay);
    const nextBtn = qs('.lightbox__nav--next', overlay);

    prevBtn.addEventListener('click', () => {
      const items = thumbnails;
      open((index - 1 + items.length) % items.length);
    });

    nextBtn.addEventListener('click', () => {
      const items = thumbnails;
      open((index + 1) % items.length);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') {
        const items = thumbnails;
        open((index - 1 + items.length) % items.length);
      }
      if (e.key === 'ArrowRight') {
        const items = thumbnails;
        open((index + 1) % items.length);
      }
    });
  }

  /** Accordion */
  function initAccordions() {
    const accordions = qsa('[data-accordion]');
    if (!accordions.length) return;

    accordions.forEach((acc) => {
      const buttons = qsa('[data-accordion-toggle]', acc);
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const panelId = btn.getAttribute('aria-controls');
          const panel = panelId ? qs(`#${panelId}`) : null;
          if (!panel) return;
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!expanded));
          panel.hidden = expanded;
        });
      });
    });
  }

  /** Tabs */
  function initTabs() {
    const tabs = qsa('[data-tabs]');
    if (!tabs.length) return;

    tabs.forEach((wrap) => {
      const tabButtons = qsa('[role="tab"]', wrap);
      const panels = qsa('[role="tabpanel"]', wrap);

      function activate(btn) {
        tabButtons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
        panels.forEach((p) => (p.hidden = p.id !== btn.getAttribute('aria-controls')));
      }

      tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => activate(btn));
        btn.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          const idx = tabButtons.indexOf(btn);
          const next = e.key === 'ArrowRight'
            ? (idx + 1) % tabButtons.length
            : (idx - 1 + tabButtons.length) % tabButtons.length;
          activate(tabButtons[next]);
          tabButtons[next].focus();
        });
      });

      // Ensure initial state
      const active = tabButtons.find((b) => b.getAttribute('aria-selected') === 'true') || tabButtons[0];
      if (active) activate(active);
    });
  }

  /** Basic filter/sort */
  function initFilterSort() {
    const container = qs('[data-filter-container]');
    if (!container) return;

    const items = qsa('[data-filter-item]', container);
    const filterSel = qs('[data-filter]', container);
    const sortSel = qs('[data-sort]', container);
    if (!items.length) return;

    function apply() {
      const filterVal = filterSel ? filterSel.value : 'all';
      const sortVal = sortSel ? sortSel.value : 'none';

      let visible = items;
      if (filterVal !== 'all') {
        visible = items.filter((it) => (it.getAttribute('data-category') || 'all') === filterVal);
      }

      // Sorting (client-side)
      if (sortVal === 'az') {
        visible.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()));
      } else if (sortVal === 'za') {
        visible.sort((a, b) => b.textContent.trim().localeCompare(a.textContent.trim()));
      }

      // Toggle hidden and re-append in sorted order
      items.forEach((it) => {
        it.hidden = !visible.includes(it);
      });
      visible.forEach((it) => container.appendChild(it));
    }

    if (filterSel) filterSel.addEventListener('change', apply);
    if (sortSel) sortSel.addEventListener('change', apply);
    apply();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLightbox();
    initAccordions();
    initTabs();
    initFilterSort();
  });
})();

