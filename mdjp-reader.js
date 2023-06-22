const fs = require('fs');
const path = require('path');

class MDJPReader {
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
            return !MDJPReader.excludeFiles.includes(file);
        }).forEach(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                selectedFiles = selectedFiles.concat([filePath]);
                selectedFiles = selectedFiles.concat(MDJPReader.getFilesForPath(filePath, allowedExtension));
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
            const group = MDJPReader.findGroupByDirectory(groupedFiles, directory);

            if (group) {
                MDJPReader.addToGroup(group, filePath);
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

            const subGroup = MDJPReader.findGroupByDirectory(group.files, directory);

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
        const file = path.basename(filePath);

        if (directory === group.directory) {
            group.files.push({directory: filePath, files: []});
            return;
        }

        for (let i = 0; i < group.files.length; i++) {
            const subGroup = group.files[i];
            MDJPReader.addToGroup(subGroup, filePath);
        }
    }
}

module.exports = MDJPReader;