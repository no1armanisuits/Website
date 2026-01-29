/**
 * Build script: reads images from images/reviews/gallery/,
 * generates the gallery section HTML (marquee, link to Google reviews),
 * and replaces the placeholder in index.html.
 *
 * Run when gallery images change: node scripts/generate-gallery.js
 * (from Website directory)
 */

const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.resolve(__dirname, '..');
const GALLERY_DIR = path.join(WEBSITE_DIR, 'images', 'gallery');
const REVIEWS_PATH = path.join(WEBSITE_DIR, 'reviews.json');
const INDEX_PATH = path.join(WEBSITE_DIR, 'index.html');
const PLACEHOLDER_GALLERY = '<!-- GALLERY_SECTION -->';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function filenameToAlt(filename) {
  const base = path.basename(filename, path.extname(filename));
  const withSpaces = base.replace(/[-_]+/g, ' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).replace(/\b\w/g, (c) => c.toUpperCase());
}

function getGalleryImagePaths() {
  try {
    if (!fs.existsSync(GALLERY_DIR)) return [];
    const names = fs.readdirSync(GALLERY_DIR);
    return names
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort()
      .map((name) => `/images/reviews/gallery/${name}`);
  } catch {
    return [];
  }
}

function getReviewsUrl() {
  try {
    const raw = fs.readFileSync(REVIEWS_PATH, 'utf8');
    const data = JSON.parse(raw);
    return data.heading_url || '#';
  } catch {
    return '#';
  }
}

function buildGallerySectionHtml(imagePaths, reviewsUrl) {
  if (imagePaths.length === 0) {
    return '';
  }
  const url = reviewsUrl || '#';
  const imagesHtml = imagePaths.map((imgPath) => {
    const filename = path.basename(imgPath);
    const alt = filenameToAlt(filename);
    return `    <img src="${escapeHtml(imgPath)}" alt="${escapeHtml(alt)}" class="gallery__image" loading="lazy" decoding="async">`;
  }).join('\n');
  return `<section class="gallery">
  <a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="gallery__link">
    <div class="marquee" data-marquee data-marquee-speed="0.5">
      <div class="marquee__strip">
${imagesHtml}
      </div>
    </div>
  </a>
</section>`;
}

function main() {
  const imagePaths = getGalleryImagePaths();
  const reviewsUrl = getReviewsUrl();
  const gallerySectionHtml = buildGallerySectionHtml(imagePaths, reviewsUrl);

  let indexContent = fs.readFileSync(INDEX_PATH, 'utf8');
  if (!indexContent.includes(PLACEHOLDER_GALLERY)) {
    throw new Error(`Placeholder ${PLACEHOLDER_GALLERY} not found in index.html`);
  }
  indexContent = indexContent.replace(PLACEHOLDER_GALLERY, gallerySectionHtml);

  fs.writeFileSync(INDEX_PATH, indexContent, 'utf8');
  console.log(`Generated gallery section with ${imagePaths.length} images`);
}

main();
