import {
  generateContainerElements,
  generateFloatElements,
  generateIconElements,
  generateListElements,
  generateCloseButton,
} from './autocompletex-generate-components.js'

export function createAutocompleteEl() {
  const { container, inputContainer, floatContainer, iconContainer } = generateContainerElements.call(this)
  const { floatLabel } = generateFloatElements.call(this)
  const { list, listContent, listFooter } = generateListElements.call(this)
  const { closeBtn } = generateCloseButton.call(this)

  this.el.insertAdjacentElement('beforebegin', container)

  container.insertAdjacentElement('beforeend', inputContainer)

  if(!this.inputFloatLabel) {
    inputContainer.insertAdjacentElement('beforeend', this.el)
  }else{
    inputContainer.insertAdjacentElement('afterbegin', floatContainer)

    floatContainer.insertAdjacentElement('beforeend', this.el)
    floatContainer.insertAdjacentElement('beforeend', floatLabel)

    this.el.removeAttribute('placeholder')
    this.el.setAttribute('placeholder', ' ')
  }

  inputContainer.insertAdjacentElement('beforeend', iconContainer)

  iconContainer.insertAdjacentElement('beforeend', generateIconElements.call(this)[this.icon])

  container.insertAdjacentElement('beforeend', list)

  list.insertAdjacentElement('beforeend', listContent)
  list.insertAdjacentElement('beforeend', listFooter)

  listFooter.insertAdjacentElement('beforeend', closeBtn)
}

export function getAutocompleteElements() {
  this.containerEl = this.el.closest('.acx-container')
  this.inputContainerEl = this.containerEl.querySelector('.acx-input-container')
  this.floatContainerEl = this.containerEl.querySelector('.acx-float-container')
  this.iconContainerEl = this.containerEl.querySelector('.acx-icon-container')
  this.checkboxContainerEl = this.containerEl.querySelector('.acx-checkbox-container')

  this.listEl = this.containerEl.querySelector('.acx-list')
  this.listContentEl = this.containerEl.querySelector('.acx-list\\:content')
  this.listFooterEl = this.containerEl.querySelector('.acx-list\\:footer')
  this.closeButton = this.containerEl.querySelector('.acx-btn')
}