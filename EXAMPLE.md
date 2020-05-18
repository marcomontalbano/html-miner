# HTML Miner • EXAMPLES

Here I want to collect some common use cases that can help you to better understand how to use `HTML Miner`.

All examples use `ES2015` syntax.

## Selector as `function`

The *htmlMiner* `selector` can be difficult to use because as you can read in the README.md, that can assume different shapes.

One interesting thing is that the `selector` can be also a function, and this is very powerful because you can use the full power of [Cheerio](https://cheerio.js.org/) inside your html.

As you can see, the code below seems like using good old `jQuery`

```js
htmlMiner(html, arg => {
  const $images = Array.from(arg.$('img'));
  return $images.map(img => {
    const $currentImage = arg.$(img);
    return {
      src: $currentImage.attr('src'),
      alt: $currentImage.attr('alt'),
    }
  })
})
```

> The above code is doing totally the same of [Get `src` and `alt` from `<img>`](#get-src-and-alt-from-img)

## Get `text` and `href` from a list of `<a>`

I want to get the `text` and the `href` from a list of `<a>` tags.

```html
<div>
  <a class="link-class" href="https://example.com/1">Link 1</a>
  <a class="link-class" href="https://example.com/2">Link 2</a>
</div>
```

```js
htmlMiner(html, {
  _each_: '.link-class',
  text: arg => arg.$scope.text(),
  href: arg => arg.$scope.attr('href')
})
```

> `_each_` accepts a selector, so you can replace `'.link-class'` with `'a'` to get the same results.

## Get `src` and `alt` from `<img>`

I want to get the `src` and the `alt` from a list of `<img>` tags.

This is totally the same as above.


```html
<img src="/image-1.jpg" alt="Image 1" />
<img src="/image-2.jpg" alt="Image 2" />
```

```js
htmlMiner(html, {
  _each_: 'img',
  src: arg => arg.$scope.attr('src'),
  alt: arg => arg.$scope.attr('alt')
})
```
