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

    it('should return a string for a tag (e.g. <h1>)', () => {
        let text = htmlMiner(html, 'h1');
        assert.equal(text, 'Hello, world!');
    });

    it('should return an array of strings for a tag (e.g. <h2>)', () => {
        let text = htmlMiner(html, 'h2');
        assert.deepEqual(text, Array(3).fill('Heading'));
    });

});