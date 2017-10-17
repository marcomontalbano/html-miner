var rest          = require('rest');
var htmlMiner     = require('../lib/');
var configuration = require('./configuration');

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
    });

    object_asString = object_asString.replace(/\\n/g, "\n");               // add "break-line"
    object_asString = object_asString.replace(/\"function/g, "function");  // manage opening functions
    object_asString = object_asString.replace(/}\"/g, "}");                // manage closing functions
    object_asString = object_asString.replace(/\"([\w]+)\":/g, '$1:');     // remove double quotes from keys
    object_asString = js_beautify(object_asString, {indent_size:2});
    return object_asString;
};

var actionRunHandler = function() {
    try {
        var selector = eval('(function() { return ' + jsonEditor_input.getValue() + '; }())');
        var json     = htmlMiner(htmlEditor.getValue(), selector) || '';
        jsonEditor_output.setValue( JSON.stringify(json, null, 2) );
    } catch (e) {
        console.error(e);
        alert(e.message + '.\nOpen console to get more information.');
    }
};

var actionSelectionHandler = function() {
    var config = configuration[ parseInt(this.value, 10) ];

    // empty result
    htmlEditor.setValue( '' );
    jsonEditor_input.setValue('""');
    actionRunHandler();

    if ( config.url !== '' ) {
        rest(config.url).then(function(response) {
            htmlEditor.setValue( html_beautify(response.entity) );
            jsonEditor_input.setValue(convertObjectToString(config.selector));
            actionRunHandler();
        });
    }
};

document.getElementById('actionRun').addEventListener('click', actionRunHandler);
document.getElementById('actionSelection').addEventListener('change', actionSelectionHandler);

actionSelectionHandler.apply({ value: 1 });
