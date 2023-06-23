class UmlElement {
    static TYPE_MODEL = 'UMLModel';
    static TYPE_CLASS = 'UMLClass';
    static TYPE_PACKAGE = 'UMLPackage';
    static TYPE_OPERATION = 'UMLOperation';
    static TYPE_PARAMETER = 'UMLParameter';
    static TYPE_ATTRIBUTE = 'UMLPackage';

    static availableTypes = [
        UmlElement.TYPE_MODEL,
        UmlElement.TYPE_CLASS,
        UmlElement.TYPE_PACKAGE,
        UmlElement.TYPE_OPERATION,
        UmlElement.TYPE_PARAMETER,
        UmlElement.TYPE_ATTRIBUTE
    ];

    parentId = '';
    name = '';
    id = '';
    type = UmlElement.TYPE_PACKAGE;

    parameterType = null;

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
     * @type {UmlElement[]}
     */
    parameters = [];

    /**
     * @param {String} parentId
     * @param {String} name
     * @param {String} type
     * @param {String|null} id
     * @param {String|null} parameterType
     */
    constructor(
        parentId,
        name,
        type = UmlElement.TYPE_PACKAGE,
        id = null,
        parameterType = null,
    ) {
        if ( !UmlElement.availableTypes.includes(type)) {
            throw new Error(`Given type: ${type} is not a valid type.`);
        }

        if (id === null) {
            id = UmlElement.generateId();
        }

        this.parentId = parentId;
        this.name = name;
        this.type = type;
        this.parameterType = parameterType;
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

    /**
     * @param {UmlElement} element
     */
    addOperation(element) {
        this.operations.push(element);
    }

    /**
     * @param {UmlElement} element
     */
    addParameters(element) {
        this.parameters.push(element);
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

        if (this.parameters.length > 0) {
            defaultObject.parameters = this.parameters;
        }

        if (this.parameterType !== null) {
            defaultObject.type = this.parameterType;
        }

        return defaultObject;
    }
}

module.exports = UmlElement;