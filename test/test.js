'use strict';

var htmlMiner = require('../lib/');

var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');
var path = require('path');

describe('htmlMiner', function() {

    var html;

    before(function(done) {
        fs.readFile(path.join(__dirname, '/html/getbootstrap.html'), 'utf8', function(err, data) {
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

        it('when \'selector\' for a special key is not a string or function', function() {
            assert.throws(function() {
                htmlMiner(html, {
                    footer: {
                        _container_: {
                            something: 1
                        }
                    }
                });
            });

            assert.throws(function() {
                htmlMiner(html, {
                    footer: {
                        _container_: [1]
                    }
                });
            });
        });

    });


    //
    describe('should returns an undefined', function() {

        it('given an incorrect html (e.g. \'undefined\')', function() {
            var actual = htmlMiner(undefined, 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an incorrect html (e.g. \'null\')', function() {
            var actual = htmlMiner(null, 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an incorrect html (e.g. \'{}\')', function() {
            var actual = htmlMiner({}, 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an incorrect html (e.g. \'[]\')', function() {
            var actual = htmlMiner([], 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an inexistent tag name (e.g. \'foo\')', function() {
            var actual = htmlMiner(html, 'foo');
            assert.strictEqual(actual, undefined);
        });

    });

    //
    describe('should returns a string', function() {

        it('given a string (e.g. \'h1\')', function() {
            var actual = htmlMiner(html, 'h1');
            assert.strictEqual(actual, 'Hello, world!');
        });

        it('given a string (e.g. \'.nav-item.active > a\')', function() {
            var actual = htmlMiner(html, '.nav-item.active > a');
            assert.strictEqual(actual, 'Home (current)');
        });

        it('given a function', function() {
            var actual = htmlMiner(html, function(arg) {
                arg.$('.nav-item.active > a > span').remove();
                return arg.$('.nav-item.active > a').text().trim();
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
                greet: function() { return 'Hello, world!'; }
            });

            assert.deepEqual(actual, {
                greet: 'Hello, world!'
            });
        });

        it('should execute the defined callback using \'$\'', function() {
            var actual = htmlMiner(html, {
                title: function(arg) {
                    return arg.$('h1').text();
                }
            });
            
            assert.deepEqual(actual, {
                title: 'Hello, world!'
            });
        });

        it('should execute the defined callback using \'$scope\'', function() {
            var actual = htmlMiner(html, {
                title: 'h1',
                lang: function(arg) {
                    return arg.$scope.find('html').attr('lang');
                },
                sublist: {
                    lang: function(arg) {
                        return arg.$scope.find('html').attr('lang');
                    }
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
                    uppertitle: function(arg) {
                        return arg.globalData.title.toUpperCase();
                    }
                }
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
                titleLength: function(arg) {
                    return arg.scopeData.title.length;
                },
                sublist: {
                    subtitle: 'h1 ~ p:first-of-type',
                    titleLength: function(arg) {
                        return arg.scopeData.title; // this is undefined
                    },
                    subtitleLength: function(arg) {
                        return arg.scopeData.subtitle.length;
                    }
                }
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                titleLength: 13,
                sublist: {
                    subtitle: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    subtitleLength: 214
                }
            });
        });

    });

    describe('special keys', function() {

        it('test \'_each_\'', function() {
            var actual = htmlMiner(html, {
                title: 'h1',
                headings: 'h2',
                scrips: {
                    _each_: 'script',
                    src: function(arg) {
                        return arg.$scope.attr('src');
                    }
                },
                articlesLength : function(arg) {
                    return arg.$scope.find('.col-md-4').length;
                },
                articles: {
                    _each_: '.col-md-4',
                    title: 'h2',
                    text: 'p:first-of-type',
                    isOk: function(arg) {
                        return arg.$scope.hasClass('col-md-4');
                    }
                }
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                headings: ['Heading', 'Heading', 'Heading'],
                scrips: [
                    { src: 'https://code.jquery.com/jquery-3.2.1.slim.min.js' },
                    { src: 'http://getbootstrap.com/assets/js/vendor/popper.min.js' },
                    { src: 'http://getbootstrap.com/dist/js/bootstrap.min.js' },
                    { src: 'http://getbootstrap.com/assets/js/ie10-viewport-bug-workaround.js' }
                ],
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

        it('\'_each_\' can returns an empty Array', function () {
            var actual = htmlMiner(html, {
                articles: {
                    _each_: '.col-md-30',
                    title: 'h2',
                    text: 'p:first-of-type'
                }
            });

            assert.deepEqual(actual, {
                articles: []
            });
        });

        it('test \'_eachId_\'', function () {
            var actual = htmlMiner(html, {
                articles: {
                    _each_: '.col-md-4',
                    title: 'h2',
                    _eachId_: function (arg) {
                        return arg.$scope.data('id');
                    }
                }
            });

            assert.deepEqual(actual, {
                articles: {
                    '1': {
                        title: 'Heading'
                    },
                    '2': {
                        title: 'Heading'
                    },
                    '3': {
                        title: 'Heading'
                    }
                }
            });
        });

        it('test \'_container_\'', function() {
            var actual = htmlMiner(html, {
                footer: {
                    _container_: 'footer',
                    copyright: function(arg) { return arg.$scope.text().trim(); },
                    year: function(arg) { return parseInt(arg.scopeData.copyright.match(/[0-9]+/)[0], 10); },
                    isFooter: function(arg) {
                        return arg.$scope.is('footer');
                    }
                }
            });

            assert.deepEqual(actual, {
                footer: {
                    copyright: '© Company 2017',
                    year: 2017,
                    isFooter: true
                }
            });
        });

        it('\'_container_\' should work also with a function as value', function() {
            var actual = htmlMiner(html, {
                footer: {
                    _container_: function(arg) { return arg.$('footer'); },
                    copyright: function(arg) { return arg.$scope.text().trim(); },
                    year: function(arg) { return parseInt(arg.scopeData.copyright.match(/[0-9]+/)[0], 10); },
                    isFooter: function(arg) {
                        return arg.$scope.is('footer');
                    }
                }
            });

            assert.deepEqual(actual, {
                footer: {
                    copyright: '© Company 2017',
                    year: 2017,
                    isFooter: true
                }
            });
        });

    });

    it('should work with complex combination', function() {

        var actual = htmlMiner(html, {
            title: 'h1',
            subtitle: 'h1 ~ p:first-of-type',
            mix: [
                'h1',
                'h2',
                function(arg) { return arg.scopeData[0]; },
                [
                    '.dropdown-item'
                ]
            ],
            articles : {
                _each_: '.col-md-4',
                title: 'h2',
                text: 'p:first-of-type',
                $document: function(arg) { return arg.$('h1').text(); },
                $scopeH1: function(arg) { return arg.$scope.find('h1').text(); },
                $scopeH2: function(arg) { return arg.$scope.find('h2').text(); },
                length: function(arg) { return arg.scopeData.text.length; },
                scopeMessage: function(arg) { return arg.scopeData.subtitle; },
                globalMessage: function(arg) { return arg.globalData.subtitle; },
                links: {
                    _each_: 'a',
                    text: function(arg) { return arg.$scope.text().trim(); },
                    href: function(arg) { return arg.$scope.attr('href'); }
                }
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
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    links: [{
                        text: 'View details »',
                        href: '#'
                    }]
                },
                {
                    title: 'Heading',
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    length: 231,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    links: [{
                        text: 'Save settings »',
                        href: '#'
                    }]
                },
                {
                    title: 'Heading',
                    text: 'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                    length: 243,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    links: [{
                        text: 'View details »',
                        href: '#'
                    }]
                }
            ]
        });

    });

});
