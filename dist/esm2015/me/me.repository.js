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
export class MeRepository {
    /**
     * @param {?} http
     * @param {?} roomRepository
     * @param {?} configuration
     */
    constructor(http, roomRepository, configuration) {
        this.http = http;
        this.roomRepository = roomRepository;
        this.userUrl = `${configuration.apiUrl}/user`;
        this.aliveUrl = `${this.userUrl}/alive`;
    }
    /**
     * @return {?}
     */
    findMe() {
        return this.http.get(this.userUrl).pipe(map(me => Me.build(me, this.roomRepository)));
    }
    /**
     * @param {?} me
     * @return {?}
     */
    updateAliveness(me) {
        return this.http.put(this.aliveUrl, { data: { type: "alive" } })
            .pipe(catchError(() => empty()), map(() => null));
    }
}
MeRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MeRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: RoomRepository },
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUucmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lL21lLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVuRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUEwQixpQkFBaUIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ3JHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBR2hDLE1BQU07Ozs7OztJQUtKLFlBQW9CLElBQWdCLEVBQ2hCLGdCQUNtQixhQUFxQztRQUZ4RCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLG1CQUFjLEdBQWQsY0FBYztRQUVoQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sT0FBTyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxRQUFRLENBQUM7S0FDekM7Ozs7SUFFRCxNQUFNO1FBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2Rjs7Ozs7SUFFRCxlQUFlLENBQUMsRUFBTTtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBQyxDQUFDO2FBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNuRTs7O1lBcEJGLFVBQVU7Ozs7WUFURixVQUFVO1lBTVYsY0FBYzs0Q0FXUixNQUFNLFNBQUMsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZW1wdHkgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVJlcG9zaXRvcnkge1xuXG4gIHByaXZhdGUgdXNlclVybDogc3RyaW5nO1xuICBwcml2YXRlIGFsaXZlVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMudXNlclVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyYDtcbiAgICB0aGlzLmFsaXZlVXJsID0gYCR7dGhpcy51c2VyVXJsfS9hbGl2ZWA7XG4gIH1cblxuICBmaW5kTWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMudXNlclVybCkucGlwZShtYXAobWUgPT4gTWUuYnVpbGQobWUsIHRoaXMucm9vbVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGVBbGl2ZW5lc3MobWU6IE1lKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodGhpcy5hbGl2ZVVybCwgeyBkYXRhOiB7IHR5cGU6IFwiYWxpdmVcIiB9fSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcigoKSA9PiBlbXB0eSgpKSwgbWFwKCgpID0+IG51bGwpKTtcbiAgfVxufVxuXG4iXX0=