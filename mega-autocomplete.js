const MegaAutoComplete = (() => {
    // TODO RIALIC
    /**
     * CRIAR LISTA PARA OS SELETECTED ELEMENTS ITEMS DO SEARCH FIELD (MOSTRAR E EXCLUIR ITENS DA LISTA)
     * A LISTA SELECIONADA DEVE POSSUIR UM ARRAY DOS ITENS SELECIONADOS PARA SEREM ENVIADOS AO SERVIDOR
     * ARMAZENAR O OBJETO DE RAÇA DO CACHORRO NO LI E DEPOIS SAVAR EM UMA CONST DO JS;
     * DIGITAÇÃO DE NÚMEROS NÃO FUNCIONA PARA CAMPOS EM MOBILE (KEY PRESS) A PARTIR DA LINHA 93
     * */

    function MegaAutoComplete() {
        this.autocompleteWrapper = document.querySelectorAll('.m-autocom-wrapper');
        this.autocomplete = document.querySelectorAll('.m-autocom');

        this.suggestions = [
            "Channel",
            "CodingLab",
            "CodingNepal",
            "YouTube",
            "YouTuber",
            "YouTube Channel",
            "Blogger",
            "Bollywood",
            "Vlogger",
            "Vechiles",
            "Facebook",
            "Freelancer",
            "Facebook Page",
            "Designer",
            "Developer",
            "Web Designer",
            "Web Developer",
            "Login Form in HTML & CSS",
            "How to learn HTML & CSS",
            "How to learn JavaScript",
            "How to became Freelancer",
            "How to became Web Designer",
            "How to start Gaming Channel",
            "How to start YouTube Channel",
            "How to start Programing",
            "How to become smart person",
            "How to think fast",
            "How can I become a day trader",
            "How to lose weight",
            "What does HTML stands for?",
            "What does CSS stands for?",
            "Vira Lata - (SRD) Sem Raça Definida no geral",
        ];
    }

    MegaAutoComplete.prototype.enable = function () {
        initMegaAutoComplete.call(this);
    }

    function initMegaAutoComplete() {
        const createAutoCompleteComponent = autocomWrapper => {
            const autocompleteList = makeElement.call(this, 'div',  {'class' : 'm-autocom-list'});
            const autocompleteSelected = makeElement.call(this, 'div',  {'class' : 'm-autocom-selected'});
            const autocompleteSelectedCounter = makeElement.call(this, 'div',  {'class' : 'm-autocom-selected--counter', 'data-total': 0});
            const autocompleteSelectedValues = makeElement.call(this, 'input',  {'class' : 'm-autocom-selected--values'});
            const autocompleteSelectedList = makeElement.call(this, 'div',  {'class' : 'm-autocom-selected-list'});

            autocomWrapper.insertAdjacentElement('beforeend', autocompleteList);

            autocomWrapper.insertAdjacentElement('beforeend', autocompleteSelected);
            autocompleteSelected.insertAdjacentElement('beforeend', autocompleteSelectedCounter);
            autocompleteSelected.insertAdjacentElement('beforeend', autocompleteSelectedValues);

            autocomWrapper.insertAdjacentElement('beforeend', autocompleteSelectedList);

            autocomWrapper.addEventListener('click', handleAutoCompleteWrapperClickEvent.bind(this));
        };
        const generateAutoCompleteClickEvent = autocomplete => autocomplete.addEventListener('keyup', handleAutoCompleteKeyUpEvent.bind(this));

        this.autocompleteWrapper.forEach(createAutoCompleteComponent);
        this.autocomplete.forEach(generateAutoCompleteClickEvent);

        document.addEventListener('click', handleAutoCompleteWrapperBlurEvent.bind(this));
    }

    function handleAutoCompleteWrapperClickEvent(event) {
        const element = event.target;
        const autocompleteWrapper = element.closest('.m-autocom-wrapper');

        const isInputElement = element.tagName === 'INPUT';
        const isLiElement = element.tagName === 'LI';

        if (isInputElement) {
            const autocomplete = element;
            const autocompleteList = autocompleteWrapper.querySelector('.m-autocom-list');

            const hasList = autocompleteList.querySelector('ul');
            const isShowingList = Array.from(autocomplete.classList).includes('-m-autocom-show') ||
                                  Array.from(autocompleteList.classList).includes('-m-autocom-list-show');

            if (hasList && !isShowingList) {
                autocomplete.classList.add('-m-autocom-show');
                autocompleteList.classList.add('-m-autocom-list-show');
            }

            return;
        }

        if (isLiElement) {
            const itemSelected = element;
            const itemSelectedText = itemSelected.textContent;

            const autocomplete = autocompleteWrapper.querySelector('.m-autocom');
            const autocompleteSelected = autocompleteWrapper.querySelector('.m-autocom-selected');
            const autocompleteSelectedCounter = autocompleteWrapper.querySelector('.m-autocom-selected--counter');
            const autocompleteSelectedValues = autocompleteWrapper.querySelector('.m-autocom-selected--values');

            const totalSelected = Number(autocompleteSelectedCounter.dataset.total) + 1;
            const hasSelectedValues = autocompleteSelectedValues.value;
            const selectedList = (hasSelectedValues) ? JSON.parse(autocompleteSelectedValues.value) : [];

            if(itemSelectedText === 'Não há resultados para essa pesquisa') return;

            selectedList.push(itemSelectedText);
            autocompleteSelectedValues.value = JSON.stringify(selectedList);

            autocomplete.value = '';
            autocompleteSelected.classList.add('-m-autocom-selected-show');
            autocompleteSelectedCounter.dataset.total = totalSelected;
            autocompleteSelectedCounter.textContent = totalSelected;

            removeAutoCompleteList.call(this, autocompleteWrapper, autocomplete);

            return;
        }
    }

    function handleAutoCompleteWrapperBlurEvent(event) {
        const element = event.target;
        const autocompleteWrapper = element.closest('.m-autocom-wrapper');
        const hasAutoCompleteWrapperParent = Boolean(autocompleteWrapper);

        const hideOtherAutoCompleteWrapper = autocomWrapper => {
            const autocomplete = autocomWrapper.querySelector('.m-autocom');
            const isDifferentAutoCompleteWrapper = autocompleteWrapper !== autocomWrapper;

            if (isDifferentAutoCompleteWrapper) { // SE FOR DIFERENTE, ENTÃO FECHA OS OUTROS AUTOCOMPLETE WRAPPER
                hideAutoCompleteList.call(this, autocomWrapper, autocomplete);
            }
        };
        const hideAllAutoCompleteWrapper = autocomWrapper => {
            const autocomplete = autocomWrapper.querySelector('.m-autocom');

            hideAutoCompleteList.call(this, autocomWrapper, autocomplete);
        };

        if(hasAutoCompleteWrapperParent) {
            this.autocompleteWrapper.forEach(hideOtherAutoCompleteWrapper);

            return;
        }

        this.autocompleteWrapper.forEach(hideAllAutoCompleteWrapper);
    }

    function handleAutoCompleteKeyUpEvent(event) {
        const autocompleteWrapper = event.target.closest('.m-autocom-wrapper');
        const autocomplete = event.target;
        const autocompleteVal = autocomplete.value;
        const autocompleteValLenght = autocomplete.value.length;
        const hasMoreThanThreeLetters = autocompleteValLenght >= 3;
        // const keyPressed = event.keyCode;
        // const isLetterKeyPressed = (keyPressed >= 65 && keyPressed <= 90); // Letter Keys
        // const isSpecialKeyPressed = (keyPressed === 8 || keyPressed === 46 || keyPressed === 32); // Backspace/Delete and Space Keys
        // const isValidKeyPressed = isLetterKeyPressed || isSpecialKeyPressed;

        if (autocompleteVal && hasMoreThanThreeLetters) {
            const generateFiltredList = (acc, item) => {
                const isItemMatching = item.toLowerCase().startsWith(autocompleteVal.toLowerCase());
                const hasDefaultResultList = acc.includes('Não há resultados para essa pesquisa');

                if (isItemMatching) {
                    if (hasDefaultResultList) acc.pop();

                    acc.push(item);
                }

                return acc;
            };
            const filteredList = this.suggestions.reduce(generateFiltredList, ['Não há resultados para essa pesquisa']);

            removeAutoCompleteList.call(this, autocompleteWrapper, autocomplete);
            mountAutoCompleteList.call(this, autocompleteWrapper, filteredList);
            showAutoCompleteList.call(this, autocompleteWrapper, autocomplete);
        }

        if (!autocompleteVal || !hasMoreThanThreeLetters) removeAutoCompleteList.call(this, autocompleteWrapper, autocomplete);
    }

    function removeAutoCompleteList(autocompleteWrapper, autocomplete) {
        const autocompleteList = autocompleteWrapper.querySelector('.m-autocom-list');

        autocomplete.classList.remove('-m-autocom-show');
        autocompleteList.innerHTML = '';
        autocompleteList.classList.remove('-m-autocom-list-show');
    }

    function hideAutoCompleteList(autocompleteWrapper, autocomplete) {
        const autocompleteList = autocompleteWrapper.querySelector('.m-autocom-list');

        autocomplete.classList.remove('-m-autocom-show');
        autocompleteList.classList.remove('-m-autocom-list-show');
    }

    function showAutoCompleteList(autocompleteWrapper, autocomplete) {
        const autocompleteList = autocompleteWrapper.querySelector('.m-autocom-list');

        autocomplete.classList.add('-m-autocom-show');
        autocompleteList.classList.add('-m-autocom-list-show');
    }

    function mountAutoCompleteList(autocompleteWrapper, filteredList) {
        const autocompleteList = autocompleteWrapper.querySelector('.m-autocom-list');
        const ulEl = makeElement.call(this, 'ul');
        const generateList = item => {
            const liEl = makeElement.call(this, 'li');

            if (item === 'Não há resultados para essa pesquisa') liEl.style.cursor = 'default';

            liEl.textContent = item;
            ulEl.insertAdjacentElement('afterbegin', liEl);
        };

        filteredList.forEach(generateList);
        autocompleteList.insertAdjacentElement('afterbegin', ulEl);
    }

    const makeElement = (elementName, attributes = {}) => {
        const isValidStringEl = typeof elementName === 'string' && Boolean(elementName);
        const isValidObjectAttr = typeof attributes === 'object' && Boolean(attributes);

        if (isValidStringEl && isValidObjectAttr) {
            const element = document.createElement(elementName);
            const attributeList = Object.entries(attributes);
            const defineElementAttr = ([key, value]) => element.setAttribute(key, value);

            attributeList.forEach(defineElementAttr);

            return element;
        }

        return;
    }

    return new MegaAutoComplete();
})();

document.addEventListener('DOMContentLoaded', () => MegaAutoComplete.enable());