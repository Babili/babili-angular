/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import * as io from "socket.io-client";
export class BootstrapSocket {
    /**
     * @param {?} configuration
     */
    constructor(configuration) {
        this.configuration = configuration;
    }
    /**
     * @param {?} token
     * @return {?}
     */
    connect(token) {
        this.socket = io.connect(this.configuration.socketUrl, {
            forceNew: true,
            query: `token=${token}`
        });
        return this.socket;
    }
    /**
     * @return {?}
     */
    socketExists() {
        return this.socket !== undefined;
    }
    /**
     * @return {?}
     */
    disconnect() {
        if (this.socketExists()) {
            this.socket.close();
            this.socket = undefined;
        }
    }
}
BootstrapSocket.decorators = [
    { type: Injectable },
];
/** @nocollapse */
BootstrapSocket.ctorParameters = () => [
    { type: BabiliConfiguration }
];
function BootstrapSocket_tsickle_Closure_declarations() {
    /** @type {?} */
    BootstrapSocket.prototype.socket;
    /** @type {?} */
    BootstrapSocket.prototype.configuration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLnNvY2tldC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbInNvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sS0FBSyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHdkMsTUFBTTs7OztJQUlKLFlBQW9CLGFBQWtDO1FBQWxDLGtCQUFhLEdBQWIsYUFBYSxDQUFxQjtLQUFJOzs7OztJQUUxRCxPQUFPLENBQUMsS0FBYTtRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUU7WUFDckQsUUFBUSxFQUFFLElBQUk7WUFDZCxLQUFLLEVBQUUsU0FBUyxLQUFLLEVBQUU7U0FDeEIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDcEI7Ozs7SUFFRCxZQUFZO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDO0tBQ2xDOzs7O0lBRUQsVUFBVTtRQUNSLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztTQUN6QjtLQUNGOzs7WUF4QkYsVUFBVTs7OztZQUhGLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgKiBhcyBpbyBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwU29ja2V0IHtcblxuICBwcml2YXRlIHNvY2tldDogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBjb25uZWN0KHRva2VuOiBzdHJpbmcpOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCh0aGlzLmNvbmZpZ3VyYXRpb24uc29ja2V0VXJsLCB7XG4gICAgICBmb3JjZU5ldzogdHJ1ZSxcbiAgICAgIHF1ZXJ5OiBgdG9rZW49JHt0b2tlbn1gXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0O1xuICB9XG5cbiAgc29ja2V0RXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNvY2tldCAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBpZiAodGhpcy5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuIl19