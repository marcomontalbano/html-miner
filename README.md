HTML Miner
==========

[![Npm](https://img.shields.io/npm/v/html-miner.svg)](https://www.npmjs.com/package/html-miner)
[![Build Status](https://travis-ci.org/marcomontalbano/html-miner.svg?branch=master)](https://travis-ci.org/marcomontalbano/html-miner)
[![Coverage Status](https://coveralls.io/repos/github/marcomontalbano/html-miner/badge.svg?branch=master)](https://coveralls.io/github/marcomontalbano/html-miner?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b9430880d9994818b4e32d5ba024ba5c)](https://www.codacy.com/app/marcomontalbano/html-miner?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=marcomontalbano/html-miner&amp;utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/marcomontalbano/html-miner/badges/gpa.svg)](https://codeclimate.com/github/marcomontalbano/html-miner)
[![Issue Count](https://codeclimate.com/github/marcomontalbano/html-miner/badges/issue_count.svg)](https://codeclimate.com/github/marcomontalbano/html-miner/issues)

A powerful miner that will scrape html pages for you.

## Install

[![NPM](https://nodei.co/npm/html-miner.png)](https://nodei.co/npm/html-miner/)

```sh
# using npm
npm i --save html-miner

# using yarn
yarn add html-miner
```


## Usage

### Arguments

`html-miner` accepts two arguments: `html` and `selector`.

```js
const htmlMiner = require('html-miner');

// htmlMiner(html, selector);
```

#### HTML

_html_ is a string and contains `html` code.

```js
let html = '<div class="title">Hello <span>Marco</span>!</div>';
```

#### SELECTOR

_selector_ could be:

`STRING`

```js
htmlMiner(html, '.title');
//=> Hello Marco!
```

If the selector extracts more elements, the result is an array:

```js
let htmlWithDivs = '<div>Element 1</div><div>Element 2</div>';
htmlMiner(htmlWithDivs, 'div');
//=> ['Element 1', 'Element 2']
```

`FUNCTION`

```js
htmlMiner(html, () => { return 'Hello everyone!' });
//=> Hello everyone!
```

`ARRAY`

```js
htmlMiner(html, ['.title', 'span']);
//=> ['Hello Marco!', 'Marco']
```

`OBJECT`

```js
htmlMiner(html, {
    title: '.title',
    who: 'span'
});
//=> {
//     title: 'Hello Marco!',
//     who: 'Marco'
//   }
```

You can combine `array` and `object` with each other or with string and functions.

```js
htmlMiner(html, {
    title: '.title',
    who: '.title span',
    upper: (options) => { return options.scopeData.who.toUpperCase(); }
});
//=> {
//     title: 'Hello Marco!',
//     who: 'Marco',
//     upper: 'MARCO'
//   }
```


### Function in detail

A `function` accepts an argument `options` that is an `object`.

#### options

- `options.$`: is a jQuery-like function pointing to the document ( html argument ). You can use it to query and fetch elements from the html.

    ```js
    htmlMiner(html, (options) => { return options.$('.title').text(); });
    //=> Hello Marco!
    ```

- `options.$scope`: useful when combined with `_each_` (read [item list](#item-list) paragraph).

    ```js
    htmlMiner(html, {
        title: '.title',
        spanList: {
            _each_: 'span',
            value: (options) => {
                // "options.$scope.find('.title')" doesn't exist.
                return options.$scope.text();
            }
        }
    });
    //=> {
    //     title: 'Hello Marco!',
    //     spanList: [{
    //         value: 'Marco'
    //     }]
    //   }
    ```

- `options.globalData`: is an object that contains all **previously** fetched datas.

    ```js
    htmlMiner(html, {
        title: '.title',
        spanList: {
            _each_: '.title span',
            pageTitle: function(options) {
                // "options.globalData.who" is undefined because defined later.
                return options.globalData.title;
            }
        },
        who: '.title span'
    });
    //=> {
    //     title: 'Hello Marco!',
    //     spanList: [{
    //         pageTitle: 'Hello Marco!'
    //     }],
    //     who: 'Marco'
    //   }
    ```

- `options.scopeData`: similar to `globalData`, but only contains scope data. Useful when combined with `_each_` (read [item list](#item-list) paragraph).

    ```js
    htmlMiner(html, {
        title: '.title',
        upper: (options) => { return options.scopeData.title.toUpperCase(); },
        sublist: {
            who: '.title span',
            upper: (options) => {
                // "options.scopeData.title" is undefined because "title" is out of scope.
                return options.scopeData.who.toUpperCase();
            },
        }
    });
    //=> {
    //     title: 'Hello Marco!',
    //     upper: 'HELLO MARCO!',
    //     sublist: {
    //         who: 'Marco',
    //         upper: 'MARCO'
    //     }
    //   }
    ```


### Item list

When selector is an `object`, you can use `_each_` as key if you want to create a list of items.

For more details see the following [example](#lets-try-this-out).


## Let's try this out

Consider the following html snippet: we will try and fetch some information.

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

```js
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
        year: (options) => { return options.scopeData.copyright.match(/[0-9]+/)[0]; },
    },
    greet: () => { return 'Hi!'; }
});

console.log( json );

//=> {
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
//   }

```

You can find other examples under the folder `/examples`.

```sh
# you can test examples with nodejs
node examples/demo.js
node examples/site.js
```


## Development

```sh
npm install
npm test
```
