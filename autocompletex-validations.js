export const {
  hasReachedMaxSelectedItems,
  hasRequest,
  hasAcceptableHeaders,
  hasAcceptableMethods,
  hasUrl,
  hasPayload,
  hasData,
  hasListParams
} = (() => {
  function hasReachedMaxSelectedItems(inputMaxItemsSelected, value) {
    const totalItemsSelected = this.autocompleteValueList.length
    const isItemNotSelected = Boolean(!this.autocompleteValueList.find(autocompleteItem => autocompleteItem === value))

    return (inputMaxItemsSelected === totalItemsSelected) && isItemNotSelected
  }

  function hasRequest(request) {
    return typeof request === 'object' && Object.keys(request).length
  }

  function hasAcceptableHeaders(headers) {
    return typeof headers === 'object'
  }

  function hasAcceptableMethods(method) {
    const isGetMethod = method.toUpperCase().trim() === 'GET' || method.trim() === 'get'
    const isPostMethod = method.toUpperCase().trim() === 'POST' || method.trim() === 'post'

    return isGetMethod || isPostMethod
  }

  function hasUrl(url) {
    return Boolean(url) && typeof url === 'string'
  }

  function hasPayload(payload) {
    return Boolean(payload) && typeof payload === 'string'
  }

  function hasData(data) {
    if (Array.isArray(data)) {
      return Boolean(data?.length)
    }

    console.error('Response data should be array')
  }

  function hasListParams(listParams) {
    return Boolean(listParams?.['list-label']) && Boolean(listParams?.['list-value'])
  }

  return {
    hasReachedMaxSelectedItems,
    hasRequest,
    hasAcceptableHeaders,
    hasAcceptableMethods,
    hasUrl,
    hasPayload,
    hasData,
    hasListParams
  }
})()