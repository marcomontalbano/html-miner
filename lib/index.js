/* eslint-disable no-use-before-define */

const cheerio = require('cheerio');
const _ = require('lodash');

const validateSelector = (selector) => {
    if (!_.isString(selector) && !_.isArrayLike(selector) && !_.isObjectLike(selector) && !_.isFunction(selector)) {
        throw new Error('"selector" must be string, array, object or function');
    }
};

const validateHtml = (html) => {
    // 'html' is undefined
    if (html === undefined || html === null) {
        return false;
    }

    // html must be string or cheerio
    if (!_.isString(html) && !html.type) {
        return false;
    }

    return true;
};

const specialKeys = {

    _each_: (specialKeySelector, selector, memo) => {
        let elements;
        const $specialKeySelector = memo.$scope.find(specialKeySelector);

        if ($specialKeySelector.length === 0) {
            return [];
        }

        $specialKeySelector.each((i, el) => {
            const element = htmlMiner(el, selector, {
                ...memo,
                manipulator: '_each_',
            });

            // remove empty objects.
            if (!_.isEmpty(element)) {
                if (element._eachId_) { // if _eachId_ is specified, use it as object ID
                    elements = elements || {};
                    elements[element._eachId_] = element;
                    delete element._eachId_;
                } else {
                    elements = elements || [];
                    elements.push(element);
                }
            }
        });

        return elements;
    },

    _container_(specialKeySelector, selector, memo) {
        const $specialKeySelector = memo.$scope.find(specialKeySelector);

        if ($specialKeySelector.length === 0) {
            return {};
        }

        return htmlMiner($specialKeySelector.get(0), selector, {
            ...memo,
            manipulator: '_container_',
        });
    },

};

const fetchSpecialKeys = (selector, memo) => {
    let elements;

    _.each(specialKeys, (specialKeyFunction, specialKeyName) => {
        if (selector[specialKeyName] !== undefined) {
            let specialKeySelector = selector[specialKeyName];

            // selector must be string or function
            if (!_.isString(specialKeySelector) && !_.isFunction(specialKeySelector)) {
                throw new Error('"selector" of a special key must be string or function');
            }

            // special key - selector could be a complex function
            if (_.isFunction(specialKeySelector)) {
                specialKeySelector = specialKeySelector({
                    globalData: memo.globalData,
                });
            }

            elements = specialKeyFunction(specialKeySelector, _.omit(selector, [specialKeyName]), memo);
        }
    });

    return elements;
};

const fetchSelector = (html, selector, memo, scopeData) => {
    const elements = [];

    const $scope = typeof html === 'string' ? memo.$scope : memo.$(html);

    // eslint-disable-next-line default-case
    switch (true) {
        case _.isObjectLike(selector):
            elements.push(htmlMiner(html, selector, {
                ...memo,
                $scope,
            }));
            break;

        case _.isFunction(selector):
            elements.push(selector.apply(this, [{
                $: memo.$,
                $scope,
                globalData: memo.globalData,
                scopeData,
            }]));
            break;

        case _.isString(selector):
            $scope.find(selector).each((i, el) => {
                elements.push(_.trim(memo.$(el).text()));
            });
            break;
    }

    return elements;
};

const htmlMiner = (html, originalSelector, memo) => {
    if (validateHtml(html) === false) {
        return undefined;
    }

    validateSelector(originalSelector);

    const selector = _.isObjectLike(originalSelector) ? originalSelector : { _default_: originalSelector };
    const scopeData = _.isArrayLike(originalSelector) ? [] : {};

    if (!memo) {
        const $ = cheerio.load(html);

        // eslint-disable-next-line no-param-reassign
        memo = {
            $,
            $scope: $.root(),
            globalData: scopeData,
            manipulator: undefined,
        };
    }

    let elements = fetchSpecialKeys(selector, memo);

    if (elements !== undefined) {
        return elements;
    }

    _.each(selector, (selectorValue, selectorKey) => {
        elements = fetchSelector(html, selectorValue, memo, scopeData);

        // remove 'undefined' values
        elements = _.filter(elements, (o) => o !== undefined);
        if (elements.length >= 1) {
            scopeData[selectorKey] = elements.length > 1 ? elements : elements[0];
        }
    });

    return _.isObjectLike(originalSelector) ? scopeData : scopeData._default_;
};

module.exports = (html, selector) => htmlMiner(html, selector);
