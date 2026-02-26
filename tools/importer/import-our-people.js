/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import quoteParser from './parsers/quote.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/abbvie-cleanup.js';
import sectionsTransformer from './transformers/abbvie-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns': columnsParser,
  'cards': cardsParser,
  'quote': quoteParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'our-people',
  description: 'Science people page with featured videos, video card grids, testimonial quote, R&D community links, FAQ accordion, and CTA',
  urls: [
    'https://www.abbvie.com/science/our-people.html',
  ],
  blocks: [
    {
      name: 'columns',
      instances: ['.container.cmp-container-full-width.height-short .grid.no-bottom-margin'],
      section: 'video-content',
    },
    {
      name: 'cards',
      instances: ['.container.cmp-container-full-width.height-short .grid.cmp-grid-custom'],
      section: 'video-content',
    },
    {
      name: 'quote',
      instances: ['.container.semi-transparent-layer .cmp-quote'],
      section: 'video-content',
    },
    {
      name: 'columns',
      instances: ['.container.no-bottom-margin.no-padding .grid'],
      section: 'explore-rd',
    },
    {
      name: 'accordion',
      instances: ['.accordion.panelcontainer .cmp-accordion'],
      section: 'faq',
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Page Hero / Title Area',
      selector: '.container.abbvie-container.overlap-predecessor',
      style: 'navy-blue',
      blocks: [],
      defaultContent: ['.cmp-title h1', '.cmp-text'],
    },
    {
      id: 'section-2-video-content',
      name: 'Video Content Area',
      selector: '.container.abbvie-container.cmp-container-full-width.height-short',
      style: null,
      blocks: ['columns', 'cards', 'quote'],
      defaultContent: [],
    },
    {
      id: 'section-3-explore-rd',
      name: 'Explore R&D Community',
      selector: '.container.abbvie-container.no-bottom-margin.no-padding',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-4-discovery-video',
      name: 'Discovery Video',
      selector: '.video.cmp-video-full-width.video-default.aem-GridColumn',
      style: null,
      blocks: [],
      defaultContent: [".cmp-video__text-content div[role='heading']", '.cmp-video__text-content p'],
    },
    {
      id: 'section-5-faq',
      name: 'FAQ Section',
      selector: '.container.abbvie-container.default-radius.cmp-container-xxx-large',
      style: null,
      blocks: ['accordion'],
      defaultContent: ['.cmp-title h2'],
    },
    {
      id: 'section-6-cta',
      name: 'CTA Banner',
      selector: '.container.abbvie-container.medium-radius.cmp-container-full-width.height-short.no-bottom-margin',
      style: 'dark',
      blocks: [],
      defaultContent: ['.cmp-title h4', '.cmp-button'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
