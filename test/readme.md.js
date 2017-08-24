'use strict';

var htmlMiner = require('../lib/');

var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

describe('htmlMiner • README.md', function() {

    var exampleHTML;
    var html = '<div class="title">Hello <span>Marco</span>!</div>';

    before(function(done) {
        fs.readFile(__dirname + '/html/readme.md.html', 'utf8', function(err, data) {
            if (err) { done(err); }
            exampleHTML = data;
            done();
        });
    });

    //
    it('the example should work', function() {
        var actual = htmlMiner(exampleHTML, {
            title: 'h1',
            h2: 'h2',
            articles: {
                _each_: '.articles .article',
                title: 'h2',
                content: 'p',
            },
            footer: {
                copyright: 'footer',
                company: 'footer span',
                year: function(options) { return options.scopeData.copyright.match(/[0-9]+/)[0]; },
            },
            greet: function() { return 'Hi!'; }
        });
        assert.deepEqual(actual, {
            title: 'Hello, world!',
            h2: ['Heading 1', 'Heading 2', 'Heading 3'],
            articles: [
                {
                    title: 'Heading 1',
                    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                },
                {
                    title: 'Heading 2',
                    content: 'Donec maximus ipsum quis est tempor, sit amet laoreet libero bibendum.',
                },
                {
                    title: 'Heading 3',
                    content: 'Suspendisse viverra convallis risus, vitae molestie est tincidunt eget.',
                }
            ],
            footer: {
                copyright: '© Company 2017',
                company: 'Company',
                year: '2017'
            },
            greet: 'Hi!'
        });
    });

    it('usage • string', function() {
        var actual = htmlMiner(html, '.title');
        assert.equal(actual, 'Hello Marco!');
    });

    it('usage • function', function() {
        var actual = htmlMiner(html, function() { return 'Hello everyone!'; });
        assert.equal(actual, 'Hello everyone!');
    });

    it('usage • array', function() {
        var actual = htmlMiner(html, ['.title', 'span']);
        assert.deepEqual(actual, ['Hello Marco!', 'Marco']);
    });

    it('usage • object', function() {
        var actual = htmlMiner(html, {
            title: '.title',
            who: 'span'
        });

        assert.deepEqual(actual, {
            title: 'Hello Marco!',
            who: 'Marco'
        });
    });

    it('usage • combined', function() {
        var actual = htmlMiner(html, {
            title: '.title',
            who: '.title span',
            upper: function(options) { return options.scopeData.who.toUpperCase(); }
        });

        assert.deepEqual(actual, {
            title: 'Hello Marco!',
            who: 'Marco',
            upper: 'MARCO'
        });
    });

    describe('usage • function in detail', function() {

        it('- use of `options.$`', function() {
            var actual = htmlMiner(html, function(options) {
                return options.$('.title').text();
            });

            assert.equal(actual, 'Hello Marco!');
        });

        it('- use of `options.$scope`', function() {
            var actual = htmlMiner(html, {
                title: '.title',
                spanList: {
                    _each_: 'span',
                    value: function(options) {
                        return options.$scope.text();
                    },
                    isUndefined: function(options) {
                        return options.$scope.find('.title').length;
                    },
                }
            });

            assert.deepEqual(actual, {
                title: 'Hello Marco!',
                spanList: [{
                    value: 'Marco',
                    isUndefined: 0
                }]
            });
        });

        it('- use of `options.globalData`', function() {
            var actual = htmlMiner(html, {
                title: '.title',
                spanList: {
                    _each_: '.title span',
                    pageTitle: function(options) {
                        return options.globalData.title;
                    },
                    isUndefined: function(options) {
                        return options.globalData.who;
                    }
                },
                who: '.title span'
            });

            assert.deepEqual(actual, {
                title: 'Hello Marco!',
                spanList: [{
                    pageTitle: 'Hello Marco!',
                    isUndefined: undefined
                }],
                who: 'Marco'
            });
        });

        it('- use of `options.scopeData`', function() {
            var actual = htmlMiner(html, {
                title: '.title',
                upper: function(options) { return options.scopeData.title.toUpperCase(); },
                sublist: {
                    who: '.title span',
                    upper: function(options) {
                        return options.scopeData.who.toUpperCase();
                    },
                    isUndefined: function(options) {
                        return options.scopeData.title;
                    },
                }
            });
            assert.deepEqual(actual, {
                title: 'Hello Marco!',
                upper: 'HELLO MARCO!',
                sublist: {
                    who: 'Marco',
                    upper: 'MARCO',
                    isUndefined: undefined
                }
            });
        });

    });

});