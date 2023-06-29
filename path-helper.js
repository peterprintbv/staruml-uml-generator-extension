class PathHelper
{
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