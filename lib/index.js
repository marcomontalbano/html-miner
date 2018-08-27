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

var _validateHtml = function(html) {

    // 'html' is undefined
    if ( html === undefined || html === null ) {
        return false;
    }

    // html must be string or cheerio
    if ( ! _.isString(html) && !html.type ) {
        return false;
    }

    return true;
};

var _fetchSpecialKeys = function($, selector, memo)
{
    var _specialKeys = {

        _each_ : function($, specialKeySelector, selector, memo) {

            var elements, element, $specialKeySelector = $(specialKeySelector);

            if ($specialKeySelector.length === 0) {
                return [];
            }

            $specialKeySelector.each(function(i, el) {
                element = _htmlMiner(el, selector, {
                    $document   : memo.$document,
                    globalData  : memo.globalData,
                    manipulator : '_each_'
                });

                // remove empty objects.
                if (!_.isEmpty(element)) {
                    if (element._eachId_) { // if _eachId_ is specified, use it as object ID
                        elements = elements || {};
                        elements[element._eachId_] = element;
                        delete element['_eachId_'];
                    } else {
                        elements = elements || [];
                        elements.push(element);
                    }
                }
            });
            return elements;

        },

        _container_ : function($, specialKeySelector, selector, memo) {

            return _htmlMiner($(specialKeySelector).get(0), selector, {
                $document   : memo.$document,
                globalData  : memo.globalData,
                manipulator : '_container_'
            });

        }

    };

    var elements;
    _.each(_specialKeys, function(value, key) {
        if ( selector[key] !== undefined ) {
            var specialKeySelector = selector[ key ];

            // selector must be string or function
            if ( ! _.isString( specialKeySelector ) && ! _.isFunction( specialKeySelector ) ) {
                throw new Error('"selector" of a special key must be string or function');
            }

            // special key - selector could be a complex function
            if ( _.isFunction( specialKeySelector ) ) {
                specialKeySelector = specialKeySelector.apply(this, [{
                    $          : memo.$document,
                    $scope     : (memo.manipulator !== undefined) ? $.root().children() : $.root(),
                    globalData : memo.globalData,
                    scopeData  : {}
                }]);
            }

            var _selector = _.cloneDeepWith(selector);
            delete _selector[ key ];

            elements = value($, specialKeySelector, _selector, memo);
        }
    });

    return elements;
};

var _fetchSelector = function(html, selector, memo, $, scopeData) {

    var elements = [];

    switch (true) {

        case _.isObjectLike( selector ):
            elements.push( _htmlMiner(html, selector, {
                $document  : memo.$document,
                globalData : memo.globalData
            }) );
            break;

        case _.isFunction( selector ):
            elements.push( selector.apply(this, [{
                $          : memo.$document,
                $scope     : (memo.manipulator !== undefined) ? $.root().children() : $.root(),
                globalData : memo.globalData,
                scopeData  : scopeData
            }]) );
            break;

        case _.isString( selector ):
            $( selector ).each(function(i, el) {
                elements.push( _.trim( $(el).text() ) );
            });
            break;

    }

    return elements;

};

var _htmlMiner = function(html, originalSelector, memo) {

    if ( _validateHtml(html) === false ) {
        return undefined;
    }

    _validateSelector( originalSelector );

    var   $         = cheerio.load(html)
        , selector  = _.isObjectLike(originalSelector) ? originalSelector : { _default_ : originalSelector }
        , scopeData = _.isArrayLike(originalSelector) ? [] : {}
        , elements
    ;

    memo = memo || {
        $document   : $,
        globalData  : scopeData,
        manipulator : undefined
    };

    if ( (elements = _fetchSpecialKeys($, selector, memo)) !== undefined ) {
        return elements;
    }

    _.each(selector, function(selectorValue, selectorKey) {
        elements = _fetchSelector( html, selectorValue, memo, $, scopeData );

        // remove 'undefined' values
        elements = _.filter(elements, function(o) { return o !== undefined; });
        if ( elements.length >= 1 ) {
            scopeData[ selectorKey ] = elements.length > 1 ? elements : elements[0];
        }
    });

    return _.isObjectLike(originalSelector) ? scopeData : scopeData._default_;

};

module.exports = function (html, selector) {
    return _htmlMiner(html, selector);
};
