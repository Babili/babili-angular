/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var ArrayUtils = /** @class */ (function () {
    function ArrayUtils() {
    }
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param items array that will be inspected to find an element index
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     */
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
    ArrayUtils.findIndex = /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element index
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @return {?}
     */
    function (items, predicate) {
        for (var /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            if (predicate.apply(items[currentIndex], currentIndex)) {
                return currentIndex;
            }
        }
        return -1;
    };
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param items array that will be inspected to find an element
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     */
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
    ArrayUtils.find = /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @return {?}
     */
    function (items, predicate) {
        for (var /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            var /** @type {?} */ item = items[currentIndex];
            if (predicate.apply(item, currentIndex)) {
                return item;
            }
        }
        return undefined;
    };
    return ArrayUtils;
}());
export { ArrayUtils };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXkudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvIiwic291cmNlcyI6WyJhcnJheS51dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBQTs7O0lBQ0U7Ozs7Ozs7T0FPRzs7Ozs7Ozs7Ozs7SUFDSSxvQkFBUzs7Ozs7Ozs7OztJQUFoQixVQUFvQixLQUFVLEVBQUUsU0FBK0M7UUFDN0UsR0FBRyxDQUFDLENBQUMscUJBQUksWUFBWSxHQUFHLENBQUMsRUFBRSxZQUFZLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDO1lBQ3ZFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLFlBQVksQ0FBQzthQUNyQjtTQUNGO1FBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ1g7SUFFRDs7Ozs7OztPQU9HOzs7Ozs7Ozs7OztJQUNJLGVBQUk7Ozs7Ozs7Ozs7SUFBWCxVQUFlLEtBQVUsRUFBRSxTQUErQztRQUN4RSxHQUFHLENBQUMsQ0FBQyxxQkFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUM7WUFDdkUscUJBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztLQUNsQjtxQkFsQ0g7SUFtQ0MsQ0FBQTtBQW5DRCxzQkFtQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQXJyYXlVdGlscyB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYXJyYXkgd2hlcmUgcHJlZGljYXRlIGlzIHRydWUsIGFuZCAtMVxuICAgKiBvdGhlcndpc2UuXG4gICAqIEBwYXJhbSBpdGVtcyBhcnJheSB0aGF0IHdpbGwgYmUgaW5zcGVjdGVkIHRvIGZpbmQgYW4gZWxlbWVudCBpbmRleFxuICAgKiBAcGFyYW0gcHJlZGljYXRlIGZpbmQgY2FsbHMgcHJlZGljYXRlIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXksIGluIGFzY2VuZGluZ1xuICAgKiBvcmRlciwgdW50aWwgaXQgZmluZHMgb25lIHdoZXJlIHByZWRpY2F0ZSByZXR1cm5zIHRydWUuIElmIHN1Y2ggYW4gZWxlbWVudCBpcyBmb3VuZCxcbiAgICogZmluZEluZGV4IGltbWVkaWF0ZWx5IHJldHVybnMgdGhhdCBlbGVtZW50IGluZGV4LiBPdGhlcndpc2UsIGZpbmRJbmRleCByZXR1cm5zIC0xLlxuICAgKi9cbiAgc3RhdGljIGZpbmRJbmRleDxUPihpdGVtczogVFtdLCBwcmVkaWNhdGU6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbik6IG51bWJlciB7XG4gICAgZm9yIChsZXQgY3VycmVudEluZGV4ID0gMDsgY3VycmVudEluZGV4IDwgaXRlbXMubGVuZ3RoOyArK2N1cnJlbnRJbmRleCkge1xuICAgICAgaWYgKHByZWRpY2F0ZS5hcHBseShpdGVtc1tjdXJyZW50SW5kZXhdLCBjdXJyZW50SW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SW5kZXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYXJyYXkgd2hlcmUgcHJlZGljYXRlIGlzIHRydWUsIGFuZCB1bmRlZmluZWRcbiAgICogb3RoZXJ3aXNlLlxuICAgKiBAcGFyYW0gaXRlbXMgYXJyYXkgdGhhdCB3aWxsIGJlIGluc3BlY3RlZCB0byBmaW5kIGFuIGVsZW1lbnRcbiAgICogQHBhcmFtIHByZWRpY2F0ZSBmaW5kIGNhbGxzIHByZWRpY2F0ZSBvbmNlIGZvciBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5LCBpbiBhc2NlbmRpbmdcbiAgICogb3JkZXIsIHVudGlsIGl0IGZpbmRzIG9uZSB3aGVyZSBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLiBJZiBzdWNoIGFuIGVsZW1lbnQgaXMgZm91bmQsIGZpbmRcbiAgICogaW1tZWRpYXRlbHkgcmV0dXJucyB0aGF0IGVsZW1lbnQgdmFsdWUuIE90aGVyd2lzZSwgZmluZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICovXG4gIHN0YXRpYyBmaW5kPFQ+KGl0ZW1zOiBUW10sIHByZWRpY2F0ZTogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuKTogVCB7XG4gICAgZm9yIChsZXQgY3VycmVudEluZGV4ID0gMDsgY3VycmVudEluZGV4IDwgaXRlbXMubGVuZ3RoOyArK2N1cnJlbnRJbmRleCkge1xuICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2N1cnJlbnRJbmRleF07XG4gICAgICBpZiAocHJlZGljYXRlLmFwcGx5KGl0ZW0sIGN1cnJlbnRJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdfQ==