export const {
  generateContainerElements,
  generateFloatElements,
  generateTagElements,
  generateIconElements,
  generateListElements,
  generateCheckboxElements,
  generateCloseButton,
  makeElement
} = (() => {
  function generateContainerElements() {
    return {
      container: makeElement.call(this, 'div', { class: 'acx-container' }),
      inputContainer: makeElement.call(this, 'div', { class: 'acx-input-container' }),
      floatContainer: makeElement.call(this, 'div', { class: 'acx-float-container' }),
      iconContainer: makeElement.call(this, 'div', { class: 'acx-icon-container' }),
      checkboxContainer: makeElement.call(this, 'div', { class: 'acx-checkbox-container' })
    }
  }

  function generateFloatElements() {
    const floatLabel = makeElement.call(this, 'div', { class: 'acx-float-label' })
    const labelEl = this.el.previousElementSibling || this.el.nextElementSibling
    const isLabelEl = labelEl.tagName.toLowerCase() === 'label'

    if (isLabelEl) {
      const textEl = makeElement.call(this, 'span')

      floatLabel.insertAdjacentElement('beforeend', textEl)
      textEl.textContent = labelEl.textContent.trim()
    }

    labelEl.remove()

    return {
      floatLabel
    }
  }

  function generateTagElements() {
    return {
      tag: makeElement.call(this, 'div', { class: 'acx-tag' })
    }
  }

  function generateIconElements() {
    return {
      iconArrow: makeElement.call(this, 'span', { class: 'acx-icon-arrow' }),
      iconSearch: makeElement.call(this, 'span', { class: 'acx-icon-search' }),
      iconClose: makeElement.call(this, 'span', { class: 'acx-icon-close' }),
      iconCheckbox: makeElement.call(this, 'span', { class: 'acx-checkbox-icon' })
    }
  }

  function generateListElements() {
    return {
      list: makeElement.call(this, 'div', { class: 'acx-list' }),
      listContent: makeElement.call(this, 'div', { class: 'acx-list:content' }),
      listItem: makeElement.call(this, 'div', { class: 'acx-list-item' }),
      listFooter: makeElement.call(this, 'div', { class: 'acx-list:footer' })
    }
  }

  function generateCheckboxElements()  {
    return {
      checkboxEl: makeElement.call(this, 'div', { class: 'acx-checkbox' }),
      checkboxInput: makeElement.call(this, 'input', { type: 'checkbox' }),
      checkboxBoxEl: makeElement.call(this, 'div', {  class: 'acx-checkbox-box' }),
    }
  }

  function generateCloseButton() {
    const closeBtn = makeElement.call(this, 'button', { type: 'button', class: 'acx-btn acx-btn--color' })

    closeBtn.textContent = 'Fechar'

    return {
      closeBtn
    }
  }

  function makeElement(elementName, attributes = {}) {
    const isValidStringEl = typeof elementName === 'string' && !!elementName
    const isValidObjectAttr = typeof attributes === 'object' && !!attributes

    if (isValidStringEl && isValidObjectAttr) {
      const element = document.createElement(elementName)
      const attributeList = Object.entries(attributes)
      const defineElementAttr = ([key, value]) => element.setAttribute(key, value)

      attributeList.forEach(defineElementAttr)

      return element
    }
  }

  return {
    generateContainerElements,
    generateFloatElements,
    generateTagElements,
    generateIconElements,
    generateListElements,
    generateCheckboxElements,
    generateCloseButton,
    makeElement
  }
})()