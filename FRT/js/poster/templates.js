export const POSTER_TEMPLATES = [
  {
    id: "billboard-ad",
    title: "Billboard advertisement",
    width: 1448,
    height: 1086,
    imageUrl: "./assets/templates/urban_night_advertising_for_skincare_serum.png",
    maskUrl: "./assets/templates/billboard-ad-mask.png",
    faceSlot: {
      x: 0.56,
      y: 0.525,
      width: 0.245,
      height: 0.42
    },
    faceCrop: "padded",
    faceBleed: 1.18,
    faceScale: 1.1,
    maskFeather: 0,
    faceCenterAdjust: { x: 0.01, y: 0.022 },
    faceFilter: {
      brightness: 1.1,
      contrast: 0.9,
      saturate: 0.9,
      blur: 0.3
    },
    faceOverlay: "rgba(245, 225, 210, 0.08)"
  },
  {
    id: "security-cam",
    title: "Security camera feed",
    width: 1448,
    height: 1086,
    imageUrl: "./assets/templates/security.png?v=2",
    maskUrl: "./assets/templates/security-mask.png?v=2",
    faceSlot: {
      x: 0.495,
      y: 0.254,
      width: 0.062,
      height: 0.108
    },
    faceCrop: "detectedFaceOnly",
    faceBleed: 1.28,
    faceScale: 1.2,
    maskFeather: 0,
    faceCenterAdjust: { x: 0, y: 0.016 },
    faceFilter: {
      brightness: 0.88,
      contrast: 1.1,
      saturate: 0.55,
      blur: 0.8
    },
    faceOverlay: "rgba(120, 160, 170, 0.08)"
  }
];

export function getTemplateImageUrl(template) {
  return template.imageUrl || null;
}

export function getTemplateMaskUrl(template) {
  return template.maskUrl || null;
}
