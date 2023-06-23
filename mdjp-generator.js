const PathHelper = require('./path-helper')
const UmlElement = require('./uml-element')
const fs = require('fs');
const path = require('path');

class MDJPGenerator {
    static extensionsFolder = 'PeterPrint';

    /**
     * @param {String[]} groupFiles
     */
    static generateDocs(groupFiles) {
        const elements = groupFiles.map((groupFile) => {
            const {directory, files} = groupFile;
            return MDJPGenerator.buildElementForFile(directory, files);
        });

        elements.forEach((element) => MDJPGenerator.generateFile(element));
    }

    /**
     * @param {UmlElement} element
     */
    static generateFile(element)
    {
        if (element.type === UmlElement.TYPE_CLASS) {
            return;
        }

        const outputDirectory = '/Users/eric/Documents/Docs';

        let directoryPath = PathHelper.buildStarUmlDocsDirectoryForDirectory(element.name);
        const fileName = directoryPath.splice(-1) + '.mdjps';

        directoryPath = outputDirectory + '/' + directoryPath.join('/');
        const filePath = path.join(directoryPath, fileName);

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const content = JSON.stringify(element, null, "\t");
        fs.writeFile(filePath, content, (error) => {
            if (error) {
                console.error('Error writing to file:', error);
            } else {
                console.log('Content written to file successfully.');
            }
        });

        element.ownedElements.forEach((ownedElement) => MDJPGenerator.generateFile(ownedElement));
    }

    /**
     * @param {String} directory
     * @param {String[]} files
     * @param {UmlElement|null} parentElement
     * @returns {UmlElement}
     */
    static buildElementForFile(directory, files, parentElement = null) {
        let parentId = UmlElement.generateId();
        const stats = fs.statSync(directory);

        let type = UmlElement.TYPE_CLASS;

        if (stats.isDirectory()) {
            type = UmlElement.TYPE_PACKAGE;
        }

        if (parentElement !== null) {
            parentId = parentElement.id;
        } else {
            type = UmlElement.TYPE_MODEL;
        }

        const element = new UmlElement(parentId, directory, type);

        files.forEach((file) => {
            const {directory, files} = file;
            element.addOwnedElement(MDJPGenerator.buildElementForFile(directory, files, element));
        });

        return element;
    }

}

module.exports = MDJPGenerator;