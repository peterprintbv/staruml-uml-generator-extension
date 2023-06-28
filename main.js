const FileReader = require("./file-reader");
const UmlGenerator = require("./uml-generator");

/**
 *
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 */
async function handleGenerate (base, path, options) {
    const directory = await selectDirectory();

    if (directory === null) {
        app.toast.warning('No directory selected. Aborted generating docs.');
        return;
    }

    app.toast.info('Starting documentation generation...');

    try {
        const files = FileReader.getFilesForPath(directory);
        const groupFiles = FileReader.groupFilesByDirectory(files);
        UmlGenerator.generateDocs(groupFiles);
    } catch (exception) {
        app.toast.error('Something went wrong while generating documentation! Exception: ' + exception);
    }

    app.toast.info('Documentation generated successfully!');
}

/**
 * Select the directory using the app open dialog, passing the openDirectory to enforce directory selection.
 * @returns {String|null}
 */
async function selectDirectory() {
    const directories = await app.dialogs.showOpenDialog(
        'Select module to generate docs for',
        undefined,
        [],
        {
            properties: [
                'openDirectory'
            ]
        }
    );

    if (directories === undefined || directories.length === 0) {
        return null;
    }

    return directories[0];
}

function init () {
    app.commands.register('docs:generate', handleGenerate);
}

exports.init = init;