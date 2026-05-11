import { CONFIG } from "./config.js";
import { loadFaceModels, detectFace } from "./faceAnalyzer.js";
import { startWebcam } from "./webcam.js";
import { renderOverlay, syncCanvasToVideo } from "./overlayRenderer.js";
import { setDramaticText, setStatus, setNotice, updateMetrics } from "./ui.js";

const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");

let latestFaceData = null;
let analyzing = false;
let lastAnalysisTimestamp = 0;
const PANEL_IDS = {
  state: "dramaticState",
  age: "dramaticAge",
  gender: "dramaticGender",
  emotion: "dramaticEmotion"
};

function setLivePanels(faceData) {
  if (!faceData) {
    setDramaticText(PANEL_IDS.state, "STATUS: SCANNING FOR SUBJECT", "searching");
    setDramaticText(PANEL_IDS.age, "AGE: --", "searching");
    setDramaticText(PANEL_IDS.gender, "GENDER: --", "searching");
    setDramaticText(PANEL_IDS.emotion, "EMOTION: --", "searching");
    return;
  }

  setDramaticText(PANEL_IDS.state, "STATUS: SUBJECT LOCKED", "tracking");
  setDramaticText(PANEL_IDS.age, `AGE: ${Math.round(faceData.age)} YEARS`, "tracking");
  setDramaticText(
    PANEL_IDS.gender,
    `GENDER: ${faceData.gender.toUpperCase()} ${Math.round(
      faceData.genderProbability * 100
    )}%`,
    "tracking"
  );
  setDramaticText(
    PANEL_IDS.emotion,
    `EMOTION: ${faceData.emotion.toUpperCase()} ${Math.round(
      faceData.emotionConfidence * 100
    )}%`,
    "alert"
  );
}

async function analysisTick(timestamp) {
  syncCanvasToVideo(canvas, video);

  if (
    !analyzing &&
    timestamp - lastAnalysisTimestamp >= CONFIG.detectionIntervalMs
  ) {
    analyzing = true;
    lastAnalysisTimestamp = timestamp;
    detectFace(video)
      .then((data) => {
        latestFaceData = data;
        updateMetrics(data);
        setStatus(data ? "Tracking" : "Searching");
        setLivePanels(data);
      })
      .catch(() => {
        setStatus("Analysis Error");
        setDramaticText(PANEL_IDS.state, "STATUS: ANALYSIS ERROR", "alert");
      })
      .finally(() => {
        analyzing = false;
      });
  }

  renderOverlay(canvas, latestFaceData, CONFIG.draw);
  requestAnimationFrame(analysisTick);
}

async function init() {
  try {
    setStatus("Loading Models");
    setDramaticText(PANEL_IDS.state, "STATUS: BOOTING ANALYSIS ENGINE", "searching");
    const loadedSource = await loadFaceModels(CONFIG.modelUrls);
    setNotice(`Models active from: ${loadedSource}`);

    setStatus("Requesting Camera");
    setDramaticText(PANEL_IDS.state, "STATUS: AWAITING CAMERA PERMISSION", "searching");
    await startWebcam(video, CONFIG.video);
    setDramaticText(PANEL_IDS.state, "STATUS: CAMERA LINK ESTABLISHED", "tracking");

    setStatus("Searching");
    setLivePanels(null);
    requestAnimationFrame(analysisTick);
  } catch (error) {
    setStatus("Initialization Failed");
    setNotice(error?.message || "Unknown initialization error.");
    setDramaticText(PANEL_IDS.state, "STATUS: INITIALIZATION FAILED", "alert");
    console.error(error);
  }
}

init();
