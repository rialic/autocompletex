const MegaAutoComplete = (() => {
  const MegaAutoComplete = ModuleFactory(megaAutoComplete)

  function megaAutoComplete() {
    const Mega = null
    const options = {}
    const maxItemLimit = 5
    const avgItemLimit = 3
    const suggestions = null
    const timeoutId = null
    const autocompleteContainer = document.querySelectorAll('.mega-ac-container')
    const autocomplete = document.querySelectorAll('.mega-ac')

    return { Mega, options, maxItemLimit, avgItemLimit, suggestions, timeoutId, autocompleteContainer, autocomplete }
  }

  megaAutoComplete.prototype.enable = function() {
    initMegaAutoComplete.call(this)
  }

  HTMLInputElement.prototype.megaAutoComplete = function(options = {}) {
    const hasUrl = Boolean(options.url)
    const hasQueryParam = Boolean(options.queryParam)
    const hasData = Boolean(options.data)
    const hasFilter = Boolean(options.matchFilter)
    const hasItemLimit = Boolean(options.itemLimit)

    if (isMegaAutoCompleteElement(this) && hasUrl) {
      MegaAutoComplete.options.url = options.url
      MegaAutoComplete.options.method = 'GET'
      MegaAutoComplete.options.queryParam = (hasQueryParam) ? options.queryParam : ''
      MegaAutoComplete.options.data = (hasData) ? options.data : ''
      MegaAutoComplete.options.matchFilter = hasFilter
      MegaAutoComplete.options.itemLimit = (hasItemLimit) ?
        ((options.itemLimit > MegaAutoComplete.maxItemLimit) ? MegaAutoComplete.maxItemLimit : options.itemLimit) :
        MegaAutoComplete.avgItemLimit
      MegaAutoComplete.options.getVal = options.getVal
    }

    MegaAutoComplete.Mega = { ...MegaAutoComplete.options }

    return MegaAutoComplete.Mega
  }

  HTMLInputElement.prototype.megaAutoCompleteVal = function() {
    if (isMegaAutoCompleteElement(this)) {
      const element = this
      const autocompleteContainer = element.closest('.mega-ac-container')
      const { autocompleteSelectedValues } = getAutoCompleteVariables.call(this, autocompleteContainer)

      return autocompleteSelectedValues.value
    }
  }

  HTMLInputElement.prototype.megaAutoCompleteReset = function() {
    if (isMegaAutoCompleteElement(this)) {
      const element = this
      const autocompleteContainer = element.closest('.mega-ac-container')
      const {
        autocompleteSelected,
        autocompleteSelectedValues,
        autocompleteSelectedCounter
      } = getAutoCompleteVariables.call(this, autocompleteContainer)
      const params = {
        autocompleteContainer,
        autocompleteSelected,
        autocompleteSelectedValues,
        autocompleteSelectedCounter
      }

      fireButtonClearItemsClickedEvent.call(this, params)
    }
  }

  function initMegaAutoComplete() {
    const createAutoCompleteComponent = autocompleteContainer => {
      const autocomplete = autocompleteContainer.querySelector('.mega-ac')
      const autocompleteFormFloating = autocomplete.closest('.form-floating')
      const autocompleteList = generateElement.call(this, 'div', { 'class': 'mega-ac-list' })
      const autocompleteSelected = generateElement.call(this, 'div', { 'class': 'mega-ac-selected' })
      // eslint-disable-next-line max-len
      const autocompleteSelectedCounter = generateElement.call(this, 'div', { 'class': 'mega-ac-selected__counter', 'data-total': 0 })
      const autocompleteSelectedValues = generateElement.call(this, 'input', { 'class': 'mega-ac-selected__values' })
      const autocompleteSelectedList = generateElement.call(this, 'div', { 'class': 'mega-ac-selected-list' })

      if (autocompleteFormFloating) {
        const autocompleteColorList = [
          'mega-ac--primary',
          'mega-ac--secondary',
          'mega-ac--success',
          'mega-ac--danger',
          'mega-ac--warning',
          'mega-ac--info',
          'mega-ac--dark',
          'mega-ac--pink',
          'mega-ac--lilac',
          'mega-ac--purple',
          'mega-ac--blue',
          'mega-ac--orange'
        ]

        const autocompleteBgSelected = autocomplete.dataset.bgSelected
        const findAutoCompleteClassColor = classItem => {
          const hasClassItem = autocompleteColorList.includes(classItem)

          if (hasClassItem) return classItem
        }
        const autocompleteClassColor = Array.from(autocomplete.classList).find(findAutoCompleteClassColor)

        autocomplete.classList.remove(autocompleteClassColor)
        autocomplete.removeAttribute('data-bg-selected')

        autocompleteFormFloating.classList.add(autocompleteClassColor)
        autocompleteFormFloating.dataset.bgSelected = autocompleteBgSelected
      }

      autocompleteContainer.insertAdjacentElement('beforeend', autocompleteList)

      autocompleteContainer.insertAdjacentElement('beforeend', autocompleteSelected)
      autocompleteSelected.insertAdjacentElement('beforeend', autocompleteSelectedCounter)
      autocompleteSelected.insertAdjacentElement('beforeend', autocompleteSelectedValues)

      autocompleteContainer.insertAdjacentElement('beforeend', autocompleteSelectedList)

      autocompleteContainer.addEventListener('click', handleAutoCompleteContainerClickEvent.bind(this))
    }
    const generateAutoCompleteClickEvent = autocomplete =>
      autocomplete.addEventListener('keyup', handleAutoCompleteKeyUpEvent.bind(this))

    MegaAutoComplete.autocompleteContainer.forEach(createAutoCompleteComponent)
    MegaAutoComplete.autocomplete.forEach(generateAutoCompleteClickEvent)

    document.addEventListener('click', handleAutoCompleteContainerBlurEvent.bind(this))
  }

  function handleAutoCompleteContainerClickEvent(event) {
    const element = event.target
    const elementClassList = Array.from(element.classList)
    const autocompleteContainer = element.closest('.mega-ac-container')
    const {
      autocomplete,
      autocompleteList,
      autocompleteSelected,
      autocompleteSelectedList,
      autocompleteSelectedCounter,
      autocompleteSelectedValues
    } = getAutoCompleteVariables.call(this, autocompleteContainer)

    const isAutoCompleteEl = elementClassList.includes('mega-ac')
    const isAutoCompleteListEl = Boolean(element.closest('.mega-ac-list'))
    const isAutoCompleteSelectedEl = elementClassList.includes('mega-ac-selected') ||
            elementClassList.includes('mega-ac-selected__counter')
    const isAutoCompleteRemoveItemEl = elementClassList.includes('mega-ac-selected-list__remove-item')
    const isButtonClearListEl = elementClassList.includes('btn-link')

    const isInputEl = element.tagName === 'INPUT'
    const isLiInputEl = element.tagName === 'LI'
    const isDivInputEl = element.tagName === 'DIV'
    const isButtonEl = element.tagName === 'BUTTON'

    const params = {
      autocompleteContainer,
      element,
      autocomplete,
      autocompleteList,
      autocompleteSelected,
      autocompleteSelectedList,
      autocompleteSelectedCounter,
      autocompleteSelectedValues
    }
    let clickedEvent = ''

    if (isInputEl && isAutoCompleteEl) clickedEvent = 'autocomplete'
    if (isLiInputEl && isAutoCompleteListEl) clickedEvent = 'autocompleteListItem'
    if (isDivInputEl && isAutoCompleteSelectedEl) clickedEvent = 'autocompleteSelected'
    if (isDivInputEl && isAutoCompleteRemoveItemEl) clickedEvent = 'autocompleteRemoveItem'
    if (isButtonEl && isButtonClearListEl) clickedEvent = 'buttonClearItems'

    fireClickEvents.call(this, clickedEvent, params)
  }

  function handleAutoCompleteContainerBlurEvent(event) {
    const element = event.target
    const autocompleteContainer = element.closest('.mega-ac-container')
    const hasAutoCompleteContainerParent = Boolean(autocompleteContainer)
    const isAutoCompleteRemoveItemEl = Array.from(element.classList).includes('mega-ac-selected-list__remove-item')

    // FECHAR OUTROS AUTOCOMPLETE EXCETO O AUTO COMPLETE QUE FOI CLICADO
    const hideOtherAutoCompleteContainer = internalAutoCompleteContainer => {
      const isDifferentAutoCompleteContainer = autocompleteContainer !== internalAutoCompleteContainer

      if (isDifferentAutoCompleteContainer) { // SE FOR DIFERENTE, ENTÃO FECHA OS OUTROS AUTOCOMPLETE WRAPPER
        hideAutoCompleteList.call(this, internalAutoCompleteContainer)
        hideAutoCompleteSelectedList.call(this, internalAutoCompleteContainer)
      }
    }

    // FECHAR TODOS OS AUTOCOMPLETE
    const hideAllAutoCompleteContainer = internalAutoCompleteContainer => {
      hideAutoCompleteList.call(this, internalAutoCompleteContainer)
      hideAutoCompleteSelectedList.call(this, internalAutoCompleteContainer)
    }

    if (isAutoCompleteRemoveItemEl) return

    if (hasAutoCompleteContainerParent) return this.autocompleteContainer.forEach(hideOtherAutoCompleteContainer)

    this.autocompleteContainer.forEach(hideAllAutoCompleteContainer)
  }

  async function handleAutoCompleteKeyUpEvent(event) {
    const autocompleteContainer = event.target.closest('.mega-ac-container')
    const {
      autocomplete,
      autocompleteList,
      autocompleteListItems,
    } = getAutoCompleteVariables.call(this, autocompleteContainer)

    const keyVal = event.key
    const hasUrl = Boolean(MegaAutoComplete.Mega.url)
    const autocompleteVal = autocomplete.value
    const autocompleteValLenght = autocomplete.value.length
    const hasMoreThanThreeLetters = autocompleteValLenght >= 3
    const hasRequiredParams = hasUrl && autocompleteVal && hasMoreThanThreeLetters

    if (hasRequiredParams) {
      const params = { autocompleteContainer, autocompleteList, autocompleteListItems, autocomplete, autocompleteVal }

      fireKeyEvents.call(this, keyVal, params)
    }

    if (!autocompleteVal || !hasMoreThanThreeLetters) removeAutoCompleteList.call(this, autocompleteContainer)
  }

  function removeAutoCompleteList(autocompleteContainer) {
    const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteContainer)

    autocomplete.classList.remove('mega-ac--show')
    autocompleteList.innerHTML = ''
    autocompleteList.classList.remove('mega-ac-list--show')
  }

  function removeAutoCompleteSelectedList(autocompleteContainer) {
    const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteContainer)

    autocompleteSelectedList.innerHTML = ''
  }

  function hideAutoCompleteList(autocompleteContainer) {
    const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteContainer)

    autocomplete.classList.remove('mega-ac--show')
    autocompleteList.classList.remove('mega-ac-list--show')
  }

  function hideAutoCompleteSelectedList(autocompleteContainer) {
    const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteContainer)

    autocompleteSelectedList.classList.remove('mega-ac-selected-list--show')
  }

  function showAutoCompleteList(autocompleteContainer) {
    const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteContainer)

    autocomplete.classList.add('mega-ac--show')
    autocompleteList.classList.add('mega-ac-list--show')
  }

  function showAutoCompleteSelectedList(autocompleteContainer) {
    const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteContainer)

    autocompleteSelectedList.classList.add('mega-ac-selected-list--show')
  }

  function mountAutoCompleteList(autocompleteList, filteredList) {
    const ulEl = generateElement.call(this, 'ul')
    const generateList = item => {
      const liEl = generateElement.call(this, 'li')
      const hasNoResult = item === 'Não há resultados para essa pesquisa'

      if (hasNoResult) liEl.style.cursor = 'default'

      liEl.textContent = item
      ulEl.insertAdjacentElement('afterbegin', liEl)
    }

    filteredList.forEach(generateList)
    autocompleteList.insertAdjacentElement('afterbegin', ulEl)
  }

  function mountAutoCompleteSelectedList(autocompleteSelectedList, filteredList) {
    const hasItemsInSelectedList = autocompleteSelectedList.hasChildNodes()
    const ulEl = (hasItemsInSelectedList)
      ? autocompleteSelectedList.querySelector('ul')
      : generateElement.call(this, 'ul')
    const generateList = item => {
      // eslint-disable-next-line max-len
      const divWrapperEl = generateElement.call(this, 'div', { class: 'd-flex align-items-center justify-content-between' })
      const divRemoveIconEl = generateElement.call(this, 'div', { class: 'mega-ac-selected-list__remove-item' })
      const spanTextEl = generateElement.call(this, 'span')
      const liEl = generateElement.call(this, 'li')

      divRemoveIconEl.classList.add('mega-ac-selected-list__remove-item')
      spanTextEl.textContent = item

      ulEl.insertAdjacentElement('afterbegin', liEl)
      liEl.insertAdjacentElement('beforeend', divWrapperEl)
      divWrapperEl.insertAdjacentElement('afterbegin', spanTextEl)
      divWrapperEl.insertAdjacentElement('beforeend', divRemoveIconEl)
    }

    filteredList.forEach(generateList)

    if (!hasItemsInSelectedList) {
      const divEl = generateElement.call(this, 'div', { class: 'd-flex justify-content-end' })
      // eslint-disable-next-line max-len
      const buttonEl = generateElement.call(this, 'button', { type: 'button', class: 'btn btn-sm btn-link text-decoration-none' })

      buttonEl.textContent = 'Limpar Lista'

      autocompleteSelectedList.insertAdjacentElement('afterbegin', ulEl)
      autocompleteSelectedList.insertAdjacentElement('beforeend', divEl)

      divEl.insertAdjacentElement('afterbegin', buttonEl)
    }
  }

  async function fetchData(url) {
    try {
      const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      const method = this.options.method

      const hasGetVal = Boolean(this.options.getVal)
      const isStringGetVal = typeof this.options.getVal === 'string'
      const isFunctionGetVal = typeof this.options.getVal === 'function'

      const response = await fetch(url, { headers, method })

      if (!response.ok) throw new Error('Não foi possível obter os dados da requisição')

      if (hasGetVal) {
        if (isStringGetVal) return (await response.json())[this.options.getVal]

        if (isFunctionGetVal) {
          const responseJSON = await response.json()

          return responseJSON.map(item => this.options.getVal(item))
        }
      }

      return (await response.json())
    } catch (error) {
      return { 'status': 'error', 'message': `${error.message}` }
    }
  }

  function fireTypingEvent(params) {
    clearTimeout(this.timeoutId)

    this.timeoutId = setTimeout(async() => {
      let filteredList

      const { autocompleteContainer, autocompleteList, autocompleteVal } = params
      const url = makeUrl.call(this, autocompleteVal)
      const responseData = await fetchData.call(this, url, this.options.data)
      const hasRequestError = responseData.status === 'error'
      const generateList = (acc, item) => {
        const hasItem = Boolean(item)
        const hasDefaultResultList = acc.includes('Não há resultados para essa pesquisa')

        if (hasItem) {
          if (hasDefaultResultList) acc.pop()

          acc.push(item)
        }

        return acc
      }
      const generateFiltredList = (acc, item) => {
        const isItemMatching = item.toLowerCase().includes(autocompleteVal.toLowerCase())
        const hasDefaultResultList = acc.includes('Não há resultados para essa pesquisa')

        if (isItemMatching) {
          if (hasDefaultResultList) acc.pop()

          acc.push(item)
        }

        return acc
      }

      this.suggestions = (hasRequestError) ? ['Não há resultados para essa pesquisa'] : responseData

      filteredList = (this.options.matchFilter) ?
        this.suggestions.reduce(generateFiltredList, ['Não há resultados para essa pesquisa']) :
        this.suggestions.reduce(generateList, ['Não há resultados para essa pesquisa'])

      removeAutoCompleteList.call(this, autocompleteContainer)
      mountAutoCompleteList.call(this, autocompleteList, filteredList)
      showAutoCompleteList.call(this, autocompleteContainer)
    }, 750)
  }

  function fireEnterEvent(params) {
    const { autocompleteContainer, autocompleteList, autocompleteListItems, autocomplete } = params
    const hasList = autocompleteList.hasChildNodes()
    const itemSelected = autocompleteListItems.find(liEl => Array.from(liEl.classList).includes('selected'))

    if (hasList, itemSelected) {
      const itemSelectedText = itemSelected.textContent
      const isMultipleInput = autocomplete.hasAttribute('multiple')
      const typeInput = (isMultipleInput) ? MultipleInput.call(this) : SingleInput.call(this)
      const inputSingleMultiple = InputSingleMultiple.call(this)

      if (itemSelectedText === 'Não há resultados para essa pesquisa') return

      //INPUT SIMPLES OU MÚLTIPLO
      inputSingleMultiple.setStrategy.call(this, typeInput)
      inputSingleMultiple.define.call(this, autocompleteContainer, itemSelectedText)
    }
  }

  function fireArrowUpEvent(params) {
    const { autocompleteList, autocompleteListItems } = params
    const hasList = autocompleteList.hasChildNodes()

    if (hasList) {
      const ulEl = autocompleteListItems[0].parentElement
      const lastLiEl = autocompleteListItems[autocompleteListItems.length - 1]

      const hasSelectedItem = autocompleteListItems.some(liEl => Array.from(liEl.classList).includes('selected'))
      const selectedIndex = autocompleteListItems.findIndex(liEl => Array.from(liEl.classList).includes('selected'))

      if (hasSelectedItem) {
        const navigateList = (liEl, index) => {
          const ulEl = liEl.parentElement
          const scrollPos = liEl.offsetTop
          const isEqualIndex = (selectedIndex - 1) === index
          const isFirstIndex = selectedIndex === 0

          if (isFirstIndex) return

          if (isEqualIndex) {
            liEl.nextElementSibling.classList.remove('selected')
            liEl.classList.add('selected')

            ulEl.scrollTop = scrollPos
          }
        }

        autocompleteListItems.forEach(navigateList)

        return
      }

      ulEl.scrollTop = lastLiEl.offsetTop
      lastLiEl.classList.add('selected')
    }
  }


  function fireArrowDownEvent(params) {
    const { autocompleteList, autocompleteListItems } = params
    const hasList = autocompleteList.hasChildNodes()

    if (hasList) {
      const firstLiEl = autocompleteListItems[0]
      const hasSelectedItem = autocompleteListItems.some(liEl => Array.from(liEl.classList).includes('selected'))
      const selectedIndex = autocompleteListItems.findIndex(liEl => Array.from(liEl.classList).includes('selected'))

      if (hasSelectedItem) {
        const navigateList = (liEl, index, list) => {
          const ulEl = liEl.parentElement
          const scrollPos = liEl.offsetTop
          const isEqualIndex = (selectedIndex + 1) === index
          const isLastIndex = selectedIndex === list.length

          if (isLastIndex) return

          if (isEqualIndex) {
            liEl.previousElementSibling.classList.remove('selected')
            liEl.classList.add('selected')

            ulEl.scrollTop = scrollPos
          }
        }

        autocompleteListItems.forEach(navigateList)

        return
      }

      firstLiEl.classList.add('selected')
    }
  }

  function fireKeyEvents(type, params) {
    const typeEvent = {
      'Enter': fireEnterEvent,
      'ArrowUp': fireArrowUpEvent,
      'ArrowDown': fireArrowDownEvent,
      'default': fireTypingEvent
    }

    return (typeEvent[type] || typeEvent['default']).call(this, params)
  }

  function fireClickEvents(type, params) {
    const typeEvent = {
      'autocomplete': fireAutoCompleteClickedEvent,
      'autocompleteSelected': fireAutoCompleteSelectedClickedEvent,
      'autocompleteListItem': fireAutoCompleteListItemClickedEvent,
      'autocompleteRemoveItem': fireAutocompleteRemoveItemClickedEvent,
      'buttonClearItems': fireButtonClearItemsClickedEvent,
      'default': () => {
        return
      }
    }

    return (typeEvent[type] || typeEvent['default']).call(this, params)
  }

  function fireAutoCompleteClickedEvent(params) {
    const { autocompleteContainer, autocomplete, autocompleteList } = params

    const hasAutoCompleteList = Boolean(autocompleteList.querySelector('ul'))
    const isShowingAutoCompleteList = Array.from(autocomplete.classList).includes('mega-ac--show') ||
            Array.from(autocompleteList.classList).includes('mega-ac-list--show')

    if (hasAutoCompleteList && !isShowingAutoCompleteList) {
      autocomplete.classList.add('mega-ac--show')
      autocompleteList.classList.add('mega-ac-list--show')
    }

    hideAutoCompleteSelectedList.call(this, autocompleteContainer)
  }

  function fireAutoCompleteListItemClickedEvent(params) {
    const { autocompleteContainer, element, autocomplete } = params
    const itemSelected = element
    const itemSelectedText = itemSelected.textContent
    const isMultipleInput = autocomplete.hasAttribute('multiple')
    const typeInput = (isMultipleInput) ? MultipleInput.call(this) : SingleInput.call(this)
    const inputSingleMultiple = InputSingleMultiple.call(this)

    if (itemSelectedText === 'Não há resultados para essa pesquisa') return

    //INPUT SIMPLES OU MÚLTIPLO
    inputSingleMultiple.setStrategy.call(this, typeInput)
    inputSingleMultiple.define.call(this, autocompleteContainer, itemSelectedText)
  }

  function fireAutoCompleteSelectedClickedEvent(params) {
    const { autocompleteContainer } = params
    hideAutoCompleteList.call(this, autocompleteContainer)
    showAutoCompleteSelectedList.call(this, autocompleteContainer)
  }

  function fireAutocompleteRemoveItemClickedEvent(params) {
    const {
      autocompleteContainer,
      element,
      autocompleteSelected,
      autocompleteSelectedList,
      autocompleteSelectedCounter,
      autocompleteSelectedValues
    } = params

    let selectedList = JSON.parse(autocompleteSelectedValues.value)

    const itemSelectedText = element.previousElementSibling.textContent
    const totalSelected = Number(autocompleteSelectedCounter.dataset.total) - 1
    const isEmptyTotalSelected = totalSelected === 0

    selectedList = selectedList.filter(selecteItem => selecteItem !== itemSelectedText)

    autocompleteSelectedCounter.textContent = (isEmptyTotalSelected) ? '' : totalSelected
    autocompleteSelectedCounter.dataset.total = totalSelected
    autocompleteSelectedValues.value = (isEmptyTotalSelected) ? '' : JSON.stringify(selectedList)

    removeAutoCompleteSelectedList.call(this, autocompleteContainer)

    if (isEmptyTotalSelected) {
      autocompleteSelected.classList.remove('mega-ac-selected--show')
      hideAutoCompleteSelectedList.call(this, autocompleteContainer)

      return
    }

    mountAutoCompleteSelectedList.call(this, autocompleteSelectedList, selectedList)
    showAutoCompleteSelectedList.call(this, autocompleteContainer)
  }

  function fireButtonClearItemsClickedEvent(params) {
    const {
      autocompleteContainer,
      autocompleteSelected,
      autocompleteSelectedValues,
      autocompleteSelectedCounter
    } = params

    autocompleteSelectedCounter.dataset.total = 0
    autocompleteSelectedCounter.innerText = ''
    autocompleteSelectedValues.value = ''

    autocompleteSelected.classList.remove('mega-ac-selected--show')
    removeAutoCompleteSelectedList.call(this, autocompleteContainer)
    hideAutoCompleteSelectedList.call(this, autocompleteContainer)
  }

  function InputSingleMultiple() {
    this.inputType = null

    const setStrategy = inputType => this.inputType = inputType
    const define = (autocompleteContainer, itemSelectedText) => {
      this.inputType.define.call(this, autocompleteContainer, itemSelectedText)
    }

    return { setStrategy, define }
  }

  function SingleInput() {
    const define = (autocompleteContainer, itemSelectedText) => {
      const { autocomplete, autocompleteSelectedValues } = getAutoCompleteVariables.call(this, autocompleteContainer)

      autocomplete.value = itemSelectedText
      autocompleteSelectedValues.value = JSON.stringify([itemSelectedText.trim()])
      removeAutoCompleteList.call(this, autocompleteContainer)
    }

    return { define }
  }

  function MultipleInput() {
    const define = (autocompleteContainer, itemSelectedText) => {
      const {
        autocomplete,
        autocompleteSelected,
        autocompleteSelectedList,
        autocompleteSelectedCounter,
        autocompleteSelectedValues
      } = getAutoCompleteVariables.call(this, autocompleteContainer)

      const totalSelected = Number(autocompleteSelectedCounter.dataset.total) + 1
      const hasSelectedValues = Boolean(autocompleteSelectedValues.value)
      const selectedList = (hasSelectedValues) ? JSON.parse(autocompleteSelectedValues.value) : []
      const isItemAlreadySelected = selectedList.includes(itemSelectedText.trim())

      const isNotInRangeMaxLimit = this.options.itemLimit <= this.maxItemLimit
      const isNotInRangeSelectedLimit = this.options.itemLimit >= totalSelected

      autocomplete.value = ''

      if (isNotInRangeMaxLimit && isNotInRangeSelectedLimit) {

        if (!isItemAlreadySelected) {
          selectedList.push(itemSelectedText.trim())
          autocompleteSelectedValues.value = JSON.stringify(selectedList)

          autocompleteSelected.classList.add('mega-ac-selected--show')
          autocompleteSelectedCounter.dataset.total = totalSelected
          autocompleteSelectedCounter.textContent = totalSelected

          removeAutoCompleteSelectedList.call(this, autocompleteContainer)
          mountAutoCompleteSelectedList.call(this, autocompleteSelectedList, selectedList)
        }

      }

      removeAutoCompleteList.call(this, autocompleteContainer)
    }

    return { define }
  }

  function makeUrl(autocompleteVal) {
    const hasData = Boolean(this.options.data)
    const hasQueryParam = Boolean(this.options.queryParam)

    if (hasData) {
      if (hasQueryParam) this.options.data[this.options.queryParam] = autocompleteVal

      return this.options.url + '?' + serialize(this.options.data)
    }

    if (hasQueryParam) {
      return this.options.url + '?' + serialize({
        [this.options.queryParam]: autocompleteVal
      })
    }

    return this.options.url
  }

  function generateElement(elementName, attributes = {}) {
    const isValidStringEl = typeof elementName === 'string' && Boolean(elementName)
    const isValidObjectAttr = typeof attributes === 'object' && Boolean(attributes)

    if (isValidStringEl && isValidObjectAttr) {
      const element = document.createElement(elementName)
      const attributeList = Object.entries(attributes)
      const defineElementAttr = ([key, value]) => element.setAttribute(key, value)

      attributeList.forEach(defineElementAttr)

      return element
    }
  }

  function isMegaAutoCompleteElement(element) {
    const isInputTag = element.tagName === 'INPUT'
    const isAutoComplete = Array.from(element.classList).includes('mega-ac')

    return isAutoComplete && isInputTag
  }

  function serialize(object) {
    let encodedString = ''

    for (let prop in object) {
      // eslint-disable-next-line no-prototype-builtins
      if (object.hasOwnProperty(prop)) {
        if (encodedString.length > 0) {
          encodedString += '&'
        }

        encodedString += encodeURI(prop + '=' + object[prop])
      }
    }

    return encodedString
  }

  function getAutoCompleteVariables(autocompleteContainer) {
    const autocomplete = autocompleteContainer.querySelector('.mega-ac')
    const autocompleteList = autocompleteContainer.querySelector('.mega-ac-list')
    const autocompleteListItems = Array.from(autocompleteContainer.querySelectorAll('.mega-ac-list li'))
    const autocompleteSelected = autocompleteContainer.querySelector('.mega-ac-selected')
    const autocompleteSelectedList = autocompleteContainer.querySelector('.mega-ac-selected-list')
    const autocompleteSelectedCounter = autocompleteContainer.querySelector('.mega-ac-selected__counter')
    const autocompleteSelectedValues = autocompleteContainer.querySelector('.mega-ac-selected__values')

    return {
      autocomplete,
      autocompleteList,
      autocompleteListItems,
      autocompleteSelected,
      autocompleteSelectedList,
      autocompleteSelectedCounter,
      autocompleteSelectedValues
    }
  }

  function ModuleFactory(obj) {
    const object = { ...obj() }

    Object.setPrototypeOf(object, obj.prototype)

    return object
  }

  return MegaAutoComplete

})()

document.addEventListener('DOMContentLoaded', () => MegaAutoComplete.enable())