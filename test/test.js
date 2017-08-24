'use strict';

var htmlMiner = require('../lib/');

var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

describe('htmlMiner', function() {

    var html;

    before(function(done) {
        fs.readFile(__dirname + '/html/getbootstrap.html', 'utf8', function(err, data) {
            if (err) { done(err); }
            html = data;
            done();
        });
    });

    //
    describe('should throw an exception', function() {

        it('given a number', function() {
            assert.throws(function() { htmlMiner(html, 4); });
        });

        it('given a boolean', function() {
            assert.throws(function() { htmlMiner(html, true); });
        });

    });


    //
    describe('should returns an undefined', function() {

        it('given an inexistent tag name (e.g. \'foo\')', function() {
            var actual = htmlMiner(html, 'foo');
            assert.equal(actual, undefined);
        });

    });

    //
    describe('should returns a string', function() {

        it('given a string (e.g. \'h1\')', function() {
            var actual = htmlMiner(html, 'h1');
            assert.equal(actual, 'Hello, world!');
        });

        it('given a string (e.g. \'.nav-item.active > a\')', function() {
            var actual = htmlMiner(html, '.nav-item.active > a');
            assert.equal(actual, 'Home (current)');
        });

        it('given a function', function() {
            var actual = htmlMiner(html, function(options) {
                options.$('.nav-item.active > a > span').remove();
                return options.$('.nav-item.active > a').text().trim();
            });
            assert.equal(actual, 'Home');
        });

    });

    //
    describe('should returns an array', function() {

        it('given a string (e.g. \'h2\')', function() {
            var actual = htmlMiner(html, 'h2');
            assert.deepEqual(actual, ['Heading', 'Heading', 'Heading']);
        });

        it('given an array', function() {
            var actual = htmlMiner(html, ['h1', 'h2']);

            assert.deepEqual(actual, [
                'Hello, world!',
                ['Heading', 'Heading', 'Heading']
            ]);
        });

        it('given an array with one element', function() {
            var actual = htmlMiner(html, ['h1']);

            assert.deepEqual(actual, [
                'Hello, world!'
            ]);
        });

        it('given an empty array', function() {
            var actual = htmlMiner(html, []);

            assert.deepEqual(actual, []);
        });

        it('given an array with object inside', function() {
            var actual = htmlMiner(html, [{ title: 'h1' }]);

            assert.deepEqual(actual, [{
                title: 'Hello, world!'
            }]);
        });

    });

    //
    describe('should returns an object', function() {

        it('given an object', function() {
            var actual = htmlMiner(html, {
                title: 'h1',
                headings: 'h2',
                footer: {
                    copyright: 'footer p'
                }
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                headings: ['Heading', 'Heading', 'Heading'],
                footer: {
                    copyright: '© Company 2017'
                }
            });
        });

    });

    //
    describe('function in detail', function() {

        it('should execute the defined callback', function() {
            var actual = htmlMiner(html, {
                greet: function() { return 'Hello, world!'; },
            });

            assert.deepEqual(actual, {
                greet: 'Hello, world!'
            });
        });

        it('should execute the defined callback using \'$\'', function() {
            var actual = htmlMiner(html, {
                title: function(options) {
                    return options.$('h1').text();
                },
            });
            
            assert.deepEqual(actual, {
                title: 'Hello, world!'
            });
        });

        it('should execute the defined callback using \'$scope\'', function() {
            var actual = htmlMiner(html, {
                title: 'h1',
                lang: function(options) {
                    return options.$scope.find('html').attr('lang');
                },
                sublist: {
                    lang: function(options) {
                        return options.$scope.find('html').attr('lang');
                    },
                }
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                lang: 'en',
                sublist: {
                    lang: 'en'
                }
            });
        });

        it('should execute the defined callback using \'globalData\'', function() {
            var actual = htmlMiner(html, {
                title: 'h1',
                sublist: {
                    uppertitle: function(options) {
                        return options.globalData.title.toUpperCase();
                    }
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                sublist: {
                    uppertitle : 'HELLO, WORLD!'
                }
            });
        });

        it('should execute the defined callback using \'scopeData\'', function() {
            var actual = htmlMiner(html, {
                title: 'h1',
                titleLength: function(options) {
                    return options.scopeData.title.length;
                },
                sublist: {
                    subtitle: 'h1 ~ p:first-of-type',
                    titleLength: function(options) {
                        return options.scopeData.title; // this is undefined
                    },
                    subtitleLength: function(options) {
                        return options.scopeData.subtitle.length;
                    }
                }
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                titleLength: 13,
                sublist: {
                    subtitle: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    titleLength: undefined,
                    subtitleLength: 214
                }
            });
        });

    });

    it('test \'_each_\' functionality', function() {
        var actual = htmlMiner(html, {
            title: 'h1',
            headings: 'h2',
            articlesLength : function(options) {
                return options.$scope.find('.col-md-4').length;
            },
            articles: {
                _each_: '.col-md-4',
                title: 'h2',
                text: 'p:first-of-type',
                isOk: function(options) {
                    return options.$scope.hasClass('col-md-4');
                }
            }
        });

        assert.deepEqual(actual, {
            title: 'Hello, world!',
            headings: ['Heading', 'Heading', 'Heading'],
            articlesLength: 3,
            articles: [
                {
                    title: 'Heading',
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    isOk: true
                },
                {
                    title: 'Heading',
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    isOk: true
                },
                {
                    title: 'Heading',
                    text: 'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                    isOk: true
                }
            ]
        });
    });

    it('should work with complex combination', function() {

        var actual = htmlMiner(html, {
            title: 'h1',
            subtitle: 'h1 ~ p:first-of-type',
            mix: [
                'h1',
                'h2',
                function(options) { return options.scopeData[0]; },
                [
                    '.dropdown-item'
                ]
            ],
            articles : {
                _each_: '.col-md-4',
                title: 'h2',
                text: 'p:first-of-type',
                $document: function(options) { return options.$('h1').text(); },
                $scopeH1: function(options) { return options.$scope.find('h1').text(); },
                $scopeH2: function(options) { return options.$scope.find('h2').text(); },
                length: function(options) { return options.scopeData.text.length; },
                scopeMessage: function(options) { return options.scopeData.subtitle; },
                globalMessage: function(options) { return options.globalData.subtitle; }
            }
        });

        assert.deepEqual(actual, {
            title: 'Hello, world!',
            subtitle: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
            mix: [
                'Hello, world!',
                ['Heading', 'Heading', 'Heading'],
                'Hello, world!',
                [
                    [
                        'Action',
                        'Another action',
                        'Something else here'
                    ]
                ]
            ],
            articles: [
                {
                    title: 'Heading',
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    length: 231,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    scopeMessage: undefined,
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.'
                },
                {
                    title: 'Heading',
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    length: 231,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    scopeMessage: undefined,
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.'
                },
                {
                    title: 'Heading',
                    text: 'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                    length: 243,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    scopeMessage: undefined,
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.'
                }
            ]
        });

    });

});