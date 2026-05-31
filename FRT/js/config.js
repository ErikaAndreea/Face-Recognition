export const CONFIG = {
  modelUrls: [
    "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model",
    "https://justadudewhohacks.github.io/face-api.js/models"
  ],
  detectionIntervalMs: 120,
  video: {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  draw: {
    boxColor: "rgba(255, 72, 72, 0.92)",
    pointColor: "rgba(255, 140, 140, 0.7)",
    boxLineWidth: 2,
    pointRadius: 1.3
  },
  poster: {
    analysisDurationMs: 30_000,
    captureCountdownSeconds: 5,
    flashFirstHoldMs: 4000,
    flashHoldMs: 800,
    flashBurstMs: 680,
    templateIds: null
  },
  outro: {
    slideDurationMs: 6500
  }
};
