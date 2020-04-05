const chai = require('chai');

const { assert } = chai;
const fs = require('fs');
const path = require('path');

const htmlMiner = require('../lib');

describe('htmlMiner • README.md', () => {
    let exampleHTML;
    const html = '<div class="title">Hello <span>Marco</span>!</div>';

    before((done) => {
        fs.readFile(path.join(__dirname, '/html/readme.md.html'), 'utf8', (err, data) => {
            if (err) { done(err); }
            exampleHTML = data;
            done();
        });
    });

    //
    it('the example should work', () => {
        const actual = htmlMiner(exampleHTML, {
            title: 'h1',
            who: 'h1 span',
            h2: 'h2',
            articlesArray: {
                _each_: '.articles .article',
                title: 'h2',
                content: 'p',
            },
            articlesObject: {
                _each_: '.articles .article',
                _eachId_(arg) {
                    return arg.$scope.data('id');
                },
                title: 'h2',
                content: 'p',
            },
            footer: {
                _container_: 'footer',
                copyright(arg) { return arg.$scope.text().trim(); },
                company: 'span',
                year(arg) { return arg.scopeData.copyright.match(/[0-9]+/)[0]; },
            },
            greet() { return 'Hi!'; },
        });
        assert.deepEqual(actual, {
            title: 'Hello, world!',
            who: 'world',
            h2: ['Heading 1', 'Heading 2', 'Heading 3'],
            articlesArray: [
                {
                    title: 'Heading 1',
                    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                },
                {
                    title: 'Heading 2',
                    content: 'Donec maximus ipsum quis est tempor, sit amet laoreet libero bibendum.',
                },
                {
                    title: 'Heading 3',
                    content: 'Suspendisse viverra convallis risus, vitae molestie est tincidunt eget.',
                },
            ],
            articlesObject: {
                a001: {
                    title: 'Heading 1',
                    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                },
                a002: {
                    title: 'Heading 2',
                    content: 'Donec maximus ipsum quis est tempor, sit amet laoreet libero bibendum.',
                },
                a003: {
                    title: 'Heading 3',
                    content: 'Suspendisse viverra convallis risus, vitae molestie est tincidunt eget.',
                },
            },
            footer: {
                copyright: '© Company 2017',
                company: 'Company',
                year: '2017',
            },
            greet: 'Hi!',
        });
    });

    it('usage • string', () => {
        const actual = htmlMiner(html, '.title');
        assert.equal(actual, 'Hello Marco!');
    });

    it('usage • function', () => {
        const actual = htmlMiner(html, () => 'Hello everyone!');
        assert.equal(actual, 'Hello everyone!');
    });

    it('usage • array', () => {
        const actual = htmlMiner(html, ['.title', 'span']);
        assert.deepEqual(actual, ['Hello Marco!', 'Marco']);
    });

    it('usage • object', () => {
        const actual = htmlMiner(html, {
            title: '.title',
            who: 'span',
        });

        assert.deepEqual(actual, {
            title: 'Hello Marco!',
            who: 'Marco',
        });
    });

    it('usage • combined', () => {
        const actual = htmlMiner(html, {
            title: '.title',
            who: '.title span',
            upper(arg) { return arg.scopeData.who.toUpperCase(); },
        });

        assert.deepEqual(actual, {
            title: 'Hello Marco!',
            who: 'Marco',
            upper: 'MARCO',
        });
    });

    describe('usage • function in detail', () => {
        it('- use of `$`', () => {
            const actual = htmlMiner(html, (arg) => arg.$('.title').text());

            assert.equal(actual, 'Hello Marco!');
        });

        it('- use of `$scope`', () => {
            const actual = htmlMiner(html, {
                title: '.title',
                spanList: {
                    _each_: 'span',
                    value(arg) {
                        return arg.$scope.text();
                    },
                    isUndefined(arg) {
                        return arg.$scope.find('.title').length;
                    },
                },
            });

            assert.deepEqual(actual, {
                title: 'Hello Marco!',
                spanList: [{
                    value: 'Marco',
                    isUndefined: 0,
                }],
            });
        });

        it('- use of `globalData`', () => {
            const actual = htmlMiner(html, {
                title: '.title',
                spanList: {
                    _each_: '.title span',
                    pageTitle(arg) {
                        return arg.globalData.title;
                    },
                    isUndefined(arg) {
                        return arg.globalData.who;
                    },
                },
                who: '.title span',
            });

            assert.deepEqual(actual, {
                title: 'Hello Marco!',
                spanList: [{
                    pageTitle: 'Hello Marco!',
                }],
                who: 'Marco',
            });
        });

        it('- use of `scopeData`', () => {
            const actual = htmlMiner(html, {
                title: '.title',
                upper(arg) { return arg.scopeData.title.toUpperCase(); },
                sublist: {
                    who: '.title span',
                    upper(arg) {
                        return arg.scopeData.who.toUpperCase();
                    },
                    isUndefined(arg) {
                        return arg.scopeData.title;
                    },
                },
            });
            assert.deepEqual(actual, {
                title: 'Hello Marco!',
                upper: 'HELLO MARCO!',
                sublist: {
                    who: 'Marco',
                    upper: 'MARCO',
                },
            });
        });
    });
});
