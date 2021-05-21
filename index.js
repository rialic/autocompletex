document.addEventListener('DOMContentLoaded', () => {
    const autocompleteOne = document.querySelector('#input_one');
    const autocompleteTwo = document.querySelector('#input_two');

    const options = {
        url: 'https://jsonplaceholder.typicode.com/comments',
        matchFilter: true,
        getVal: element => element.name
    };

    autocompleteOne.megaAutoComplete(options);
    autocompleteTwo.megaAutoComplete(options);
})