/* eslint-disable import/no-extraneous-dependencies */

const rest = require('rest');
const htmlMiner = require('../lib');

const editorConfiguration = { tabSize: 2, lineNumbers: true };

const htmlEditor = window.CodeMirror(
    document.getElementById('HTMLEditor'),
    { ...editorConfiguration, mode: 'htmlmixed' },
);

const jsonEditorInput = window.CodeMirror(
    document.getElementById('JSONEditor-input'),
    { ...editorConfiguration, mode: 'javascript' },
);

const jsonEditorOutput = window.CodeMirror(
    document.getElementById('JSONEditor-output'),
    { ...editorConfiguration, mode: 'javascript', readOnly: 'nocursor' },
);

const actionUrl = document.getElementById('actionUrl');
const convertObjectToString = (obj) => {
    let objectAsString = JSON.stringify(obj, (key, val) => {
        if (typeof val === 'function') {
            return `${val}`; // implicitly `toString` it
        }
        return val;
    });

    objectAsString = objectAsString.replace(/\\n/g, '\n'); // add "break-line"
    objectAsString = objectAsString.replace(/"function/g, 'function'); // manage opening functions
    objectAsString = objectAsString.replace(/}"/g, '}'); // manage closing functions
    objectAsString = objectAsString.replace(/"([\w]+)":/g, '$1:'); // remove double quotes from keys
    objectAsString = window.js_beautify(objectAsString, { indent_size: 2 });
    return objectAsString;
};

const showError = (show) => {
    const output = document.getElementById('JSONEditor-output');
    const classList = output.className.split(' ');

    if (show === true) {
        classList.push('error');
    } else {
        for (let i = classList.length - 1; i >= 0; i -= 1) {
            if (classList[i] === 'error') {
                classList.splice(i, 1);
            }
        }
    }

    output.className = classList.join(' ');
};

const throwError = (e) => {
    if (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        jsonEditorOutput.setValue(JSON.stringify(e, null, 2));
        showError(true);
    }

    // eslint-disable-next-line no-alert
    window.alert(`${e.message !== undefined ? (`${e.message}.\n`) : 'Error. '}Open console to get more information.`);
};

const actionRun = () => {
    try {
        // eslint-disable-next-line no-eval
        const selector = eval(`(function() { return ${jsonEditorInput.getValue()}; }())`);
        const json = htmlMiner(htmlEditor.getValue(), selector) || '';
        jsonEditorOutput.setValue(JSON.stringify(json, null, 2));
    } catch (e) {
        throwError(e);
    }
};

const actionRunHandler = () => {
    showError(false);
    try {
        if (actionUrl.value !== '') {
            rest(actionUrl.value).then((response) => {
                htmlEditor.setValue(window.html_beautify(response.entity));
                actionRun();
            }, (response) => {
                throwError(response);
            });
        } else {
            actionRun();
        }
    } catch (e) {
        throwError(e);
    }
};

function actionSelectionHandler() {
    showError(false);
    const config = window.configuration[parseInt(this.value, 10)];

    // empty result
    htmlEditor.setValue('');
    jsonEditorInput.setValue('""');
    actionRun();

    actionUrl.value = config.url;
    if (config.url !== '') {
        rest(config.url).then((response) => {
            htmlEditor.setValue(window.html_beautify(response.entity));
            jsonEditorInput.setValue(convertObjectToString(config.selector));
            actionRun();
        });
    }
}

document.getElementById('actionRun').addEventListener('click', actionRunHandler);
document.getElementById('actionSelection').addEventListener('change', actionSelectionHandler);

actionSelectionHandler.apply({ value: 1 });
