import { hasReachedMaxSelectedItems } from './autocompletex-validations.js'

export const {
  onKeyArrowUp,
  onKeyArrowDown,
  onKeyEnter
} = (() => {
  function onKeyArrowUp() {
    const { itensList, hasListItem, hasSelectedItem, selectedIndex } = getParamsInRegardsToKeyboard.call(this)

    if (hasListItem) {
      const lastListItem = itensList[itensList.length - 1]
      const isFirstIndex = ((selectedIndex + 1) === 0) || (selectedIndex === 0)

      if (isFirstIndex) {
        const firstListItem = itensList[0]

        this.listContentEl.scrollTop = lastListItem.offsetTop
        firstListItem.classList.remove('acx-list-item--hover')
        lastListItem.classList.add('acx-list-item--hover')

        return
      }

      if (hasSelectedItem) {
        itensList.forEach((item, index) => {
          const isEqualIndex = (selectedIndex - 1) === index

          if (isEqualIndex) {
            item.nextElementSibling.classList.remove('acx-list-item--hover')
            item.classList.add('acx-list-item--hover')

            handleScrollListItem.call(this, item, 'keyArrowUp')
          }
        })

        return
      }

      this.listContentEl.scrollTop = lastListItem.offsetTop
      lastListItem.classList.add('acx-list-item--hover')
    }
  }

  function onKeyArrowDown() {
    const { itensList, hasListItem, hasSelectedItem, selectedIndex } = getParamsInRegardsToKeyboard.call(this)

    if (hasListItem) {
      const firstListItem = itensList[0]
      const isLastIndex = (selectedIndex + 1) === itensList.length

      if (isLastIndex) {
        const lastListItem = itensList[itensList.length - 1]

        this.listContentEl.scrollTop = firstListItem.offsetTop
        lastListItem.classList.remove('acx-list-item--hover')
        firstListItem.classList.add('acx-list-item--hover')

        return
      }

      if (hasSelectedItem) {
        itensList.forEach((item, index) => {
          const isEqualIndex = (selectedIndex + 1) === index

          if (isEqualIndex) {
            item.previousElementSibling.classList.remove('acx-list-item--hover')
            item.classList.add('acx-list-item--hover')

            handleScrollListItem.call(this, item, 'keyArrowDown')
          }
        })

        return
      }

      this.listContentEl.scrollTop = firstListItem.offsetTop
      firstListItem.classList.add('acx-list-item--hover')
    }
  }

  function onKeyEnter(toggleSelectedListItem, getParamsInRegardsCheckbox) {
    const { hasListItem, hasSelectedItem } = getParamsInRegardsToKeyboard.call(this)

    if (hasListItem && hasSelectedItem) {
      const listItemEl = this.listContentEl.querySelector('.acx-list-item--hover')
      const { checkbox, checkboxBoxEl, checkboxIcon } = getParamsInRegardsCheckbox.call(this, listItemEl)

      if (hasReachedMaxSelectedItems.call(this, this.hasReachedMaxSelectedItems, checkbox.value)) {
        return
      }

      toggleSelectedListItem.call(this, checkbox, checkboxBoxEl, checkboxIcon)
    }
  }

  function getParamsInRegardsToKeyboard() {
    const hasListItem = this.listContentEl.hasChildNodes()
    const itensList = this.listContentEl.querySelectorAll('.acx-list-item')
    const hasSelectedItem = Array.from(itensList).some(item => Array.from(item.classList).includes('acx-list-item--hover'))
    const selectedIndex = Array.from(itensList).findIndex(item => Array.from(item.classList).includes('acx-list-item--hover'))

    return {
      itensList,
      hasListItem,
      hasSelectedItem,
      selectedIndex
    }
  }

  function handleScrollListItem(item, key) {
    const scrollPos = item.offsetTop
    const elRect = item.getBoundingClientRect()
    const parentRect = this.listContentEl.getBoundingClientRect()
    const hasToScrollList = { 'keyArrowUp': (elRect.bottom <= parentRect.top), 'keyArrowDown': (elRect.top >= parentRect.bottom) }

    if (hasToScrollList[key]) {
      this.listContentEl.scrollTop = scrollPos
    }
  }

  return {
    onKeyArrowUp,
    onKeyArrowDown,
    onKeyEnter
  }
})()