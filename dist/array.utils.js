"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArrayUtils {
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param items array that will be inspected to find an element index
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     */
    static findIndex(items, predicate) {
        for (let currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            if (predicate.apply(items[currentIndex], currentIndex)) {
                return currentIndex;
            }
        }
        return -1;
    }
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param items array that will be inspected to find an element
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     */
    static find(items, predicate) {
        for (let currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            const item = items[currentIndex];
            if (predicate.apply(item, currentIndex)) {
                return item;
            }
        }
        return undefined;
    }
}
exports.ArrayUtils = ArrayUtils;
