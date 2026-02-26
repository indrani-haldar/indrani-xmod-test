/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Source: https://www.abbvie.com/science/our-people.html
 *
 * Handles two-column grid layouts (.grid > .grid-container > .grid-row > .grid-cell)
 * Extracts content from each non-empty grid cell into columns.
 *
 * UE Model (_columns.json):
 *   Container: Columns with column items
 *   Each column can contain: text, image, button, title
 */
export default function parse(element, { document }) {
  const row = element.querySelector('.grid-row');
  if (!row) {
    element.remove();
    return;
  }

  const cells = row.querySelectorAll('.grid-cell');
  const colContents = [];

  cells.forEach((cell) => {
    // Skip empty spacer columns
    if (cell.children.length === 0 || cell.textContent.trim() === '') return;

    const frag = document.createDocumentFragment();

    // Extract images
    cell.querySelectorAll('img.cmp-image__image, img.cmp-container__bg-image, .cmp-video__image img').forEach((img) => {
      if (img.src && !img.src.startsWith('data:')) {
        const p = document.createElement('p');
        const picture = img.closest('picture');
        if (picture) {
          p.appendChild(picture.cloneNode(true));
        } else {
          p.appendChild(img.cloneNode(true));
        }
        frag.appendChild(p);
      }
    });

    // Extract headings
    cell.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.trim();
      frag.appendChild(h);
    });

    // Extract video heading (role="heading")
    cell.querySelectorAll('[role="heading"]').forEach((heading) => {
      const h = document.createElement('h2');
      h.textContent = heading.textContent.trim();
      frag.appendChild(h);
    });

    // Extract paragraphs from .cmp-text
    cell.querySelectorAll('.cmp-text p').forEach((p) => {
      frag.appendChild(p.cloneNode(true));
    });

    // Extract link lists
    cell.querySelectorAll('.cmp-list .cmp-list__item a').forEach((link) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      const titleSpan = link.querySelector('.cmp-list__item-title');
      a.textContent = titleSpan ? titleSpan.textContent.trim() : link.textContent.trim();
      p.appendChild(a);
      frag.appendChild(p);
    });

    // Extract buttons
    cell.querySelectorAll('.cmp-button').forEach((btn) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', btn.getAttribute('href') || '#');
      const textSpan = btn.querySelector('.cmp-button__text');
      a.textContent = textSpan ? textSpan.textContent.trim() : btn.textContent.trim();
      p.appendChild(a);
      frag.appendChild(p);
    });

    // Extract video captions
    cell.querySelectorAll('.cmp-video__caption p').forEach((p) => {
      frag.appendChild(p.cloneNode(true));
    });

    if (frag.childNodes.length > 0) {
      colContents.push(frag);
    }
  });

  if (colContents.length < 2) {
    // Not enough columns, skip
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns',
    cells: [colContents],
  });

  element.replaceWith(block);
}
