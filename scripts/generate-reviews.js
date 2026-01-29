/**
 * Build script: reads reviews.json, filters items (text + name/reviewer + rating),
 * generates the reviews section HTML (BEM: reviews, marquee) and JSON-LD structured data,
 * then replaces placeholders in index.html.
 *
 * Run when reviews.json changes: node scripts/generate-reviews.js
 * (from Website directory)
 */

const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.resolve(__dirname, '..');
const REVIEWS_PATH = path.join(WEBSITE_DIR, 'reviews.json');
const INDEX_PATH = path.join(WEBSITE_DIR, 'index.html');

const PLACEHOLDER_SECTION = '<!-- REVIEWS_SECTION -->';
const PLACEHOLDER_STRUCTURED_DATA = '<!-- REVIEWS_STRUCTURED_DATA -->';

function loadReviews() {
  const raw = fs.readFileSync(REVIEWS_PATH, 'utf8');
  return JSON.parse(raw);
}

function filterReviewItems(items) {
  return items.filter(
    (item) =>
      item.text &&
      (item.name || item.reviewer) &&
      item.rating != null
  );
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtmlForJsonLd(str) {
  if (!str) return '';
  return str
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSectionHtml(items) {
  const cards = items.map((item) => {
    const name = item.name || item.reviewer || '';
    const image = item.image ? `<img src="${escapeHtml(item.image)}" alt="" class="reviews__card-image" loading="lazy">` : '';
    const stars = item.rating != null ? '\u2605'.repeat(Math.min(5, Math.max(0, item.rating))) : '';
    const ratingHtml = stars ? `<span class="reviews__card-rating" aria-label="Rating: ${item.rating} out of 5">${stars}</span>` : '';
    const textHtml = item.text ? `<div class="reviews__card-text">${item.text}</div>` : '';
    const url = item.url || '#';
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="reviews__card">
  ${image}
  <span class="reviews__card-name">${escapeHtml(name)}</span>
  ${ratingHtml}
  ${textHtml}
</a>`;
  }).join('\n');

  return `<section class="reviews">
  <h2 class="reviews__title">What our customers say</h2>
  <div class="marquee" data-marquee data-marquee-speed="0.5">
    <div class="marquee__strip">
${cards}
    </div>
  </div>
</section>`;
}

function buildJsonLd(items) {
  const reviews = items.map((item) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: item.name || item.reviewer || '' },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: item.rating,
      bestRating: 5,
    },
    reviewBody: stripHtmlForJsonLd(item.text),
    datePublished: item.date || undefined,
  })).filter((r) => r.reviewBody || r.author.name);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': reviews,
  };
  return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`;
}

function main() {
  const data = loadReviews();
  const items = Array.isArray(data.items) ? data.items : [];
  const filtered = filterReviewItems(items);

  const sectionHtml = buildSectionHtml(filtered);
  const structuredDataHtml = buildJsonLd(filtered);

  let indexContent = fs.readFileSync(INDEX_PATH, 'utf8');
  if (!indexContent.includes(PLACEHOLDER_SECTION)) {
    throw new Error(`Placeholder ${PLACEHOLDER_SECTION} not found in index.html`);
  }
  if (!indexContent.includes(PLACEHOLDER_STRUCTURED_DATA)) {
    throw new Error(`Placeholder ${PLACEHOLDER_STRUCTURED_DATA} not found in index.html`);
  }
  indexContent = indexContent.replace(PLACEHOLDER_SECTION, sectionHtml);
  indexContent = indexContent.replace(PLACEHOLDER_STRUCTURED_DATA, structuredDataHtml);

  fs.writeFileSync(INDEX_PATH, indexContent, 'utf8');
  console.log(`Generated ${filtered.length} review cards and updated index.html`);
}

main();
