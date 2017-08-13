'use strict';

const assert  = require('assert');
const htmlMiner = require('../lib/');
const fs = require('fs');

describe('htmlMiner', () => {

    let html;

    before(function (done) {
        fs.readFile(`${ __dirname }/html/getbootstrap.html`, 'utf8', (err, data) => {
            if (err) done(err);
            html = data;
            done();
        });
    })

    //
    describe('should throw an exception', () => {

        it('given a number', () => {
            assert.throws(() => { htmlMiner(html, 4) });
        });

        it('given a boolean', () => {
            assert.throws(() => { htmlMiner(html, true) });
        });

    });

    //
    describe('should returns a string', () => {

        it('given a string (e.g. \'h1\')', () => {
            let actual = htmlMiner(html, 'h1');
            assert.equal(actual, 'Hello, world!');
        });

        it('given a string (e.g. \'.nav-item.active > a\')', () => {
            let actual = htmlMiner(html, '.nav-item.active > a');
            assert.equal(actual, 'Home (current)');
        });

        it('given a function', () => {
            let actual = htmlMiner(html, ($) => {
                $('.nav-item.active > a > span').remove();
                return $('.nav-item.active > a').text().trim();
            });
            assert.equal(actual, 'Home');
        });

    });

    //
    describe('should returns an array', () => {

        it('given a string (e.g. \'h2\')', () => {
            let actual = htmlMiner(html, 'h2');
            assert.deepStrictEqual(actual, Array(3).fill('Heading'));
        });

        it('given an array', () => {
            let actual = htmlMiner(html, ['h1', 'h2']);

            assert.deepStrictEqual(actual, [
                'Hello, world!',
                Array(3).fill('Heading')
            ]);
        });

    });

    //
    describe('should returns an object', () => {

        it('given an object', () => {
            let actual = htmlMiner(html, {
                title    : 'h1',
                headings : 'h2',
                footer   : {
                    copyright : 'footer p'
                }
            });

            assert.deepStrictEqual(actual, {
                title    : 'Hello, world!',
                headings : Array(3).fill('Heading'),
                footer   : {
                    copyright : '© Company 2017'
                }
            });
        });

    });

    //
    describe('given an object', () => {

        it('should execute the defined callback', () => {
            let actual = htmlMiner(html, {
                greet : $ => 'Hello, world!',
            });

            assert.deepStrictEqual(actual, {
                greet : 'Hello, world!'
            });
        });

        it('should execute the defined callback using previousData', () => {
            let actual = htmlMiner(html, {
                title : 'h1',
                uppertitle : ($, previousData) => {
                    return previousData.title.toUpperCase();
                },
            });

            assert.deepStrictEqual(actual, {
                title : 'Hello, world!',
                uppertitle : 'HELLO, WORLD!'
            });
        });

        it('test \'_each_\' functionality', () => {
            let actual = htmlMiner(html, {
                title    : 'h1',
                headings : 'h2',
                articles : {
                    _each_ : '.col-md-4',
                    title  : 'h2',
                    text   : 'p:first-of-type',
                }
            });

            assert.deepStrictEqual(actual, {
                title    : 'Hello, world!',
                headings : Array(3).fill('Heading'),
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

});