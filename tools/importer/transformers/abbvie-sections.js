/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie sections.
 * Adds section breaks (<hr>) and section-metadata blocks from template sections.
 * Runs only in afterTransform. Selectors from captured DOM.
 * Sections:
 *   1. Hero (navy-blue) - .container.abbvie-container.overlap-predecessor
 *   2. Leaders Grid - .grid.aem-GridColumn
 *   3. Board of Directors - .container.abbvie-container.cmp-container-large
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element };
    const doc = element.ownerDocument || document;
    const template = payload && payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;

    // Process sections in reverse order to avoid position shifts
    const sections = [...template.sections].reverse();

    sections.forEach((section) => {
      // Try to find the first element matching the section selector
      let selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectorList) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) return;

      // Add section-metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        // Insert section-metadata after the last content element in this section
        sectionEl.after(metaBlock);
      }

      // Add <hr> section break before section (except the first section)
      if (section.id !== template.sections[0].id) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
