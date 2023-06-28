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
}

module.exports = PathHelper;