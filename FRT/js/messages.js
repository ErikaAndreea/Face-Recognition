const FADE_OUT_MS = 650;
const MAX_CONCURRENT = 2;
const MAX_QUEUE = 14;
const GAP_MIN_MS = 180;
const GAP_MAX_MS = 550;
const STAGGER_MIN_MS = 1100;
const STAGGER_MAX_MS = 1800;
const HOLD_MIN_MS = 1500;
const HOLD_MAX_MS = 2600;
const AMBIENT_MIN_MS = 1600;
const AMBIENT_MAX_MS = 3000;

const SLOTS = ["pos-upper", "pos-lower", "pos-mid-left", "pos-mid-right"];

const SCANNING = [
  "Scanning for a face…",
  "Position your face in frame",
  "Looking for a match…",
  "Optical sweep in progress",
  "No subject in range",
  "Acquire facial target",
  "Wide-area scan active",
  "Awaiting biometric input",
  "Search pattern: spiral",
  "Infrared channel standby",
  "Frame empty — retrying",
  "Subject acquisition pending"
];

const ANALYZING = [
  "Face detected",
  "Your face is being analyzed",
  "Hold still a moment…",
  "Processing video feed…",
  "Running biometric scan…",
  "Mapping facial geometry",
  "Triangulating features",
  "Depth map updating",
  "Contour lock engaged",
  "Vertex mesh stabilizing",
  "Signal strength: acceptable",
  "Tracking point confirmed",
  "Rasterizing expression plane",
  "Temporal filter applied",
  "Cross-checking landmarks",
  "Neural pass 2 of 4",
  "Neural pass 3 of 4",
  "Buffer flush complete",
  "Do not break line of sight",
  "Maintain neutral posture"
];

const SURVEILLANCE = [
  "Session flagged: live",
  "Local inference only",
  "No export channel open",
  "Confidence threshold: dynamic",
  "Model revision: embedded",
  "Latency within tolerance",
  "Subject ID: ephemeral",
  "Audit log: disabled",
  "Mirror mode: active",
  "Optical axis: centered",
  "Frame delta: nominal",
  "Pipeline: uninterrupted",
  "Watchdog: silent",
  "Checksum: deferred",
  "Cache: volatile"
];

const LOCK_LINES = [
  "Face detected",
  "Your face is being analyzed",
  "Biometric lock acquired",
  "Subject profile loading",
  "Do not move",
  "Scan depth: increasing"
];

const LOST_LINES = [
  "Face lost — scanning again",
  "Track terminated",
  "Re-acquiring subject",
  "Optical sweep resuming"
];

let queue = [];
let activeCount = 0;
let ambientTimer = null;
const occupiedSlots = new Set();

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getStage() {
  return document.getElementById("statusCaptions");
}

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickRandomSlot() {
  const free = SLOTS.filter((slot) => !occupiedSlots.has(slot));
  const pool = free.length > 0 ? free : SLOTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickPool(hasFace) {
  if (!hasFace) {
    return SCANNING;
  }
  return Math.random() < 0.55
    ? ANALYZING
    : Math.random() < 0.7
      ? SURVEILLANCE
      : ANALYZING;
}

function resolveHoldMs(holdMs) {
  if (typeof holdMs === "number") {
    return holdMs + randomBetween(-250, 350);
  }
  return randomBetween(HOLD_MIN_MS, HOLD_MAX_MS);
}

function displayOne({ text, holdMs, slot }) {
  const stage = getStage();
  if (!stage || !text) {
    return Promise.resolve();
  }

  occupiedSlots.add(slot);

  return new Promise((resolve) => {
    const el = document.createElement("span");
    el.className = `status-caption status-caption--${slot}`;
    el.textContent = text;
    stage.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add("status-caption--visible"));
    });

    window.setTimeout(() => {
      el.classList.add("status-caption--hide");
      window.setTimeout(() => {
        el.remove();
        occupiedSlots.delete(slot);
        resolve();
      }, FADE_OUT_MS);
    }, holdMs);
  });
}

function launchNextJob() {
  if (activeCount >= MAX_CONCURRENT || queue.length === 0) {
    return;
  }

  const job = queue.shift();
  const holdMs = resolveHoldMs(job.holdMs);
  const startDelay = activeCount >= 1 ? randomBetween(STAGGER_MIN_MS, STAGGER_MAX_MS) : 0;

  activeCount += 1;

  window.setTimeout(() => {
    const slot = job.slot || pickRandomSlot();
    displayOne({ text: job.text, holdMs, slot }).then(() => {
      activeCount -= 1;
      window.setTimeout(launchNextJob, randomBetween(GAP_MIN_MS, GAP_MAX_MS));
    });
  }, startDelay);
}

function enqueue(text, holdMs, slot) {
  if (!text) {
    return;
  }
  if (queue.length >= MAX_QUEUE) {
    queue.shift();
  }
  queue.push({ text, holdMs, slot });
  launchNextJob();
}

function enqueueMany(lines) {
  lines.forEach((text) => enqueue(text));
}

export function showMessage(text, holdMs) {
  enqueue(text, holdMs);
}

function spawnRandomAmbient(hasFace) {
  enqueue(pickRandom(pickPool(hasFace)));
}

function scheduleAmbientTick(getHasFace) {
  ambientTimer = window.setTimeout(() => {
    spawnRandomAmbient(getHasFace());
    scheduleAmbientTick(getHasFace);
  }, randomBetween(AMBIENT_MIN_MS, AMBIENT_MAX_MS));
}

export function startAmbientChatter(getHasFace) {
  stopAmbientChatter();
  window.setTimeout(() => spawnRandomAmbient(getHasFace()), 800);
  scheduleAmbientTick(getHasFace);
}

export function stopAmbientChatter() {
  if (ambientTimer) {
    window.clearTimeout(ambientTimer);
    ambientTimer = null;
  }
}

export function onFaceStateChange(prev, next) {
  if (!next) {
    if (prev) {
      enqueueMany([
        pickRandom(LOST_LINES),
        pickRandom(LOST_LINES),
        pickRandom(LOST_LINES)
      ]);
    }
    return;
  }

  if (!prev) {
    const picks = [];
    while (picks.length < 4) {
      const line = pickRandom(LOCK_LINES);
      if (!picks.includes(line)) {
        picks.push(line);
      }
    }
    enqueueMany(picks);
  }
}

export function showBootMessage(text) {
  enqueue(text);
}
