const FileReader = require('./file-reader')
const PathHelper = require('./path-helper')
const UmlElement = require('./uml-element')
const fs = require('fs');

class UmlGenerator {
    static extensionsFolder = 'PeterPrint';
    static returnKey = 'Return';
    static returnDirection = 'return';
    static allowedExtensions = [
        '.php'
    ];

    /**
     * @param {String[]} groupFiles
     */
    static generateDocs(groupFiles) {
        const elements = groupFiles.map((groupFile) => {
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
        return app.factory.createModel({
            ...options,
            modelInitializer: callback
        });
    }

    /**
     * @param {String[]} files
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
     * @param {*} parentElement
     */
    static handleFile(filePath, parentElement)
    {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            const functions = FileReader.extractFunctionsFromFileContent(fileContent);
            if (parentElement.name === 'AbstractFormElement') {
                console.log(fileContent);
                console.log(functions);
            }
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
     * @param {*} parentElement
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
     * @param {*} parentElement
     */
    static handleOperations(functions, parentElement)
    {
        functions.forEach((functionType) => {
            const operation = UmlGenerator.createModelFromOptions({
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

            UmlGenerator.handleParameters(functionType.parameters.split(','), operation);

            if (functionType.returnType !== undefined) {
                let returnType = functionType.returnType;

                if (functionType.isNullableReturn) {
                    returnType = returnType + '|null';
                }

                UmlGenerator.createModelFromOptions({
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
        });
    }

    /**
     * @param {String[]} parameters
     * @param {*} operationElement
     */
    static handleParameters(parameters, operationElement)
    {
        parameters.forEach((parameter) => {
            let [type, name] = parameter.split(' ').filter((param) => param !== '');

            if (name === undefined) {
                name = type;
                type = null;
            }

            if (name === undefined && type === null) {
                return;
            }

            name = name.replace('$', '');

            UmlGenerator.createModelFromOptions({
                id: UmlElement.TYPE_PARAMETER,
                parent: operationElement,
                field: UmlElement.PARAMETERS,
            }, (elem) => {
                elem.name = name;
                elem.type = type;
            });
        });
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
            UmlGenerator.allowedExtensions.forEach((extension) => {
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
        return project.ownedElements.find((element) => element.name === UmlGenerator.extensionsFolder);
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