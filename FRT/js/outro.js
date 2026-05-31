import { CONFIG } from "./config.js";

const DEFAULT_SLIDE_MS = Number(CONFIG.outro?.slideDurationMs) || 6500;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createLine(text, className = "intro__line") {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

export function showOutro(slides) {
  return new Promise((resolve) => {
    if (!slides?.length) {
      resolve();
      return;
    }

    document.body.classList.add("outro-active");

    const root = document.createElement("section");
    root.className = "intro outro";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-live", "polite");

    root.innerHTML = `
      <div class="intro__depth" aria-hidden="true"></div>
      <div class="intro__content">
        <header class="intro__header"></header>
        <div class="intro__copy"></div>
        <footer class="intro__footer outro__footer"></footer>
      </div>
      <div class="outro__timer" aria-hidden="true"><div class="outro__timer-fill"></div></div>
    `;

    const headerEl = root.querySelector(".intro__header");
    const copyEl = root.querySelector(".intro__copy");
    const footerEl = root.querySelector(".outro__footer");
    const timerFillEl = root.querySelector(".outro__timer-fill");

    document.body.appendChild(root);

    let index = 0;
    let timerId = null;
    let finished = false;

    function clearTimer() {
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    }

    function finish() {
      if (finished) {
        return;
      }
      finished = true;
      clearTimer();
      document.removeEventListener("keydown", onKeyDown);
      root.classList.add("intro--leaving");
      document.body.classList.remove("outro-active");

      const cleanup = () => {
        root.remove();
        resolve();
      };

      root.addEventListener("transitionend", cleanup, { once: true });
      window.setTimeout(cleanup, 1600);
    }

    function startSlideTimer(ms) {
      if (!timerFillEl || ms <= 0) {
        return;
      }

      timerFillEl.style.transition = "none";
      timerFillEl.style.width = "0%";
      void timerFillEl.offsetWidth;
      timerFillEl.style.transition = `width ${ms}ms linear`;
      timerFillEl.style.width = "100%";

      clearTimer();
      timerId = window.setTimeout(() => {
        advanceSlide();
      }, ms);
    }

    function renderSlide(slide) {
      headerEl.replaceChildren();
      copyEl.replaceChildren();
      footerEl.replaceChildren();

      if (slide.button) {
        root.querySelector(".outro__timer")?.classList.add("outro__timer--hidden");
      } else {
        root.querySelector(".outro__timer")?.classList.remove("outro__timer--hidden");
      }

      if (slide.title) {
        headerEl.appendChild(createLine(slide.title, "intro__title intro__line"));
      }

      slide.lines?.forEach((line) => {
        copyEl.appendChild(createLine(line));
      });

      if (slide.qrImage) {
        const qrWrap = document.createElement("div");
        qrWrap.className = "outro__qr-wrap intro__line";

        const qrImg = document.createElement("img");
        qrImg.className = "outro__qr";
        qrImg.src = slide.qrImage;
        qrImg.alt = slide.qrAlt || "QR code";
        qrImg.decoding = "async";

        qrWrap.appendChild(qrImg);
        copyEl.appendChild(qrWrap);
      }

      if (slide.button) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "intro__continue";
        button.textContent = slide.button;
        button.addEventListener("click", finish);
        footerEl.appendChild(button);
        window.setTimeout(() => button.focus(), 400);
        return;
      }

      startSlideTimer(slide.durationMs ?? DEFAULT_SLIDE_MS);
    }

    async function advanceSlide() {
      if (finished) {
        return;
      }

      clearTimer();

      if (index >= slides.length - 1) {
        finish();
        return;
      }

      root.classList.add("intro--leaving");
      await wait(1150);

      if (finished) {
        return;
      }

      index += 1;
      root.classList.remove("intro--leaving");
      renderSlide(slides[index]);
    }

    function onKeyDown(event) {
      if (finished) {
        return;
      }

      const slide = slides[index];
      if (slide?.button && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        finish();
        return;
      }

      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        advanceSlide();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    renderSlide(slides[index]);
  });
}
