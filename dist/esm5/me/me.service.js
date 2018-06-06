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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lL21lLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBYyxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNsRixPQUFPLEVBQTBCLGlCQUFpQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDdkcsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7O0lBUzdDLG1CQUFvQixZQUEwQixFQUMxQixjQUMyQixhQUFxQyxFQUNoRTtRQUhBLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLGlCQUFZLEdBQVosWUFBWTtRQUNlLGtCQUFhLEdBQWIsYUFBYSxDQUF3QjtRQUNoRSx1QkFBa0IsR0FBbEIsa0JBQWtCO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ3BCOzs7OztJQUVELHlCQUFLOzs7O0lBQUwsVUFBTSxLQUFhO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztTQUMxQztLQUNGOzs7O0lBRUQsc0JBQUU7OztJQUFGO1FBQUEsaUJBWUM7UUFYQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWTtpQkFDWixNQUFNLEVBQUU7aUJBQ1IsSUFBSSxDQUNILEdBQUcsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxFQUNyQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQ2hCLFFBQVEsRUFBRSxFQUNWLEtBQUssRUFBRSxDQUNSLENBQUM7U0FDdkI7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDLENBQUM7S0FDOUQ7Ozs7SUFFRCx5QkFBSzs7O0lBQUw7UUFDRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7Ozs7O0lBRU8scUNBQWlCOzs7O2NBQUMsRUFBTTs7UUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUNqRCxTQUFTLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLEVBQVYsQ0FBVSxDQUFDLENBQzVCO2FBQ0EsU0FBUyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBckMsQ0FBcUMsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUM7Ozs7O0lBR0osK0JBQVc7Ozs7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDOzs7Ozs7SUFHN0IsaUNBQWE7Ozs7Y0FBQyxFQUFNOztRQUMxQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLHFCQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQTVCLENBQTRCLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLEVBQUUsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBekMsQ0FBeUMsQ0FBQyxDQUFDO1NBQzNFO1FBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQzs7Ozs7O0lBR0oscUNBQWlCOzs7O2NBQUMsSUFBUztRQUNqQyxxQkFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDOzs7Z0JBL0QzRCxVQUFVOzs7O2dCQUhGLFlBQVk7Z0JBRFosZUFBZTtnREFZVCxNQUFNLFNBQUMsaUJBQWlCO2dCQWY5QixrQkFBa0I7O29CQUgzQjs7U0FXYSxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRpbWVyIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCwgcHVibGlzaFJlcGxheSwgcmVmQ291bnQsIHNoYXJlLCB0YWtlV2hpbGUgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi8uLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVTZXJ2aWNlIHtcblxuICBwcml2YXRlIGNhY2hlZE1lOiBPYnNlcnZhYmxlPE1lPjtcbiAgcHJpdmF0ZSBhbGl2ZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1lUmVwb3NpdG9yeTogTWVSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIHNvY2tldENsaWVudDogQm9vdHN0cmFwU29ja2V0LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBzZXR1cCh0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5pc0FwaVRva2VuU2V0KCkpIHtcbiAgICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuID0gdG9rZW47XG4gICAgfVxuICB9XG5cbiAgbWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIGlmICghdGhpcy5oYXNDYWNoZWRNZSgpKSB7XG4gICAgICB0aGlzLmNhY2hlZE1lID0gdGhpcy5tZVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmRNZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcChtZSA9PiB0aGlzLnNjaGVkdWxlQWxpdmVuZXNzKG1lKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaFJlcGxheSgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZDb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXJlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUucGlwZShtYXAobWUgPT4gdGhpcy5jb25uZWN0U29ja2V0KG1lKSkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uY2xlYXIoKTtcbiAgICB0aGlzLmNhY2hlZE1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVBbGl2ZW5lc3MobWU6IE1lKTogTWUge1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuICAgIHRpbWVyKDAsIHRoaXMuY29uZmlndXJhdGlvbi5hbGl2ZUludGVydmFsSW5NcykucGlwZShcbiAgICAgIHRha2VXaGlsZSgoKSA9PiB0aGlzLmFsaXZlKVxuICAgIClcbiAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMubWVSZXBvc2l0b3J5LnVwZGF0ZUFsaXZlbmVzcyhtZSkpO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgaGFzQ2FjaGVkTWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgY29ubmVjdFNvY2tldChtZTogTWUpOiBNZSB7XG4gICAgaWYgKCF0aGlzLnNvY2tldENsaWVudC5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5zb2NrZXRDbGllbnQuY29ubmVjdCh0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbik7XG4gICAgICBzb2NrZXQub24oXCJuZXcgbWVzc2FnZVwiLCBkYXRhID0+IHRoaXMucmVjZWl2ZU5ld01lc3NhZ2UoZGF0YSkpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdGVkXCIsIGRhdGEgPT4gbWUuZGV2aWNlU2Vzc2lvbklkID0gZGF0YS5kZXZpY2VTZXNzaW9uSWQpO1xuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIHJlY2VpdmVOZXdNZXNzYWdlKGpzb246IGFueSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBNZXNzYWdlLmJ1aWxkKGpzb24uZGF0YSk7XG4gICAgdGhpcy5tZSgpLnN1YnNjcmliZShtZSA9PiBtZS5oYW5kbGVOZXdNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxufVxuIl19