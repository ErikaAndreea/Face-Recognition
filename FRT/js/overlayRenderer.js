function drawCornerBracket(ctx, x, y, size, corner, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  if (corner === "tl") {
    ctx.moveTo(x, y + size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
  } else if (corner === "tr") {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + size);
  } else if (corner === "bl") {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
  } else {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - size);
  }

  ctx.stroke();
}

function drawReticle(ctx, box, drawConfig) {
  const pad = 8;
  const size = Math.min(22, box.width * 0.12, box.height * 0.12);
  const x = box.x - pad;
  const y = box.y - pad;
  const w = box.width + pad * 2;
  const h = box.height + pad * 2;
  const color = drawConfig.boxColor;

  drawCornerBracket(ctx, x, y, size, "tl", color, drawConfig.boxLineWidth);
  drawCornerBracket(ctx, x + w, y, size, "tr", color, drawConfig.boxLineWidth);
  drawCornerBracket(ctx, x, y + h, size, "bl", color, drawConfig.boxLineWidth);
  drawCornerBracket(ctx, x + w, y + h, size, "br", color, drawConfig.boxLineWidth);

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.globalAlpha = 1;
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

  drawReticle(ctx, faceData.box, drawConfig);
  drawLandmarks(ctx, faceData.landmarks, drawConfig);
}
