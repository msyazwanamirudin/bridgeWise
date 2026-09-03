// ============================================================
// Apply page — multi-step form controller
// Steps: 1 Your Details, 2 Program & Documents
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("apply-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".form-step"));
  const pills = Array.from(document.querySelectorAll(".step-pill"));
  let current = 0;

  function render() {
    steps.forEach((s, i) => s.classList.toggle("active", i === current));
    pills.forEach((p, i) => {
      p.classList.toggle("active", i === current);
      p.classList.toggle("done", i < current);
    });
    window.scrollTo({ top: form.offsetTop - 100, behavior: "smooth" });
  }

  function validateStep(index) {
    const fields = steps[index].querySelectorAll("[required]");
    for (const f of fields) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return false;
      }
    }
    return true;
  }

  form.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!validateStep(current)) return;
      if (current < steps.length - 1) {
        current++;
        render();
      }
    });
  });

  form.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (current > 0) {
        current--;
        render();
      }
    });
  });

  form.addEventListener("submit", (e) => {
    if (!validateStep(current)) {
      e.preventDefault();
      return;
    }
    if (typeof trackEvent === "function") {
      trackEvent("apply_form_submit", {
        track: document.getElementById("target_program") ? document.getElementById("target_program").value : ""
      });
    }
    const msg = document.getElementById("apply-msg");
    if (msg) {
      msg.textContent = "Submitting your application…";
      msg.classList.remove("error");
      msg.classList.add("show");
    }
  });

  render();
});
