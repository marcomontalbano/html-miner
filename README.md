HTML Miner
==========

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b9430880d9994818b4e32d5ba024ba5c)](https://www.codacy.com/app/marcomontalbano/html-miner?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=marcomontalbano/html-miner&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.org/marcomontalbano/html-miner.svg?branch=master)](https://travis-ci.org/marcomontalbano/html-miner)
[![Npm](https://img.shields.io/npm/v/html-miner.svg)](https://www.npmjs.com/package/html-miner)


Install
-------

```sh
# using yarn
yarn add html-miner

# using npm
npm i --save html-miner
```


Example
-------

We have following html snippet and we want to fetch some information.

```html
<h1>Hello, world!</h1>
<div class="articles">
    <div class="article">
        <h2>Heading 1</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    <div class="article">
        <h2>Heading 2</h2>
        <p>Donec maximus ipsum quis est tempor, sit amet laoreet libero bibendum.</p>
    </div>
    <div class="article">
        <h2>Heading 3</h2>
        <p>Suspendisse viverra convallis risus, vitae molestie est tincidunt eget.</p>
    </div>
</div>
<footer>
    <p>&copy; <span>Company</span> 2017</p>
</footer>
```

```javascript
const htmlMiner = require('html-miner');

let json = htmlMiner(html, {
    title: "h1",
    h2: "h2",
    articles: {
        _each_: '.articles .article',
        title: 'h2',
        content: 'p',
    },
    footer: {
        copyright: 'footer',
        company: 'footer span',
        year: ($, scopeData) => { return scopeData.copyright.match(/[0-9]+/)[0] },
    },
    greet: $ => { return 'Hi!' }
});

console.log( json );

// {
//     title: 'Hello, world!',
//     h2: ['Heading 1', 'Heading 2', 'Heading 3'],
//     articles: [
//         {
//             title: 'Heading 1',
//             content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//         },
//         {
//             title: 'Heading 2',
//             content: 'Donec maximus ipsum quis est tempor, sit amet laoreet libero bibendum.',
//         },
//         {
//             title: 'Heading 3',
//             content: 'Suspendisse viverra convallis risus, vitae molestie est tincidunt eget.',
//         }
//     ],
//     footer: {
//         copyright: '© Company 2017',
//         company: 'Company',
//         year: '2017'
//     },
//     greet: 'Hi!'
// }

```


Development
-----------

```sh
yarn
yarn test
```
