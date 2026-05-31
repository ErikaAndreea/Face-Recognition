export function analyzeMaskBounds(maskImage) {
  if (!maskImage?.naturalWidth || !maskImage?.naturalHeight) {
    return null;
  }

  const w = maskImage.naturalWidth;
  const h = maskImage.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  ctx.drawImage(maskImage, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  let xmin = Infinity;
  let xmax = -Infinity;
  let ymin = Infinity;
  let ymax = -Infinity;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a > 128 && r > 200 && g > 200 && b > 200) {
        xmin = Math.min(xmin, x);
        xmax = Math.max(xmax, x);
        ymin = Math.min(ymin, y);
        ymax = Math.max(ymax, y);
      }
    }
  }

  if (!Number.isFinite(xmin)) {
    return null;
  }

  const bw = xmax - xmin + 1;
  const bh = ymax - ymin + 1;

  return {
    cx: (xmin + xmax + 1) / 2 / w,
    cy: (ymin + ymax + 1) / 2 / h,
    width: bw / w,
    height: bh / h
  };
}
