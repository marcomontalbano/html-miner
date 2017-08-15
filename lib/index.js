'use strict';

var cheerio = require('cheerio');
var _ = require('lodash');

var htmlMiner = function(html, originalSelector) {

    if (
        ! _.isString( originalSelector ) &&
        ! _.isArrayLike( originalSelector ) &&
        ! _.isObjectLike( originalSelector ) &&
        ! _.isFunction( originalSelector ) ) {
        throw new Error('"selector" must be string, array, object or function');
    }

    var $ = cheerio.load(html);

    var selector = _.isObjectLike(originalSelector) ? originalSelector : {_default_:originalSelector};

    var elements = [];

    if ( selector._each_ ) {
        $(selector._each_).each(function(i, el) {
            delete selector['_each_'];
            elements.push( htmlMiner(el, selector) );
        });
        return elements;
    }

    var data = _.isArrayLike(originalSelector) ? [] : {};
    _.each(selector, function(value, key) {
        elements = [];

        if ( _.isObjectLike( value ) ) {
            elements.push( htmlMiner(html, value) );
        }

        if ( _.isFunction( value ) ) {
            elements.push( value.apply(this, [$, data]) );
        }

        if ( _.isString( value ) ) {
            $( value ).each(function(i, el) {
                elements.push( _.trim( $(el).text() ) );
            });
        }

        data[key] = elements.length > 1 ? elements : elements[0];

    });

    return _.isObjectLike(originalSelector) ? data : data._default_;

};


module.exports = htmlMiner;
