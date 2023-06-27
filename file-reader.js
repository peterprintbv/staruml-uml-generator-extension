const UmlElement = require('./uml-element')

const fs = require('fs');
const path = require('path');

class FileReader {
    static excludeFiles = [
        'registration.php',
        'patches',
        'etc'
    ];

    /**
     *
     * @param {string} directoryPath
     * @param {String[]} allowedExtension
     * @returns {String[]}
     */
    static getFilesForPath(directoryPath, allowedExtension = ['.php']) {
        const files = fs.readdirSync(directoryPath);

        let selectedFiles = [];

        files.filter(file => {
            return !FileReader.excludeFiles.includes(file);
        }).forEach(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                selectedFiles = selectedFiles.concat([filePath]);
                selectedFiles = selectedFiles.concat(FileReader.getFilesForPath(filePath, allowedExtension));
            } else {
                if (allowedExtension.includes(path.extname(filePath))) {
                    selectedFiles.push(filePath);
                }
            }
        });

        return selectedFiles;
    }

    /**
     * @param {String[]} filePaths
     * @returns {Object[]}
     */
    static groupFilesByDirectory(filePaths) {
        const groupedFiles = [];

        filePaths.forEach(filePath => {
            const directory = path.dirname(filePath);
            const file = path.basename(filePath);
            const group = FileReader.findGroupByDirectory(groupedFiles, directory);

            if (group) {
                FileReader.addToGroup(group, filePath);
            } else {
                groupedFiles.push({directory, files: [{directory: filePath, files: []}]});
            }
        });

        return groupedFiles;
    }

    /**
     * @param {Object[]} groups
     * @param {String} directory
     * @returns {Object|null}
     */
    static findGroupByDirectory(groups, directory) {
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (group.directory === directory) {
                return group;
            }

            const subGroup = FileReader.findGroupByDirectory(group.files, directory);

            if (subGroup) {
                return subGroup;
            }
        }
        return null;
    }

    /**
     * @param {Object} group
     * @param {String} filePath
     */
    static addToGroup(group, filePath) {
        const directory = path.dirname(filePath);

        if (directory === group.directory) {
            group.files.push({directory: filePath, files: []});
            return;
        }

        for (let i = 0; i < group.files.length; i++) {
            const subGroup = group.files[i];
            FileReader.addToGroup(subGroup, filePath);
        }
    }

    /**
     * @param {String} fileContent
     * @returns {String}
     */
    static extractUmlTypeByFileContent(fileContent)
    {
        if (/class\s+(\w+)/.test(fileContent) || /trait\s+(\w+)/.test(fileContent)) {
            return UmlElement.TYPE_CLASS;
        }

        if (/interface\s+(\w+)/.test(fileContent)) {
            return UmlElement.TYPE_INTERFACE;
        }

        throw new Error('The file contents do not contain a valid UmlElement.');
    }

    /**
     * @param {String} fileContent
     * @returns {String}
     */
    static extractClassNameFromFileContent(fileContent) {
        const classnameRegex = /class\s+(\w+)/;
        const classnameMatch = fileContent.match(classnameRegex);
        return classnameMatch ? classnameMatch[1] : '';
    }

    /**
     * @param {String} fileContent
     * @returns {boolean}
     */
    static isClassAbstract(fileContent) {
        const classRegex = /abstract\s+class\s+\w+/g;
        return classRegex.test(fileContent);
    }

    /**
     * @param {String} fileContent
     * @returns {*[]}
     */
    static extractClassPropertiesFromFileContent(fileContent) {
        const propertyRegex = /(private|protected|public)\s+(static)?\s*\??([\w|\\]+)\s+\$([\w]+)(?:\s*=\s*([^;]+))?;/g;
        const properties = [];
        let match;
        while ((match = propertyRegex.exec(fileContent)) !== null) {
            const [, visibility, isStatic, propertyType, propertyName, defaultValue] = match;
            properties.push({
                visibility,
                isStatic: !!isStatic,
                type: propertyType,
                name: propertyName,
                defaultValue: defaultValue ? defaultValue.trim() : undefined,
            });
        }
        return properties;
    }

    /**
     * @param {String} fileContent
     * @returns {*[]}
     */
    static extractConstantsFromFileContent(fileContent) {
        const constantRegex = /(private|protected|public)?\s*const\s+([\w]+)\s*=\s*([\w\[\]'"\\|:$]+);/g;
        const constants = [];
        let match;
        while ((match = constantRegex.exec(fileContent)) !== null) {
            const [, visibility, constantName, constantValue] = match;
            constants.push({ visibility: visibility || 'public', isStatic: true, type: 'const', name: constantName, value: constantValue });
        }
        return constants;
    }

    /**
     * @param {String} fileContent
     * @returns {*[]}
     */
    static extractFunctionsFromFileContent(fileContent) {
        const functionRegex = /\/\*\*([\s\S]*?)\*\/[\s\S]*?(abstract\s+)?(private|protected|public)?\s+(static)?\s*function\s+(\w+)\s*\((.*?)\)\s*:\s*([\w|\\]+)/g;
        const functions = [];
        let match;
        while ((match = functionRegex.exec(fileContent)) !== null) {
            const [, docBlock, isAbstract, visibility, isStatic, name, parameters, returnType] = match;
            const documentation = docBlock.trim();
            const isAbstractFunction = !!isAbstract;
            functions.push({ name, parameters, returnType, visibility, isStatic, isAbstract: isAbstractFunction, documentation });
        }
        return functions;
    }
}

module.exports = FileReader;