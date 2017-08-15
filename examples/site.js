'use strict';

var htmlScraper = require('../lib/');

var https = require('https');

var simpleRequest = function(host, method, callback) {

    var html = '';
    var req = https.request({host:host,method:method}, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            html += chunk;
        });
        res.on('end', function() {
            callback.apply(this, [html]);
        });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    req.end();

};

simpleRequest('marcomontalbano.com', 'GET', function(html) {

    var json = htmlScraper(html, {
        title: 'h1',
        links: {
            _each_: '.nav.navbar-nav li',
            text: 'a',
            href: function($) { return $('a').attr('href'); }
        },
        portfolio: {
            _each_: '.portfolio',
            title: '.content .title',
            description: '.content .description',
            ribbon: '.ribbon',
            image: function($) { return $('img').attr('src'); }
        }
    });

    process.stdout.write( JSON.stringify(json) );

});
