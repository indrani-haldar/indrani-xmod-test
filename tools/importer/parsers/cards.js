/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://www.abbvie.com/who-we-are/our-leaders.html
 * Generated: 2026-02-25
 *
 * Source DOM structure (captured from .grid.aem-GridColumn):
 *   .grid-container > .grid-row > .grid-row__col-with-4.grid-cell > .cardpagestory
 *     a[href] (wraps entire card, links to bio page)
 *       .card-image-container > picture > img.card-image
 *       .card-content-container > div > .card-text-container
 *         h4.card-title (leader name)
 *         p.card-description (job title)
 *       .card-cta (CTA text, e.g. "Meet Rob")
 *
 * UE Model (_cards.json):
 *   Container: Cards > Card items
 *   Card model fields: image (reference), text (richtext)
 *   -> 2 columns per row: [image, text]
 *   -> Field hints: <!-- field:image --> before picture, <!-- field:text --> before text content
 *
 * Block library structure: Each row = 1 card with [image | text] columns
 */
export default function parse(element, { document }) {
  // Collect all cardpagestory elements from this grid AND all subsequent sibling grids
  const allCards = [];
  const cards = element.querySelectorAll('.cardpagestory');
  cards.forEach((c) => allCards.push(c));

  // Also collect from subsequent sibling .grid.aem-GridColumn elements
  let sibling = element.nextElementSibling;
  const consumedSiblings = [];
  while (sibling) {
    if (sibling.classList.contains('grid') && sibling.classList.contains('aem-GridColumn')) {
      const sibCards = sibling.querySelectorAll('.cardpagestory');
      sibCards.forEach((c) => allCards.push(c));
      consumedSiblings.push(sibling);
      sibling = sibling.nextElementSibling;
    } else {
      break;
    }
  }

  // If no cards found, this grid was already consumed - remove element
  if (allCards.length === 0) {
    element.remove();
    return;
  }

  // Build cells array - each card is one row with [image, text] columns
  const cells = [];

  allCards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    // Column 1: Image with field hint
    const picture = card.querySelector('picture');
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    if (picture) {
      imgFrag.appendChild(picture.cloneNode(true));
    }

    // Column 2: Text content with field hint (name, title, CTA link)
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    const title = card.querySelector('h4.card-title, .card-title');
    if (title) {
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      const p1 = document.createElement('p');
      p1.appendChild(strong);
      textFrag.appendChild(p1);
    }

    const desc = card.querySelector('p.card-description, .card-description');
    if (desc) {
      const p2 = document.createElement('p');
      p2.textContent = desc.textContent.trim();
      textFrag.appendChild(p2);
    }

    const ctaText = card.querySelector('.card-cta');
    if (ctaText && href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = ctaText.textContent.trim();
      const p3 = document.createElement('p');
      p3.appendChild(a);
      textFrag.appendChild(p3);
    }

    cells.push([imgFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });

  // Remove consumed sibling grids
  consumedSiblings.forEach((s) => s.remove());

  element.replaceWith(block);
}
