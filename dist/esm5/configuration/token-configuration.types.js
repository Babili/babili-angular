/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from "@angular/core";
var TokenConfiguration = /** @class */ (function () {
    function TokenConfiguration() {
    }
    /**
     * @return {?}
     */
    TokenConfiguration.prototype.isApiTokenSet = /**
     * @return {?}
     */
    function () {
        return this.apiToken !== undefined && this.apiToken !== null && this.apiToken !== "";
    };
    /**
     * @return {?}
     */
    TokenConfiguration.prototype.clear = /**
     * @return {?}
     */
    function () {
        this.apiToken = undefined;
    };
    TokenConfiguration.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    TokenConfiguration.ctorParameters = function () { return []; };
    return TokenConfiguration;
}());
export { TokenConfiguration };
function TokenConfiguration_tsickle_Closure_declarations() {
    /** @type {?} */
    TokenConfiguration.prototype.apiToken;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tY29uZmlndXJhdGlvbi50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkvYW5ndWxhci8iLCJzb3VyY2VzIjpbImNvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7SUFNekM7S0FBZ0I7Ozs7SUFFaEIsMENBQWE7OztJQUFiO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDO0tBQ3RGOzs7O0lBRUQsa0NBQUs7OztJQUFMO1FBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7S0FDM0I7O2dCQVpGLFVBQVU7Ozs7NkJBRlg7O1NBR2Esa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUb2tlbkNvbmZpZ3VyYXRpb24ge1xuICBwdWJsaWMgYXBpVG9rZW46IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgaXNBcGlUb2tlblNldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hcGlUb2tlbiAhPT0gdW5kZWZpbmVkICYmIHRoaXMuYXBpVG9rZW4gIT09IG51bGwgJiYgdGhpcy5hcGlUb2tlbiAhPT0gXCJcIjtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuYXBpVG9rZW4gPSB1bmRlZmluZWQ7XG4gIH1cblxufVxuIl19