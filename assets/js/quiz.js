// ============================================================
// Home page — eligibility quiz widget
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const quiz = document.getElementById("eligibility-quiz");
  if (!quiz) return;

  const steps = Array.from(quiz.querySelectorAll(".quiz-step"));
  const progressDots = Array.from(quiz.querySelectorAll(".quiz-progress span"));
  const resultPanel = document.getElementById("quiz-result");
  let current = 0;
  const answers = {};

  const trackLabels = {
    "Hospitality Management": "Hospitality Management",
    "Business Management": "Business Management",
    "Art & Design": "Art & Design",
    "Computing": "Computing",
    "Engineering": "Engineering",
    "Nursing": "Nursing",
    "Other": "Let's find the right fit together"
  };

  function showStep(i) {
    steps.forEach((s, idx) => s.classList.toggle("active", idx === i));
    progressDots.forEach((d, idx) => d.classList.toggle("done", idx <= i));
    resultPanel.classList.remove("active");
  }

  steps.forEach((step, idx) => {
    const optionsWrap = step.querySelector(".quiz-options");
    step.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = optionsWrap.getAttribute("data-question");
        answers[q] = btn.getAttribute("data-value");
        optionsWrap.querySelectorAll(".quiz-option").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        if (idx < steps.length - 1) {
          current = idx + 1;
          setTimeout(() => showStep(current), 150);
        } else {
          setTimeout(showResult, 150);
        }
      });
    });
    const backBtn = step.querySelector("[data-back]");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        current = idx - 1;
        showStep(current);
      });
    }
  });

  function showResult() {
    steps.forEach((s) => s.classList.remove("active"));
    resultPanel.classList.add("active");
    progressDots.forEach((d) => d.classList.add("done"));

    const track = trackLabels[answers.field] || "Let's find the right fit together";
    document.getElementById("quiz-track-value").textContent = track;

    const cgpaNote = document.getElementById("quiz-cgpa-note");
    if (answers.cgpa === "below-2.50") {
      cgpaNote.textContent = "Your CGPA is below our typical 2.50 guideline, but borderline cases are still reviewed individually — send your transcript and we'll take a proper look.";
    } else {
      cgpaNote.textContent = "Your CGPA meets our general guideline for this track.";
    }

    const ieltsNote = document.getElementById("quiz-ielts-note");
    if (answers.english === "yes") {
      ieltsNote.textContent = "Since your diploma was taught in English, you may qualify for an IELTS waiver — we'll confirm this against your transcript.";
    } else if (answers.english === "no") {
      ieltsNote.textContent = "You'll likely need to submit an IELTS score — message us and we can advise on next steps.";
    } else {
      ieltsNote.textContent = "Not sure about your medium of instruction? Send us your transcript and we'll check the English requirement for you.";
    }

    const waMsg =
      "Hi BridgeWise, I just completed the eligibility check.\n" +
      "Diploma field: " + (answers.field || "-") + "\n" +
      "CGPA: " + (answers.cgpa || "-") + "\n" +
      "Diploma taught in English: " + (answers.english || "-") + "\n" +
      "Can you confirm my eligibility?";

    const waLink = document.getElementById("quiz-wa-link");
    if (waLink && typeof WHATSAPP_NUMBER !== "undefined") {
      waLink.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(waMsg);
      waLink.target = "_blank";
      waLink.rel = "noopener";
    }

    if (typeof trackEvent === "function") {
      trackEvent("eligibility_quiz_complete", answers);
    }
  }

  const restartBtn = document.getElementById("quiz-restart");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      quiz.querySelectorAll(".quiz-option.selected").forEach((b) => b.classList.remove("selected"));
      current = 0;
      showStep(0);
    });
  }

  showStep(0);
});
