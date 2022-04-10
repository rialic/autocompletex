import { generateIconElements } from './autocompletex-generate-components.js'
import { fillList } from './autocompletex-handle-list.js'
import { hasRequest, hasAcceptableHeaders, hasAcceptableMethods, hasUrl, hasPayload, hasData } from './autocompletex-validations.js'

export const {
  handleSelectType,
  handleAutocompleteType
} = (() => {
  function handleSelectType(params) {
    if (!hasData(params.data)) {
      return console.error('"data" parameter can not be null and should be declared"')
    }

    this.data = params.data

    this.icon = 'iconArrow'
    this.iconContainerEl.children[0].remove()
    this.iconContainerEl.insertAdjacentElement('beforeend', generateIconElements.call(this)[this.icon])

    fillList.call(this, params.data)
  }

  function handleAutocompleteType(params) {
    const method = params?.request?.method || 'GET'
    const headers = params?.request.headers || null
    const url = params?.request.url
    const payload = params?.request?.payload

    if (!hasRequest.call(this, params?.request)) {
      return console.error('"request" parameter can not be null and should be declared"')
    }

    if (!hasAcceptableMethods.call(this, method)) {
      return console.error('"method" parameter not acceptable"')
    }

    if (!hasAcceptableHeaders.call(this, headers)) {
      return console.error('"headers" parameter not acceptable"')
    }

    if (!hasUrl.call(this, url)) {
      return console.error('"url" parameter can not be null and should be declared"')
    }

    if (!hasPayload.call(this, payload)) {
      return console.error('"payload" parameter not acceptable"')
    }

    this.request.method = method
    this.request.headers = headers
    this.request.url = url
    this.request.payload = payload

    this.icon = 'iconSearch'
    this.iconContainerEl.children[0].remove()
    this.iconContainerEl.insertAdjacentElement('beforeend', generateIconElements.call(this)[this.icon])
  }

  return {
    handleSelectType,
    handleAutocompleteType
  }
})()