import { generateContainerElements, generateIconElements, generateListElements, generateCheckboxElements, makeElement } from './autocompletex-generate-components.js'

export const {
  fillList,
  removeList,
  fillListWithNotResultMessage
} = (() => {

  function fillList(data) {
    const hasDataSelected = !!this.dataSelected.length

    data.forEach(data => {
      const { listItem } = generateListElements()
      const { checkboxContainer } = generateContainerElements()
      const { checkboxEl, checkboxInput, checkboxBoxEl } = generateCheckboxElements()
      const { iconCheckbox } = generateIconElements()
      const label = makeElement('label')

      label.setAttribute('text-content', '')
      label.textContent = data[this.listParams['list-label']]

      checkboxInput.id =  data[this.listParams['list-value']]
      checkboxInput.value =  data[this.listParams['list-value']]

      listItem.insertAdjacentElement('beforeend', checkboxContainer)
      listItem.insertAdjacentElement('beforeend', label)

      checkboxContainer.insertAdjacentElement('beforeend', checkboxEl)
      checkboxContainer.insertAdjacentElement('beforeend', checkboxBoxEl)

      checkboxEl.insertAdjacentElement('beforeend', checkboxInput)
      checkboxBoxEl.insertAdjacentElement('beforeend', iconCheckbox)

      this.listContentEl.insertAdjacentElement('beforeend', listItem)
    })

    if (hasDataSelected) {
      this.dataSelected.forEach(data => {
        const dataId = data[this.listParams['list-value']]
        const listItemEl = this.listContentEl.querySelector(`input[id="${dataId}"]`)?.closest('.acx-list-item')
        const hasListItemEl = !!listItemEl

        if (hasListItemEl) {
          const checkboxBoxEl = listItemEl.querySelector('.acx-checkbox-box')
          const checkboxIcon = checkboxBoxEl.querySelector('.acx-checkbox-icon')

          checkboxBoxEl.classList.toggle('acx-checkbox-box--checked')
          checkboxIcon.classList.toggle('acx-checkbox-icon--checked')
        }
      })
    }
  }

  function removeList() {
    Array.from(this.listContentEl.children).forEach(listItem => listItem.remove())
  }

  function fillListWithNotResultMessage() {
    const { listItem } = generateListElements()
    const label = makeElement('label')

    label.setAttribute('no-content', '')
    label.textContent = this.noResultMessage

    listItem.insertAdjacentElement('beforeend', label)
    this.listContentEl.insertAdjacentElement('beforeend', listItem)
  }

  return {
    fillList,
    removeList,
    fillListWithNotResultMessage
  }
})()