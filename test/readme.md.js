'use strict';

const assert  = require('assert');
const htmlMiner = require('../lib/');
const fs = require('fs');

describe('htmlMiner • README.md', () => {

    let html;

    before(function (done) {
        fs.readFile(`${ __dirname }/html/readme.md.html`, 'utf8', (err, data) => {
            if (err) done(err);
            html = data;
            done();
        });
    })

    //
    it('the example should work', () => {
        let actual = htmlMiner(html, {
            title: "h1",
            h2: "h2",
            articles: {
                _each_: '.articles .article',
                title: 'h2',
                content: 'p',
            },
            footer: {
                copyright: 'footer',
                company: 'footer span',
                year: ($, scopeData) => { return scopeData.copyright.match(/[0-9]+/)[0] },
            },
            greet: $ => { return 'Hi!' }
        });
        assert.deepStrictEqual(actual, {
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

});