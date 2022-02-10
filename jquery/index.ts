import * as jQuery from './jQuery'

(async function () {
  {
    const $ = jQuery.html('<div>Hello <span>World</span>!</div>')

    console.log($('div span').text())
  }

  {
    const $ = await jQuery.fetch({
      url: 'https://www.marcomontalbano.com'
    })

    console.log($('head title').text())
  }
})()
