/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { empty } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { URL_CONFIGURATION } from "../configuration/url-configuration.types";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";
var MeRepository = /** @class */ (function () {
    function MeRepository(http, roomRepository, configuration) {
        this.http = http;
        this.roomRepository = roomRepository;
        this.userUrl = configuration.apiUrl + "/user";
        this.aliveUrl = this.userUrl + "/alive";
    }
    /**
     * @return {?}
     */
    MeRepository.prototype.findMe = /**
     * @return {?}
     */
    function () {
        var _this = this;
        return this.http.get(this.userUrl).pipe(map(function (me) { return Me.build(me, _this.roomRepository); }));
    };
    /**
     * @param {?} me
     * @return {?}
     */
    MeRepository.prototype.updateAliveness = /**
     * @param {?} me
     * @return {?}
     */
    function (me) {
        return this.http.put(this.aliveUrl, { data: { type: "alive" } })
            .pipe(catchError(function () { return empty(); }), map(function () { return null; }));
    };
    MeRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MeRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: RoomRepository },
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
    ]; };
    return MeRepository;
}());
export { MeRepository };
function MeRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    MeRepository.prototype.userUrl;
    /** @type {?} */
    MeRepository.prototype.aliveUrl;
    /** @type {?} */
    MeRepository.prototype.http;
    /** @type {?} */
    MeRepository.prototype.roomRepository;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUucmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lL21lLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsS0FBSyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFFLGlCQUFpQixFQUFvQixNQUFNLDBDQUEwQyxDQUFDO0FBQy9GLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sWUFBWSxDQUFDOztJQVE5QixzQkFBb0IsSUFBZ0IsRUFDaEIsZ0JBQ21CLGFBQStCO1FBRmxELFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsbUJBQWMsR0FBZCxjQUFjO1FBRWhDLElBQUksQ0FBQyxPQUFPLEdBQU0sYUFBYSxDQUFDLE1BQU0sVUFBTyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLEdBQU0sSUFBSSxDQUFDLE9BQU8sV0FBUSxDQUFDO0tBQ3pDOzs7O0lBRUQsNkJBQU07OztJQUFOO1FBQUEsaUJBRUM7UUFEQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFJLENBQUMsY0FBYyxDQUFDLEVBQWpDLENBQWlDLENBQUMsQ0FBQyxDQUFDO0tBQ3ZGOzs7OztJQUVELHNDQUFlOzs7O0lBQWYsVUFBZ0IsRUFBTTtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBQyxDQUFDO2FBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBTSxPQUFBLEtBQUssRUFBRSxFQUFQLENBQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxjQUFNLE9BQUEsSUFBSSxFQUFKLENBQUksQ0FBQyxDQUFDLENBQUM7S0FDbkU7O2dCQXBCRixVQUFVOzs7O2dCQVJGLFVBQVU7Z0JBS1YsY0FBYztnREFXUixNQUFNLFNBQUMsaUJBQWlCOzt1QkFoQnZDOztTQVNhLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgZW1wdHksIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVJlcG9zaXRvcnkge1xuXG4gIHByaXZhdGUgdXNlclVybDogc3RyaW5nO1xuICBwcml2YXRlIGFsaXZlVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMudXNlclVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyYDtcbiAgICB0aGlzLmFsaXZlVXJsID0gYCR7dGhpcy51c2VyVXJsfS9hbGl2ZWA7XG4gIH1cblxuICBmaW5kTWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMudXNlclVybCkucGlwZShtYXAobWUgPT4gTWUuYnVpbGQobWUsIHRoaXMucm9vbVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGVBbGl2ZW5lc3MobWU6IE1lKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodGhpcy5hbGl2ZVVybCwgeyBkYXRhOiB7IHR5cGU6IFwiYWxpdmVcIiB9fSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcigoKSA9PiBlbXB0eSgpKSwgbWFwKCgpID0+IG51bGwpKTtcbiAgfVxufVxuXG4iXX0=