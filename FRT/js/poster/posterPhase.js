import { CONFIG } from "../config.js";
import { POSTER_TEMPLATES } from "./templates.js";
import { captureFaceFromVideo } from "./faceCapture.js";
import { renderAllPosters } from "./compositor.js";
import { preloadTemplates } from "./imageLoader.js";

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function createPosterPhase(options) {
  const {
    stageEl,
    canvasEl,
    titleEl,
    counterEl,
    hintEl,
    nextBtn,
    restartBtn,
    continueBtn,
    templates = POSTER_TEMPLATES,
    onRestart,
    onContinue
  } = options;

  const flashEl = stageEl?.querySelector(".poster-stage__flash");
  const firstHoldMs = Number(CONFIG.poster?.flashFirstHoldMs) || 4000;
  const holdMs = Number(CONFIG.poster?.flashHoldMs) || 800;
  const burstMs = Number(CONFIG.poster?.flashBurstMs) || 680;

  let posters = [];
  let index = 0;
  let visible = false;
  let sequenceAbort = false;

  function paintCurrentPoster() {
    if (!posters.length) {
      return;
    }

    const { template, canvas } = posters[index];
    const displayCtx = canvasEl.getContext("2d", { alpha: false });

    if (!displayCtx) {
      return;
    }

    if (canvasEl.width !== canvas.width || canvasEl.height !== canvas.height) {
      canvasEl.width = canvas.width;
      canvasEl.height = canvas.height;
    }

    displayCtx.drawImage(canvas, 0, 0);

    titleEl.textContent = template.title;
    counterEl.textContent = `${index + 1} / ${posters.length}`;
    hintEl.textContent =
      index < posters.length - 1 ? "Next scenario" : "You have seen all scenarios";
  }

  function showCurrent() {
    paintCurrentPoster();
    canvasEl?.classList.remove("poster-stage__canvas--flash-in");
    void canvasEl?.offsetWidth;
    canvasEl?.classList.add("poster-stage__canvas--flash-in");
  }

  function triggerFlash(intense = false) {
    if (!flashEl) {
      return;
    }

    flashEl.classList.remove(
      "poster-stage__flash--active",
      "poster-stage__flash--intense"
    );
    void flashEl.offsetWidth;
    flashEl.classList.add("poster-stage__flash--active");
    if (intense) {
      flashEl.classList.add("poster-stage__flash--intense");
    }

    stageEl?.classList.remove("poster-stage--impact");
    void stageEl?.offsetWidth;
    stageEl?.classList.add("poster-stage--impact");
  }

  function setSequenceMode(active) {
    stageEl?.classList.toggle("poster-stage--sequencing", active);
  }

  function setAwaitContinueMode(active) {
    stageEl?.classList.toggle("poster-stage--await-continue", active);
  }

  async function playFlashSequence() {
    sequenceAbort = false;
    setSequenceMode(true);
    showStage();

    for (let i = 0; i < posters.length; i += 1) {
      if (sequenceAbort) {
        break;
      }

      index = i;
      triggerFlash(i > 0);
      showCurrent();
      await wait(burstMs);

      if (sequenceAbort) {
        break;
      }

      if (i < posters.length - 1) {
        const pauseMs = i === 0 ? firstHoldMs : holdMs;
        await wait(pauseMs);
      }
    }

    stageEl?.classList.remove("poster-stage--impact");
    setSequenceMode(false);
    index = posters.length - 1;
    paintCurrentPoster();
    hintEl.textContent = "Take a moment with what you saw";
    setAwaitContinueMode(true);
  }

  function showStage() {
    stageEl.classList.remove("poster-stage--hidden");
    stageEl.removeAttribute("aria-hidden");
    visible = true;
  }

  function hideStage() {
    stageEl.classList.add("poster-stage--hidden");
    stageEl.setAttribute("aria-hidden", "true");
    stageEl.classList.remove("poster-stage--sequencing");
    visible = false;
  }

  function next() {
    if (!posters.length) {
      return;
    }
    index = (index + 1) % posters.length;
    paintCurrentPoster();
  }

  function restart() {
    sequenceAbort = true;
    setAwaitContinueMode(false);
    hideStage();
    posters = [];
    index = 0;
    onRestart?.();
  }

  function continueToOutro() {
    if (!stageEl?.classList.contains("poster-stage--await-continue")) {
      return;
    }
    sequenceAbort = true;
    setAwaitContinueMode(false);
    hideStage();
    onContinue?.();
  }

  nextBtn?.addEventListener("click", next);
  restartBtn?.addEventListener("click", restart);
  continueBtn?.addEventListener("click", continueToOutro);

  document.addEventListener("keydown", (event) => {
    if (!visible || stageEl?.classList.contains("poster-stage--sequencing")) {
      return;
    }
    if (stageEl?.classList.contains("poster-stage--await-continue")) {
      if (event.key === "Enter") {
        event.preventDefault();
        continueToOutro();
      }
      return;
    }
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      next();
    }
  });

  return {
    async start(video, faceData) {
      const capture = captureFaceFromVideo(video, faceData);
      if (!capture) {
        return false;
      }

      try {
        await preloadTemplates(templates);
      } catch (error) {
        console.error(error);
        return false;
      }

      posters = renderAllPosters(capture, templates);
      if (!posters.length) {
        return false;
      }

      index = 0;
      await playFlashSequence();
      return true;
    }
  };
}
