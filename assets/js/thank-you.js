// ============================================================
// Thank You page — recap the submitted application and build a
// pre-filled WhatsApp link addressed to BridgeWise's own number.
// The applicant tapping "send" on that message is both their own
// confirmation and Zarina's WhatsApp notification — there is no
// free way to push a WhatsApp message automatically without a
// paid Business API + backend, so this is the honest equivalent.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const data = {
    name: params.get("name") || "",
    phone: params.get("phone") || "",
    email: params.get("email") || "",
    current_institution: params.get("current_institution") || "",
    current_programme: params.get("current_programme") || "",
    target_university: params.get("target_university") || "",
    target_programme: params.get("target_programme") || "",
    ref: params.get("ref") || "",
  };

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val && val.length ? val : "—";
  };

  setText("recap-name", data.name);
  setText(
    "recap-programme",
    data.target_programme ? data.target_programme : ""
  );
  setText("recap-university", data.target_university);
  setText("recap-ref", data.ref || "None");

  // If someone lands here directly (no query params), hide the recap
  // card rather than show a block of dashes.
  if (!data.name) {
    const card = document.getElementById("recap-card");
    if (card) card.hidden = true;
  }

  const waBtn = document.getElementById("wa-confirm-btn");
  if (waBtn) {
    const lines = [
      "Hi BridgeWise, I just submitted my application:",
      "Name: " + (data.name || "-"),
      "Phone: " + (data.phone || "-"),
      "Email: " + (data.email || "-"),
      "Current: " + (data.current_programme || "-") + " at " + (data.current_institution || "-"),
      "Applying for: " + (data.target_programme || "-") + " at " + (data.target_university || "-"),
      "Referral code: " + (data.ref || "None"),
      "",
      "Please confirm you've received it. Thank you!",
    ];
    const msg = lines.join("\n");
    const number = typeof WHATSAPP_NUMBER !== "undefined" ? WHATSAPP_NUMBER : "60123039697";
    waBtn.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(msg);
    waBtn.target = "_blank";
    waBtn.rel = "noopener";
    waBtn.addEventListener("click", () => {
      if (typeof trackEvent === "function") {
        trackEvent("thank_you_whatsapp_confirm_click", {});
      }
    });
  }

  if (typeof trackEvent === "function") {
    trackEvent("thank_you_page_view", {});
  }

  initAutoRedirect();
});

/* Auto-redirect to homepage after a visible countdown ------------------- */
function initAutoRedirect() {
  const countdownEl = document.getElementById("redirect-countdown");
  if (!countdownEl) return;

  let seconds = 12;
  countdownEl.textContent = seconds;

  const timer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(timer);
      window.location.href = "index.html";
      return;
    }
    countdownEl.textContent = seconds;
  }, 1000);
}
