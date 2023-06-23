class PathHelper
{
    static extensionsFolder = 'PeterPrint';

    /**
     * @param {String} directory
     * @param {String} splitOn
     * @returns {String[]}
     */
    static splitDirectory(directory, splitOn = PathHelper.extensionsFolder)
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

    /**
     * @param {String} directory
     * @returns {String[]}
     */
    static buildStarUmlDocsDirectoryForDirectory(directory)
    {
        const pathAfterExtension = PathHelper.splitDirectory(directory);
        return pathAfterExtension.map((pathName, key) => {
            let prefix = 'umlmodel.';
            if (key > 1) {
                prefix = 'umlpackage.';
            }
            return prefix + pathName.toLowerCase();
        });
    }
}

module.exports = PathHelper;