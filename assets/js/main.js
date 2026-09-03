// ============================================================
// Bridge Wise — shared site behaviour
// ============================================================

const WHATSAPP_NUMBER = "60123039697"; // no +, no spaces, for wa.me links

document.addEventListener("DOMContentLoaded", () => {
  initPageFadeIn();
  initPageTransitions();
  initNavToggle();
  initWhatsappLinks();
  initRefCapture();
  initYear();
  initBackToTop();
  initReveal();
  initFaq();
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
    if (displayBadge) {
      displayBadge.hidden = false;
      displayBadge.querySelector("[data-ref-code]").textContent = stored;
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
