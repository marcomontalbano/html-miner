var rest      = require('rest');
var htmlMiner = require('../lib/');


var   htmlEditor        = CodeMirror(document.getElementById('HTMLEditor'),        { tabSize: 2, lineNumbers: true, mode: 'htmlmixed' })
    , jsonEditor_input  = CodeMirror(document.getElementById('JSONEditor-input'),  { tabSize: 2, lineNumbers: true, mode: 'javascript' })
    , jsonEditor_output = CodeMirror(document.getElementById('JSONEditor-output'), { tabSize: 2, lineNumbers: true, mode: 'javascript', readOnly: 'nocursor' })
;

var convertObjectToString = function(obj)
{
    var object_asString = JSON.stringify(obj, function(key, val) {
        if (typeof val === 'function') {
            return val + ''; // implicitly `toString` it
        }
        return val;
    }, 2);

    object_asString = object_asString.replace(/\\n/g, "\n");               // add "break-line"
    object_asString = object_asString.replace(/\"function/g, "function");  // manage opening functions
    object_asString = object_asString.replace(/}\"/g, "}");                // manage closing functions
    object_asString = object_asString.replace(/\"([\w]+)\":/g, '$1:');     // remove double quotes from keys
    return object_asString;
};

var actionRunHandler = function() {
    try {
        var selector = eval('(function() { return ' + jsonEditor_input.getValue() + '; }())');
        var json     = htmlMiner(htmlEditor.getValue(), selector);
        jsonEditor_output.setValue( JSON.stringify(json, null, 2) );
    } catch (e) {
        console.error(e);
        alert(e.message + '.\nOpen console to get more information.');
    }
};

document.getElementById('actionRun').addEventListener('click', actionRunHandler);


// LOAD BOOTSTRAP DEMO
rest('https://getbootstrap.com/docs/4.0/examples/jumbotron/').then(function(response)
{
    htmlEditor.setValue(response.entity);
    jsonEditor_input.setValue(convertObjectToString({
        scrips: {
            _each_: 'script',
            src: function(arg) {
                return arg.$scope.attr('src');
            },
            code: function(arg) {
                return arg.$scope.text();
            },
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
    }));

    actionRunHandler();
});
