/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie cleanup.
 * Selectors from captured DOM of https://www.abbvie.com/who-we-are/our-leaders.html
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie/consent dialogs and overlays (captured DOM: Cloudflare challenge, OneTrust)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="cookie"]',
      '#CybotCookiebotDialog',
      '.truste_overlay',
      '.evidon-banner',
    ]);

    // Remove dark navy background container (empty decorative div, captured DOM: .container.large-radius.cmp-container-full-width with background-color:#071D49)
    const bgContainers = element.querySelectorAll('.container.cmp-container-full-width');
    bgContainers.forEach((c) => {
      const inner = c.querySelector('.cmp-container');
      if (inner && inner.children.length === 0) {
        c.remove();
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable content (captured DOM selectors)
    WebImporter.DOMUtils.remove(element, [
      // Header and navigation (captured: banner element with .cmp-header)
      'header',
      'banner',
      '[class*="header"]',
      // Footer (captured: footer area with social links, legal text, bottom nav)
      'footer',
      // Breadcrumb (captured: .breadcrumb.abbvie-breadcrumb, nav.cmp-breadcrumb)
      '.breadcrumb.abbvie-breadcrumb',
      'nav.cmp-breadcrumb',
      '.breadcrumb-drop-title',
      // Scroll to top button (captured: button "Scroll to top of page")
      'button[class*="scroll"]',
      // Iframes and non-content elements
      'iframe',
      'link',
      'noscript',
    ]);

    // Remove data-tracking and event attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-clickable');
      el.removeAttribute('data-warn-on-departure');
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
    });
  }
}
