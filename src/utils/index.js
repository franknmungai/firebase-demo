/**
 *
 * @param {string} selector
 * @returns {NodeListOf<Element> | Element}
 */

export const $ = (selector) => {
  const elements = document.querySelectorAll(selector);

  if (elements.length === 1) {
    return elements[0];
  }

  return elements;
};
