(() => {
  "use strict";

  const grid = document.getElementById("activity-grid");
  const filters = document.getElementById("gallery-filters");
  const lightbox = document.getElementById("lightbox");

  if (!grid || !filters) {
    return;
  }

  const normalizeItems = (data) => {
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [];
    return list.filter((item) => item && item.src && item.title);
  };

  const loadItems = async () => {
    if (window.location.protocol !== "file:") {
      try {
        const response = await fetch("data/gallery.json", { cache: "no-store" });
        if (response.ok) {
          return normalizeItems(await response.json());
        }
      } catch (error) {
        // Fall back to the bundled list below.
      }
    }
    return normalizeItems(window.GALLERY_ITEMS);
  };

  const slugify = (value) =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return entities[character];
    });

  const init = (items) => {
  if (!items.length) {
    filters.hidden = true;
    grid.innerHTML =
      '<div class="gallery-empty"><h3>Photos coming soon</h3><p>Our activities gallery is being updated. Please check back soon.</p></div>';
    return;
  }

  const categoryNames = [];
  items.forEach((item) => {
    const category = (item.category || "Activities").trim();
    if (!categoryNames.some((name) => name.toLowerCase() === category.toLowerCase())) {
      categoryNames.push(category);
    }
  });

  const filterOptions = [
    { label: "All activities", value: "all", count: items.length },
    ...categoryNames.map((category) => ({
      label: category,
      value: slugify(category),
      count: items.filter((item) => slugify(item.category || "Activities") === slugify(category)).length
    }))
  ];

  filters.innerHTML = filterOptions
    .map(
      (option, index) =>
        `<button class="filter-btn${index === 0 ? " is-active" : ""}" type="button" data-filter="${option.value}" aria-pressed="${index === 0}">${escapeHtml(option.label)} <span class="filter-btn__count">${option.count}</span></button>`
    )
    .join("");

  grid.innerHTML = items
    .map((item, index) => {
      const category = item.category || "Activities";
      const categorySlug = slugify(category);
      return `<article class="activity-card" data-category="${categorySlug}" data-index="${index}">
        <a class="activity-card__link" href="${escapeHtml(item.src)}" aria-label="View ${escapeHtml(item.title)}">
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || item.title)}" width="1200" height="900" loading="${index < 3 ? "eager" : "lazy"}">
          <span class="activity-card__badge">${escapeHtml(category)}</span>
          <span class="activity-card__zoom" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </span>
          <span class="activity-card__body">
            <span class="activity-card__title">${escapeHtml(item.title)}</span>
            ${item.date ? `<span class="activity-card__date">${escapeHtml(item.date)}</span>` : ""}
          </span>
        </a>
      </article>`;
    })
    .join("");

  const cards = Array.from(grid.querySelectorAll(".activity-card"));
  const filterButtons = Array.from(filters.querySelectorAll(".filter-btn"));
  let currentFilter = "all";
  let visibleIndices = items.map((item, index) => index);
  let currentPosition = 0;
  let lastFocused = null;

  const getVisibleIndices = () =>
    cards.filter((card) => !card.hidden).map((card) => Number(card.dataset.index));

  const applyFilter = (filter) => {
    currentFilter = filter;

    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.hidden = !show;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    visibleIndices = getVisibleIndices();
  };

  filters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) {
      return;
    }
    applyFilter(button.dataset.filter || currentFilter);
  });

  const lightboxImage = lightbox?.querySelector(".lightbox__image");
  const lightboxTitle = lightbox?.querySelector(".lightbox__title");
  const lightboxCategory = lightbox?.querySelector(".lightbox__category");
  const lightboxDate = lightbox?.querySelector(".lightbox__date");
  const lightboxCounter = lightbox?.querySelector(".lightbox__counter");
  const lightboxPrev = lightbox?.querySelector(".lightbox__nav--prev");
  const lightboxNext = lightbox?.querySelector(".lightbox__nav--next");
  const lightboxClose = lightbox?.querySelector(".lightbox__close");

  const showCurrent = () => {
    const item = items[visibleIndices[currentPosition]];
    if (!item || !lightboxImage) {
      return;
    }

    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt || item.title;

    if (lightboxTitle) {
      lightboxTitle.textContent = item.title;
    }
    if (lightboxCategory) {
      lightboxCategory.textContent = item.category || "";
      lightboxCategory.hidden = !item.category;
    }
    if (lightboxDate) {
      lightboxDate.textContent = item.date || "";
      lightboxDate.hidden = !item.date;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentPosition + 1} / ${visibleIndices.length}`;
    }

    const hasMultiple = visibleIndices.length > 1;
    if (lightboxPrev) {
      lightboxPrev.hidden = !hasMultiple;
    }
    if (lightboxNext) {
      lightboxNext.hidden = !hasMultiple;
    }
  };

  const step = (direction) => {
    if (visibleIndices.length < 2) {
      return;
    }
    currentPosition =
      (currentPosition + direction + visibleIndices.length) % visibleIndices.length;
    showCurrent();
  };

  if (lightbox && typeof lightbox.showModal === "function") {
    grid.addEventListener("click", (event) => {
      const link = event.target.closest(".activity-card__link");
      if (!link) {
        return;
      }

      event.preventDefault();
      const card = link.closest(".activity-card");
      const index = Number(card?.dataset.index);
      visibleIndices = getVisibleIndices();
      const position = visibleIndices.indexOf(index);

      if (position === -1) {
        return;
      }

      lastFocused = document.activeElement;
      currentPosition = position;
      showCurrent();

      if (!lightbox.open) {
        lightbox.showModal();
      }
    });

    lightboxClose?.addEventListener("click", () => lightbox.close());
    lightboxPrev?.addEventListener("click", () => step(-1));
    lightboxNext?.addEventListener("click", () => step(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        lightbox.close();
      }
    });

    lightbox.addEventListener("close", () => {
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.open) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    });
  }

  applyFilter("all");
  };

  loadItems().then(init);
})();
