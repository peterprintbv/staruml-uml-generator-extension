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
}

module.exports = Settings;