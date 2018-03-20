var rest          = require('rest');
var htmlMiner     = require('../lib/');

var   htmlEditor        = CodeMirror(document.getElementById('HTMLEditor'),        { tabSize: 2, lineNumbers: true, mode: 'htmlmixed' })
    , jsonEditor_input  = CodeMirror(document.getElementById('JSONEditor-input'),  { tabSize: 2, lineNumbers: true, mode: 'javascript' })
    , jsonEditor_output = CodeMirror(document.getElementById('JSONEditor-output'), { tabSize: 2, lineNumbers: true, mode: 'javascript', readOnly: 'nocursor' })
    , actionUrl         = document.getElementById('actionUrl')
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

var showError = function(show) {
    var output = document.getElementById('JSONEditor-output');
    var classList = output.className.split(' ');

    if (show === true) {
        classList.push('error');
    } else {
        for (var i = classList.length - 1; i >= 0; i--) {
            if (classList[i] === 'error') {
                classList.splice(i, 1);
            }
        }
    }

    output.className = classList.join(' ');
}

var throwError = function(e) {
    if (e) {
        console.error(e);
        jsonEditor_output.setValue(JSON.stringify(e, null, 2));
        showError(true);
    }

    alert((e.message !== undefined ? (e.message + '.\n') : 'Error. ') + 'Open console to get more information.');
};

var actionRunHandler = function () {
    showError(false);
    try {
        if (actionUrl.value !== '') {
            rest(actionUrl.value).then(function (response) {
                htmlEditor.setValue(html_beautify(response.entity));
                actionRun();
            }, function(response) {
                throwError(response);
            });
        } else {
            actionRun();
        }
    } catch (e) {
        throwError(e);
    }
};

var actionRun = function () {
    try {
        var selector = eval('(function() { return ' + jsonEditor_input.getValue() + '; }())');
        var json = htmlMiner(htmlEditor.getValue(), selector) || '';
        jsonEditor_output.setValue(JSON.stringify(json, null, 2));
    } catch (e) {
        throwError(e);
    }
};

var actionSelectionHandler = function() {
    showError(false);
    var config = configuration[ parseInt(this.value, 10) ];

    // empty result
    htmlEditor.setValue( '' );
    jsonEditor_input.setValue('""');
    actionRun();

    actionUrl.value = config.url;
    if ( config.url !== '' ) {
        rest(config.url).then(function(response) {
            htmlEditor.setValue( html_beautify(response.entity) );
            jsonEditor_input.setValue(convertObjectToString(config.selector));
            actionRun();
        });
    }
};

document.getElementById('actionRun').addEventListener('click', actionRunHandler);
document.getElementById('actionSelection').addEventListener('change', actionSelectionHandler);

actionSelectionHandler.apply({ value: 1 });
