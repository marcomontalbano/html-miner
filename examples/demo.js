'use strict';

var htmlMiner = require('../lib/');

var path = require('path');
var fs = require('fs');

fs.readFile(path.join(__dirname, '../test/html/getbootstrapd.html'), 'utf8', function(err, data) {

    if (err) {
        throw err;
    }

    var json = htmlMiner(data, {
        title    : 'h1',
        headings : 'h2',
        articles : {
            _each_ : '.col-md-4',
            title  : 'h2',
            text   : 'p:first-of-type'
        },
        footer: {
            copyright: 'footer',
            year: function($, scopeData) { return scopeData.copyright.match(/[0-9]+/)[0]; }
        }
    });

    process.stdout.write( JSON.stringify(json) );

});
