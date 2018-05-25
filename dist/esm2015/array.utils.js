/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
export class ArrayUtils {
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element index
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @return {?}
     */
    static findIndex(items, predicate) {
        for (let /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            if (predicate.apply(items[currentIndex], currentIndex)) {
                return currentIndex;
            }
        }
        return -1;
    }
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @return {?}
     */
    static find(items, predicate) {
        for (let /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            const /** @type {?} */ item = items[currentIndex];
            if (predicate.apply(item, currentIndex)) {
                return item;
            }
        }
        return undefined;
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXkudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvIiwic291cmNlcyI6WyJhcnJheS51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsTUFBTTs7Ozs7Ozs7Ozs7SUFTSixNQUFNLENBQUMsU0FBUyxDQUFJLEtBQVUsRUFBRSxTQUErQztRQUM3RSxHQUFHLENBQUMsQ0FBQyxxQkFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUM7WUFDdkUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLENBQUMsWUFBWSxDQUFDO2FBQ3JCO1NBQ0Y7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDWDs7Ozs7Ozs7Ozs7SUFVRCxNQUFNLENBQUMsSUFBSSxDQUFJLEtBQVUsRUFBRSxTQUErQztRQUN4RSxHQUFHLENBQUMsQ0FBQyxxQkFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUM7WUFDdkUsdUJBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztLQUNsQjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEFycmF5VXRpbHMge1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIGFycmF5IHdoZXJlIHByZWRpY2F0ZSBpcyB0cnVlLCBhbmQgLTFcbiAgICogb3RoZXJ3aXNlLlxuICAgKiBAcGFyYW0gaXRlbXMgYXJyYXkgdGhhdCB3aWxsIGJlIGluc3BlY3RlZCB0byBmaW5kIGFuIGVsZW1lbnQgaW5kZXhcbiAgICogQHBhcmFtIHByZWRpY2F0ZSBmaW5kIGNhbGxzIHByZWRpY2F0ZSBvbmNlIGZvciBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5LCBpbiBhc2NlbmRpbmdcbiAgICogb3JkZXIsIHVudGlsIGl0IGZpbmRzIG9uZSB3aGVyZSBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLiBJZiBzdWNoIGFuIGVsZW1lbnQgaXMgZm91bmQsXG4gICAqIGZpbmRJbmRleCBpbW1lZGlhdGVseSByZXR1cm5zIHRoYXQgZWxlbWVudCBpbmRleC4gT3RoZXJ3aXNlLCBmaW5kSW5kZXggcmV0dXJucyAtMS5cbiAgICovXG4gIHN0YXRpYyBmaW5kSW5kZXg8VD4oaXRlbXM6IFRbXSwgcHJlZGljYXRlOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW4pOiBudW1iZXIge1xuICAgIGZvciAobGV0IGN1cnJlbnRJbmRleCA9IDA7IGN1cnJlbnRJbmRleCA8IGl0ZW1zLmxlbmd0aDsgKytjdXJyZW50SW5kZXgpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUuYXBwbHkoaXRlbXNbY3VycmVudEluZGV4XSwgY3VycmVudEluZGV4KSkge1xuICAgICAgICByZXR1cm4gY3VycmVudEluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIGFycmF5IHdoZXJlIHByZWRpY2F0ZSBpcyB0cnVlLCBhbmQgdW5kZWZpbmVkXG4gICAqIG90aGVyd2lzZS5cbiAgICogQHBhcmFtIGl0ZW1zIGFycmF5IHRoYXQgd2lsbCBiZSBpbnNwZWN0ZWQgdG8gZmluZCBhbiBlbGVtZW50XG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgZmluZCBjYWxscyBwcmVkaWNhdGUgb25jZSBmb3IgZWFjaCBlbGVtZW50IG9mIHRoZSBhcnJheSwgaW4gYXNjZW5kaW5nXG4gICAqIG9yZGVyLCB1bnRpbCBpdCBmaW5kcyBvbmUgd2hlcmUgcHJlZGljYXRlIHJldHVybnMgdHJ1ZS4gSWYgc3VjaCBhbiBlbGVtZW50IGlzIGZvdW5kLCBmaW5kXG4gICAqIGltbWVkaWF0ZWx5IHJldHVybnMgdGhhdCBlbGVtZW50IHZhbHVlLiBPdGhlcndpc2UsIGZpbmQgcmV0dXJucyB1bmRlZmluZWQuXG4gICAqL1xuICBzdGF0aWMgZmluZDxUPihpdGVtczogVFtdLCBwcmVkaWNhdGU6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbik6IFQge1xuICAgIGZvciAobGV0IGN1cnJlbnRJbmRleCA9IDA7IGN1cnJlbnRJbmRleCA8IGl0ZW1zLmxlbmd0aDsgKytjdXJyZW50SW5kZXgpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tjdXJyZW50SW5kZXhdO1xuICAgICAgaWYgKHByZWRpY2F0ZS5hcHBseShpdGVtLCBjdXJyZW50SW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iXX0=