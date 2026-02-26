/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion block.
 * Source: https://www.abbvie.com/science/our-people.html
 *
 * Source DOM: .cmp-accordion > .cmp-accordion__item[]
 *   .cmp-accordion__header > a.cmp-accordion__button > span.cmp-accordion__title
 *   .cmp-accordion__panel > .cmp-text > p (answer text with links)
 *
 * UE Model (_accordion.json):
 *   Container: Accordion > Accordion Item[]
 *   Item fields: summary (text), text (richtext)
 *   -> Each row = 1 accordion item with [summary, text]
 *   -> Field hints: <!-- field:summary --> and <!-- field:text -->
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.cmp-accordion__item');
  if (items.length === 0) {
    element.remove();
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title');
    const panelEl = item.querySelector('.cmp-accordion__panel');

    // Column 1: Summary (question title)
    const summaryFrag = document.createDocumentFragment();
    summaryFrag.appendChild(document.createComment(' field:summary '));
    if (titleEl) {
      const p = document.createElement('p');
      p.textContent = titleEl.textContent.trim();
      summaryFrag.appendChild(p);
    }

    // Column 2: Text (answer content)
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (panelEl) {
      const paragraphs = panelEl.querySelectorAll('p');
      paragraphs.forEach((para) => {
        textFrag.appendChild(para.cloneNode(true));
      });
    }

    cells.push([summaryFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion',
    cells,
  });

  element.replaceWith(block);
}
