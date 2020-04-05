
const chai = require('chai');

const { assert } = chai;
const fs = require('fs');
const path = require('path');

const htmlMiner = require('../lib');

describe('htmlMiner', () => {
    let html;

    before((done) => {
        fs.readFile(path.join(__dirname, '/html/getbootstrap.html'), 'utf8', (err, data) => {
            if (err) { done(err); }
            html = data;
            done();
        });
    });

    //
    describe('should throw an exception', () => {
        it('given a number', () => {
            assert.throws(() => { htmlMiner(html, 4); });
        });

        it('given a boolean', () => {
            assert.throws(() => { htmlMiner(html, true); });
        });

        it('when \'selector\' for a special key is not a string or function', () => {
            assert.throws(() => {
                htmlMiner(html, {
                    footer: {
                        _container_: {
                            something: 1,
                        },
                    },
                });
            });

            assert.throws(() => {
                htmlMiner(html, {
                    footer: {
                        _container_: [1],
                    },
                });
            });
        });
    });


    //
    describe('should returns an undefined', () => {
        it('given an incorrect html (e.g. \'undefined\')', () => {
            const actual = htmlMiner(undefined, 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an incorrect html (e.g. \'null\')', () => {
            const actual = htmlMiner(null, 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an incorrect html (e.g. \'{}\')', () => {
            const actual = htmlMiner({}, 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an incorrect html (e.g. \'[]\')', () => {
            const actual = htmlMiner([], 'div');
            assert.strictEqual(actual, undefined);
        });

        it('given an inexistent tag name (e.g. \'foo\')', () => {
            const actual = htmlMiner(html, 'foo');
            assert.strictEqual(actual, undefined);
        });
    });

    //
    describe('should returns a string', () => {
        it('given a string (e.g. \'h1\')', () => {
            const actual = htmlMiner(html, 'h1');
            assert.strictEqual(actual, 'Hello, world!');
        });

        it('given a string (e.g. \'.nav-item.active > a\')', () => {
            const actual = htmlMiner(html, '.nav-item.active > a');
            assert.strictEqual(actual, 'Home (current)');
        });

        it('given a function', () => {
            const actual = htmlMiner(html, (arg) => {
                arg.$('.nav-item.active > a > span').remove();
                return arg.$('.nav-item.active > a').text().trim();
            });
            assert.equal(actual, 'Home');
        });
    });

    //
    describe('should returns an array', () => {
        it('given a string (e.g. \'h2\')', () => {
            const actual = htmlMiner(html, 'h2');
            assert.deepEqual(actual, ['Heading', 'Heading', 'Heading']);
        });

        it('given an array', () => {
            const actual = htmlMiner(html, ['h1', 'h2']);

            assert.deepEqual(actual, [
                'Hello, world!',
                ['Heading', 'Heading', 'Heading'],
            ]);
        });

        it('given an array with one element', () => {
            const actual = htmlMiner(html, ['h1']);

            assert.deepEqual(actual, [
                'Hello, world!',
            ]);
        });

        it('given an empty array', () => {
            const actual = htmlMiner(html, []);

            assert.deepEqual(actual, []);
        });

        it('given an array with object inside', () => {
            const actual = htmlMiner(html, [{ title: 'h1' }]);

            assert.deepEqual(actual, [{
                title: 'Hello, world!',
            }]);
        });
    });

    //
    describe('should returns an object', () => {
        it('given an object', () => {
            const actual = htmlMiner(html, {
                title: 'h1',
                headings: 'h2',
                footer: {
                    copyright: 'footer p',
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                headings: ['Heading', 'Heading', 'Heading'],
                footer: {
                    copyright: '© Company 2017',
                },
            });
        });
    });

    //
    describe('function in detail', () => {
        it('should execute the defined callback', () => {
            const actual = htmlMiner(html, {
                greet() { return 'Hello, world!'; },
            });

            assert.deepEqual(actual, {
                greet: 'Hello, world!',
            });
        });

        it('should execute the defined callback using \'$\'', () => {
            const actual = htmlMiner(html, {
                title(arg) {
                    return arg.$('h1').text();
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
            });
        });

        it('should execute the defined callback using \'$scope\'', () => {
            const actual = htmlMiner(html, {
                title: 'h1',
                lang(arg) {
                    return arg.$scope.find('html').attr('lang');
                },
                sublist: {
                    lang(arg) {
                        return arg.$scope.find('html').attr('lang');
                    },
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                lang: 'en',
                sublist: {
                    lang: 'en',
                },
            });
        });

        it('should execute the defined callback using \'globalData\'', () => {
            const actual = htmlMiner(html, {
                title: 'h1',
                sublist: {
                    uppertitle(arg) {
                        return arg.globalData.title.toUpperCase();
                    },
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                sublist: {
                    uppertitle: 'HELLO, WORLD!',
                },
            });
        });

        it('should execute the defined callback using \'scopeData\'', () => {
            const actual = htmlMiner(html, {
                title: 'h1',
                titleLength(arg) {
                    return arg.scopeData.title.length;
                },
                sublist: {
                    subtitle: 'h1 ~ p:first-of-type',
                    titleLength(arg) {
                        return arg.scopeData.title; // this is undefined
                    },
                    subtitleLength(arg) {
                        return arg.scopeData.subtitle.length;
                    },
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                titleLength: 13,
                sublist: {
                    // eslint-disable-next-line max-len
                    subtitle: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    subtitleLength: 214,
                },
            });
        });
    });

    describe('special keys', () => {
        it('test \'$scope\' inside \'_each_\' ( https://git.io/JvF9O )', () => {
            const localHtml = `
                <h3>Title 1</h3>
                <p>Text 1A</p>
                <p>Text 1B</p>`;

            const actual = htmlMiner(localHtml, {
                _each_: 'h3',
                title(arg) {
                    return arg.$scope.text();
                },
                paragraphs(arg) {
                    const paragraphs = arg.$scope.nextUntil('h3').toArray();

                    return paragraphs.map((p) => arg.$(p).text());
                },
            });

            assert.deepEqual(actual, [{
                title: 'Title 1',
                paragraphs: ['Text 1A', 'Text 1B'],
            }]);
        });

        it('test \'_each_\'', () => {
            const actual = htmlMiner(html, {
                title: 'h1',
                headings: 'h2',
                scrips: {
                    _each_: 'script',
                    src(arg) {
                        return arg.$scope.attr('src');
                    },
                },
                articlesLength(arg) {
                    return arg.$scope.find('.col-md-4').length;
                },
                articles: {
                    _each_: '.col-md-4',
                    title: 'h2',
                    text: 'p:first-of-type',
                    isOk(arg) {
                        return arg.$scope.hasClass('col-md-4');
                    },
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello, world!',
                headings: ['Heading', 'Heading', 'Heading'],
                scrips: [
                    { src: 'https://code.jquery.com/jquery-3.2.1.slim.min.js' },
                    { src: 'http://getbootstrap.com/assets/js/vendor/popper.min.js' },
                    { src: 'http://getbootstrap.com/dist/js/bootstrap.min.js' },
                    { src: 'http://getbootstrap.com/assets/js/ie10-viewport-bug-workaround.js' },
                ],
                articlesLength: 3,
                articles: [
                    {
                        title: 'Heading',
                        // eslint-disable-next-line max-len
                        text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                        isOk: true,
                    },
                    {
                        title: 'Heading',
                        // eslint-disable-next-line max-len
                        text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                        isOk: true,
                    },
                    {
                        title: 'Heading',
                        // eslint-disable-next-line max-len
                        text: 'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                        isOk: true,
                    },
                ],
            });
        });

        it('\'_each_\' can returns an empty Array', () => {
            const actual = htmlMiner(html, {
                articles: {
                    _each_: '.col-md-30',
                    title: 'h2',
                    text: 'p:first-of-type',
                },
            });

            assert.deepEqual(actual, {
                articles: [],
            });
        });

        it('test \'_eachId_\'', () => {
            const actual = htmlMiner(html, {
                articles: {
                    _each_: '.col-md-4',
                    title: 'h2',
                    _eachId_(arg) {
                        return arg.$scope.data('id');
                    },
                },
            });

            assert.deepEqual(actual, {
                articles: {
                    1: {
                        title: 'Heading',
                    },
                    2: {
                        title: 'Heading',
                    },
                    3: {
                        title: 'Heading',
                    },
                },
            });
        });

        it('test \'_container_\'', () => {
            const actual = htmlMiner(html, {
                footer: {
                    _container_: 'footer',
                    copyright(arg) { return arg.$scope.text().trim(); },
                    year(arg) { return parseInt(arg.scopeData.copyright.match(/[0-9]+/)[0], 10); },
                    isFooter(arg) {
                        return arg.$scope.is('footer');
                    },
                },
            });

            assert.deepEqual(actual, {
                footer: {
                    copyright: '© Company 2017',
                    year: 2017,
                    isFooter: true,
                },
            });
        });

        it('\'_container_\' should work also with a function as value', () => {
            const actual = htmlMiner(html, {
                footer: {
                    _container_() { return 'footer'; },
                    copyright(arg) { return arg.$scope.text().trim(); },
                    year(arg) { return parseInt(arg.scopeData.copyright.match(/[0-9]+/)[0], 10); },
                    isFooter(arg) {
                        return arg.$scope.is('footer');
                    },
                },
            });

            assert.deepEqual(actual, {
                footer: {
                    copyright: '© Company 2017',
                    year: 2017,
                    isFooter: true,
                },
            });
        });
    });

    it('should work combining _each_ and _container_', () => {
        const actual = htmlMiner(html, {
            _each_: '.col-md-4',
            p: {
                _each_: 'p',
                text(arg) {
                    return arg.$scope.text().trim();
                },
                button: {
                    _container_: 'a.btn',
                    text(arg) {
                        return arg.$scope.text().trim();
                    },
                    href(arg) {
                        return arg.$scope.attr('href');
                    },
                },
            },
        });

        assert.deepEqual(actual[0], {
            p: [
                {
                    // eslint-disable-next-line max-len
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    button: {},
                },
                {
                    text: 'View details »',
                    button: {
                        text: 'View details »',
                        href: '#',
                    },
                },
            ],
        });
    });


    it('should work with complex combination', () => {
        const actual = htmlMiner(html, {
            title: 'h1',
            subtitle: 'h1 ~ p:first-of-type',
            mix: [
                'h1',
                'h2',
                (arg) => arg.scopeData[0],
                [
                    '.dropdown-item',
                ],
            ],
            articles: {
                _each_: '.col-md-4',
                title: 'h2',
                text: 'p:first-of-type',
                $document(arg) { return arg.$('h1').text(); },
                $scopeH1(arg) { return arg.$scope.find('h1').text(); },
                $scopeH2(arg) { return arg.$scope.find('h2').text(); },
                length(arg) { return arg.scopeData.text.length; },
                scopeMessage(arg) { return arg.scopeData.subtitle; },
                globalMessage(arg) { return arg.globalData.subtitle; },
                links: {
                    _each_: 'a',
                    text(arg) { return arg.$scope.text().trim(); },
                    href(arg) { return arg.$scope.attr('href'); },
                },
                button: {
                    _container_: 'a.btn',
                    text(arg) {
                        return arg.$scope.text();
                    },
                    href(arg) {
                        return arg.$scope.attr('href');
                    },
                },
            },
        });

        assert.deepEqual(actual, {
            title: 'Hello, world!',
            // eslint-disable-next-line max-len
            subtitle: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
            mix: [
                'Hello, world!',
                ['Heading', 'Heading', 'Heading'],
                'Hello, world!',
                [
                    [
                        'Action',
                        'Another action',
                        'Something else here',
                    ],
                ],
            ],
            articles: [
                {
                    title: 'Heading',
                    // eslint-disable-next-line max-len
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    length: 231,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    // eslint-disable-next-line max-len
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    links: [{
                        text: 'View details »',
                        href: '#',
                    }],
                    button: {
                        text: 'View details »',
                        href: '#',
                    },
                },
                {
                    title: 'Heading',
                    // eslint-disable-next-line max-len
                    text: 'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.',
                    length: 231,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    // eslint-disable-next-line max-len
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    links: [{
                        text: 'Save settings »',
                        href: '#',
                    }],
                    button: {
                        text: 'Save settings »',
                        href: '#',
                    },
                },
                {
                    title: 'Heading',
                    // eslint-disable-next-line max-len
                    text: 'Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                    length: 243,
                    $scopeH1: '',
                    $scopeH2: 'Heading',
                    $document: 'Hello, world!',
                    // eslint-disable-next-line max-len
                    globalMessage: 'This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.',
                    links: [{
                        text: 'View details »',
                        href: '#',
                    }],
                    button: {
                        text: 'View details »',
                        href: '#',
                    },
                },
            ],
        });
    });
});
