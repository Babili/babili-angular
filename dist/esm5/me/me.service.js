/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Inject, Injectable } from "@angular/core";
import { timer } from "rxjs";
import { map, publishReplay, refCount, share, takeWhile } from "rxjs/operators";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { URL_CONFIGURATION } from "./../configuration/url-configuration.types";
import { Message } from "./../message/message.types";
import { BootstrapSocket } from "./../socket/bootstrap.socket";
import { MeRepository } from "./me.repository";
var MeService = /** @class */ (function () {
    function MeService(meRepository, socketClient, configuration, tokenConfiguration) {
        this.meRepository = meRepository;
        this.socketClient = socketClient;
        this.configuration = configuration;
        this.tokenConfiguration = tokenConfiguration;
        this.alive = false;
    }
    /**
     * @param {?} token
     * @return {?}
     */
    MeService.prototype.setup = /**
     * @param {?} token
     * @return {?}
     */
    function (token) {
        if (!this.tokenConfiguration.isApiTokenSet()) {
            this.tokenConfiguration.apiToken = token;
        }
    };
    /**
     * @return {?}
     */
    MeService.prototype.me = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this.hasCachedMe()) {
            this.cachedMe = this.meRepository
                .findMe()
                .pipe(map(function (me) { return _this.scheduleAliveness(me); }), publishReplay(1), refCount(), share());
        }
        return this.cachedMe.pipe(map(function (me) { return _this.connectSocket(me); }));
    };
    /**
     * @return {?}
     */
    MeService.prototype.clear = /**
     * @return {?}
     */
    function () {
        this.tokenConfiguration.clear();
        this.cachedMe = undefined;
        this.alive = false;
    };
    /**
     * @param {?} me
     * @return {?}
     */
    MeService.prototype.scheduleAliveness = /**
     * @param {?} me
     * @return {?}
     */
    function (me) {
        var _this = this;
        this.alive = true;
        timer(0, this.configuration.aliveIntervalInMs).pipe(takeWhile(function () { return _this.alive; }))
            .subscribe(function () { return _this.meRepository.updateAliveness(me); });
        return me;
    };
    /**
     * @return {?}
     */
    MeService.prototype.hasCachedMe = /**
     * @return {?}
     */
    function () {
        return this.cachedMe !== undefined;
    };
    /**
     * @param {?} me
     * @return {?}
     */
    MeService.prototype.connectSocket = /**
     * @param {?} me
     * @return {?}
     */
    function (me) {
        var _this = this;
        if (!this.socketClient.socketExists()) {
            var /** @type {?} */ socket = this.socketClient.connect(this.tokenConfiguration.apiToken);
            socket.on("new message", function (data) { return _this.receiveNewMessage(data); });
            socket.on("connected", function (data) { return me.deviceSessionId = data.deviceSessionId; });
        }
        return me;
    };
    /**
     * @param {?} json
     * @return {?}
     */
    MeService.prototype.receiveNewMessage = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        var /** @type {?} */ message = Message.build(json.data);
        this.me().subscribe(function (me) { return me.handleNewMessage(message); });
    };
    MeService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MeService.ctorParameters = function () { return [
        { type: MeRepository },
        { type: BootstrapSocket },
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] },
        { type: TokenConfiguration }
    ]; };
    return MeService;
}());
export { MeService };
function MeService_tsickle_Closure_declarations() {
    /** @type {?} */
    MeService.prototype.cachedMe;
    /** @type {?} */
    MeService.prototype.alive;
    /** @type {?} */
    MeService.prototype.meRepository;
    /** @type {?} */
    MeService.prototype.socketClient;
    /** @type {?} */
    MeService.prototype.configuration;
    /** @type {?} */
    MeService.prototype.tokenConfiguration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkvYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lL21lLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBYyxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVoRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNsRixPQUFPLEVBQUUsaUJBQWlCLEVBQW9CLE1BQU0sNENBQTRDLENBQUM7QUFDakcsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7O0lBUzdDLG1CQUFvQixZQUEwQixFQUMxQixjQUMyQixhQUErQixFQUMxRDtRQUhBLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLGlCQUFZLEdBQVosWUFBWTtRQUNlLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtRQUMxRCx1QkFBa0IsR0FBbEIsa0JBQWtCO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ3BCOzs7OztJQUVELHlCQUFLOzs7O0lBQUwsVUFBTSxLQUFhO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztTQUMxQztLQUNGOzs7O0lBRUQsc0JBQUU7OztJQUFGO1FBQUEsaUJBWUM7UUFYQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWTtpQkFDWixNQUFNLEVBQUU7aUJBQ1IsSUFBSSxDQUNILEdBQUcsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxFQUNyQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQ2hCLFFBQVEsRUFBRSxFQUNWLEtBQUssRUFBRSxDQUNSLENBQUM7U0FDdkI7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDLENBQUM7S0FDOUQ7Ozs7SUFFRCx5QkFBSzs7O0lBQUw7UUFDRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7Ozs7O0lBRU8scUNBQWlCOzs7O2NBQUMsRUFBTTs7UUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUNqRCxTQUFTLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLEVBQVYsQ0FBVSxDQUFDLENBQzVCO2FBQ0EsU0FBUyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBckMsQ0FBcUMsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUM7Ozs7O0lBR0osK0JBQVc7Ozs7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDOzs7Ozs7SUFHN0IsaUNBQWE7Ozs7Y0FBQyxFQUFNOztRQUMxQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLHFCQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQTVCLENBQTRCLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLEVBQUUsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBekMsQ0FBeUMsQ0FBQyxDQUFDO1NBQzNFO1FBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQzs7Ozs7O0lBR0oscUNBQWlCOzs7O2NBQUMsSUFBUztRQUNqQyxxQkFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDOzs7Z0JBL0QzRCxVQUFVOzs7O2dCQUhGLFlBQVk7Z0JBRFosZUFBZTtnREFZVCxNQUFNLFNBQUMsaUJBQWlCO2dCQWY5QixrQkFBa0I7O29CQUwzQjs7U0FhYSxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRpbWVyIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCwgcHVibGlzaFJlcGxheSwgcmVmQ291bnQsIHNoYXJlLCB0YWtlV2hpbGUgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vLi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lU2VydmljZSB7XG5cbiAgcHJpdmF0ZSBjYWNoZWRNZTogT2JzZXJ2YWJsZTxNZT47XG4gIHByaXZhdGUgYWxpdmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtZVJlcG9zaXRvcnk6IE1lUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBzb2NrZXRDbGllbnQ6IEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0dXAodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uaXNBcGlUb2tlblNldCgpKSB7XG4gICAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbiA9IHRva2VuO1xuICAgIH1cbiAgfVxuXG4gIG1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICBpZiAoIXRoaXMuaGFzQ2FjaGVkTWUoKSkge1xuICAgICAgdGhpcy5jYWNoZWRNZSA9IHRoaXMubWVSZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kTWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAobWUgPT4gdGhpcy5zY2hlZHVsZUFsaXZlbmVzcyhtZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2hSZXBsYXkoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmQ291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFyZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lLnBpcGUobWFwKG1lID0+IHRoaXMuY29ubmVjdFNvY2tldChtZSkpKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmNsZWFyKCk7XG4gICAgdGhpcy5jYWNoZWRNZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQWxpdmVuZXNzKG1lOiBNZSk6IE1lIHtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICB0aW1lcigwLCB0aGlzLmNvbmZpZ3VyYXRpb24uYWxpdmVJbnRlcnZhbEluTXMpLnBpcGUoXG4gICAgICB0YWtlV2hpbGUoKCkgPT4gdGhpcy5hbGl2ZSlcbiAgICApXG4gICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLm1lUmVwb3NpdG9yeS51cGRhdGVBbGl2ZW5lc3MobWUpKTtcbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIGhhc0NhY2hlZE1lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGNvbm5lY3RTb2NrZXQobWU6IE1lKTogTWUge1xuICAgIGlmICghdGhpcy5zb2NrZXRDbGllbnQuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuc29ja2V0Q2xpZW50LmNvbm5lY3QodGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pO1xuICAgICAgc29ja2V0Lm9uKFwibmV3IG1lc3NhZ2VcIiwgZGF0YSA9PiB0aGlzLnJlY2VpdmVOZXdNZXNzYWdlKGRhdGEpKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RlZFwiLCBkYXRhID0+IG1lLmRldmljZVNlc3Npb25JZCA9IGRhdGEuZGV2aWNlU2Vzc2lvbklkKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSByZWNlaXZlTmV3TWVzc2FnZShqc29uOiBhbnkpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gTWVzc2FnZS5idWlsZChqc29uLmRhdGEpO1xuICAgIHRoaXMubWUoKS5zdWJzY3JpYmUobWUgPT4gbWUuaGFuZGxlTmV3TWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cbn1cbiJdfQ==