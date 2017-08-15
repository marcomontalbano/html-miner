'use strict';

const htmlScraper = require('../lib/');

const https = require('https');

const simpleRequest = (host, method, callback) => {

    let html = '';
    let req = https.request({host:host,method:method}, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            html += chunk;
        });
        res.on('end', () => {
            callback.apply(this, [html]);
        });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    req.end();

};

simpleRequest('marcomontalbano.com', 'GET', (html) => {

    let json = htmlScraper(html, {
        title: 'h1',
        links: {
            _each_: '.nav.navbar-nav li',
            text: 'a',
            href: ($) => { return $('a').attr('href'); }
        },
        portfolio: {
            _each_: '.portfolio',
            title: '.content .title',
            description: '.content .description',
            ribbon: '.ribbon',
            image: ($) => { return $('img').attr('src'); }
        }
    });

    process.stdout.write( JSON.stringify(json) );

});
