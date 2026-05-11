export const CONFIG = {
  modelUrls: [
    "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model",
    "https://justadudewhohacks.github.io/face-api.js/models",
    "./models"
  ],
  detectionIntervalMs: 120,
  video: {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  draw: {
    boxColor: "rgba(130, 205, 255, 0.9)",
    pointColor: "rgba(197, 232, 255, 0.75)",
    boxLineWidth: 2,
    pointRadius: 1.3
  }
};
