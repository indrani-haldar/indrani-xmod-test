var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-our-people.js
  var import_our_people_exports = {};
  __export(import_our_people_exports, {
    default: () => import_our_people_default
  });

  // tools/importer/parsers/columns.js
  function parse(element, { document }) {
    const row = element.querySelector(".grid-row");
    if (!row) {
      element.remove();
      return;
    }
    const cells = row.querySelectorAll(".grid-cell");
    const colContents = [];
    cells.forEach((cell) => {
      if (cell.children.length === 0 || cell.textContent.trim() === "") return;
      const frag = document.createDocumentFragment();
      cell.querySelectorAll("img.cmp-image__image, img.cmp-container__bg-image, .cmp-video__image img").forEach((img) => {
        if (img.src && !img.src.startsWith("data:")) {
          const p = document.createElement("p");
          const picture = img.closest("picture");
          if (picture) {
            p.appendChild(picture.cloneNode(true));
          } else {
            p.appendChild(img.cloneNode(true));
          }
          frag.appendChild(p);
        }
      });
      cell.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
        const h = document.createElement(heading.tagName.toLowerCase());
        h.textContent = heading.textContent.trim();
        frag.appendChild(h);
      });
      cell.querySelectorAll('[role="heading"]').forEach((heading) => {
        const h = document.createElement("h2");
        h.textContent = heading.textContent.trim();
        frag.appendChild(h);
      });
      cell.querySelectorAll(".cmp-text p").forEach((p) => {
        frag.appendChild(p.cloneNode(true));
      });
      cell.querySelectorAll(".cmp-list .cmp-list__item a").forEach((link) => {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        const titleSpan = link.querySelector(".cmp-list__item-title");
        a.textContent = titleSpan ? titleSpan.textContent.trim() : link.textContent.trim();
        p.appendChild(a);
        frag.appendChild(p);
      });
      cell.querySelectorAll(".cmp-button").forEach((btn) => {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", btn.getAttribute("href") || "#");
        const textSpan = btn.querySelector(".cmp-button__text");
        a.textContent = textSpan ? textSpan.textContent.trim() : btn.textContent.trim();
        p.appendChild(a);
        frag.appendChild(p);
      });
      cell.querySelectorAll(".cmp-video__caption p").forEach((p) => {
        frag.appendChild(p.cloneNode(true));
      });
      if (frag.childNodes.length > 0) {
        colContents.push(frag);
      }
    });
    if (colContents.length < 2) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns",
      cells: [colContents]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const allCards = [];
    const cards = element.querySelectorAll(".cardpagestory");
    cards.forEach((c) => allCards.push(c));
    let sibling = element.nextElementSibling;
    const consumedSiblings = [];
    while (sibling) {
      if (sibling.classList.contains("grid") && sibling.classList.contains("aem-GridColumn")) {
        const sibCards = sibling.querySelectorAll(".cardpagestory");
        sibCards.forEach((c) => allCards.push(c));
        consumedSiblings.push(sibling);
        sibling = sibling.nextElementSibling;
      } else {
        break;
      }
    }
    if (allCards.length === 0) {
      element.remove();
      return;
    }
    const cells = [];
    allCards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : "";
      const picture = card.querySelector("picture");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (picture) {
        imgFrag.appendChild(picture.cloneNode(true));
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const title = card.querySelector("h4.card-title, .card-title");
      if (title) {
        const strong = document.createElement("strong");
        strong.textContent = title.textContent.trim();
        const p1 = document.createElement("p");
        p1.appendChild(strong);
        textFrag.appendChild(p1);
      }
      const desc = card.querySelector("p.card-description, .card-description");
      if (desc) {
        const p2 = document.createElement("p");
        p2.textContent = desc.textContent.trim();
        textFrag.appendChild(p2);
      }
      const ctaText = card.querySelector(".card-cta");
      if (ctaText && href) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = ctaText.textContent.trim();
        const p3 = document.createElement("p");
        p3.appendChild(a);
        textFrag.appendChild(p3);
      }
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    consumedSiblings.forEach((s) => s.remove());
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote.js
  function parse3(element, { document }) {
    const wrapper = element.querySelector(".cmp-quote__text-author-wrapper") || element;
    const quoteText = wrapper.querySelector(".cmp-quote__text, p");
    const quoteFrag = document.createDocumentFragment();
    quoteFrag.appendChild(document.createComment(" field:quotation "));
    if (quoteText) {
      const p = document.createElement("p");
      p.textContent = quoteText.textContent.trim();
      quoteFrag.appendChild(p);
    }
    const authorBlock = wrapper.querySelector(".cmp-quote__author-block");
    const attrFrag = document.createDocumentFragment();
    attrFrag.appendChild(document.createComment(" field:attribution "));
    if (authorBlock) {
      const name = authorBlock.querySelector(".author-name");
      const title = authorBlock.querySelector(".author-title");
      if (name) {
        const p1 = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = name.textContent.trim();
        p1.appendChild(strong);
        attrFrag.appendChild(p1);
      }
      if (title) {
        const p2 = document.createElement("p");
        p2.textContent = title.textContent.trim();
        attrFrag.appendChild(p2);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "quote",
      cells: [[quoteFrag, attrFrag]]
    });
    const quoteContainer = element.closest(".container.semi-transparent-layer") || element.closest(".quote") || element;
    quoteContainer.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse4(element, { document }) {
    const items = element.querySelectorAll(".cmp-accordion__item");
    if (items.length === 0) {
      element.remove();
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title");
      const panelEl = item.querySelector(".cmp-accordion__panel");
      const summaryFrag = document.createDocumentFragment();
      summaryFrag.appendChild(document.createComment(" field:summary "));
      if (titleEl) {
        const p = document.createElement("p");
        p.textContent = titleEl.textContent.trim();
        summaryFrag.appendChild(p);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (panelEl) {
        const paragraphs = panelEl.querySelectorAll("p");
        paragraphs.forEach((para) => {
          textFrag.appendChild(para.cloneNode(true));
        });
      }
      cells.push([summaryFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "accordion",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/abbvie-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="cookie"]',
        "#CybotCookiebotDialog",
        ".truste_overlay",
        ".evidon-banner"
      ]);
      const bgContainers = element.querySelectorAll(".container.cmp-container-full-width");
      bgContainers.forEach((c) => {
        const inner = c.querySelector(".cmp-container");
        if (inner && inner.children.length === 0) {
          c.remove();
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header and navigation (captured: banner element with .cmp-header)
        "header",
        "banner",
        '[class*="header"]',
        // Footer (captured: footer area with social links, legal text, bottom nav)
        "footer",
        // Breadcrumb (captured: .breadcrumb.abbvie-breadcrumb, nav.cmp-breadcrumb)
        ".breadcrumb.abbvie-breadcrumb",
        "nav.cmp-breadcrumb",
        ".breadcrumb-drop-title",
        // Scroll to top button (captured: button "Scroll to top of page")
        'button[class*="scroll"]',
        // Iframes and non-content elements
        "iframe",
        "link",
        "noscript"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-clickable");
        el.removeAttribute("data-warn-on-departure");
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/transformers/abbvie-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element };
      const doc = element.ownerDocument || document;
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        let selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectorList) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) return;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (section.id !== template.sections[0].id) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-our-people.js
  var parsers = {
    "columns": parse,
    "cards": parse2,
    "quote": parse3,
    "accordion": parse4
  };
  var PAGE_TEMPLATE = {
    name: "our-people",
    description: "Science people page with featured videos, video card grids, testimonial quote, R&D community links, FAQ accordion, and CTA",
    urls: [
      "https://www.abbvie.com/science/our-people.html"
    ],
    blocks: [
      {
        name: "columns",
        instances: [".container.cmp-container-full-width.height-short .grid.no-bottom-margin"],
        section: "video-content"
      },
      {
        name: "cards",
        instances: [".container.cmp-container-full-width.height-short .grid.cmp-grid-custom"],
        section: "video-content"
      },
      {
        name: "quote",
        instances: [".container.semi-transparent-layer .cmp-quote"],
        section: "video-content"
      },
      {
        name: "columns",
        instances: [".container.no-bottom-margin.no-padding .grid"],
        section: "explore-rd"
      },
      {
        name: "accordion",
        instances: [".accordion.panelcontainer .cmp-accordion"],
        section: "faq"
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Page Hero / Title Area",
        selector: ".container.abbvie-container.overlap-predecessor",
        style: "navy-blue",
        blocks: [],
        defaultContent: [".cmp-title h1", ".cmp-text"]
      },
      {
        id: "section-2-video-content",
        name: "Video Content Area",
        selector: ".container.abbvie-container.cmp-container-full-width.height-short",
        style: null,
        blocks: ["columns", "cards", "quote"],
        defaultContent: []
      },
      {
        id: "section-3-explore-rd",
        name: "Explore R&D Community",
        selector: ".container.abbvie-container.no-bottom-margin.no-padding",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-4-discovery-video",
        name: "Discovery Video",
        selector: ".video.cmp-video-full-width.video-default.aem-GridColumn",
        style: null,
        blocks: [],
        defaultContent: [".cmp-video__text-content div[role='heading']", ".cmp-video__text-content p"]
      },
      {
        id: "section-5-faq",
        name: "FAQ Section",
        selector: ".container.abbvie-container.default-radius.cmp-container-xxx-large",
        style: null,
        blocks: ["accordion"],
        defaultContent: [".cmp-title h2"]
      },
      {
        id: "section-6-cta",
        name: "CTA Banner",
        selector: ".container.abbvie-container.medium-radius.cmp-container-full-width.height-short.no-bottom-margin",
        style: "dark",
        blocks: [],
        defaultContent: [".cmp-title h4", ".cmp-button"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_our_people_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_our_people_exports);
})();
