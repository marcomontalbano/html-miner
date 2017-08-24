'use strict';

var cheerio = require('cheerio');
var _ = require('lodash');

var _validateSelector = function(selector) {
    if (
        ! _.isString( selector ) &&
        ! _.isArrayLike( selector ) &&
        ! _.isObjectLike( selector ) &&
        ! _.isFunction( selector ) ) {
        throw new Error('"selector" must be string, array, object or function');
    }
};

var _htmlMiner = function(html, originalSelector, memo) {

    _validateSelector( originalSelector );

    var   $        = cheerio.load(html)
        , selector = _.isObjectLike(originalSelector) ? originalSelector : { _default_ : originalSelector }
        , elements = []
        , data     = _.isArrayLike(originalSelector) ? [] : {}
    ;

    memo = memo || {
        $document  : $,
        globalData : data,
        referrer   : undefined,
    };

    if ( selector._each_ ) {
        $(selector._each_).each(function(i, el) {
            delete selector._each_;
            elements.push( _htmlMiner(el, selector, {
                $document  : memo.$document,
                globalData : memo.globalData,
                referrer   : '_each_'
            }) );
        });
        return elements;
    }

    _.each(selector, function(value, key) {
        elements = [];

        switch (true) {

        case _.isObjectLike( value ):
            elements.push( _htmlMiner(html, value, {
                $document: memo.$document,
                globalData : memo.globalData,
            }) );
            break;

        case _.isFunction( value ):
            elements.push( value.apply(this, [{
                $          : memo.$document,
                $scope     : (memo.referrer === '_each_') ? $.root().children() : $.root(),
                globalData : memo.globalData,
                scopeData  : data
            }]) );
            break;

        case _.isString( value ):
            $( value ).each(function(i, el) {
                elements.push( _.trim( $(el).text() ) );
            });
            break;

        }

        data[key] = elements.length > 1 ? elements : elements[0];

    });

    return _.isObjectLike(originalSelector) ? data : data._default_;

};

module.exports = function (html, selector) {
    return _htmlMiner(html, selector);
};
