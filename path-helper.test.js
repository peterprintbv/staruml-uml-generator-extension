const pathHelper = require('./path-helper');

test('last directory is returned as current directory', () => {
    const directories = ['Users' + 'directory' + pathHelper.extensionsFolder, 'subDirectory' , 'subsubDirectory'];
    const result = pathHelper.getCurrentDirectory(directories.join('/'));
    expect(directories[directories.length - 1]).toStrictEqual(result);
});