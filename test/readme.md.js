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
                year: function($, scopeData) { return scopeData.copyright.match(/[0-9]+/)[0]; },
            },
            greet: function($) { return 'Hi!'; }
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
        var actual = htmlMiner(html, function() { return 'Hello everyone!' });
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
            who: 'span',
            upper: function($, scopeData) { return scopeData.who.toUpperCase(); }
        });

        assert.deepEqual(actual, {
            title: 'Hello Marco!',
            who: 'Marco',
            upper: 'MARCO'
        });
    });

    describe('usage • function powers', function() {

        it('- use of `$`', function() {
            var actual = htmlMiner(html, function($) { return $('.title').text(); });
            assert.equal(actual, 'Hello Marco!');
        });

        it('- use of `scopeData`', function() {
            var actual = htmlMiner(html, {
                title: '.title',
                upper: function($, scopeData) { return scopeData.title.toUpperCase(); },
                sublist: {
                    who: 'span',
                    upper: function($, scopeData) {
                        // 'scopeData.title' is undefined.
                        return scopeData.who.toUpperCase();
                    },
                    isUndefined: function($, scopeData) {
                        return scopeData.title;
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