const MDJPReader = require("./file-reader");
const MDJPGenerator = require("./mdjp-generator");

/**
 *
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 */
async function handleGenerate (base, path, options) {
    const { buttonId, returnValue } = await app.dialogs.showTextDialog(
        'Select module to generate docs for'
    );

    if (buttonId !== 'ok') {
        app.toast.warning('Aborted generation');
        return;
    }

    app.toast.info('Starting documentation generation...');

    try {
        const files = MDJPReader.getFilesForPath(returnValue);
        const groupFiles = MDJPReader.groupFilesByDirectory(files);
        MDJPGenerator.generateDocs(groupFiles);
    } catch (exception) {
        app.toast.error('Something went wrong while generating documentation! Exception: ' + exception);
    }

    app.modelExplorer.rebuild();
    app.toast.info('Documentation generated successfully!');
}

function init () {
    app.commands.register('docs:generate', handleGenerate);
}

exports.init = init;