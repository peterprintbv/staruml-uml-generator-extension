const PathHelper = require('./path-helper');

const fs = require('fs');
const path = require('path');

class UmlElement {
    static TYPE_MODEL = 'UMLModel';
    static TYPE_CLASS = 'UMLClass';
    static TYPE_PACKAGE = 'UMLPackage';
    static TYPE_OPERATION = 'UMLPackage';
    static TYPE_ATTRIBUTE = 'UMLPackage';

    static availableTypes = [
        UmlElement.TYPE_MODEL,
        UmlElement.TYPE_CLASS,
        UmlElement.TYPE_PACKAGE,
        UmlElement.TYPE_OPERATION,
        UmlElement.TYPE_ATTRIBUTE
    ];

    parentId = '';
    name = '';
    id = '';
    type = UmlElement.TYPE_PACKAGE;

    /**
     * @type {UmlElement[]}
     */
    ownedElements = [];

    /**
     * @type {UmlElement[]}
     */
    attributes = [];

    /**
     * @type {UmlElement[]}
     */
    operations = [];

    /**
     * @param {String} parentId
     * @param {String} name
     * @param {String} type
     * @param {String|null} id
     */
    constructor(parentId, name, type = UmlElement.TYPE_PACKAGE, id = null) {
        if ( !UmlElement.availableTypes.includes(type)) {
            throw new Error(`Given type: ${type} is not a valid type.`);
        }

        if (id === null) {
            id = UmlElement.generateId();
        }

        this.parentId = parentId;
        this.name = name;
        this.type = type;
        this.id = id;
    }

    /**
     * @returns {string}
     */
    static generateId() {
        const randomString = (Math.random() + 1).toString(36).substring(7);
        return 'AAAAAAG' + randomString.toUpperCase();
    }

    /**
     * @param {UmlElement} element
     */
    addOwnedElement(element) {
        this.ownedElements.push(element);
    }

    generateFile() {
        if (this.type === UmlElement.TYPE_CLASS) {
            return;
        }

        const outputDirectory = '/Users/eric/Documents/Docs';

        let directoryPath = PathHelper.buildStarUmlDocsDirectoryForDirectory(this.name);
        const fileName = directoryPath.splice(-1) + '.mdjps';

        directoryPath = outputDirectory + '/' + directoryPath.join('/');
        const filePath = path.join(directoryPath, fileName);

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const content = JSON.stringify(this, null, "\t");
        fs.writeFile(filePath, content, (error) => {
            if (error) {
                console.error('Error writing to file:', error);
            } else {
                console.log('Content written to file successfully.');
            }
        });

        this.ownedElements.forEach((ownedElement) => ownedElement.generateFile());
    }

    toJSON() {
        const splitName = this.name.split('/');

        const defaultObject = {
            '_type': this.type,
            '_id': this.id,
            '_parent': {
                '$ref': this.parentId
            },
            'ownedElements': this.ownedElements,
            'name': splitName[splitName.length - 1],
        };

        if (this.type === UmlElement.TYPE_MODEL) {
            defaultObject.ownedElements = [];
        }

        if (this.attributes.length > 0) {
            defaultObject.attributes = this.attributes;
        }

        if (this.operations.length > 0) {
            defaultObject.operations = this.operations;
        }

        return defaultObject;
    }
}

module.exports = UmlElement;