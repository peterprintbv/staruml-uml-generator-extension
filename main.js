const MDJPReader = require("./file-reader");
const MDJPGenerator = require("./mdjp-generator");

/**
 *
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 */
function handleGenerate (base, path, options) {
    app.dialogs.showTextDialog("Select module to generate docs for").then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok') {
            const files = MDJPReader.getFilesForPath(returnValue);
            const groupFiles = MDJPReader.groupFilesByDirectory(files);
            MDJPGenerator.generateDocs(groupFiles);

            app.toast.info('Documentation generated successfully!')
        } else {
            app.toast.warning('Aborted generation');
        }
    })
}

function init () {
    app.commands.register('docs:generate', handleGenerate);
}

exports.init = init;