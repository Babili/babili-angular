/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Inject, Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { URL_CONFIGURATION } from "./../configuration/url-configuration.types";
var BootstrapSocket = /** @class */ (function () {
    function BootstrapSocket(configuration) {
        this.configuration = configuration;
    }
    /**
     * @param {?} token
     * @return {?}
     */
    BootstrapSocket.prototype.connect = /**
     * @param {?} token
     * @return {?}
     */
    function (token) {
        this.socket = io.connect(this.configuration.socketUrl, {
            forceNew: true,
            query: "token=" + token
        });
        return this.socket;
    };
    /**
     * @return {?}
     */
    BootstrapSocket.prototype.socketExists = /**
     * @return {?}
     */
    function () {
        return this.socket !== undefined;
    };
    /**
     * @return {?}
     */
    BootstrapSocket.prototype.disconnect = /**
     * @return {?}
     */
    function () {
        if (this.socketExists()) {
            this.socket.close();
            this.socket = undefined;
        }
    };
    BootstrapSocket.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    BootstrapSocket.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
    ]; };
    return BootstrapSocket;
}());
export { BootstrapSocket };
function BootstrapSocket_tsickle_Closure_declarations() {
    /** @type {?} */
    BootstrapSocket.prototype.socket;
    /** @type {?} */
    BootstrapSocket.prototype.configuration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLnNvY2tldC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbInNvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVuRCxPQUFPLEtBQUssRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxpQkFBaUIsRUFBb0IsTUFBTSw0Q0FBNEMsQ0FBQzs7SUFTL0YseUJBQStDLGFBQStCO1FBQS9CLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtLQUFJOzs7OztJQUVsRixpQ0FBTzs7OztJQUFQLFVBQVEsS0FBYTtRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUU7WUFDckQsUUFBUSxFQUFFLElBQUk7WUFDZCxLQUFLLEVBQUUsV0FBUyxLQUFPO1NBQ3hCLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7O0lBRUQsc0NBQVk7OztJQUFaO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDO0tBQ2xDOzs7O0lBRUQsb0NBQVU7OztJQUFWO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1NBQ3pCO0tBQ0Y7O2dCQXhCRixVQUFVOzs7O2dEQUtJLE1BQU0sU0FBQyxpQkFBaUI7OzBCQVp2Qzs7U0FRYSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0ICogYXMgaW8gZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuXG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcFNvY2tldCB7XG5cbiAgcHJpdmF0ZSBzb2NrZXQ6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIGNvbmZpZ3VyYXRpb246IFVybENvbmZpZ3VyYXRpb24pIHt9XG5cbiAgY29ubmVjdCh0b2tlbjogc3RyaW5nKTogU29ja2V0SU9DbGllbnQuU29ja2V0IHtcbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QodGhpcy5jb25maWd1cmF0aW9uLnNvY2tldFVybCwge1xuICAgICAgZm9yY2VOZXc6IHRydWUsXG4gICAgICBxdWVyeTogYHRva2VuPSR7dG9rZW59YFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnNvY2tldDtcbiAgfVxuXG4gIHNvY2tldEV4aXN0cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLnNvY2tldCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==