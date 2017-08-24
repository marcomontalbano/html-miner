'use strict';

var cheerio = require('cheerio');
var _ = require('lodash');

var _htmlMiner = function(options) {

    options = options || {
        html       : undefined,
        selector   : undefined,
        $document  : undefined,
        globalData : undefined,
        referrer   : undefined,
    };

    if (
        ! _.isString( options.selector ) &&
        ! _.isArrayLike( options.selector ) &&
        ! _.isObjectLike( options.selector ) &&
        ! _.isFunction( options.selector ) ) {
        throw new Error('"selector" must be string, array, object or function');
    }

    var $ = cheerio.load(options.html);

    // setup $document
    options.$document = options.$document || $;

    var selector = _.isObjectLike(options.selector) ? options.selector : {_default_:options.selector};

    var elements = [];

    if ( selector._each_ ) {
        $(selector._each_).each(function(i, el) {
            delete selector._each_;
            elements.push( _htmlMiner({
                html       : el,
                selector   : selector,
                $document  : options.$document,
                globalData : options.globalData,
                referrer   : '_each_'
            }) );
        });
        return elements;
    }

    var data = _.isArrayLike(options.selector) ? [] : {};
    options.globalData = options.globalData || data;
    _.each(selector, function(value, key) {
        elements = [];

        switch (true) {

            case _.isObjectLike( value ):
                elements.push( _htmlMiner({
                    html: options.html,
                    selector: value,
                    $document: options.$document,
                    globalData : options.globalData,
                }) );
                break;

            case _.isFunction( value ):
                elements.push( value.apply(this, [{
                    $          : options.$document,
                    $scope     : (options.referrer === '_each_') ? $.root().children() : $.root(),
                    globalData : options.globalData,
                    scopeData  : data
                }]) ); // https://cheerio.js.org/#root
                break;

            case _.isString( value ):
                $( value ).each(function(i, el) {
                    elements.push( _.trim( $(el).text() ) );
                });
                break;

        }

        data[key] = elements.length > 1 ? elements : elements[0];

    });

    return _.isObjectLike(options.selector) ? data : data._default_;

};

module.exports = function (html, selector) {
    return _htmlMiner({
        html: html,
        selector: selector
    });
};
