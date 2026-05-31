function clampCrop(sx, sy, sw, sh, vw, vh) {
  const x = Math.max(0, sx);
  const y = Math.max(0, sy);
  const w = Math.min(sw, vw - x);
  const h = Math.min(sh, vh - y);
  return { sx: x, sy: y, sw: w, sh: h };
}

function drawMirroredRegion(video, sx, sy, sw, sh) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(8, Math.round(sw));
  canvas.height = Math.max(8, Math.round(sh));
  const ctx = canvas.getContext("2d");

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function cropFromFaceBox(video, faceData, padX, padY) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const bx = faceData.box.x;
  const by = faceData.box.y;
  const bw = faceData.box.width;
  const bh = faceData.box.height;

  return clampCrop(bx - padX, by - padY, bw + padX * 2, bh + padY * 2, vw, vh);
}

function toMirroredCanvasPoint(point, crop) {
  const { sx, sy, sw } = crop;
  return {
    x: sw - (point.x - sx),
    y: point.y - sy
  };
}

function computeFaceCenter(landmarks, crop, canvasW, canvasH) {
  if (!landmarks?.length || landmarks.length < 46 || !crop) {
    return { x: canvasW / 2, y: canvasH / 2 };
  }

  const leftEye = toMirroredCanvasPoint(landmarks[36], crop);
  const rightEye = toMirroredCanvasPoint(landmarks[45], crop);
  const nose = toMirroredCanvasPoint(landmarks[30], crop);

  return {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) * 0.6 + nose.y * 0.4
  };
}

function computeFaceRoll(landmarks, crop) {
  if (!landmarks?.length || landmarks.length < 46 || !crop) {
    return 0;
  }

  const eyeA = toMirroredCanvasPoint(landmarks[36], crop);
  const eyeB = toMirroredCanvasPoint(landmarks[45], crop);
  const leftOnCanvas = eyeA.x <= eyeB.x ? eyeA : eyeB;
  const rightOnCanvas = eyeA.x <= eyeB.x ? eyeB : eyeA;

  return Math.atan2(
    rightOnCanvas.y - leftOnCanvas.y,
    rightOnCanvas.x - leftOnCanvas.x
  );
}

export function captureFaceFromVideo(video, faceData) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh || !faceData?.box) {
    return null;
  }

  const bw = faceData.box.width;
  const bh = faceData.box.height;
  const padX = bw * 0.12;
  const padY = bh * 0.18;

  const paddedCrop = cropFromFaceBox(video, faceData, bw * 0.3, bh * 0.35);
  const faceCrop = cropFromFaceBox(video, faceData, padX, padY);

  const canvas = drawMirroredRegion(
    video,
    paddedCrop.sx,
    paddedCrop.sy,
    paddedCrop.sw,
    paddedCrop.sh
  );
  const faceCanvas = drawMirroredRegion(
    video,
    faceCrop.sx,
    faceCrop.sy,
    faceCrop.sw,
    faceCrop.sh
  );

  if (faceCanvas.width < 8 || faceCanvas.height < 8) {
    return null;
  }

  return {
    canvas,
    faceCanvas,
    faceCenter: computeFaceCenter(
      faceData.landmarks,
      faceCrop,
      faceCanvas.width,
      faceCanvas.height
    ),
    faceCenterPadded: computeFaceCenter(
      faceData.landmarks,
      paddedCrop,
      canvas.width,
      canvas.height
    ),
    roll: computeFaceRoll(faceData.landmarks, faceCrop),
    rollPadded: computeFaceRoll(faceData.landmarks, paddedCrop)
  };
}

export function getFaceCenter(capture, template) {
  if (template?.faceCrop === "detectedFaceOnly") {
    return capture?.faceCenter;
  }

  return capture?.faceCenterPadded ?? capture?.faceCenter;
}

export function getFaceRoll(capture, template) {
  if (template?.faceCrop === "detectedFaceOnly") {
    return capture?.roll ?? 0;
  }

  return capture?.rollPadded ?? capture?.roll ?? 0;
}

export function getCaptureSource(capture, template) {
  if (template?.faceCrop === "detectedFaceOnly" && capture?.faceCanvas) {
    return capture.faceCanvas;
  }

  return capture?.canvas || null;
}
