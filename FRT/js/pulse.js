const PANEL_IDS = ["dramaticState", "dramaticAge", "dramaticGender", "dramaticEmotion"];

let pulseTimer = null;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function allPanels() {
  return PANEL_IDS.map((id) => document.getElementById(id)).filter(Boolean);
}

function pulseElement(element) {
  if (!element) {
    return;
  }

  element.classList.remove("text-pulse-active");
  void element.offsetWidth;
  element.classList.add("text-pulse-active");

  window.setTimeout(() => element.classList.remove("text-pulse-active"), 1200);
}

function pulseAllPanels() {
  allPanels().forEach((el, index) => {
    window.setTimeout(() => pulseElement(el), index * 180);
  });
}

function scheduleNextPulse() {
  pulseTimer = window.setTimeout(() => {
    const panels = allPanels();
    if (Math.random() < 0.35) {
      pulseAllPanels();
    } else {
      pulseElement(panels[Math.floor(Math.random() * panels.length)]);
    }
    scheduleNextPulse();
  }, randomBetween(1200, 2200));
}

export function startPulseScheduler() {
  stopPulseScheduler();
  window.setTimeout(pulseAllPanels, 400);
  scheduleNextPulse();
}

export function stopPulseScheduler() {
  if (pulseTimer) {
    window.clearTimeout(pulseTimer);
    pulseTimer = null;
  }
}
