function drawFaceBox(ctx, box, drawConfig) {
  ctx.strokeStyle = drawConfig.boxColor;
  ctx.lineWidth = drawConfig.boxLineWidth;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function drawLandmarks(ctx, landmarks, drawConfig) {
  ctx.fillStyle = drawConfig.pointColor;
  landmarks.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, drawConfig.pointRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function syncCanvasToVideo(canvas, video) {
  const width = video.videoWidth || video.clientWidth;
  const height = video.videoHeight || video.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

export function renderOverlay(canvas, faceData, drawConfig) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!faceData) {
    return;
  }

  drawFaceBox(ctx, faceData.box, drawConfig);
  drawLandmarks(ctx, faceData.landmarks, drawConfig);
}
