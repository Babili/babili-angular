/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { empty } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";
var MeRepository = /** @class */ (function () {
    function MeRepository(http, roomRepository, configuration) {
        this.http = http;
        this.roomRepository = roomRepository;
        this.configuration = configuration;
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
    Object.defineProperty(MeRepository.prototype, "userUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.configuration.apiUrl + "/user";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MeRepository.prototype, "aliveUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.userUrl + "/alive";
        },
        enumerable: true,
        configurable: true
    });
    MeRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MeRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: RoomRepository },
        { type: BabiliConfiguration }
    ]; };
    return MeRepository;
}());
export { MeRepository };
function MeRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    MeRepository.prototype.http;
    /** @type {?} */
    MeRepository.prototype.roomRepository;
    /** @type {?} */
    MeRepository.prototype.configuration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUucmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lL21lLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxLQUFLLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0QsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLFlBQVksQ0FBQzs7SUFLOUIsc0JBQW9CLElBQWdCLEVBQ2hCLGdCQUNBO1FBRkEsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixtQkFBYyxHQUFkLGNBQWM7UUFDZCxrQkFBYSxHQUFiLGFBQWE7S0FBeUI7Ozs7SUFFMUQsNkJBQU07OztJQUFOO1FBQUEsaUJBRUM7UUFEQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFJLENBQUMsY0FBYyxDQUFDLEVBQWpDLENBQWlDLENBQUMsQ0FBQyxDQUFDO0tBQ3ZGOzs7OztJQUVELHNDQUFlOzs7O0lBQWYsVUFBZ0IsRUFBTTtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBQyxDQUFDO2FBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBTSxPQUFBLEtBQUssRUFBRSxFQUFQLENBQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxjQUFNLE9BQUEsSUFBSSxFQUFKLENBQUksQ0FBQyxDQUFDLENBQUM7S0FDbkU7MEJBRVcsaUNBQU87Ozs7O1lBQ2pCLE1BQU0sQ0FBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sVUFBTyxDQUFDOzs7OzswQkFHakMsa0NBQVE7Ozs7O1lBQ2xCLE1BQU0sQ0FBSSxJQUFJLENBQUMsT0FBTyxXQUFRLENBQUM7Ozs7OztnQkFyQmxDLFVBQVU7Ozs7Z0JBUkYsVUFBVTtnQkFLVixjQUFjO2dCQUhkLG1CQUFtQjs7dUJBRjVCOztTQVNhLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHsgZW1wdHksIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVJlcG9zaXRvcnkge1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBmaW5kTWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMudXNlclVybCkucGlwZShtYXAobWUgPT4gTWUuYnVpbGQobWUsIHRoaXMucm9vbVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGVBbGl2ZW5lc3MobWU6IE1lKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodGhpcy5hbGl2ZVVybCwgeyBkYXRhOiB7IHR5cGU6IFwiYWxpdmVcIiB9fSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcigoKSA9PiBlbXB0eSgpKSwgbWFwKCgpID0+IG51bGwpKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHVzZXJVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWd1cmF0aW9uLmFwaVVybH0vdXNlcmA7XG4gIH1cblxuICBwcml2YXRlIGdldCBhbGl2ZVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLnVzZXJVcmx9L2FsaXZlYDtcbiAgfVxufVxuXG4iXX0=