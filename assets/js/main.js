// ============================================================
// Bridge Wise — shared site behaviour
// ============================================================

const WHATSAPP_NUMBER = "60123039697"; // no +, no spaces, for wa.me links

// Known referral agent codes. Add a new agent by adding a line here —
// key is the exact code they'll share (case-insensitive to match), value
// is the name shown on the badge and used in the recognized/unrecognized
// check. This is the whole "validation list" — no backend, just this.
const REFERRAL_AGENTS = {
  "AGENT007": "Sample Agent — replace or remove this line",
  // "AGENT123": "Ahmad bin Ali",
};

document.addEventListener("DOMContentLoaded", () => {
  initPageFadeIn();
  initPageTransitions();
  initNavToggle();
  initNavDropdown();
  initWhatsappLinks();
  initRefCapture();
  initYear();
  initBackToTop();
  initReveal();
  initFaq();
  initCountUp();
  initSectionNav();
});

/* Analytics helper — safe no-op if GA4 / Meta Pixel aren't configured yet.
   Swap the placeholder IDs in each page's <head> and this starts firing. */
function trackEvent(name, params) {
  params = params || {};
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
  if (typeof fbq === "function") {
    fbq("trackCustom", name, params);
  }
}

/* Restore full opacity if page is served from bfcache (browser back/forward) */
window.addEventListener("pageshow", () => {
  document.body.style.opacity = "1";
});

/* Fade the page in on first load ------------------------------------- */
function initPageFadeIn() {
  document.body.style.transition = "opacity 0.25s ease";
  document.body.style.opacity = "0";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = "1";
    });
  });
}

/* Fade out before navigating to another page on this site ------------- */
function initPageTransitions() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    if (link.hasAttribute("data-wa")) return;
    if (link.target === "_blank") return;

    const href = link.getAttribute("href");
    if (!href) return;
    if (href.startsWith("#")) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (/^https?:\/\//i.test(href)) return;
    if (href.indexOf(".html") === -1) return;

    e.preventDefault();
    document.body.style.opacity = "0";
    setTimeout(() => {
      window.location.href = href;
    }, 200);
  });
}

/* Mobile nav toggle -------------------------------------------------- */
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

/* Explore dropdown in nav ---------------------------------------------- */
function initNavDropdown() {
  document.querySelectorAll(".nav-dropdown-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = btn.closest(".nav-dropdown");
      const wasOpen = dropdown.classList.contains("open");
      document.querySelectorAll(".nav-dropdown.open").forEach((d) => d.classList.remove("open"));
      if (!wasOpen) dropdown.classList.add("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown.open").forEach((d) => d.classList.remove("open"));
  });
}

/* Build every [data-wa] element into a live wa.me link ---------------- */
function initWhatsappLinks() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const msg = el.getAttribute("data-wa-msg") || "Hi BridgeWise, I'd like to find out more about the UK Top-Up programme.";
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    el.target = "_blank";
    el.rel = "noopener";
    el.addEventListener("click", () => trackEvent("whatsapp_click", { page: location.pathname }));
  });
}

/* Capture ?ref= from the URL and persist it for the Apply form -------- */
function initRefCapture() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref) {
    sessionStorage.setItem("bw_ref_code", ref);
  }

  const stored = sessionStorage.getItem("bw_ref_code");
  const visibleField = document.getElementById("referral_code");
  const displayBadge = document.getElementById("referral-badge");

  if (stored) {
    if (visibleField && !visibleField.value) visibleField.value = stored;

    // Case-insensitive lookup against the known agent list.
    const matchKey = Object.keys(REFERRAL_AGENTS).find(
      (k) => k.toLowerCase() === stored.toLowerCase()
    );
    const agentName = matchKey ? REFERRAL_AGENTS[matchKey] : null;

    if (displayBadge) {
      displayBadge.hidden = false;
      const codeSlot = displayBadge.querySelector("[data-ref-code]");
      if (agentName) {
        displayBadge.classList.remove("unrecognized");
        if (codeSlot) codeSlot.textContent = "Applying via agent referral: " + stored + " — " + agentName;
      } else {
        displayBadge.classList.add("unrecognized");
        if (codeSlot) codeSlot.textContent = "Referral code " + stored + " noted — not a recognized agent code, but your application will still be submitted";
      }
    }

    // Only log once per code per browser session, so revisiting pages
    // doesn't spam duplicate events for the same visit.
    if (ref && typeof trackEvent === "function" && sessionStorage.getItem("bw_ref_logged") !== ref) {
      trackEvent("referral_code_captured", {
        referral_code: ref,
        recognized: Boolean(agentName),
      });
      sessionStorage.setItem("bw_ref_logged", ref);
    }
  }
}

/* Footer year ---------------------------------------------------------- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* Sticky back-to-top button --------------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("show", window.scrollY > 600);
    },
    { passive: true }
  );
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* Scroll-reveal for section headings ------------------------------------ */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

/* FAQ accordion ---------------------------------------------------------- */
function initFaq() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".faq-item").classList.toggle("open");
    });
  });
}

/* Count-up animation for advisor stats ----------------------------------- */
function initCountUp() {
  const items = document.querySelectorAll("[data-count-to]");
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate(el) {
    const target = parseInt(el.getAttribute("data-count-to"), 10);
    if (reduceMotion || isNaN(target)) {
      el.textContent = target;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach(animate);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  items.forEach((el) => observer.observe(el));
}

/* Sticky section nav (Home page only) ------------------------------------ */
function initSectionNav() {
  const secNav = document.getElementById("section-nav");
  if (!secNav) return;

  const navEl = document.querySelector(".nav");
  function setTop() {
    if (navEl) secNav.style.top = navEl.offsetHeight + "px";
  }
  setTop();
  window.addEventListener("resize", setTop);

  const hero = document.querySelector(".hero");
  const links = Array.from(secNav.querySelectorAll("a"));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  window.addEventListener(
    "scroll",
    () => {
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      secNav.classList.toggle("visible", heroBottom < 0);
    },
    { passive: true }
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = secNav.querySelector('a[href="#' + entry.target.id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }
}
