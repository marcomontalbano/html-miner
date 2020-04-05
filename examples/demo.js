
const path = require('path');
const fs = require('fs');
const htmlMiner = require('../lib');

fs.readFile(path.join(__dirname, '../test/html/getbootstrap.html'), 'utf8', (err, data) => {
    if (err) {
        throw err;
    }

    const json = htmlMiner(data, {
        scrips: {
            _each_: 'script',
            src(arg) {
                return arg.$scope.attr('src');
            },
            // code: function(arg) {
            //    return arg.$scope.text();
            // },
        },
        asd: 'asd',
        nav: {
            _container_: 'body > nav',
            links: {
                _each_: '.nav-item:not(.dropdown) a',
                text(arg) { return arg.$scope.text(); },
                href(arg) { return arg.$scope.attr('href'); },
            },
        },
        jumbotron: {
            _container_: 'body > .jumbotron',
            title: 'h1',
            message: 'p:first-of-type',
            button: {
                _container_: 'a.btn',
                text(arg) { return arg.$scope.text(); },
                href(arg) { return arg.$scope.attr('href'); },
            },
        },
        articles: {
            _each_: '.col-md-4',
            _eachId_(arg) {
                return arg.$scope.data('id');
            },
            title: 'h2',
            text: 'p:first-of-type',
            button: {
                _container_: 'a.btn',
                text(arg) { return arg.$scope.text(); },
                href(arg) { return arg.$scope.attr('href'); },
            },
        },
        footer: {
            copyright: 'footer',
            year(arg) { return parseInt(arg.scopeData.copyright.match(/[0-9]+/)[0], 10); },
        },
    });

    process.stdout.write(JSON.stringify(json));
});
