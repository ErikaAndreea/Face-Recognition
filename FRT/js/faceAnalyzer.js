function requireFaceApi() {
  if (!window.faceapi) {
    throw new Error("face-api.js did not load.");
  }
  return window.faceapi;
}

async function loadFromSingleSource(faceapi, modelUrl) {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelUrl),
    faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
    faceapi.nets.ageGenderNet.loadFromUri(modelUrl)
  ]);
}

export async function loadFaceModels(modelUrls) {
  const faceapi = requireFaceApi();
  const sources = Array.isArray(modelUrls) ? modelUrls : [modelUrls];
  const errors = [];

  for (const source of sources) {
    try {
      await loadFromSingleSource(faceapi, source);
      return source;
    } catch (error) {
      errors.push(`${source}: ${error.message}`);
    }
  }

  throw new Error(`Unable to load face models. ${errors.join(" | ")}`);
}

export async function detectFace(videoElement) {
  const faceapi = requireFaceApi();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5
  });

  const result = await faceapi
    .detectSingleFace(videoElement, options)
    .withFaceLandmarks(true)
    .withFaceExpressions()
    .withAgeAndGender();

  if (!result) {
    return null;
  }

  const [emotion, confidence] = Object.entries(result.expressions).reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ["neutral", 0]
  );

  return {
    box: result.detection.box,
    landmarks: result.landmarks.positions,
    age: result.age,
    gender: result.gender,
    genderProbability: result.genderProbability,
    emotion,
    emotionConfidence: confidence
  };
}
