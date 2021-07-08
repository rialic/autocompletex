const Index = (() => {
    const Index = ModuleFactory(index);

    function index() {
        const formOne = document.querySelector('#form_one');
        const formTwo = document.querySelector('#form_two');

        const autocompleteOne = document.querySelector('#input_one');
        const autocompleteTwo = document.querySelector('#input_two');

        const autocompleteOneResult = document.querySelector('#result_autocomplete_one');
        const autocompleteTwoResult = document.querySelector('#result_autocomplete_two');

        return { formOne, formTwo, autocompleteOne, autocompleteTwo, autocompleteOneResult, autocompleteTwoResult };
    }

    index.prototype.enable = function() {
        init.call(this);

        Index.formOne.addEventListener('submit', sendFormOne);
        Index.formTwo.addEventListener('submit', sendFormTwo);
    };

    function init() {
        setAutoCompleteOne.call(this);
        setAutoCompleteTwo.call(this);
    }

    function sendFormOne(event) {
        const autocompleteVals = Index.autocompleteOne.megaAutoCompleteVal();
        
        event.preventDefault();

        Index.autocompleteOneResult.textContent = `Show Submited Form: ${autocompleteVals}`;
        Index.autocompleteOne.megaAutoCompleteReset();
    }

    function sendFormTwo(event) {
        const autocompleteVals = Index.autocompleteTwo.megaAutoCompleteVal();
        
        event.preventDefault();

        Index.autocompleteTwoResult.textContent = `Show Submited Form: ${autocompleteVals}`;
        Index.autocompleteTwo.megaAutoCompleteReset();
    }

    function setAutoCompleteOne() {
        const optionsAutoCompleteOne = {
            url: Index.formOne.getAttribute('action'), // https://jsonplaceholder.typicode.com/comments
            matchFilter: true,
            itemLimit: 1,
            data: {'postId': 1},
            getVal: element => element.body
            // getVal: element => element.body
        };

        Index.autocompleteOne.megaAutoComplete(optionsAutoCompleteOne);
    }

    function setAutoCompleteTwo() {
        const optionsAutoCompleteTwo = {
            url: Index.formTwo.getAttribute('action'), // https://jsonplaceholder.typicode.com/photos
            matchFilter: true,
            getVal: element => element.title
        };

        Index.autocompleteTwo.megaAutoComplete(optionsAutoCompleteTwo);
    }

    return Index;
})();

document.addEventListener("DOMContentLoaded", () => Index.enable());