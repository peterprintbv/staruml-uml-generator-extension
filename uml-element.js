class UmlElement {
    static TYPE_MODEL = 'UMLModel';
    static TYPE_CLASS = 'UMLClass';
    static TYPE_PACKAGE = 'UMLPackage';
    static TYPE_OPERATION = 'UMLOperation';
    static TYPE_PARAMETER = 'UMLParameter';
    static TYPE_ATTRIBUTE = 'UMLAttribute';

    static ATTRIBUTES = 'attributes';
    static OPERATIONS = 'operations';
    static PARAMETERS = 'parameters';

    static availableTypes = [
        UmlElement.TYPE_MODEL,
        UmlElement.TYPE_CLASS,
        UmlElement.TYPE_PACKAGE,
        UmlElement.TYPE_OPERATION,
        UmlElement.TYPE_PARAMETER,
        UmlElement.TYPE_ATTRIBUTE
    ];
}

module.exports = UmlElement;