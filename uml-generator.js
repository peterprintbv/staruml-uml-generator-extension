const FileReader = require('./file-reader');
const PathHelper = require('./path-helper');
const UmlElement = require('./uml-element');
const Settings = require('./settings');
const fs = require('fs');

class UmlGenerator {
    static returnKey = 'Return';
    static returnDirection = 'return';

    /**
     * @param {String[]} groupFiles
     */
    static generateDocs(groupFiles) {
        groupFiles.forEach((groupFile) => {
            const {directory, files} = groupFile;
            return UmlGenerator.buildElementForFile(directory, files);
        });
    }

    /**
     * @param {*} options
     * @param {Function} callback
     * @returns {*}
     */
    static createModelFromOptions(options, callback)
    {
        const model = app.factory.createModel({
            ...options,
            modelInitializer: callback
        });
        app.modelExplorer.$viewContent.stop();
        return model;
    }

    /**
     * @param {String[]} files
     * @param {Object} parentElement
     */
    static handleFiles(files, parentElement)
    {
        files.forEach((file) => {
            const {directory, files} = file;
            UmlGenerator.buildElementForFile(directory, files, parentElement);
        });
    }

    /**
     * Handles a file from filePath and parentElement. Reads the content, extracts functions and class properties.
     * Elements are created dynamically based on the functions and properties the file contains.
     *
     * @param {String} filePath
     * @param {Object} parentElement
     */
    static handleFile(filePath, parentElement)
    {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            const functions = FileReader.extractFunctionsFromFileContent(fileContent);
            UmlGenerator.handleOperations(functions, parentElement);

            const classProperties = FileReader.extractClassPropertiesFromFileContent(fileContent);
            UmlGenerator.handleClassProperties(classProperties, parentElement);

            const constants = FileReader.extractConstantsFromFileContent(fileContent);
            UmlGenerator.handleClassProperties(constants, parentElement);
        } catch (err) {
            app.showErrorDialog.error(err);
        }
    }

    /**
     * Handles the attributes and create Attributes model from options. Sets the Operation as parent.
     * @param {*[]} classProperties
     * @param {Object} parentElement
     */
    static handleClassProperties(classProperties, parentElement)
    {
        classProperties.forEach((property) => {
            UmlGenerator.createModelFromOptions({
                id: UmlElement.TYPE_ATTRIBUTE,
                parent: parentElement,
                field: UmlElement.ATTRIBUTES,
            }, (elem) => {
                elem.name = property.name;
                elem.visibility = property.visibility;
                elem.type = property.type;
                elem.isStatic = property.isStatic;
                elem.defaultValue = property.value;
            });
        });
    }

    /**
     * Handles the operation and create Operations model from options. Sets the Model/Package as parent.
     *
     * @param {*[]} functions
     * @param {Object} parentElement
     */
    static handleOperations(functions, parentElement)
    {
        functions.forEach((functionType) => {
            const operation = UmlGenerator.createOperation(functionType, parentElement);

            UmlGenerator.handleParameters(functionType.parameters.split(','), operation);

            if (functionType.returnType !== undefined) {
                UmlGenerator.createReturnTypeForOperation(functionType, operation);
            }
        });
    }

    /**
     * @param {*} functionType
     * @param {*} parentElement
     * @returns {*}
     */
    static createOperation(functionType, parentElement) {
        return UmlGenerator.createModelFromOptions({
            id: UmlElement.TYPE_OPERATION,
            parent: parentElement,
            field: UmlElement.OPERATIONS,
        }, (elem) => {
            elem.name = PathHelper.getCurrentDirectory(functionType.name);
            elem.visibility = functionType.visibility;
            elem.isStatic = functionType.isStatic;
            elem.isAbstract = functionType.isAbstract;
            elem.documentation = functionType.documentation;
        });
    }

    /**
     * @param {*} functionType
     * @param {*} operation
     * @returns {*}
     */
    static createReturnTypeForOperation(functionType, operation) {
        let returnType = functionType.returnType;

        if (functionType.isNullableReturn) {
            returnType = returnType + '|null';
        } else {
            returnType = UmlGenerator.findUmlType(returnType);
        }

        return UmlGenerator.createModelFromOptions({
                id: UmlElement.TYPE_PARAMETER,
                parent: operation,
                field: UmlElement.PARAMETERS,
            }, (elem) => {
                elem.name = UmlGenerator.returnKey;
                elem.type = returnType;
                elem.direction = UmlGenerator.returnDirection;
            }
        );
    }

    /**
     * @param {String[]} parameters
     * @param {Object} operationElement
     */
    static handleParameters(parameters, operationElement)
    {
        parameters.forEach((parameter) => {
            let [type, name] = UmlGenerator.extractTypeAndNameFromParameter(parameter);

            if (name === undefined && type === null) {
                return;
            }

            UmlGenerator.createModelFromOptions({
                id: UmlElement.TYPE_PARAMETER,
                parent: operationElement,
                field: UmlElement.PARAMETERS,
            }, (elem) => {
                elem.name = name.replace('$', '');
                elem.type = type;
            });
        });
    }

    /**
     * @param {String} parameter
     * @returns {*[]}
     */
    static extractTypeAndNameFromParameter(parameter) {
        let [type, name] = parameter.split(' ').filter((param) => param !== '');

        if (name === undefined) {
            name = type;
            type = null;
        }

        if (type !== null) {
            type = UmlGenerator.findUmlType(type);
        }

        return [type, name];
    }

    /**
     * @param {String} type
     */
    static findUmlType(type) {
        if (Settings.getDataTypes().includes(type)) {
            return type;
        }

        const existingUmlElements = app.repository.select(type);

        if (existingUmlElements.length === 1) {
            type = existingUmlElements[0];
        } else {
            console.error('Multiple or no existing UML Elements found for: ' + type);
            type = 'TODO:' + type;
        }

        return type;
    }

    /**
     * @param {String} filePath
     * @param {Object} parentElement
     * @param {Object} stats
     */
    static handleUmlElement(filePath, parentElement, stats)
    {
        let name = PathHelper.getCurrentDirectory(filePath);
        const activeModel = UmlGenerator.getActiveModel();
        const isDirectory = stats.isDirectory();

        let type = UmlElement.TYPE_PACKAGE;

        if (parentElement === null) {
            parentElement = activeModel;
            type = UmlElement.TYPE_MODEL;
        }

        let isAbstract = false;

        if (!isDirectory) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            type = FileReader.extractUmlTypeByFileContent(fileContent);
            isAbstract = FileReader.isClassAbstract(fileContent);

            Settings.getAllowedExtensions().forEach((extension) => {
                name = name.replace(extension, '');
            });
        }

        return UmlGenerator.createModelFromOptions({
            id: type,
            parent: parentElement,
        }, (elem) => {
            elem.name = name;
            elem.isAbstract = isAbstract;
        });
    }

    /**
     * @returns {*}
     */
    static getActiveModel()
    {
        const project = app.project.getProject();
        return project.ownedElements.find((element) => element.name === Settings.getActiveModel());
    }

    /**
     * @param {String} directory
     * @param {String[]} files
     * @param {UmlElement|null} parentElement
     * @returns {UmlElement}
     */
    static buildElementForFile(directory, files, parentElement = null)
    {
        const stats = fs.statSync(directory);
        const element = UmlGenerator.handleUmlElement(directory, parentElement, stats);

        this.handleFiles(files, element);

        if (stats.isFile()) {
            this.handleFile(directory, element);
        }
    }
}

module.exports = UmlGenerator;