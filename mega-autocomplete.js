const MegaAutoComplete = (() => {
    const megaAutoComplete = new MegaAutoComplete()

    function MegaAutoComplete() {
        this.options = {};
        this.suggestions;
        this.timeoutId;
        this.autocompleteContainer = document.querySelectorAll('.mega-ac-container');
        this.autocomplete = document.querySelectorAll('.mega-ac');
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
        const isAutoComplete = Array.from(this.classList).includes('mega-ac');
        const isMegaAutoComplete = isAutoComplete && isInputTag;

        if (isMegaAutoComplete && hasUrl) {
            megaAutoComplete.options.url = options.url;
            megaAutoComplete.options.method = hasMethod ? options.method : 'GET';
            megaAutoComplete.options.data = hasData ? options.data : '';
            megaAutoComplete.options.matchFilter = hasFilter;
            megaAutoComplete.options.getVal = options.getVal;
        }
    }

    function initMegaAutoComplete() {
        const createAutoCompleteComponent = autocompleteContainer => {
            // const hasAutoCompleteNameAttr = autocomplete.hasAttribute('name');
            // const hasAutoCompleteIdAttr = autocomplete.hasAttribute('id');

            const autocomplete = autocompleteContainer.querySelector('.mega-ac');
            const autocompleteFormFloating = autocomplete.closest('.form-floating');
            const autocompleteList = makeElement.call(this, 'div', { 'class': 'mega-ac-list' });
            const autocompleteSelected = makeElement.call(this, 'div', { 'class': 'mega-ac-selected' });
            const autocompleteSelectedCounter = makeElement.call(this, 'div', { 'class': 'mega-ac-selected__counter', 'data-total': 0 });
            const autocompleteSelectedValues = makeElement.call(this, 'input', { 'class': 'mega-ac-selected__values' });
            const autocompleteSelectedList = makeElement.call(this, 'div', { 'class': 'mega-ac-selected-list' });


            // if (hasAutoCompleteIdAttr) {
            //     const autocompleteIdAttr = autocomplete.getAttribute('id');

            //     autocompleteSelectedValues.setAttribute('id', autocompleteIdAttr);
            // }

            // if (hasAutoCompleteNameAttr) {
            //     const autocompleteNameAttr = autocomplete.getAttribute('name');

            //     autocomplete.removeAttribute('name');
            //     autocompleteSelectedValues.setAttribute('name', autocompleteNameAttr);
            // }

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
                ];

                const autocompleteBgSelected = autocomplete.dataset.bgSelected;
                const findAutoCompleteClassColor = classItem => {
                    const hasClassItem = autocompleteColorList.includes(classItem);

                    if(hasClassItem) return classItem;
                }
                const autocompleteClassColor = Array.from(autocomplete.classList).find(findAutoCompleteClassColor);

                autocomplete.classList.remove(autocompleteClassColor);
                autocomplete.removeAttribute('data-bg-selected');

                autocompleteFormFloating.classList.add(autocompleteClassColor);
                autocompleteFormFloating.dataset.bgSelected = autocompleteBgSelected;
            }

            autocompleteContainer.insertAdjacentElement('beforeend', autocompleteList);

            autocompleteContainer.insertAdjacentElement('beforeend', autocompleteSelected);
            autocompleteSelected.insertAdjacentElement('beforeend', autocompleteSelectedCounter);
            autocompleteSelected.insertAdjacentElement('beforeend', autocompleteSelectedValues);

            autocompleteContainer.insertAdjacentElement('beforeend', autocompleteSelectedList);

            autocompleteContainer.addEventListener('click', handleAutoCompleteContainerClickEvent.bind(this));
        };
        const generateAutoCompleteClickEvent = autocomplete => autocomplete.addEventListener('keyup', handleAutoCompleteKeyUpEvent.bind(this));

        this.autocompleteContainer.forEach(createAutoCompleteComponent);
        this.autocomplete.forEach(generateAutoCompleteClickEvent);

        document.addEventListener('click', handleAutoCompleteContainerBlurEvent.bind(this));
    }

    function handleAutoCompleteContainerClickEvent(event) {
        const element = event.target;
        const elementClassList = Array.from(element.classList);
        const autocompleteContainer = element.closest('.mega-ac-container');
        const {
            autocomplete,
            autocompleteList,
            autocompleteSelected,
            autocompleteSelectedList,
            autocompleteSelectedCounter,
            autocompleteSelectedValues
        } = getAutoCompleteVariables.call(this, autocompleteContainer);

        const isAutoCompleteEl = elementClassList.includes('mega-ac');
        const isAutoCompleteListEl = Boolean(element.closest('.mega-ac-list'));
        const isAutoCompleteSelectedEl = elementClassList.includes('mega-ac-selected')
            || elementClassList.includes('mega-ac-selected__counter');
        const isAutoCompleteRemoveItemEl = elementClassList.includes('mega-ac-selected-list__remove-item');
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
            const isShowingAutoCompleteList = Array.from(autocomplete.classList).includes('mega-ac--show')
                || Array.from(autocompleteList.classList).includes('mega-ac-list--show');

            if (hasAutoCompleteList && !isShowingAutoCompleteList) {
                autocomplete.classList.add('mega-ac--show');
                autocompleteList.classList.add('mega-ac-list--show');
            }

            hideAutoCompleteSelectedList.call(this, autocompleteContainer);

            return;
        }

        if (isClickedLiAutoCompleteListEl) {
            const itemSelected = element;
            const itemSelectedText = itemSelected.textContent;
            const isMultipleInput = autocomplete.hasAttribute('multiple');
            const typeInput = (isMultipleInput) ? MultipleInput.call(this) : SingleInput.call(this);
            const inputSingleMultiple = InputSingleMultiple.call(this);

            if (itemSelectedText === 'Não há resultados para essa pesquisa') return;

            //INPUT SIMPLES OU MÚLTIPLO
            inputSingleMultiple.setStrategy.call(this, typeInput);
            inputSingleMultiple.define.call(this, autocompleteContainer, itemSelectedText);
        }

        if (isClickedDivAutoCompleteSelectedEl) {
            hideAutoCompleteList.call(this, autocompleteContainer);
            showAutoCompleteSelectedList.call(this, autocompleteContainer);
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

            removeAutoCompleteSelectedList.call(this, autocompleteContainer);

            if (isEmptyTotalSelected) {
                autocompleteSelected.classList.remove('mega-ac-selected--show');
                hideAutoCompleteSelectedList.call(this, autocompleteContainer);

                return;
            }

            mountAutoCompleteSelectedList.call(this, autocompleteSelectedList, selectedList);
            showAutoCompleteSelectedList.call(this, autocompleteContainer);
        }

        if (isClickedButtonClearListEl) {
            autocompleteSelectedCounter.dataset.total = 0;
            autocompleteSelectedCounter.innerText = '';
            autocompleteSelectedValues.value = '';

            autocompleteSelected.classList.remove('mega-ac-selected--show');
            removeAutoCompleteSelectedList.call(this, autocompleteContainer);
            hideAutoCompleteSelectedList.call(this, autocompleteContainer);
        }
    }

    function handleAutoCompleteContainerBlurEvent(event) {
        const element = event.target;
        const autocompleteContainer = element.closest('.mega-ac-container');
        const hasAutoCompleteContainerParent = Boolean(autocompleteContainer);
        const isAutoCompleteRemoveItemEl = Array.from(element.classList).includes('mega-ac-selected-list__remove-item');

        // FECHAR OUTROS AUTOCOMPLETE EXCETO O AUTO COMPLETE QUE FOI CLICADO
        const hideOtherAutoCompleteContainer = internalAutoCompleteContainer => {
            const isDifferentAutoCompleteContainer = autocompleteContainer !== internalAutoCompleteContainer;

            if (isDifferentAutoCompleteContainer) { // SE FOR DIFERENTE, ENTÃO FECHA OS OUTROS AUTOCOMPLETE WRAPPER
                hideAutoCompleteList.call(this, internalAutoCompleteContainer);
                hideAutoCompleteSelectedList.call(this, internalAutoCompleteContainer);
            }
        }

        // FECHAR TODOS OS AUTOCOMPLETE
        const hideAllAutoCompleteContainer = internalAutoCompleteContainer => {
            hideAutoCompleteList.call(this, internalAutoCompleteContainer);
            hideAutoCompleteSelectedList.call(this, internalAutoCompleteContainer);
        }

        if (isAutoCompleteRemoveItemEl) return;

        if (hasAutoCompleteContainerParent) return this.autocompleteContainer.forEach(hideOtherAutoCompleteContainer);

        this.autocompleteContainer.forEach(hideAllAutoCompleteContainer);
    }

    async function handleAutoCompleteKeyUpEvent(event) {
        const autocompleteContainer = event.target.closest('.mega-ac-container');
        const {
            autocomplete,
            autocompleteList,
            autocompleteListItems,
        } = getAutoCompleteVariables.call(this, autocompleteContainer);

        const autocompleteVal = autocomplete.value;
        const autocompleteValLenght = autocomplete.value.length;
        const hasUrl = Boolean(this.options.url);
        const hasMoreThanThreeLetters = autocompleteValLenght >= 3;

        const keyVal = event.key;

        if (hasUrl && autocompleteVal && hasMoreThanThreeLetters) {
            const params = {autocompleteContainer, autocompleteList, autocompleteListItems, autocomplete, autocompleteVal};

            fireEvents.call(this, keyVal, params);
        }

        if (!autocompleteVal || !hasMoreThanThreeLetters) removeAutoCompleteList.call(this, autocompleteContainer);
    }

    function removeAutoCompleteList(autocompleteContainer) {
        const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteContainer);

        autocomplete.classList.remove('mega-ac--show');
        autocompleteList.innerHTML = '';
        autocompleteList.classList.remove('mega-ac-list--show');
    }

    function removeAutoCompleteSelectedList(autocompleteContainer) {
        const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteContainer);

        autocompleteSelectedList.innerHTML = '';
    }

    function hideAutoCompleteList(autocompleteContainer) {
        const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteContainer);

        autocomplete.classList.remove('mega-ac--show');
        autocompleteList.classList.remove('mega-ac-list--show');
    }

    function hideAutoCompleteSelectedList(autocompleteContainer) {
        const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteContainer);

        autocompleteSelectedList.classList.remove('mega-ac-selected-list--show');
    }

    function showAutoCompleteList(autocompleteContainer) {
        const { autocomplete, autocompleteList } = getAutoCompleteVariables.call(this, autocompleteContainer);

        autocomplete.classList.add('mega-ac--show');
        autocompleteList.classList.add('mega-ac-list--show');
    }

    function showAutoCompleteSelectedList(autocompleteContainer) {
        const { autocompleteSelectedList } = getAutoCompleteVariables.call(this, autocompleteContainer);

        autocompleteSelectedList.classList.add('mega-ac-selected-list--show');
    }

    function mountAutoCompleteList(autocompleteList, filteredList) {
        const ulEl = makeElement.call(this, 'ul');
        const generateList = item => {
            const liEl = makeElement.call(this, 'li');
            const hasNoResult = item === 'Não há resultados para essa pesquisa';

            if (hasNoResult) liEl.style.cursor = 'default';

            liEl.textContent = item;
            ulEl.insertAdjacentElement('afterbegin', liEl);
        }

        filteredList.forEach(generateList);
        autocompleteList.insertAdjacentElement('afterbegin', ulEl);
    }

    function mountAutoCompleteSelectedList(autocompleteSelectedList, filteredList) {
        const hasItemsInSelectedList = autocompleteSelectedList.hasChildNodes();
        const ulEl = (hasItemsInSelectedList) ? autocompleteSelectedList.querySelector('ul')
            : makeElement.call(this, 'ul');
        const generateList = item => {
            const divWrapperEl = makeElement.call(this, 'div', {class: 'd-flex align-items-center justify-content-between'});
            const divRemoveIconEl = makeElement.call(this, 'div', {class: 'mega-ac-selected-list__remove-item'});
            const spanTextEl = makeElement.call(this, 'span');
            const liEl = makeElement.call(this, 'li');

            divRemoveIconEl.classList.add('mega-ac-selected-list__remove-item');
            spanTextEl.textContent = item;

            ulEl.insertAdjacentElement('afterbegin', liEl);
            liEl.insertAdjacentElement('beforeend', divWrapperEl);
            divWrapperEl.insertAdjacentElement('afterbegin', spanTextEl);
            divWrapperEl.insertAdjacentElement('beforeend', divRemoveIconEl);
        }

        filteredList.forEach(generateList);

        if (!hasItemsInSelectedList) {
            const divEl = makeElement.call(this, 'div', {class: 'd-flex justify-content-end'});
            const buttonEl = makeElement.call(this, 'button', {class: 'btn btn-sm btn-link text-decoration-none'});

            buttonEl.textContent = 'Limpar Lista';

            autocompleteSelectedList.insertAdjacentElement('afterbegin', ulEl);
            autocompleteSelectedList.insertAdjacentElement('beforeend', divEl);

            divEl.insertAdjacentElement('afterbegin', buttonEl);
        }
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

    function fireTypingEvent (params) {
        clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(async () => {
            let filteredList;

            const { autocompleteContainer, autocompleteList, autocompleteVal } = params;
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
            }

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

            removeAutoCompleteList.call(this, autocompleteContainer);
            mountAutoCompleteList.call(this, autocompleteList, filteredList);
            showAutoCompleteList.call(this, autocompleteContainer);
        }, 1000);
    }

    function fireEnterEvent(params) {
        const { autocompleteContainer, autocompleteListItems, autocomplete } = params;
        const itemSelected = autocompleteListItems.find(liEl => Array.from(liEl.classList).includes('selected'));
        const itemSelectedText = itemSelected.textContent;
        const isMultipleInput = autocomplete.hasAttribute('multiple');
        const typeInput = (isMultipleInput) ? MultipleInput.call(this) : SingleInput.call(this);
        const inputSingleMultiple = InputSingleMultiple.call(this);

        if (itemSelectedText === 'Não há resultados para essa pesquisa') return;

        //INPUT SIMPLES OU MÚLTIPLO
        inputSingleMultiple.setStrategy.call(this, typeInput);
        inputSingleMultiple.define.call(this, autocompleteContainer, itemSelectedText);
    }

    function fireArrowUpEvent(params) {
        const { autocompleteListItems } = params;
        const ulEl = autocompleteListItems[0].parentElement;
        const lastLiEl = autocompleteListItems[autocompleteListItems.length - 1];

        const hasSelectedItem = autocompleteListItems.some(liEl => Array.from(liEl.classList).includes('selected'));
        const selectedIndex = autocompleteListItems.findIndex(liEl => Array.from(liEl.classList).includes('selected'));

        if (hasSelectedItem) {
            const navigateList = (liEl, index) => {
                const ulEl = liEl.parentElement;
                const scrollPos = liEl.offsetTop;
                const isEqualIndex = (selectedIndex - 1) === index;
                const isFirstIndex = selectedIndex === 0;

                if (isFirstIndex) return;

                if (isEqualIndex) {
                    liEl.nextElementSibling.classList.remove('selected');
                    liEl.classList.add('selected');

                    ulEl.scrollTop = scrollPos;
                }
            }

            autocompleteListItems.forEach(navigateList);

            return;
        }

        ulEl.scrollTop = lastLiEl.offsetTop;
        lastLiEl.classList.add('selected');
    }


    function fireArrowDownEvent(params) {
        const { autocompleteListItems } = params;
        const firstLiEl = autocompleteListItems[0];

        const hasSelectedItem = autocompleteListItems.some(liEl => Array.from(liEl.classList).includes('selected'));
        const selectedIndex = autocompleteListItems.findIndex(liEl => Array.from(liEl.classList).includes('selected'));

        if (hasSelectedItem) {
            const navigateList = (liEl, index, list) => {
                const ulEl = liEl.parentElement;
                const scrollPos = liEl.offsetTop;
                const isEqualIndex = (selectedIndex + 1) === index;
                const isLastIndex = selectedIndex === list.length;

                if (isLastIndex) return;

                if (isEqualIndex) {
                    liEl.previousElementSibling.classList.remove('selected');
                    liEl.classList.add('selected');

                    ulEl.scrollTop = scrollPos;
                }
            }

            autocompleteListItems.forEach(navigateList);

            return;
        }

        firstLiEl.classList.add('selected');
    }

    function fireEvents(type, params) {
        const typeEvent = {
            'Enter': fireEnterEvent,
            'ArrowUp' : fireArrowUpEvent,
            'ArrowDown' : fireArrowDownEvent,
            'default' : fireTypingEvent
        };

        return (typeEvent[type] || typeEvent['default']).call(this, params);
    }

    function InputSingleMultiple() {
        this.inputType = null;

        const setStrategy = inputType => this.inputType = inputType;
        const define = (autocompleteContainer, itemSelectedText) => {
            this.inputType.define.call(this, autocompleteContainer, itemSelectedText);
        }

        return {setStrategy, define};
    }

    function SingleInput() {
        const define = (autocompleteContainer, itemSelectedText) => {
            const { autocomplete, autocompleteSelectedValues } = getAutoCompleteVariables.call(this, autocompleteContainer);

            autocomplete.value = itemSelectedText;
            autocompleteSelectedValues.value = JSON.stringify([itemSelectedText.trim()]);
            removeAutoCompleteList.call(this, autocompleteContainer);
        }

        return {define};
    }

    function MultipleInput() {
        const define = (autocompleteContainer, itemSelectedText) => {
            const {
                autocomplete,
                autocompleteSelected,
                autocompleteSelectedList,
                autocompleteSelectedCounter,
                autocompleteSelectedValues
            } = getAutoCompleteVariables.call(this, autocompleteContainer);

            const totalSelected = Number(autocompleteSelectedCounter.dataset.total) + 1;
            const hasSelectedValues = Boolean(autocompleteSelectedValues.value);
            const selectedList = (hasSelectedValues) ? JSON.parse(autocompleteSelectedValues.value) : [];
            const isItemAlreadySelected = selectedList.includes(itemSelectedText.trim());

            autocomplete.value = '';

            if (!isItemAlreadySelected) {
                selectedList.push(itemSelectedText.trim());
                autocompleteSelectedValues.value = JSON.stringify(selectedList);

                autocompleteSelected.classList.add('mega-ac-selected--show');
                autocompleteSelectedCounter.dataset.total = totalSelected;
                autocompleteSelectedCounter.textContent = totalSelected;

                removeAutoCompleteSelectedList.call(this, autocompleteContainer);
                mountAutoCompleteSelectedList.call(this, autocompleteSelectedList, selectedList);
            }

            removeAutoCompleteList.call(this, autocompleteContainer);
        }

        return {define};
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
    }

    const getAutoCompleteVariables = (autocompleteContainer) => {
        const autocomplete = autocompleteContainer.querySelector('.mega-ac');
        const autocompleteList = autocompleteContainer.querySelector('.mega-ac-list');
        const autocompleteListItems = Array.from(autocompleteContainer.querySelectorAll('.mega-ac-list li'));
        const autocompleteSelected = autocompleteContainer.querySelector('.mega-ac-selected');
        const autocompleteSelectedList = autocompleteContainer.querySelector('.mega-ac-selected-list');
        const autocompleteSelectedCounter = autocompleteContainer.querySelector('.mega-ac-selected__counter');
        const autocompleteSelectedValues = autocompleteContainer.querySelector('.mega-ac-selected__values');

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
    const autocomplete = document.querySelector('.mega-ac');
    const options = {
        url: 'https://pokeapi.co/api/v2/pokemon/',
        matchFilter: true,
        getVal: 'name'
    };

    autocomplete.megaAutoComplete(options);
});