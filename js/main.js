(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     Sticky header state
     ------------------------------------------------------------------------ */
  const header = document.querySelector(".site-header");

  if (header) {
    const setHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navClose = document.querySelector(".nav__close");

  if (nav && navToggle) {
    const openNav = () => {
      nav.classList.add("is-open");
      document.body.classList.add("nav-open");
      navToggle.setAttribute("aria-expanded", "true");
      if (navClose) {
        window.setTimeout(() => navClose.focus(), 120);
      }
    };

    const closeNav = (returnFocus = true) => {
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
      if (returnFocus) {
        navToggle.focus();
      }
    };

    navToggle.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (navClose) {
      navClose.addEventListener("click", () => closeNav());
    }

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 981px)");
    const handleViewportChange = (event) => {
      if (event.matches && nav.classList.contains("is-open")) {
        closeNav(false);
      }
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleViewportChange);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleViewportChange);
    }
  }

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  /* ------------------------------------------------------------------------
     Animated counters
     ------------------------------------------------------------------------ */
  const counters = document.querySelectorAll("[data-count]");
  const numberFormatter = new Intl.NumberFormat("en-US");

  const animateCounter = (element) => {
    const target = Number.parseInt(element.getAttribute("data-count"), 10);

    if (Number.isNaN(target)) {
      return;
    }

    if (prefersReducedMotion) {
      element.textContent = numberFormatter.format(target);
      return;
    }

    const duration = 1600;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = numberFormatter.format(Math.round(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.textContent = numberFormatter.format(target);
      }
    };

    window.requestAnimationFrame(tick);
  };

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach((counter) => counterObserver.observe(counter));
    }
  }

  /* ------------------------------------------------------------------------
     Accordion
     ------------------------------------------------------------------------ */
  const accordions = document.querySelectorAll(".accordion");

  accordions.forEach((accordion) => {
    const triggers = accordion.querySelectorAll(".accordion__trigger");

    const setPanelHeight = (item, panel) => {
      panel.style.maxHeight = item.classList.contains("is-open")
        ? `${panel.scrollHeight}px`
        : "0px";
    };

    triggers.forEach((trigger) => {
      const item = trigger.closest(".accordion__item");
      const panel = item ? item.querySelector(".accordion__panel") : null;

      if (!item || !panel) {
        return;
      }

      trigger.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");

        triggers.forEach((otherTrigger) => {
          const otherItem = otherTrigger.closest(".accordion__item");
          if (!otherItem || otherItem === item) {
            return;
          }

          const otherPanel = otherItem.querySelector(".accordion__panel");
          otherItem.classList.remove("is-open");
          otherTrigger.setAttribute("aria-expanded", "false");
          if (otherPanel) {
            otherPanel.style.maxHeight = "0px";
          }
        });

        item.classList.toggle("is-open", willOpen);
        trigger.setAttribute("aria-expanded", String(willOpen));
        setPanelHeight(item, panel);
      });
    });

    window.addEventListener("resize", () => {
      triggers.forEach((trigger) => {
        const item = trigger.closest(".accordion__item");
        const panel = item ? item.querySelector(".accordion__panel") : null;
        if (item && panel && item.classList.contains("is-open")) {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     Mailto forms
     ------------------------------------------------------------------------ */
  const mailtoForms = document.querySelectorAll("form[data-mailto]");

  mailtoForms.forEach((form) => {
    const status = form.querySelector(".form__status");
    const destination = form.getAttribute("data-mailto") || "wisdomacademyschools@gmail.com";
    const baseSubject = form.getAttribute("data-subject") || "Website enquiry";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      const data = new FormData(form);
      const lines = [];
      let senderName = "";

      data.forEach((value, key) => {
        if (typeof value !== "string" || value.trim() === "") {
          return;
        }

        const field = form.elements.namedItem(key);
        const labelElement =
          field && field.closest ? field.closest(".field")?.querySelector("label") : null;
        const label = labelElement
          ? labelElement.textContent.replace(/\s*\*\s*$/, "").trim()
          : key;

        if (key === "name") {
          senderName = value.trim();
        }

        lines.push(`${label}: ${value.trim()}`);
      });

      const body = lines.join("\n");
      const subject = senderName ? `${baseSubject} — ${senderName}` : baseSubject;
      const mailtoLink = `mailto:${destination}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      if (status) {
        status.textContent = `Thanks${
          senderName ? `, ${senderName}` : ""
        }. Your email app should open with your message ready to send. If it does not, please email ${destination} directly.`;
        status.classList.add("is-visible");
      }

      window.location.href = mailtoLink;
    });
  });

  /* ------------------------------------------------------------------------
     Footer year + back to top
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const toTop = document.querySelector(".to-top");

  if (toTop) {
    window.addEventListener(
      "scroll",
      () => {
        toTop.classList.toggle("is-visible", window.scrollY > 600);
      },
      { passive: true }
    );

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }
})();
