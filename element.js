const PathHelper = require('./path-helper');

const fs = require('fs');
const path = require('path');

class Element {
    static TYPE_MODEL = 'UMLModel';
    static TYPE_CLASS = 'UMLClass';
    static TYPE_PACKAGE = 'UMLPackage';
    static TYPE_OPERATION = 'UMLPackage';
    static TYPE_ATTRIBUTE = 'UMLPackage';

    static availableTypes = [
        Element.TYPE_MODEL,
        Element.TYPE_CLASS,
        Element.TYPE_PACKAGE,
        Element.TYPE_OPERATION,
        Element.TYPE_ATTRIBUTE
    ];

    parentId = '';
    name = '';
    id = '';
    type = Element.TYPE_PACKAGE;

    /**
     * @type {Element[]}
     */
    ownedElements = [];

    /**
     * @type {Element[]}
     */
    attributes = [];

    /**
     * @type {Element[]}
     */
    operations = [];

    /**
     * @param {String} parentId
     * @param {String} name
     * @param {String} type
     * @param {String|null} id
     */
    constructor(parentId, name, type = Element.TYPE_PACKAGE, id = null) {
        if ( !Element.availableTypes.includes(type)) {
            throw new Error(`Given type: ${type} is not a valid type.`);
        }

        if (id === null) {
            id = Element.generateId();
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
     * @param {Element} element
     */
    addOwnedElement(element) {
        this.ownedElements.push(element);
    }

    generateFile() {
        if (this.type === Element.TYPE_CLASS) {
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

        if (this.type === Element.TYPE_MODEL) {
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

module.exports = Element;