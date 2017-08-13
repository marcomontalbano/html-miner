'use strict';

const htmlScraper = require('./lib/');

const fs = require('fs');

fs.readFile(`${ __dirname }/test/html/getbootstrap.html`, 'utf8', (err, data) => {

    let json = htmlScraper(data, {
        title    : 'h1',
        headings : 'h2',
        articles : {
            _each_ : '.col-md-4',
            title  : 'h2',
            text   : 'p:first-of-type',
        }
    });

    console.dir(json, {depth: null, colors: true});

});
