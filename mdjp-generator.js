const PathHelper = require('./path-helper')
const Element = require('./uml-element')
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

        elements.forEach((element) => element.generateFile());
    }

    /**
     * @param {String} directory
     * @param {String[]} files
     * @param {Element|null} parentElement
     * @returns {Element}
     */
    static buildElementForFile(directory, files, parentElement = null) {
        let parentId = Element.generateId();

        let type = files.length === 0 ? Element.TYPE_CLASS : Element.TYPE_PACKAGE;

        if (parentElement !== null) {
            parentId = parentElement.id;
        } else {
            type = Element.TYPE_MODEL;
        }


        const element = new Element(parentId, directory, type);

        files.forEach((file) => {
            const {directory, files} = file;
            element.addOwnedElement(MDJPGenerator.buildElementForFile(directory, files, element));
        });

        return element;
    }

}

module.exports = MDJPGenerator;