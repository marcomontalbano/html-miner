import { BinaryData, ConstructorOptions, DOMWindow, JSDOM } from 'jsdom'

type jQuery = {
  $: JQueryStatic,
  window: DOMWindow,
  document: Document
}

function jQuery(html?: string | Buffer | BinaryData, options?: ConstructorOptions): jQuery {
  const jsdom = new JSDOM(html, options);

  return {
    $: require('jquery')(jsdom.window),
    document: jsdom.window.document,
    window: jsdom.window
  };
}

export const html = (html: string): JQueryStatic => jQuery(html).$

export const fetch = async (settings: JQuery.AjaxSettings): Promise<JQueryStatic> => {
  const { $, document } = jQuery(undefined, {
    url: settings.url
  })

  await $.ajax(settings).then((html) => {
    if (document.body.parentElement) {
      document.body.parentElement.innerHTML = html
    }
  })

  return $;
}
