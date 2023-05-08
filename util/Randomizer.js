class Randomizer {

    static getRandomFloat(max, min) {
        return Math.random() * (max - min) + min;
    }
}