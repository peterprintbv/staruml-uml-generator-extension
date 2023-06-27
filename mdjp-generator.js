const FileReader = require('./file-reader')
const PathHelper = require('./path-helper')
const UmlElement = require('./uml-element')
const fs = require('fs');

class MDJPGenerator {
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
            return MDJPGenerator.buildElementForFile(directory, files);
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
            MDJPGenerator.buildElementForFile(directory, files, parentElement);
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
            MDJPGenerator.handleOperations(functions, parentElement);

            const classProperties = FileReader.extractClassPropertiesFromFileContent(fileContent);
            MDJPGenerator.handleClassProperties(classProperties, parentElement);

            const constants = FileReader.extractConstantsFromFileContent(fileContent);
            MDJPGenerator.handleConstants(constants, parentElement);
        } catch (err) {
            app.showErrorDialog.error(err);
        }
    }

    static handleConstants(constants, parentElement)
    {
        console.log(constants);
        constants.forEach((constant) => {
            MDJPGenerator.createModelFromOptions({
                id: UmlElement.TYPE_ATTRIBUTE,
                parent: parentElement,
                field: UmlElement.ATTRIBUTES,
            }, (elem) => {
                elem.name = constant.name;
                elem.visibility = constant.visibility;
                elem.type = constant.type;
                elem.isStatic = constant.isStatic;
                elem.defaultValue = constant.value;
            });
        });
    }

    /**
     * Handles the attributes and create Attributes model from options. Sets the Operation as parent.
     * @param {*[]} classProperties
     * @param {*} parentElement
     */
    static handleClassProperties(classProperties, parentElement)
    {
        classProperties.forEach((property) => {
            MDJPGenerator.createModelFromOptions({
                id: UmlElement.TYPE_ATTRIBUTE,
                parent: parentElement,
                field: UmlElement.ATTRIBUTES,
            }, (elem) => {
                elem.name = property.name;
                elem.visibility = property.visibility;
                elem.type = property.type;
                elem.isStatic = property.isStatic;
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
            const operation = MDJPGenerator.createModelFromOptions({
                id: UmlElement.TYPE_OPERATION,
                parent: parentElement,
                field: UmlElement.OPERATIONS,
            }, (elem) => {
                elem.name = PathHelper.getCurrentDirectory(functionType.name);
                elem.visibility = functionType.visibility;
                elem.isStatic = functionType.isStatic;
                elem.documentation = functionType.documentation;
            });

            MDJPGenerator.handleParameters(functionType.parameters.split(','), operation);

            if (functionType.returnType !== undefined) {
                MDJPGenerator.createModelFromOptions({
                    id: UmlElement.TYPE_PARAMETER,
                    parent: operation,
                    field: UmlElement.PARAMETERS,
                    }, (elem) => {
                        elem.name = MDJPGenerator.returnKey;
                        elem.type = functionType.returnType;
                        elem.direction = MDJPGenerator.returnDirection;
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

            MDJPGenerator.createModelFromOptions({
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
     * @returns {*}
     */
    static getActiveModel()
    {
        const project = app.project.getProject();
        return project.ownedElements.find((element) => element.name === MDJPGenerator.extensionsFolder);
    }

    /**
     * @param {String} directory
     * @param {String[]} files
     * @param {UmlElement|null} parentElement
     * @returns {UmlElement}
     */
    static buildElementForFile(directory, files, parentElement = null)
    {
        const activeModel = MDJPGenerator.getActiveModel();

        const stats = fs.statSync(directory);
        const isDirectory = stats.isDirectory();
        let name = PathHelper.getCurrentDirectory(directory);

        let type = UmlElement.TYPE_PACKAGE;

        if (parentElement === null) {
            parentElement = activeModel;
            type = UmlElement.TYPE_MODEL;
        }

        if (!isDirectory) {
            const fileContent = fs.readFileSync(directory, 'utf8');
            type = FileReader.extractUmlTypeByFileContent(fileContent);
            MDJPGenerator.allowedExtensions.forEach((extension) => {
                name = name.replace(extension, '');
            });
        }

        const element = MDJPGenerator.createModelFromOptions({
            id: type,
            parent: parentElement,
        }, (elem) => {
            elem.name = name;
        });

        this.handleFiles(files, element);

        if (stats.isFile()) {
            this.handleFile(directory, element);
        }
    }
}

module.exports = MDJPGenerator;