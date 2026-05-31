import { getTemplateImageUrl, getTemplateMaskUrl } from "./templates.js";
import { analyzeMaskBounds } from "./maskUtils.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export async function preloadTemplates(templates) {
  await Promise.all(
    templates.map(async (template) => {
      const imageUrl = getTemplateImageUrl(template);
      if (imageUrl && !template.image) {
        template.image = await loadImage(imageUrl);
        template.width = template.width || template.image.naturalWidth;
        template.height = template.height || template.image.naturalHeight;
      }

      const maskUrl = getTemplateMaskUrl(template);
      if (maskUrl && !template.maskImage) {
        template.maskImage = await loadImage(maskUrl);
        template.maskBounds = analyzeMaskBounds(template.maskImage);
      }
    })
  );

  return templates;
}
