import { generateContainerElements, generateTagElements, generateIconElements, makeElement } from './autocompletex-generate-components.js'
import { createAutocompleteEl, getAutocompleteElements } from './autocompletex-elements.js'
import { handleSelectType, handleAutocompleteType } from './autocompletex-handle-types.js'
import { fillList, removeList, fillListWithNotResultMessage } from './autocompletex-handle-list.js'
import { onKeyArrowUp, onKeyArrowDown, onKeyEnter } from './autocompletex-key-events.js'
import { hasReachedMaxSelectedItems, hasData, hasListParams } from './autocompletex-validations.js'

window.Autocompletex = (function() {
  function Autocompletex(params) {
    this.el = getInputAutocomleteEl(params)
    this.elType = null

    this.listParams = null
    this.data = null
    this.dataSelected = []
    this.icon = 'iconSearch'
    this.timeoutId = null
    this.noResultMessage = 'Não há resultados para essa pesquisa'

    this.request = {}

    this.autocompleteLabelList = []
    this.autocompleteValueList = []

    this.inputFloatLabel = false
    this.inputDelay = 750
    this.inputMinLength = 3
    this.inputMaxItemsSelected = 3

    return {
      options: params => options.call(this, params)
    }
  }

  Autocompletex.prototype.init = function() {
    createAutocompleteEl.call(this)
    getAutocompleteElements.call(this)

    this.containerEl.addEventListener('click', event => onClickAutocompleteEl.call(this, event))
    this.el.addEventListener('keyup', event => onKeyUpAutocompleteEl.call(this, event))
    document.addEventListener('click', () => onClickOutsideAutocompleteEl.call(this))
  }

  function options(params = {}) {
    const isEmptyType = Boolean(!params?.type)
    const isInvalidType = params?.type !== 'select' && params?.type !== 'autocomplete'
    const typeList = {
      select: params => handleSelectType.call(this, params),
      autocomplete: params => handleAutocompleteType.call(this, params)
    }

    if (isEmptyType) {
      return console.error('Type should be declared')
    }

    if (isInvalidType) {
      return console.error('Invalid type. Type should be "select" or "autocomplete"')
    }

    if (!hasListParams(params.listParams)) {
      return console.error('"listParams" parameter can not be null and should be declared"')
    }

    this.elType = params.type
    this.listParams = params.listParams
    this.inputFloatLabel = (typeof params?.inputFloatLabel === 'boolean') ? params?.inputFloatLabel : this.inputFloatLabel
    this.inputDelay = params?.inputDelay || this.inputDelay
    this.inputMinLength = params?.inputMinLength || this.inputMinLength
    this.inputMaxItemsSelected = params?.inputMaxItemsSelected || this.inputMaxItemsSelected

    Autocompletex.prototype.init.call(this)

    // HandleSelectType or HandleAutocompleteType
    typeList[params.type](params)
  }

  function onClickAutocompleteEl(event) {
    event.stopPropagation()

    const targetElement = event.target
    const isINPUTClicked = targetElement.tagName === 'INPUT'
    const tagElementListClicked = { 'LABEL': onClickListItem, 'DIV': onClickListItem, 'SPAN': onClickListItem,  'BUTTON': onClickCloseButton }

    hideOthersContainers.call(this)

    if (isINPUTClicked) {
      const hasAutocompleteValues = this.autocompleteValueList.length

      if (hasAutocompleteValues) {
        toogleAutocompleteNameAttr.call(this)
        removeInputHiddenWithValues.call(this)
      }

      if (this.elType === 'select') {
        showListItems.call(this)
      }

      return
    }

    tagElementListClicked[targetElement.tagName]?.call(this, targetElement)
  }

  function onClickListItem(targetElement) {
    const isNoResultItemClicked = targetElement.hasAttribute('no-content') || !!targetElement.querySelector('label[no-content]')
    const validClassList = ['acx-list-item', 'acx-checkbox-box', 'acx-checkbox-icon']
    // Three elements with specific class can be clicked in item list, LABEL, DIV, SPAN
    const isValidItemClicked = validClassList.find(cls => targetElement.classList.contains(cls)) || targetElement.hasAttribute('text-content')

    if (isNoResultItemClicked) {
      return
    }

    if (isValidItemClicked) {
      const listItemEl = targetElement.closest('.acx-list-item')
      const { checkbox, checkboxBoxEl, checkboxIcon } = getParamsInRegardsCheckbox.call(this, listItemEl)

      if (hasReachedMaxSelectedItems.call(this, this.hasReachedMaxSelectedItems, checkbox.value)) {
        return
      }

      toggleSelectedListItem.call(this, checkbox, checkboxBoxEl, checkboxIcon)
    }
  }

  function onClickCloseButton() {
    const inputHiddenList = Array.from(this.containerEl.querySelectorAll('input[type="hidden"]'))

    hideListItems.call(this)

    if (!inputHiddenList.length) {
      createInputHiddenWithValues.call(this)
    }
  }

  function onKeyUpAutocompleteEl(event) {
    const keyboardKey = event.key
    const keyboardKeyList = { 'ArrowUp': onKeyArrowUp,  'ArrowDown': onKeyArrowDown, 'Enter': onKeyEnter }
    const isNavigationKeyBoardKey = !!keyboardKeyList[keyboardKey]

    if (isNavigationKeyBoardKey) {
      return keyboardKeyList[keyboardKey].call(this, toggleSelectedListItem, getParamsInRegardsCheckbox)
    }

    clearTimeout(this.timeoutId)

    this.timeoutId = setTimeout(async() => {
      const inputValue = this.el.value
      const hasMinLengthToSearch = this.el.value.length >= this.inputMinLength
      const isAutocompleteType = this.elType === 'autocomplete'

      if (hasMinLengthToSearch) {
        const data = await filterData.call(this, inputValue)

        if (isAutocompleteType) {
          this.data = data
          showListItems.call(this)
        }

        if (!hasData(data)) {
          removeList.call(this)
          fillListWithNotResultMessage.call(this)

          return
        }

        removeList.call(this)
        fillList.call(this, data)

        return
      }

      if (!inputValue) {
        if (isAutocompleteType) {
          hideListItems.call(this)
        }

        removeList.call(this)
        fillList.call(this, this.data)
      }
    }, this.inputDelay)
  }

  function onClickOutsideAutocompleteEl() {
    const inputHiddenList = Array.from(this.containerEl.querySelectorAll('input[type="hidden"]'))

    hideListItems.call(this)

    if (!inputHiddenList.length) {
      createInputHiddenWithValues.call(this)
    }
  }

  async function filterData(inputValue) {
    const isSelectType = this.elType === 'select'
    const isAutocompleteType = this.elType === 'autocomplete'

    if (isSelectType) {
      return new Promise(resolve => {
        const data = this.data.filter(data => !!data[this.listParams['list-label']].match(RegExp(`${inputValue}`, 'gi')))
        resolve(data)
      })
    }

    if (isAutocompleteType) {
      return await getData.call(this, inputValue)
    }
  }

  function addOrRemoveAutocompleteValue(val) {
    const itemSelected = this.data.find(item => String(item[this.listParams['list-value']]) === String(val))
    const itemSelectedLabelText = itemSelected[this.listParams['list-label']]
    const itemSelectedValue = val
    const isItemAlreadySelected = !!this.autocompleteLabelList.find(autocompleteItem => String(autocompleteItem) === String(itemSelected[this.listParams['list-label']]))

    if (isItemAlreadySelected) {
      this.dataSelected = this.dataSelected.filter(data => data !== itemSelected)
      this.autocompleteLabelList = this.autocompleteLabelList.filter(autocompleteItem => autocompleteItem !== itemSelectedLabelText)
      this.autocompleteValueList = this.autocompleteValueList.filter(autocompleteItem => autocompleteItem !== itemSelectedValue)

      return
    }

    this.dataSelected.push(itemSelected)
    this.autocompleteLabelList.push(itemSelectedLabelText)
    this.autocompleteValueList.push(itemSelectedValue)
  }

  function createInputHiddenWithValues() {
    const hasAutocompleteValues = this.autocompleteValueList.length

    if (hasAutocompleteValues) {
      removeInputHiddenWithValues.call(this)

      const inputHiddenList = this.autocompleteValueList.map(value => {
        const inputEl = makeElement('input', { type: 'hidden', name: `${this.el.getAttribute('name')}[]` })

        inputEl.value = value

        return inputEl.outerHTML
      })

      this.el.insertAdjacentHTML('afterend', inputHiddenList.join(''))
      toogleAutocompleteNameAttr.call(this)
    }
  }

  function removeInputHiddenWithValues() {
    const inputHiddenList = Array.from(this.containerEl.querySelectorAll('input[type="hidden"]'))

    inputHiddenList.forEach(input => input.remove())
  }

  function addInputTag() {
    Array.from(this.containerEl.querySelectorAll('.acx-tag')).forEach(tag => tag.remove())

    this.autocompleteLabelList.forEach((autocompleteItem, index) => {
      let { tag } = generateTagElements()
      let { iconContainer } = generateContainerElements()
      let { iconClose } = generateIconElements()

      if (!this.inputFloatLabel) {
        this.inputContainerEl.insertBefore(tag, this.el)
      }else{
        this.floatContainerEl.insertBefore(tag, this.el)
      }

      iconContainer.dataset.id = this.autocompleteValueList[index]
      iconClose.dataset.id = this.autocompleteValueList[index]

      tag.insertAdjacentText('afterbegin', autocompleteItem)
      tag.insertAdjacentElement('beforeend', iconContainer)
      iconContainer.insertAdjacentElement('beforeend', iconClose)

      tag = iconContainer = iconClose = null
    })

    this.tagList = this.inputContainerEl.querySelectorAll('.acx-tag')
    this.tagList.forEach(tag => tag.addEventListener('click', event => onRemoveTag.call(this, event)))
  }

  function onRemoveTag(event) {
    event.stopPropagation()

    const targetElement = event.target
    const isValidClosebleTag = !!Array.from(targetElement.classList).find(className => className === 'acx-icon-container' || className === 'acx-icon-close')

    if (isValidClosebleTag) {
      const dataId = targetElement.dataset.id
      const listItemEl = this.listContentEl.querySelector(`input[id="${dataId}"]`).closest('.acx-list-item')
      const checkbox = listItemEl.querySelector('input[type="checkbox"]')
      const checkboxBoxEl = listItemEl.querySelector('.acx-checkbox-box')
      const checkboxIcon = checkboxBoxEl.querySelector('.acx-checkbox-icon')

      toggleSelectedListItem.call(this, checkbox, checkboxBoxEl, checkboxIcon)
    }
  }

  function getInputAutocomleteEl(params) {
    const selectors = ['#el', '.el', '[name=\'el\']']

    return selectors.reduce((acc, selector) => document.querySelector(`${selector.replace('el', params.el)}`) || acc, {})
  }

  async function getData(inputValue) {
    let response = null
    const isgetMethod = this.request.method.toUpperCase().trim() === 'GET' || this.request.method.trim() === 'get'
    const isPostMethod = this.request.method.toUpperCase().trim() === 'POST' || this.request.method.trim() === 'POST'

    if (isgetMethod) {
      const url = `${this.request.url}?${this.request.payload}=${inputValue}`
      const headers = this.request.headers

      response = (headers) ? await fetch(url, { headers }) : await fetch(url)
    }

    if (isPostMethod) {
      const url = this.request.url
      const headers = this.request.headers
      const method = this.request.method.toUpperCase().trim()
      const body = JSON.stringify({ [this.request.payload]: inputValue })

      response = (headers) ? await fetch(url, { headers, method, body }) : await fetch(url, { method, body })
    }

    response = (response?.ok) ? await response.json() : []
    response = (Object.prototype.toString.call(response) === '[object Object]') ? [response] : response

    return response
  }

  function getParamsInRegardsCheckbox(listItemEl) {
    const checkbox = listItemEl.querySelector('input[type="checkbox"]')
    const checkboxBoxEl = listItemEl.querySelector('.acx-checkbox-box')
    const checkboxIcon = checkboxBoxEl.querySelector('.acx-checkbox-icon')

    return {
      checkbox,
      checkboxBoxEl,
      checkboxIcon
    }
  }

  function toggleSelectedListItem(checkbox, checkboxBoxEl, checkboxIcon) {
    checkboxBoxEl.classList.toggle('acx-checkbox-box--checked')
    checkboxIcon.classList.toggle('acx-checkbox-icon--checked')
    addOrRemoveAutocompleteValue.call(this, checkbox.value)
    addInputTag.call(this)
  }

  function toogleAutocompleteNameAttr() {
    const siblingEl = this.el.nextSibling
    const hasInputNameAttr = this.el.getAttribute('name')
    const nameAttr = siblingEl.getAttribute('name').slice(0, siblingEl.getAttribute('name').indexOf('['))

    if (hasInputNameAttr) {
      this.el.removeAttribute('name')

      return
    }

    this.el.setAttribute('name', nameAttr)
  }

  function showListItems() {
    this.inputContainerEl.classList.add('acx-input-container--open')
    this.listEl.classList.add('acx-list--open')
  }

  function hideListItems() {
    this.inputContainerEl.classList.remove('acx-input-container--open')
    this.listEl.classList.remove('acx-list--open')

    Array.from(this.listContentEl.querySelectorAll('.acx-list-item')).forEach(item => item.classList.remove('acx-list-item--hover'))
  }

  function hideOthersContainers() {
    const containerElList = Array.from(document.querySelectorAll('.acx-container'))

    containerElList.forEach(container => {
      // Get container that was not clicked and verify if it is open
      const isContainerOpen = (container !== this.containerEl) && container.querySelector('.acx-input-container--open')

      if (isContainerOpen) {
        const inputContainerEl = container.querySelector('.acx-input-container--open')
        const listEl = container.querySelector('.acx-list--open')

        inputContainerEl.classList.remove('acx-input-container--open')
        listEl.classList.remove('acx-list--open')
      }
    })
  }

  return Autocompletex
})()