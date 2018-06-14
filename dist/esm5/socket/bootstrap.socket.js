/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import * as io from "socket.io-client";
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
        { type: BabiliConfiguration }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLnNvY2tldC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbInNvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sS0FBSyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7O0lBT3JDLHlCQUFvQixhQUFrQztRQUFsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBcUI7S0FBSTs7Ozs7SUFFMUQsaUNBQU87Ozs7SUFBUCxVQUFRLEtBQWE7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFO1lBQ3JELFFBQVEsRUFBRSxJQUFJO1lBQ2QsS0FBSyxFQUFFLFdBQVMsS0FBTztTQUN4QixDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNwQjs7OztJQUVELHNDQUFZOzs7SUFBWjtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQztLQUNsQzs7OztJQUVELG9DQUFVOzs7SUFBVjtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztTQUN6QjtLQUNGOztnQkF4QkYsVUFBVTs7OztnQkFIRixtQkFBbUI7OzBCQUQ1Qjs7U0FLYSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCAqIGFzIGlvIGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCb290c3RyYXBTb2NrZXQge1xuXG4gIHByaXZhdGUgc29ja2V0OiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlDb25maWd1cmF0aW9uKSB7fVxuXG4gIGNvbm5lY3QodG9rZW46IHN0cmluZyk6IFNvY2tldElPQ2xpZW50LlNvY2tldCB7XG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHRoaXMuY29uZmlndXJhdGlvbi5zb2NrZXRVcmwsIHtcbiAgICAgIGZvcmNlTmV3OiB0cnVlLFxuICAgICAgcXVlcnk6IGB0b2tlbj0ke3Rva2VufWBcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQ7XG4gIH1cblxuICBzb2NrZXRFeGlzdHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0ICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLnNvY2tldEV4aXN0cygpKSB7XG4gICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iXX0=