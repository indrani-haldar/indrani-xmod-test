/* eslint-disable */
/* global WebImporter */

/**
 * Parser for quote block.
 * Source: https://www.abbvie.com/science/our-people.html
 *
 * Source DOM: .cmp-quote > .cmp-quote__text-author-wrapper
 *   p.cmp-quote__text (quote text)
 *   .cmp-quote__author-block > div > span.author-name + span.author-title
 *
 * UE Model (_quote.json):
 *   Fields: quotation (richtext), attribution (richtext)
 *   -> 1 row, 2 columns: [quotation, attribution]
 *   -> Field hints: <!-- field:quotation --> and <!-- field:attribution -->
 */
export default function parse(element, { document }) {
  const wrapper = element.querySelector('.cmp-quote__text-author-wrapper') || element;

  // Extract quotation text
  const quoteText = wrapper.querySelector('.cmp-quote__text, p');
  const quoteFrag = document.createDocumentFragment();
  quoteFrag.appendChild(document.createComment(' field:quotation '));
  if (quoteText) {
    const p = document.createElement('p');
    p.textContent = quoteText.textContent.trim();
    quoteFrag.appendChild(p);
  }

  // Extract attribution
  const authorBlock = wrapper.querySelector('.cmp-quote__author-block');
  const attrFrag = document.createDocumentFragment();
  attrFrag.appendChild(document.createComment(' field:attribution '));
  if (authorBlock) {
    const name = authorBlock.querySelector('.author-name');
    const title = authorBlock.querySelector('.author-title');
    if (name) {
      const p1 = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = name.textContent.trim();
      p1.appendChild(strong);
      attrFrag.appendChild(p1);
    }
    if (title) {
      const p2 = document.createElement('p');
      p2.textContent = title.textContent.trim();
      attrFrag.appendChild(p2);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'quote',
    cells: [[quoteFrag, attrFrag]],
  });

  // Replace the entire quote container (may be nested in a grid)
  const quoteContainer = element.closest('.container.semi-transparent-layer') || element.closest('.quote') || element;
  quoteContainer.replaceWith(block);
}
