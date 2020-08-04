const chai = require('chai');

const { assert } = chai;

const htmlMiner = require('../lib');

describe('htmlMiner • EXAMPLE.md', () => {
    it('Get text and href from a list of <a>', () => {
        const html = `
            <div>
                <a class="link-class" href="https://example.com/1">Link 1</a>
                <a class="link-class" href="https://example.com/2">Link 2</a>
            </div>
        `;

        const actual = htmlMiner(html, {
            _each_: '.link-class',
            text: (arg) => arg.$scope.text(),
            href: (arg) => arg.$scope.attr('href'),
        });

        assert.deepEqual(actual, [
            {
                text: 'Link 1',
                href: 'https://example.com/1',
            },
            {
                text: 'Link 2',
                href: 'https://example.com/2',
            },
        ]);
    });

    describe('Get src and alt from <img>', () => {
        const html = `
            <img src="/image-1.jpg" alt="Image 1" />
            <img src="/image-2.jpg" alt="Image 2" />
        `;

        const doAssert = (actual) => {
            assert.deepEqual(actual, [
                {
                    src: '/image-1.jpg',
                    alt: 'Image 1',
                },
                {
                    src: '/image-2.jpg',
                    alt: 'Image 2',
                },
            ]);
        };

        it('Selector as function', () => {
            const actual = htmlMiner(html, (arg) => {
                const $images = Array.from(arg.$('img'));
                return $images.map((img) => {
                    const $currentImage = arg.$(img);
                    return {
                        src: $currentImage.attr('src'),
                        alt: $currentImage.attr('alt'),
                    };
                });
            });

            doAssert(actual);
        });

        it('Simpler way', () => {
            const actual = htmlMiner(html, {
                _each_: 'img',
                src: (arg) => arg.$scope.attr('src'),
                alt: (arg) => arg.$scope.attr('alt'),
            });

            doAssert(actual);
        });
    });
});
