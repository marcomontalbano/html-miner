'use strict';

const cheerio = require('cheerio');

module.exports = (html, selectors) => {

    const $ = cheerio.load(html);
    let elements = [];
    $( selectors ).each((i, el) => {
        elements.push( $(el).text() );
    });

    return elements.length > 1 ? elements : elements[0];

};
