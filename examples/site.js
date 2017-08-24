'use strict';

var htmlMiner = require('../lib/');

var _ = require('lodash');
var url = require('url');
var https = require('https');

var simpleRequest = function(_url, _method, _callback) {

    var   html    = ''
        , options = url.parse( _url )
    ;

    options.method = _method || 'GET';
    options.headers = {
        'User-Agent': 'request'
    };

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            html += chunk;
        });
        res.on('end', function() {
            _callback.apply(this, [html, options]);
        });
    });

    req.on('error', function(e) {
        process.stdout.write('problem with request: ' + e.message);
    });

    req.end();

};

simpleRequest('https://marcomontalbano.com', 'GET', function(html, _options) {

    var json = htmlMiner(html, {
        title: 'h1',
        links: {
            _each_: '.nav.navbar-nav li',
            text: 'a',
            href: function(arg) { return arg.$scope.find('a').attr('href'); }
        },
        portfolio: {
            _each_: '.portfolio',
            title: '.content .title',
            description: '.content .description',
            ribbon: '.ribbon',
            image: function(arg) { return _.trimEnd(_options.href, '/') + arg.$scope.find('img').attr('src'); }
        }
    });

    process.stdout.write( JSON.stringify(json) );

});
