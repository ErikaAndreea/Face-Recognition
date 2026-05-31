import { getCaptureSource, getFaceCenter, getFaceRoll } from "./faceCapture.js";

function applyFaceFilter(ctx, filter = {}) {
  const { saturate = 1, contrast = 1, brightness = 1, hue = 0, blur = 0 } = filter;
  const parts = [
    `brightness(${brightness})`,
    `contrast(${contrast})`,
    `saturate(${saturate})`
  ];

  if (hue) {
    parts.push(`hue-rotate(${hue}deg)`);
  }

  if (blur > 0) {
    parts.push(`blur(${blur}px)`);
  }

  ctx.filter = parts.join(" ");
}

function resetFilter(ctx) {
  ctx.filter = "none";
}

function applyFaceBlendEffects(ctx, template, posterW, posterH) {
  if (template.faceOverlay) {
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = template.faceOverlay;
    ctx.fillRect(0, 0, posterW, posterH);
    ctx.restore();
  }
}

function resolveMaskTarget(template, posterW, posterH) {
  const bleed = template.faceBleed ?? 1;
  const adjust = { x: 0, y: 0, ...template.faceCenterAdjust };

  if (template.maskBounds) {
    const { cx, cy, width, height } = template.maskBounds;
    return {
      cx: cx * posterW + adjust.x * posterW,
      cy: cy * posterH + adjust.y * posterH,
      width: width * posterW * bleed,
      height: height * posterH * bleed
    };
  }

  const slot = template.faceSlot;
  return {
    cx: slot.x * posterW + adjust.x * posterW,
    cy: slot.y * posterH + adjust.y * posterH,
    width: slot.width * posterW * bleed,
    height: slot.height * posterH * bleed
  };
}

function drawFaceAlignedToMask(ctx, source, template, capture, posterW, posterH) {
  const target = resolveMaskTarget(template, posterW, posterH);
  const faceCenter = getFaceCenter(capture, template) || {
    x: source.width / 2,
    y: source.height / 2
  };
  const roll = template.levelFaceRoll !== false ? getFaceRoll(capture, template) : 0;
  const scaleBoost = template.faceScale ?? 1;
  const scale =
    Math.max(target.width / source.width, target.height / source.height) * scaleBoost;
  const drawW = source.width * scale;
  const drawH = source.height * scale;
  const drawX = target.cx - faceCenter.x * scale;
  const drawY = target.cy - faceCenter.y * scale;

  ctx.save();
  if (roll) {
    ctx.translate(target.cx, target.cy);
    ctx.rotate(-roll);
    ctx.translate(-target.cx, -target.cy);
  }

  applyFaceFilter(ctx, template.faceFilter);
  ctx.drawImage(source, drawX, drawY, drawW, drawH);
  resetFilter(ctx);
  ctx.restore();
}

function getFeatheredMask(template, posterW, posterH) {
  const feather = template.maskFeather ?? 0;
  if (feather <= 0 || !template.maskImage) {
    return template.maskImage;
  }

  const key = `${posterW}x${posterH}f${feather}`;
  if (template._featheredMask?.key === key) {
    return template._featheredMask.canvas;
  }

  const canvas = document.createElement("canvas");
  canvas.width = posterW;
  canvas.height = posterH;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return template.maskImage;
  }

  ctx.filter = `blur(${feather}px)`;
  ctx.drawImage(template.maskImage, 0, 0, posterW, posterH);
  ctx.filter = "none";

  template._featheredMask = { key, canvas };
  return canvas;
}

function drawMaskedFaceLayer(ctx, capture, template, posterW, posterH) {
  const source = getCaptureSource(capture, template);
  const maskImage = template.maskImage;

  if (!source || source.width < 4 || source.height < 4 || !maskImage) {
    return;
  }

  const faceLayer = document.createElement("canvas");
  faceLayer.width = posterW;
  faceLayer.height = posterH;
  const faceCtx = faceLayer.getContext("2d");

  drawFaceAlignedToMask(faceCtx, source, template, capture, posterW, posterH);
  applyFaceBlendEffects(faceCtx, template, posterW, posterH);

  const featherMask = getFeatheredMask(template, posterW, posterH);
  faceCtx.globalCompositeOperation = "destination-in";
  faceCtx.drawImage(featherMask, 0, 0, posterW, posterH);

  ctx.drawImage(faceLayer, 0, 0);
}

export function renderPoster(capture, template) {
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d", { alpha: false });

  if (!ctx) {
    return canvas;
  }

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, template.width, template.height);
  ctx.drawImage(template.image, 0, 0, template.width, template.height);
  drawMaskedFaceLayer(ctx, capture, template, template.width, template.height);

  return canvas;
}

export function renderAllPosters(capture, templates) {
  return templates
    .filter((template) => template.image)
    .map((template) => ({
      template,
      canvas: renderPoster(capture, template)
    }));
}
