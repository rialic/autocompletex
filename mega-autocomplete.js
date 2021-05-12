const MegaAutoComplete = (() => {
    const megaAutoComplete = new MegaAutoComplete()

    function MegaAutoComplete() {
        this.options = {};
        this.suggestions;
        this.timeoutId;
        this.autocompleteWrapper = document.querySelectorAll('.m-autocom-wrapper');
        this.autocomplete = document.querySelectorAll('.m-autocom');
    }

    MegaAutoComplete.prototype.enable = function () {
        initMegaAutoComplete.call(this);
    }

    HTMLInputElement.prototype.megaAutoComplete = function (options = {}) {
        const hasUrl = Boolean(options.url);
        const hasMethod = Boolean(options.method);
        const hasData = Boolean(options.data);
        const hasFilter = Boolean(options.matchFilter);

        const isInputTag = this.tagName === 'INPUT';
        const isAutoComplete = Array.from(this.classList).includes('m-autocom');
        const isMegaAutoComplete = isAutoComplete && isInputTag;

        if (isMegaAutoComplete && hasUrl) {
            megaAutoComplete.options.url = options.url;
            megaAutoComplete.options.method = hasMethod ? options.method : 'GET';
            megaAutoComplete.options.data = hasData ? options.data : '';
            megaAutoComplete.options.matchFilter = hasFilter;
            megaAutoComplete.options.getVal = options.getVal;

            return;
        }

        return; 
    }

    function initMegaAutoComplete() {
        const createAutoCompleteComponent = autocomWrapper => {
            // const autocomplete = autocomWrapper.querySelector('.m-autocom');
            // const hasAutoCompleteNameAttr = autocomplete.hasAttribute('name');
            // const hasAutoCompleteIdAttr = autocomplete.hasAttribute('id');

            const autocompleteList = makeElement.call(this, 'div', { 'class': 'm-autocom-list' });
            const autocompleteSelected = makeElement.call(this, 'div', { 'class': 'm-autocom-selected' });
            const autocompleteSelectedCounter = makeElement.call(this, 'div', { 'class': 'm-autocom-selected--counter', 'data-total': 0 });
            const autocompleteSelectedValues = makeElement.call(this, 'input', { 'class': 'm-autocom-selected--values' });
            const autocompleteSelectedList = makeElement.call(this, 'div', { 'class': 'm-autocom-selected-list' });

            // if (hasAutoCompleteIdAttr) {
            //     const autocompleteIdAttr = autocomplete.getAttribute('id');

            //     autocompleteSelectedValues.setAttribute('id', autocompleteIdAttr);
            // }

            // if (hasAutoCompleteNameAttr) {
            //     const autocompleteNameAttr = autocomplete.getAttribute('name');

            //     autocomplete.removeAttribute('name');
            //     autocompleteSelectedValues.setAttribute('name', autocompleteNameAttr);
            // }

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
        const elementClassList = Array.from(element.classList);
        const autocompleteWrapper = element.closest('.m-autocom-wrapper');
        const {
                autocomplete,
                autocompleteList,
                autocompleteSelected,
                autocompleteSelectedList,
                autocompleteSelectedCounter,
                autocompleteSelectedValues
            } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        const isAutoCompleteEl = elementClassList.includes('m-autocom');
        const isAutoCompleteListEl = Boolean(element.closest('.m-autocom-list'));
        const isAutoCompleteSelectedEl = elementClassList.includes('m-autocom-selected')
                                         || elementClassList.includes('m-autocom-selected--counter');
        const isAutoCompleteRemoveItemEl = elementClassList.includes('m-autocom-remove-item');
        const isButtonClearListEl = elementClassList.includes('btn-link');

        const isInputEl = element.tagName === 'INPUT';
        const isLiInputEl = element.tagName === 'LI';
        const isDivInputEl = element.tagName === 'DIV';
        const isButtonEl = element.tagName === 'BUTTON';

        const isClickedAutoCompleteEl =  isInputEl && isAutoCompleteEl;
        const isClickedLiAutoCompleteListEl = isLiInputEl && isAutoCompleteListEl;
        const isClickedDivAutoCompleteSelectedEl = isDivInputEl && isAutoCompleteSelectedEl;
        const isClickedDivAutoCompleteRemoveItemEl = isDivInputEl && isAutoCompleteRemoveItemEl;
        const isClickedButtonClearListEl = isButtonEl && isButtonClearListEl;

        if (isClickedAutoCompleteEl) {
            const hasAutoCompleteList = Boolean(autocompleteList.querySelector('ul'));
            const isShowingAutoCompleteList = Array.from(autocomplete.classList).includes('-m-autocom-show')
                                  || Array.from(autocompleteList.classList).includes('-list-show');

            if (hasAutoCompleteList && !isShowingAutoCompleteList) {
                autocomplete.classList.add('-m-autocom-show');
                autocompleteList.classList.add('-list-show');
            }

            hideAutoCompleteSelectedList.call(this, autocompleteWrapper);

            return;
        }

        if (isClickedLiAutoCompleteListEl) {
            const itemSelected = element;
            const itemSelectedText = itemSelected.textContent;
            const isMultipleInput = autocomplete.hasAttribute('multiple');

            if (itemSelectedText === 'Não há resultados para essa pesquisa') return;

            // INPUT MÚLTIPLO
            if (isMultipleInput) {
                return handleMultipleInput.call(this, autocompleteWrapper, itemSelectedText);
            }

            //INPUT SIMPLES
            return handleSingleInput.call(this, autocompleteWrapper, itemSelectedText);
        }

        if (isClickedDivAutoCompleteSelectedEl) {
            hideAutoCompleteList.call(this, autocompleteWrapper);
            showAutoCompleteSelectedList.call(this, autocompleteWrapper);
        }

        if (isClickedDivAutoCompleteRemoveItemEl) {
            let selectedList = JSON.parse(autocompleteSelectedValues.value);

            const itemSelectedText = element.previousElementSibling.textContent;
            const totalSelected = Number(autocompleteSelectedCounter.dataset.total) - 1;
            const isEmptyTotalSelected = totalSelected === 0;

            selectedList = selectedList.filter(selecteItem => selecteItem !== itemSelectedText);

            autocompleteSelectedCounter.textContent = (isEmptyTotalSelected) ? '' : totalSelected;
            autocompleteSelectedCounter.dataset.total = totalSelected;
            autocompleteSelectedValues.value = (isEmptyTotalSelected) ? '' : JSON.stringify(selectedList);

            removeAutoCompleteSelectedList.call(this, autocompleteWrapper);
            
            if (isEmptyTotalSelected) {
                autocompleteSelected.classList.remove('-m-autocom-selected-show');
                hideAutoCompleteSelectedList.call(this, autocompleteWrapper);
                
                return;
            }
            
            mountAutoCompleteSelectedList.call(this, autocompleteSelectedList, selectedList);
            showAutoCompleteSelectedList.call(this, autocompleteWrapper);
        }

        if (isClickedButtonClearListEl) {
            autocompleteSelectedCounter.dataset.total = 0;
            autocompleteSelectedCounter.innerText = '';
            autocompleteSelectedValues.value = '';

            autocompleteSelected.classList.remove('-m-autocom-selected-show');
            removeAutoCompleteSelectedList.call(this, autocompleteWrapper);
            hideAutoCompleteSelectedList.call(this, autocompleteWrapper);
        }
    }

    function handleAutoCompleteWrapperBlurEvent(event) {
        const element = event.target;
        const autocompleteWrapper = element.closest('.m-autocom-wrapper');
        const hasAutoCompleteWrapperParent = Boolean(autocompleteWrapper);
        const isAutoCompleteRemoveItemEl = Array.from(element.classList).includes('m-autocom-remove-item');

        // FECHAR OUTROS AUTOCOMPLETE EXCETO O AUTO COMPLETE QUE FOI CLICADO
        const hideOtherAutoCompleteWrapper = internalAutoCompleteWrapper => {
            const isDifferentAutoCompleteWrapper = autocompleteWrapper !== internalAutoCompleteWrapper;

            if (isDifferentAutoCompleteWrapper) { // SE FOR DIFERENTE, ENTÃO FECHA OS OUTROS AUTOCOMPLETE WRAPPER
                hideAutoCompleteList.call(this, internalAutoCompleteWrapper);
                hideAutoCompleteSelectedList.call(this, internalAutoCompleteWrapper);
            }
        };

        // FECHAR TODOS OS AUTOCOMPLETE
        const hideAllAutoCompleteWrapper = internalAutoCompleteWrapper => {
            hideAutoCompleteList.call(this, internalAutoCompleteWrapper);
            hideAutoCompleteSelectedList.call(this, internalAutoCompleteWrapper);
        };

        if (isAutoCompleteRemoveItemEl) return;

        if (hasAutoCompleteWrapperParent) return this.autocompleteWrapper.forEach(hideOtherAutoCompleteWrapper);

        this.autocompleteWrapper.forEach(hideAllAutoCompleteWrapper);
    }

    async function handleAutoCompleteKeyUpEvent(event) {
        const autocompleteWrapper = event.target.closest('.m-autocom-wrapper');
        const {
            autocomplete,
            autocompleteList,
            autocompleteListItems,
        } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        const autocompleteVal = autocomplete.value;
        const autocompleteValLenght = autocomplete.value.length;
        const hasUrl = Boolean(this.options.url);
        const hasMoreThanThreeLetters = autocompleteValLenght >= 3;

        const keyPressed = event.keyCode;
        const isEnterPressed = keyPressed === 13;
        const isArrowUpPressed = keyPressed === 38;
        const isArrowDownPressed = keyPressed === 40;
        const isArrowUpDownPressed = isArrowUpPressed || isArrowDownPressed;

        // VERIFICA SE O ENTER DO TECLADO FOI PRESSIONADO
        if(isEnterPressed && autocompleteVal && hasMoreThanThreeLetters) {
            const itemSelected = autocompleteListItems.find(liEl => Array.from(liEl.classList).includes('selected'));
            const itemSelectedText = itemSelected.textContent;
            const isMultipleInput = autocomplete.hasAttribute('multiple');

            if (itemSelectedText === 'Não há resultados para essa pesquisa') return;

            // TEM ALGUM ITEM SELECIONADO
            if (itemSelected) {
                // INPUT MÚLTIPLO
                if (isMultipleInput) {
                    return handleMultipleInput.call(this, autocompleteWrapper, itemSelectedText);
                }

                // INPUT SIMPLES
                handleSingleInput.call(this, autocompleteWrapper, itemSelectedText);
            }

            return;
        }

        // VERIFICA SE AS SETAS DO TECLADO BAIXO E CIMA FORAM PRESSIONADAS
        if (isArrowUpDownPressed && autocompleteVal && hasMoreThanThreeLetters) {
            const hasSelectedItem = autocompleteListItems.some(liEl => Array.from(liEl.classList).includes('selected'));

            if (hasSelectedItem) {
                const selectedIndex = autocompleteListItems.findIndex(liEl => Array.from(liEl.classList).includes('selected'));

                autocompleteListItems.forEach((liEl, index, list) => {
                    const ulEl = liEl.parentElement;
                    const scrollPos = liEl.offsetTop;
                    const isFirstIndex = selectedIndex === 0;
                    const isLastIndex = selectedIndex === list.length;

                    if (isArrowUpPressed) {
                        const isEqualIndex = (selectedIndex - 1) === index;

                        if (isFirstIndex) return;

                        if (isEqualIndex) {
                            liEl.nextElementSibling.classList.remove('selected');
                            liEl.classList.add('selected');

                            ulEl.scrollTop = scrollPos;
                        }
                    }

                    if (isArrowDownPressed) {
                        const isEqualIndex = (selectedIndex + 1) === index;

                        if (isLastIndex) return;

                        if (isEqualIndex) {
                            liEl.previousElementSibling.classList.remove('selected');
                            liEl.classList.add('selected');

                            ulEl.scrollTop = scrollPos;
                        }
                    }

                });

                return;
            }

            const ulEl = autocompleteListItems[0].parentElement;
            const firstLiEl = autocompleteListItems[0];
            const lastLiEl = autocompleteListItems[autocompleteListItems.length - 1];

            // SE NÃO TIVER ITEM SELECIONADO E A SETA PRA BAIXO FOR CLICADA, ENTÃO SELECIONA O PRIMEIRO
            if (isArrowDownPressed) {
                firstLiEl.classList.add('selected');
            }

            // SE NÃO TIVER ITEM SELECIONADO E A SETA PRA CIMA FOR CLICADA, ENTÃO SELECIONA O ÚLTIMO
            if (isArrowUpPressed) {
                ulEl.scrollTop = lastLiEl.offsetTop;
                lastLiEl.classList.add('selected');
            }

            return;
        }

        if (autocompleteVal && hasMoreThanThreeLetters && hasUrl) {
            clearTimeout(this.timeoutId);

            this.timeoutId = setTimeout(async () => {
                let filteredList;

                const method = this.options.method;
                const url = (method === 'GET') ? `${this.options.url}${autocompleteVal}` : this.options.url;
                // const responseData = await fetchData.call(this, url, this.options.data);
                // const hasRequestError = responseData.status === 'error';
                const generateList = item => item;
                const generateFiltredList = (acc, item) => {
                    const isItemMatching = item.toLowerCase().includes(autocompleteVal.toLowerCase());
                    const hasDefaultResultList = acc.includes('Não há resultados para essa pesquisa');
    
                    if (isItemMatching) {
                        if (hasDefaultResultList) acc.pop();
    
                        acc.push(item);
                    }
    
                    return acc;
                };

                // this.suggestions = (hasRequestError) ? ['Não há resultados para essa pesquisa'] : [responseData];

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
                    ]

                filteredList = (this.options.matchFilter) 
                                    ? this.suggestions.reduce(generateFiltredList, ['Não há resultados para essa pesquisa'])
                                    : this.suggestions.map(generateList);

                removeAutoCompleteList.call(this, autocompleteWrapper);
                mountAutoCompleteList.call(this, autocompleteList, filteredList);
                showAutoCompleteList.call(this, autocompleteWrapper);
            }, 1000);

            return;
        }

        if (!autocompleteVal || !hasMoreThanThreeLetters) removeAutoCompleteList.call(this, autocompleteWrapper);
    }

    function removeAutoCompleteList(autocompleteWrapper) {
        const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        autocomplete.classList.remove('-m-autocom-show');
        autocompleteList.innerHTML = '';
        autocompleteList.classList.remove('-list-show');
    }

    function removeAutoCompleteSelectedList(autocompleteWrapper) {
        const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        autocompleteSelectedList.innerHTML = '';
    }

    function hideAutoCompleteList(autocompleteWrapper) {
        const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        autocomplete.classList.remove('-m-autocom-show');
        autocompleteList.classList.remove('-list-show');
    }

    function hideAutoCompleteSelectedList(autocompleteWrapper) {
        const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        autocompleteSelectedList.classList.remove('-selected-list-show');
    }

    function showAutoCompleteList(autocompleteWrapper) {
        const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        autocomplete.classList.add('-m-autocom-show');
        autocompleteList.classList.add('-list-show');
    }

    function showAutoCompleteSelectedList(autocompleteWrapper) {
        const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        autocompleteSelectedList.classList.add('-selected-list-show');
    }

    function mountAutoCompleteList(autocompleteList, filteredList) {
        const ulEl = makeElement.call(this, 'ul');
        const generateList = item => {
            const liEl = makeElement.call(this, 'li');
            const hasNoResult = item === 'Não há resultados para essa pesquisa';

            if (hasNoResult) liEl.style.cursor = 'default';

            liEl.textContent = item;
            ulEl.insertAdjacentElement('afterbegin', liEl);
        };

        filteredList.forEach(generateList);
        autocompleteList.insertAdjacentElement('afterbegin', ulEl);
    }

    function mountAutoCompleteSelectedList(autocompleteSelectedList, filteredList) {
        let ulEl = (autocompleteSelectedList.hasChildNodes()) ? autocompleteSelectedList.querySelector('ul') 
                                                              : makeElement.call(this, 'ul');
        const generateList = item => {
            const divWrapperEl = makeElement.call(this, 'div', {class: 'd-flex align-items-center justify-content-between'});
            const divRemoveIconEl = makeElement.call(this, 'div', {class: 'm-autocom-remove-item'});
            const spanTextEl = makeElement.call(this, 'span');
            const liEl = makeElement.call(this, 'li');
        
            divRemoveIconEl.classList.add('m-autocom-remove-item');
            spanTextEl.textContent = item;

            ulEl.insertAdjacentElement('afterbegin', liEl);
            liEl.insertAdjacentElement('beforeend', divWrapperEl);
            divWrapperEl.insertAdjacentElement('afterbegin', spanTextEl);
            divWrapperEl.insertAdjacentElement('beforeend', divRemoveIconEl);
        };

        filteredList.forEach(generateList);

        if (!autocompleteSelectedList.hasChildNodes()) {
            const divEl = makeElement.call(this, 'div', {class: 'd-flex justify-content-end'});
            const buttonEl = makeElement.call(this, 'button', {class: 'btn btn-sm btn-link text-decoration-none'});

            buttonEl.textContent = 'Limpar Lista';

            autocompleteSelectedList.insertAdjacentElement('afterbegin', ulEl);
            autocompleteSelectedList.insertAdjacentElement('beforeend', divEl);

            divEl.insertAdjacentElement('afterbegin', buttonEl);
        }
    }

    function handleMultipleInput(autocompleteWrapper, itemSelectedText) {
        const {
            autocomplete,
            autocompleteSelected,
            autocompleteSelectedList,
            autocompleteSelectedCounter,
            autocompleteSelectedValues
        } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        const totalSelected = Number(autocompleteSelectedCounter.dataset.total) + 1;
        const hasSelectedValues = Boolean(autocompleteSelectedValues.value);
        const selectedList = (hasSelectedValues) ? JSON.parse(autocompleteSelectedValues.value) : [];
        const isItemAlreadySelected = selectedList.includes(itemSelectedText.trim());

        autocomplete.value = '';

        if (!isItemAlreadySelected) {
            selectedList.push(itemSelectedText.trim());
            autocompleteSelectedValues.value = JSON.stringify(selectedList);

            autocompleteSelected.classList.add('-m-autocom-selected-show');
            autocompleteSelectedCounter.dataset.total = totalSelected;
            autocompleteSelectedCounter.textContent = totalSelected;

            removeAutoCompleteSelectedList.call(this, autocompleteWrapper);
            mountAutoCompleteSelectedList.call(this, autocompleteSelectedList, selectedList);
        }

        removeAutoCompleteList.call(this, autocompleteWrapper);
    }

    function handleSingleInput(autocompleteWrapper, itemSelectedText) {
        const { autocomplete, autocompleteSelectedValues } = getAutoCompleteVariables.call(this, autocompleteWrapper);

        autocomplete.value = itemSelectedText;
        autocompleteSelectedValues.value = JSON.stringify([itemSelectedText.trim()]);
        removeAutoCompleteList.call(this, autocompleteWrapper);
    }

    async function fetchData(url, data) {
        try {
            const headers = {'Accept': 'application/json','Content-Type': 'application/json'};
            const method = this.options.method;
            const body = JSON.stringify(data);

            const response = (method === 'GET') ? await fetch(url, {headers, method}) : await fetch(url, {headers, method, body});

            const hasGetVal = Boolean(this.options.getVal);
            const isStringGetVal = typeof this.options.getVal === 'string';
            const isFunctionGetVal = typeof this.options.getVal === 'function';

            if (!response.ok) throw new Error('Não foi possível obter os dados da requisição');

            if (hasGetVal) {
                if (isStringGetVal) return (await response.json())[this.options.getVal];

                if (isFunctionGetVal) return this.options.getVal((await response.json()));
            }

            return (await response.json());
        } catch (error) {
            return {'status': 'error', 'message': `${error.message}`};
        }
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

    const getAutoCompleteVariables = (autocompleteWrapper) => {
        const autocomplete = autocompleteWrapper.querySelector('.m-autocom');
        const autocompleteList = autocompleteWrapper.querySelector('.m-autocom-list');
        const autocompleteListItems = Array.from(autocompleteWrapper.querySelectorAll('.m-autocom-list li'));
        const autocompleteSelected = autocompleteWrapper.querySelector('.m-autocom-selected');
        const autocompleteSelectedList = autocompleteWrapper.querySelector('.m-autocom-selected-list');
        const autocompleteSelectedCounter = autocompleteWrapper.querySelector('.m-autocom-selected--counter');
        const autocompleteSelectedValues = autocompleteWrapper.querySelector('.m-autocom-selected--values');

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

    document.addEventListener('DOMContentLoaded', () => megaAutoComplete.enable());
})();

document.addEventListener('DOMContentLoaded', () => {
    const autocomplete = document.querySelector('.m-autocom');
    const options = {
        url: 'https://pokeapi.co/api/v2/pokemon/',
        matchFilter: true,
        getVal: 'name'
    };

    autocomplete.megaAutoComplete(options);
});