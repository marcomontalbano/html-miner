/* eslint-disable func-names, object-shorthand, space-before-function-paren */

window.configuration = [
    {
        name: 'empty',
        url: '',
        selector: '',
    },
    {
        name: 'HTML Miner • Simple Selector',
        url: window.location.href,
        selector: {
            title: 'h1',
            charset: function(arg) {
                return arg.$('meta[charset]').attr('charset');
            },
        },
    },
    {
        name: 'HTML Miner • Complex Selector',
        url: window.location.href,
        selector: {
            title: 'h1',
            assets: {
                link: {
                    _each_: 'link',
                    href: function(arg) {
                        return arg.$scope.attr('href');
                    },
                    rel: function(arg) {
                        return arg.$scope.attr('rel');
                    },
                },
                script: {
                    _each_: 'script',
                    src: function(arg) {
                        return arg.$scope.attr('src');
                    },
                },
            },
        },
    },
    {
        name: 'Jumbotron Template for Bootstrap',
        url: 'https://getbootstrap.com/docs/4.0/examples/jumbotron/',
        selector: {
            scrips: {
                _each_: 'script',
                src: function(arg) {
                    return arg.$scope.attr('src');
                },
            },
            asd: 'asd',
            nav: {
                _container_: 'body > nav',
                links: {
                    _each_: '.nav-item:not(.dropdown) a',
                    text: function(arg) { return arg.$scope.text(); },
                    href: function(arg) { return arg.$scope.attr('href'); },
                },
            },
            jumbotron: {
                _container_: 'body > .jumbotron',
                title: 'h1',
                message: 'p:first-of-type',
                button: {
                    _container_: 'a.btn',
                    text: function(arg) { return arg.$scope.text(); },
                    href: function(arg) { return arg.$scope.attr('href'); },
                },
            },
            articles: {
                _each_: '.col-md-4',
                title: 'h2',
                text: 'p:first-of-type',
                button: {
                    _container_: 'a.btn',
                    text: function(arg) { return arg.$scope.text(); },
                    href: function(arg) { return arg.$scope.attr('href'); },
                },
            },
            footer: {
                copyright: 'footer',
                year: function(arg) { return parseInt(arg.scopeData.copyright.match(/[0-9]+/)[0], 10); },
            },
        },
    },
    {
        name: 'marcomontalbano.com',
        url: 'https://marcomontalbano.com',
        selector: {
            title: 'h1',
            links: {
                _each_: '.nav.navbar-nav li',
                text: 'a',
                href: function(arg) { return arg.$scope.find('a').attr('href'); },
            },
            portfolio: {
                _each_: '.portfolio',
                title: '.content .title',
                description: '.content .description',
                ribbon: '.ribbon',
                image: function(arg) { return arg.globalData.links[0].href + arg.$scope.find('img').attr('src'); },
            },
        },
    },
];
