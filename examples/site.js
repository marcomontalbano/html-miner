
const url = require('url');
const https = require('https');
const htmlMiner = require('../lib');

const simpleRequest = (_url, _method, _callback) => {
    let html = '';
    const options = url.parse(_url);
    options.method = _method || 'GET';
    options.headers = {
        'User-Agent': 'request',
    };

    const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            html += chunk;
        });
        res.on('end', () => {
            _callback.apply(this, [html, options]);
        });
    });

    req.on('error', (e) => {
        process.stdout.write(`problem with request: ${e.message}`);
    });

    req.end();
};

simpleRequest('https://marcomontalbano.com', 'GET', (html) => {
    const json = htmlMiner(html, {
        title: 'h1',
        links: {
            _each_: '.nav.navbar-nav li',
            text: 'a',
            href(arg) { return arg.$scope.find('a').attr('href'); },
        },
        portfolio: {
            _each_: '.portfolio',
            title: '.content .title',
            description: '.content .description',
            ribbon: '.ribbon',
            image(arg) { return arg.globalData.links[0].href + arg.$scope.find('img').attr('src'); },
        },
    });

    process.stdout.write(JSON.stringify(json));
});
