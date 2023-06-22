const MDJPReader = require('./mdjp-reader')
const MDJPGenerator = require('./mdjp-generator')

function main(directoryPath) {
    const files = MDJPReader.getFilesForPath(directoryPath);

    const groupFiles = MDJPReader.groupFilesByDirectory(files);

    MDJPGenerator.generateDocs(groupFiles);
}

// Usage:
const absolutePath = '/Users/eric/Documents/Projects/peterprint/extensions/PeterPrint/ToolboxXmlStructure';
main(absolutePath);