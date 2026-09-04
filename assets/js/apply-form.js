// ============================================================
// Apply page — single-step form
// Builds a personalised _next redirect URL (so the Thank You page
// can recap what was submitted and pre-fill the WhatsApp confirm
// message) and fires an analytics event on submit.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("apply-form");
  if (!form) return;

  const nextField = document.getElementById("next-field");
  const THANK_YOU_BASE = "https://bridge-wise.vercel.app/thank-you.html";

  form.addEventListener("submit", (e) => {
    // Native HTML5 validation still applies (required fields) — if the
    // browser blocks submission, this handler simply won't have lasting
    // effect since the form won't actually submit.

    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const params = new URLSearchParams({
      name: val("full_name"),
      phone: val("phone"),
      email: val("email"),
      current_institution: val("current_institution"),
      current_programme: val("current_programme"),
      target_university: val("target_university"),
      target_programme: val("target_programme"),
      ref: val("referral_code"),
    });

    if (nextField) {
      nextField.value = THANK_YOU_BASE + "?" + params.toString();
    }

    if (typeof trackEvent === "function") {
      trackEvent("apply_form_submit", {
        target_university: val("target_university"),
        target_programme: val("target_programme"),
      });
    }

    const msg = document.getElementById("apply-msg");
    if (msg) {
      msg.textContent = "Submitting your application…";
      msg.classList.remove("error");
      msg.classList.add("show");
    }
  });
});
