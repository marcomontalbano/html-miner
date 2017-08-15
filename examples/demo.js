'use strict';

var htmlScraper = require('../lib/');

var fs = require('fs');

fs.readFile(__dirname + '/../test/html/getbootstrap.html', 'utf8', function(err, data) {

    var json = htmlScraper(data, {
        title    : 'h1',
        headings : 'h2',
        articles : {
            _each_ : '.col-md-4',
            title  : 'h2',
            text   : 'p:first-of-type',
        },
        footer: {
            copyright: 'footer',
            year: function($, scopeData) { return scopeData.copyright.match(/[0-9]+/)[0]; },
        }
    });

    process.stdout.write( JSON.stringify(json) );

});
