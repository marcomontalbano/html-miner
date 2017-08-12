'use strict';

const cheerio = require('cheerio');
const _ = require('lodash');

module.exports = (html, originalSelector) => {

    if (
        ! _.isString( originalSelector ) &&
        ! _.isArrayLike( originalSelector ) &&
        ! _.isObjectLike( originalSelector ) &&
        ! _.isFunction( originalSelector ) ) {
        throw new Error("'selector' must be string, array, object or function");
    }

    const $ = cheerio.load(html);

    let selector = _.isObjectLike(originalSelector) ? originalSelector : {default:originalSelector};

    let elements = [];
    let data = _.isArrayLike(originalSelector) ? [] : {};
    _.each(selector, (value, key) => {

        if ( _.isFunction( value ) ) {
            elements.push( value.apply(this, [$, data]) );
        }

        if ( _.isString( value ) ) {
            $( value ).each((i, el) => {
                elements.push( $(el).text().replace(/\s+\n+\s+/g, "\n").trim() );
            });
        }

        data[key] = elements.length > 1 ? elements : elements[0];
        elements = [];

    });

    return _.isObjectLike(originalSelector) ? data : data.default;
};
