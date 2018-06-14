/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from "@angular/core";
export class BabiliConfiguration {
    /**
     * @param {?} apiUrl
     * @param {?} socketUrl
     * @param {?=} aliveIntervalInMs
     * @return {?}
     */
    init(apiUrl, socketUrl, aliveIntervalInMs) {
        this.url = {
            apiUrl: apiUrl,
            socketUrl: socketUrl,
            aliveIntervalInMs: aliveIntervalInMs
        };
    }
    /**
     * @return {?}
     */
    get apiUrl() {
        return this.url ? this.url.apiUrl : undefined;
    }
    /**
     * @return {?}
     */
    get socketUrl() {
        return this.url ? this.url.socketUrl : undefined;
    }
    /**
     * @return {?}
     */
    get aliveIntervalInMs() {
        return this.url ? this.url.aliveIntervalInMs : 30000;
    }
}
BabiliConfiguration.decorators = [
    { type: Injectable },
];
function BabiliConfiguration_tsickle_Closure_declarations() {
    /** @type {?} */
    BabiliConfiguration.prototype.url;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvIiwic291cmNlcyI6WyJjb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBSXJELE1BQU07Ozs7Ozs7SUFJSixJQUFJLENBQUMsTUFBYyxFQUFFLFNBQWlCLEVBQUUsaUJBQTBCO1FBQ2hFLElBQUksQ0FBQyxHQUFHLEdBQUc7WUFDVCxNQUFNLEVBQUUsTUFBTTtZQUNkLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLGlCQUFpQixFQUFFLGlCQUFpQjtTQUNyQyxDQUFDO0tBQ0g7Ozs7SUFFRCxJQUFJLE1BQU07UUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztLQUMvQzs7OztJQUVELElBQUksU0FBUztRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0tBQ2xEOzs7O0lBRUQsSUFBSSxpQkFBaUI7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUN0RDs7O1lBdkJGLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3RvciB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhYmlsaUNvbmZpZ3VyYXRpb24ge1xuXG4gIHByaXZhdGUgdXJsOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uO1xuXG4gIGluaXQoYXBpVXJsOiBzdHJpbmcsIHNvY2tldFVybDogc3RyaW5nLCBhbGl2ZUludGVydmFsSW5Ncz86IG51bWJlcikge1xuICAgIHRoaXMudXJsID0ge1xuICAgICAgYXBpVXJsOiBhcGlVcmwsXG4gICAgICBzb2NrZXRVcmw6IHNvY2tldFVybCxcbiAgICAgIGFsaXZlSW50ZXJ2YWxJbk1zOiBhbGl2ZUludGVydmFsSW5Nc1xuICAgIH07XG4gIH1cblxuICBnZXQgYXBpVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsID8gdGhpcy51cmwuYXBpVXJsIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0IHNvY2tldFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybCA/IHRoaXMudXJsLnNvY2tldFVybCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBhbGl2ZUludGVydmFsSW5NcygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVybCA/IHRoaXMudXJsLmFsaXZlSW50ZXJ2YWxJbk1zIDogMzAwMDA7XG4gIH1cbn1cbiJdfQ==