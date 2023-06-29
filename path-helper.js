const Settings = require("./settings");

class PathHelper
{
    /**
     * @param {String} filePath
     * @returns {*|null}
     */
    static getUmlElementByFilePath(filePath) {
        let name = PathHelper.getCurrentDirectory(filePath);
        Settings.getAllowedExtensions().forEach((extension) => {
            name = name.replace(extension, '');
        });

        let splitDirectory = PathHelper.splitDirectory(filePath, Settings.getActiveModel());
        splitDirectory.pop();
        splitDirectory.push(name);

        const elements = app.repository.select(splitDirectory.join('::'));

        if (elements.length === 0) {
            return null;
        }

        console.error('Using existing UML Element for: ' + name + ', because it exists already.');
        return elements[0];
    }

    /**
     * @param {String} directory
     * @param {String} splitOn
     * @returns {String[]}
     */
    static splitDirectory(directory, splitOn )
    {
        let splitFilePaths = directory.split('/');
        const index = splitFilePaths.indexOf(splitOn);
        return splitFilePaths.splice(index, splitFilePaths.length);
    }

    /**
     * @param {String} directory
     * @returns {String}
     */
    static getCurrentDirectory(directory)
    {
        let splitDirectories = directory.split('/');
        return splitDirectories[splitDirectories.length - 1];
    }
}

module.exports = PathHelper;