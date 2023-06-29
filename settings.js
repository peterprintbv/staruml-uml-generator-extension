class Settings {
    /**
     * @returns {String}
     */
    static getActiveModel() {
        return app.preferences.get('uml.gen.activeModel');
    }

    /**
     * @returns {String[]}
     */
    static getExcludeFiles() {
        return app.preferences.get('uml.gen.excludeFiles').split(',');
    }

    /**
     * @returns {String[]}
     */
    static getAllowedExtensions() {
        return app.preferences.get('uml.gen.allowedExtensions').split(',');
    }

    /**
     * @returns {String[]}
     */
    static getDataTypes() {
        return app.preferences.get('uml.gen.dataTypes').split(',');
    }
}

module.exports = Settings;