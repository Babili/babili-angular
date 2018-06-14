/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from "@angular/core";
var BabiliConfiguration = /** @class */ (function () {
    function BabiliConfiguration() {
    }
    /**
     * @param {?} apiUrl
     * @param {?} socketUrl
     * @param {?=} aliveIntervalInMs
     * @return {?}
     */
    BabiliConfiguration.prototype.init = /**
     * @param {?} apiUrl
     * @param {?} socketUrl
     * @param {?=} aliveIntervalInMs
     * @return {?}
     */
    function (apiUrl, socketUrl, aliveIntervalInMs) {
        this.url = {
            apiUrl: apiUrl,
            socketUrl: socketUrl,
            aliveIntervalInMs: aliveIntervalInMs
        };
    };
    Object.defineProperty(BabiliConfiguration.prototype, "apiUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.url ? this.url.apiUrl : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BabiliConfiguration.prototype, "socketUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.url ? this.url.socketUrl : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BabiliConfiguration.prototype, "aliveIntervalInMs", {
        get: /**
         * @return {?}
         */
        function () {
            return this.url ? this.url.aliveIntervalInMs : 30000;
        },
        enumerable: true,
        configurable: true
    });
    BabiliConfiguration.decorators = [
        { type: Injectable },
    ];
    return BabiliConfiguration;
}());
export { BabiliConfiguration };
function BabiliConfiguration_tsickle_Closure_declarations() {
    /** @type {?} */
    BabiliConfiguration.prototype.url;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvIiwic291cmNlcyI6WyJjb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7O0lBUW5ELGtDQUFJOzs7Ozs7SUFBSixVQUFLLE1BQWMsRUFBRSxTQUFpQixFQUFFLGlCQUEwQjtRQUNoRSxJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1QsTUFBTSxFQUFFLE1BQU07WUFDZCxTQUFTLEVBQUUsU0FBUztZQUNwQixpQkFBaUIsRUFBRSxpQkFBaUI7U0FDckMsQ0FBQztLQUNIO0lBRUQsc0JBQUksdUNBQU07Ozs7UUFBVjtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1NBQy9DOzs7T0FBQTtJQUVELHNCQUFJLDBDQUFTOzs7O1FBQWI7WUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUNsRDs7O09BQUE7SUFFRCxzQkFBSSxrREFBaUI7Ozs7UUFBckI7WUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3REOzs7T0FBQTs7Z0JBdkJGLFVBQVU7OzhCQUhYOztTQUlhLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdG9yIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQmFiaWxpQ29uZmlndXJhdGlvbiB7XG5cbiAgcHJpdmF0ZSB1cmw6IEJhYmlsaVVybENvbmZpZ3VyYXRpb247XG5cbiAgaW5pdChhcGlVcmw6IHN0cmluZywgc29ja2V0VXJsOiBzdHJpbmcsIGFsaXZlSW50ZXJ2YWxJbk1zPzogbnVtYmVyKSB7XG4gICAgdGhpcy51cmwgPSB7XG4gICAgICBhcGlVcmw6IGFwaVVybCxcbiAgICAgIHNvY2tldFVybDogc29ja2V0VXJsLFxuICAgICAgYWxpdmVJbnRlcnZhbEluTXM6IGFsaXZlSW50ZXJ2YWxJbk1zXG4gICAgfTtcbiAgfVxuXG4gIGdldCBhcGlVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmwgPyB0aGlzLnVybC5hcGlVcmwgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgc29ja2V0VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsID8gdGhpcy51cmwuc29ja2V0VXJsIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0IGFsaXZlSW50ZXJ2YWxJbk1zKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudXJsID8gdGhpcy51cmwuYWxpdmVJbnRlcnZhbEluTXMgOiAzMDAwMDtcbiAgfVxufVxuIl19