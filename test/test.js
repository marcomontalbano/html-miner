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
            var actual = htmlMiner(html, function($) {
                $('.nav-item.active > a > span').remove();
                return $('.nav-item.active > a').text().trim();
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
                title    : 'h1',
                headings : 'h2',
                footer   : {
                    copyright : 'footer p'
                }
            });

            assert.deepEqual(actual, {
                title    : 'Hello, world!',
                headings : ['Heading', 'Heading', 'Heading'],
                footer   : {
                    copyright : '© Company 2017'
                }
            });
        });

    });

    //
    describe('given an object', function() {

        it('should execute the defined callback', function() {
            var actual = htmlMiner(html, {
                greet : function() { return 'Hello, world!'; },
            });

            assert.deepEqual(actual, {
                greet : 'Hello, world!'
            });
        });

        it('should execute the defined callback using scopeData', function() {
            var actual = htmlMiner(html, {
                title : 'h1',
                uppertitle : function($, scopeData) {
                    return scopeData.title.toUpperCase();
                },
            });

            assert.deepEqual(actual, {
                title : 'Hello, world!',
                uppertitle : 'HELLO, WORLD!'
            });
        });

        it('test \'_each_\' functionality', function() {
            var actual = htmlMiner(html, {
                title    : 'h1',
                headings : 'h2',
                articles : {
                    _each_ : '.col-md-4',
                    title  : 'h2',
                    text   : 'p:first-of-type',
                }
            });

            assert.deepEqual(actual, {
                title    : 'Hello, world!',
                headings : ['Heading', 'Heading', 'Heading'],
                articles : [
                    {
                        title : 'Heading',
                        text  : 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    },
                    {
                        title : 'Heading',
                        text  : 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    },
                    {
                        title : 'Heading',
                        text  : 'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                    }
                ]
            });
        });

    });

    it('should work with complex combination', function() {

        var actual = htmlMiner(html, {
            title    : 'h1',
            mix      : [
                'h1',
                'h2',
                function($, scopeData) { return scopeData[0]; },
                [
                    '.dropdown-item',
                    
                ]
            ],
            articles : {
                _each_ : '.col-md-4',
                title  : 'h2',
                text   : 'p:first-of-type',
                length : function($, scopeData) { return scopeData.text.length; }
            }
        });

        assert.deepEqual(actual, {
            title    : 'Hello, world!',
            mix : [
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
            articles : [
                {
                    title  : 'Heading',
                    text   : 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    length : 231,
                },
                {
                    title  : 'Heading',
                    text   : 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    length : 231,
                },
                {
                    title  : 'Heading',
                    text   : 'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                    length : 243,
                }
            ]
        });

    });

});