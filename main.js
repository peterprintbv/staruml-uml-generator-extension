const FileReader = require("./file-reader");
const UmlGenerator = require("./uml-generator");
const Settings = require("./settings");

/**
 *
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 */
async function handleGenerate (base, path, options) {
    const directory = await selectDirectory();

    if (directory === null) {
        app.toast.warning('No directory selected. Aborted generating documentation.');
        return;
    }

    app.toast.info('Generating documentation...');

    try {
        const files = FileReader.getFilesForPath(directory, Settings.getAllowedExtensions());
        const groupFiles = FileReader.groupFilesByDirectory(files);

        setImmediate(() => {
            UmlGenerator.generateDocs(groupFiles);
            app.toast.info('Documentation generated successfully!');
        });
    } catch (exception) {
        app.toast.error('Something went wrong while generating documentation! Exception: ' + exception);
    }
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
    app.commands.register('docs:generate', async (base, path, options) => {
        handleGenerate(base, path, options);
    });
}

exports.init = init;