// ============================================================
// Apply page — submits via EmailJS (client-side, no backend).
// Sends two emails per application:
//   1. businessTemplateId  → notifies Zarina with full details
//   2. applicantTemplateId → confirms the applicant, sent to
//      whatever address they typed (that template's "To Email"
//      must be set to {{email}} in the EmailJS dashboard)
// On success, redirects to a Thank You page carrying a recap in
// the URL. On failure, shows an inline error and re-enables the
// form rather than pretending it worked.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("apply-form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const msg = document.getElementById("apply-msg");
  const THANK_YOU_URL = "thank-you.html";

  function showMessage(text, state) {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove("error", "success");
    if (state) msg.classList.add(state);
    msg.classList.add("show");
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "Submitting…" : "Submit Application";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const config = window.EMAILJS_CONFIG || {};
    const isPlaceholder = (v) => !v || v.indexOf("YOUR_") === 0;
    const missing = [];
    if (isPlaceholder(config.publicKey)) missing.push("Public Key");
    if (isPlaceholder(config.serviceId)) missing.push("Service ID");
    if (isPlaceholder(config.businessTemplateId)) missing.push("business Template ID");
    if (isPlaceholder(config.applicantTemplateId)) missing.push("applicant Template ID");

    if (!window.emailjs || missing.length) {
      const detail = missing.length
        ? "Still using placeholder value(s) for: " + missing.join(", ") + "."
        : "The EmailJS script didn't load.";
      showMessage(
        "Application sending isn't fully configured yet (" + detail + ") — please message us directly on WhatsApp so we don't lose your details.",
        "error"
      );
      console.warn("EmailJS not configured:", detail);
      return;
    }

    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const now = new Date();
    const submittedAt = now.toLocaleString("en-MY", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const templateParams = {
      full_name: val("full_name"),
      phone: val("phone"),
      email: val("email"),
      current_institution: val("current_institution"),
      current_programme: val("current_programme"),
      target_university: val("target_university"),
      target_programme: val("target_programme"),
      referral_code: val("referral_code") || "None",
      submitted_at: submittedAt,
    };

    setSubmitting(true);
    showMessage("Submitting your application…", null);

    emailjs
      .send(config.serviceId, config.businessTemplateId, templateParams)
      .then(() => emailjs.send(config.serviceId, config.applicantTemplateId, templateParams))
      .then(() => {
        if (typeof trackEvent === "function") {
          trackEvent("apply_form_submit", {
            target_university: templateParams.target_university,
            target_programme: templateParams.target_programme,
          });
        }

        showMessage("Application sent! Redirecting…", "success");

        const params = new URLSearchParams({
          name: templateParams.full_name,
          phone: templateParams.phone,
          email: templateParams.email,
          current_institution: templateParams.current_institution,
          current_programme: templateParams.current_programme,
          target_university: templateParams.target_university,
          target_programme: templateParams.target_programme,
          ref: templateParams.referral_code === "None" ? "" : templateParams.referral_code,
        });

        window.location.href = THANK_YOU_URL + "?" + params.toString();
      })
      .catch((err) => {
        const detail = err && (err.text || err.message) ? err.text || err.message : JSON.stringify(err);
        console.error("EmailJS send failed — status:", err && err.status, "| detail:", detail);
        setSubmitting(false);
        showMessage(
          "Something went wrong sending your application. Please try again, or message us directly on WhatsApp so we don't lose your details.",
          "error"
        );
      });
  });
});
