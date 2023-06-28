const FileReader = require("./file-reader");
const UmlGenerator = require("./uml-generator");

/**
 *
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 */
async function handleGenerate (base, path, options) {
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
        app.toast.warning('Aborted generation.');
        return;
    }

    app.toast.info('Starting documentation generation...');

    try {
        const files = FileReader.getFilesForPath(directories[0]);
        const groupFiles = FileReader.groupFilesByDirectory(files);
        UmlGenerator.generateDocs(groupFiles);
    } catch (exception) {
        app.toast.error('Something went wrong while generating documentation! Exception: ' + exception);
    }

    app.toast.info('Documentation generated successfully!');
}

function init () {
    app.commands.register('docs:generate', handleGenerate);
}

exports.init = init;