class ModelCache {

    constructor() {
        this.map = new Map();
    }

    add(filepath, content) {
        this.map.set(filepath, content);
    }

    get(filepath) {
        return this.map.get(filepath);
    }
}