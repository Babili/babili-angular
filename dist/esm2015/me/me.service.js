/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { timer } from "rxjs";
import { map, publishReplay, refCount, share, takeWhile } from "rxjs/operators";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { Message } from "./../message/message.types";
import { BootstrapSocket } from "./../socket/bootstrap.socket";
import { MeRepository } from "./me.repository";
export class MeService {
    /**
     * @param {?} meRepository
     * @param {?} socketClient
     * @param {?} configuration
     * @param {?} tokenConfiguration
     */
    constructor(meRepository, socketClient, configuration, tokenConfiguration) {
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
    setup(token) {
        if (!this.tokenConfiguration.isApiTokenSet()) {
            this.tokenConfiguration.apiToken = token;
        }
    }
    /**
     * @return {?}
     */
    me() {
        if (!this.hasCachedMe()) {
            this.cachedMe = this.meRepository
                .findMe()
                .pipe(map(me => this.scheduleAliveness(me)), publishReplay(1), refCount(), share());
        }
        return this.cachedMe.pipe(map(me => this.connectSocket(me)));
    }
    /**
     * @return {?}
     */
    clear() {
        this.tokenConfiguration.clear();
        this.cachedMe = undefined;
        this.alive = false;
    }
    /**
     * @param {?} me
     * @return {?}
     */
    scheduleAliveness(me) {
        this.alive = true;
        timer(0, this.configuration.aliveIntervalInMs).pipe(takeWhile(() => this.alive))
            .subscribe(() => this.meRepository.updateAliveness(me));
        return me;
    }
    /**
     * @return {?}
     */
    hasCachedMe() {
        return this.cachedMe !== undefined;
    }
    /**
     * @param {?} me
     * @return {?}
     */
    connectSocket(me) {
        if (!this.socketClient.socketExists()) {
            const /** @type {?} */ socket = this.socketClient.connect(this.tokenConfiguration.apiToken);
            socket.on("new message", data => this.receiveNewMessage(data));
            socket.on("connected", data => me.deviceSessionId = data.deviceSessionId);
        }
        return me;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    receiveNewMessage(json) {
        const /** @type {?} */ message = Message.build(json.data);
        this.me().subscribe(me => me.handleNewMessage(message));
    }
}
MeService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MeService.ctorParameters = () => [
    { type: MeRepository },
    { type: BootstrapSocket },
    { type: BabiliConfiguration },
    { type: TokenConfiguration }
];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lL21lLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFjLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6QyxPQUFPLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2hGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSS9DLE1BQU07Ozs7Ozs7SUFLSixZQUFvQixZQUEwQixFQUMxQixjQUNBLGVBQ0E7UUFIQSxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixpQkFBWSxHQUFaLFlBQVk7UUFDWixrQkFBYSxHQUFiLGFBQWE7UUFDYix1QkFBa0IsR0FBbEIsa0JBQWtCO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ3BCOzs7OztJQUVELEtBQUssQ0FBQyxLQUFhO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztTQUMxQztLQUNGOzs7O0lBRUQsRUFBRTtRQUNBLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZO2lCQUNaLE1BQU0sRUFBRTtpQkFDUixJQUFJLENBQ0gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3JDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFDaEIsUUFBUSxFQUFFLEVBQ1YsS0FBSyxFQUFFLENBQ1IsQ0FBQztTQUN2QjtRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM5RDs7OztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7Ozs7O0lBRU8saUJBQWlCLENBQUMsRUFBTTtRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQ2pELFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQzVCO2FBQ0EsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEQsTUFBTSxDQUFDLEVBQUUsQ0FBQzs7Ozs7SUFHSixXQUFXO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQzs7Ozs7O0lBRzdCLGFBQWEsQ0FBQyxFQUFNO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsdUJBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDM0U7UUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDOzs7Ozs7SUFHSixpQkFBaUIsQ0FBQyxJQUFTO1FBQ2pDLHVCQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Ozs7WUEvRDNELFVBQVU7Ozs7WUFIRixZQUFZO1lBRFosZUFBZTtZQUxmLG1CQUFtQjtZQUduQixrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGltZXIgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwLCBwdWJsaXNoUmVwbGF5LCByZWZDb3VudCwgc2hhcmUsIHRha2VXaGlsZSB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi8uLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVTZXJ2aWNlIHtcblxuICBwcml2YXRlIGNhY2hlZE1lOiBPYnNlcnZhYmxlPE1lPjtcbiAgcHJpdmF0ZSBhbGl2ZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1lUmVwb3NpdG9yeTogTWVSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIHNvY2tldENsaWVudDogQm9vdHN0cmFwU29ja2V0LFxuICAgICAgICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBzZXR1cCh0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5pc0FwaVRva2VuU2V0KCkpIHtcbiAgICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuID0gdG9rZW47XG4gICAgfVxuICB9XG5cbiAgbWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIGlmICghdGhpcy5oYXNDYWNoZWRNZSgpKSB7XG4gICAgICB0aGlzLmNhY2hlZE1lID0gdGhpcy5tZVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmRNZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcChtZSA9PiB0aGlzLnNjaGVkdWxlQWxpdmVuZXNzKG1lKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaFJlcGxheSgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZDb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXJlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUucGlwZShtYXAobWUgPT4gdGhpcy5jb25uZWN0U29ja2V0KG1lKSkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uY2xlYXIoKTtcbiAgICB0aGlzLmNhY2hlZE1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVBbGl2ZW5lc3MobWU6IE1lKTogTWUge1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuICAgIHRpbWVyKDAsIHRoaXMuY29uZmlndXJhdGlvbi5hbGl2ZUludGVydmFsSW5NcykucGlwZShcbiAgICAgIHRha2VXaGlsZSgoKSA9PiB0aGlzLmFsaXZlKVxuICAgIClcbiAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMubWVSZXBvc2l0b3J5LnVwZGF0ZUFsaXZlbmVzcyhtZSkpO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgaGFzQ2FjaGVkTWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgY29ubmVjdFNvY2tldChtZTogTWUpOiBNZSB7XG4gICAgaWYgKCF0aGlzLnNvY2tldENsaWVudC5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5zb2NrZXRDbGllbnQuY29ubmVjdCh0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbik7XG4gICAgICBzb2NrZXQub24oXCJuZXcgbWVzc2FnZVwiLCBkYXRhID0+IHRoaXMucmVjZWl2ZU5ld01lc3NhZ2UoZGF0YSkpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdGVkXCIsIGRhdGEgPT4gbWUuZGV2aWNlU2Vzc2lvbklkID0gZGF0YS5kZXZpY2VTZXNzaW9uSWQpO1xuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIHJlY2VpdmVOZXdNZXNzYWdlKGpzb246IGFueSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBNZXNzYWdlLmJ1aWxkKGpzb24uZGF0YSk7XG4gICAgdGhpcy5tZSgpLnN1YnNjcmliZShtZSA9PiBtZS5oYW5kbGVOZXdNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxufVxuIl19