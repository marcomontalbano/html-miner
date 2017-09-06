'use strict';

var htmlMiner = require('../lib/');

var path = require('path');
var fs = require('fs');

fs.readFile(path.join(__dirname, '../test/html/getbootstrap.html'), 'utf8', function(err, data) {

    if (err) {
        throw err;
    }

    var json = htmlMiner(data, {
        scrips: {
            _each_: 'script',
            src: function(arg) {
                return arg.$scope.attr('src');
            }
            //code: function(arg) {
            //    return arg.$scope.text();
            //},
        },
        asd: 'asd',
        nav: {
            _container_: 'body > nav',
            links: {
                _each_: '.nav-item:not(.dropdown) a',
                text: function(arg) { return arg.$scope.text(); },
                href: function(arg) { return arg.$scope.attr('href'); }
            }
        },
        jumbotron : {
            _container_: 'body > .jumbotron',
            title    : 'h1',
            message  : 'p:first-of-type',
            button   : {
                _container_: 'a.btn',
                text: function(arg) { return arg.$scope.text(); },
                href: function(arg) { return arg.$scope.attr('href'); }
            }
        },
        articles : {
            _each_ : '.col-md-4',
            title  : 'h2',
            text   : 'p:first-of-type',
            button   : {
                _container_: 'a.btn',
                text: function(arg) { return arg.$scope.text(); },
                href: function(arg) { return arg.$scope.attr('href'); }
            }
        },
        footer: {
            copyright: 'footer',
            year: function(arg) { return parseInt(arg.scopeData.copyright.match(/[0-9]+/)[0], 10); }
        }
    });

    process.stdout.write( JSON.stringify(json) );

});
