// ============================================================
// Bridge Wise — shared site behaviour
// ============================================================

const WHATSAPP_NUMBER = "60123039697"; // no +, no spaces, for wa.me links

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsappLinks();
  initRefCapture();
  initYear();
});

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
    const msg = el.getAttribute("data-wa-msg") || "Hi Bridge Wise, I'd like to find out more about the UK Top-Up programme.";
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    el.target = "_blank";
    el.rel = "noopener";
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
  const hiddenField = document.getElementById("referral_code");
  const displayBadge = document.getElementById("referral-badge");

  if (stored) {
    if (hiddenField) hiddenField.value = stored;
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
