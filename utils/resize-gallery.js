/**
 * Resize and optimize gallery images from original/ to gallery/.
 * - Source: images/gallery/original/
 * - Output: images/gallery/*.webp (420px height, WebP 80% quality)
 *
 * Run: npm run resize-gallery (from repo root, i.e. Website/)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const WEBSITE_DIR = path.resolve(__dirname, '..');
const ORIGINAL_DIR = path.join(WEBSITE_DIR, 'images', 'gallery', 'original');
const GALLERY_DIR = path.join(WEBSITE_DIR, 'images', 'gallery');

const TARGET_HEIGHT = 420;
const WEBP_QUALITY = 80;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function getBaseName(filename) {
  return path.basename(filename, path.extname(filename));
}

async function processImage(inputPath) {
  const baseName = getBaseName(path.basename(inputPath));
  const outputPath = path.join(GALLERY_DIR, `${baseName}.webp`);

  await sharp(inputPath)
    .resize({ height: TARGET_HEIGHT, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  return outputPath;
}

async function main() {
  if (!fs.existsSync(ORIGINAL_DIR)) {
    console.error('Original directory not found:', ORIGINAL_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
  }

  const names = fs.readdirSync(ORIGINAL_DIR);
  const imageNames = names.filter((name) =>
    IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())
  );

  if (imageNames.length === 0) {
    console.log('No images found in', ORIGINAL_DIR);
    return;
  }

  console.log(`Processing ${imageNames.length} images (${TARGET_HEIGHT}px height, WebP ${WEBP_QUALITY}%)...`);

  for (const name of imageNames) {
    const inputPath = path.join(ORIGINAL_DIR, name);
    try {
      const out = await processImage(inputPath);
      console.log('  ', name, '->', path.basename(out));
    } catch (err) {
      console.error('  Error:', name, err.message);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
