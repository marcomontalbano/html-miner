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

var _manipulate = function($, selector, memo)
{
    var _manipulators = {

        _each_ : function($, itemSelector, selector, memo) {

            var elements = [];
            $(itemSelector).each(function(i, el) {
                elements.push(_htmlMiner(el, selector, {
                    $document   : memo.$document,
                    globalData  : memo.globalData,
                    manipulator : '_each_'
                }));
            });
            return elements;

        },

        _container_ : function($, itemSelector, selector, memo) {

            return _htmlMiner($(itemSelector).get(0), selector, {
                $document   : memo.$document,
                globalData  : memo.globalData,
                manipulator : '_container_'
            });

        },

    };

    var elements;
    _.each(_manipulators, function(value, key) {
        if ( selector[key] !== undefined ) {
            var itemSelector = selector[ key ];
            delete selector[ key ];
            elements = value($, itemSelector, selector, memo);
        }
    });

    return elements;
};

var _htmlMiner = function(html, originalSelector, memo) {

    _validateSelector( originalSelector );

    var   $        = cheerio.load(html)
        , selector = _.isObjectLike(originalSelector) ? originalSelector : { _default_ : originalSelector }
        , data     = _.isArrayLike(originalSelector) ? [] : {}
        , elements
    ;

    memo = memo || {
        $document   : $,
        globalData  : data,
        manipulator : undefined,
    };

    if ( (elements = _manipulate($, selector, memo)) !== undefined ) {
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
                $scope     : (memo.manipulator !== undefined) ? $.root().children() : $.root(),
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
