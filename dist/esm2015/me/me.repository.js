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
export class MeRepository {
    /**
     * @param {?} http
     * @param {?} roomRepository
     * @param {?} configuration
     */
    constructor(http, roomRepository, configuration) {
        this.http = http;
        this.roomRepository = roomRepository;
        this.configuration = configuration;
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
    /**
     * @return {?}
     */
    get userUrl() {
        return `${this.configuration.apiUrl}/user`;
    }
    /**
     * @return {?}
     */
    get aliveUrl() {
        return `${this.userUrl}/alive`;
    }
}
MeRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MeRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: RoomRepository },
    { type: BabiliConfiguration }
];
function MeRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    MeRepository.prototype.http;
    /** @type {?} */
    MeRepository.prototype.roomRepository;
    /** @type {?} */
    MeRepository.prototype.configuration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUucmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lL21lLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxLQUFLLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0QsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUdoQyxNQUFNOzs7Ozs7SUFFSixZQUFvQixJQUFnQixFQUNoQixnQkFDQTtRQUZBLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsbUJBQWMsR0FBZCxjQUFjO1FBQ2Qsa0JBQWEsR0FBYixhQUFhO0tBQXlCOzs7O0lBRTFELE1BQU07UUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3ZGOzs7OztJQUVELGVBQWUsQ0FBQyxFQUFNO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFDLENBQUM7YUFDOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ25FOzs7O1FBRVcsT0FBTztRQUNqQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sT0FBTyxDQUFDOzs7OztRQUdqQyxRQUFRO1FBQ2xCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLFFBQVEsQ0FBQzs7OztZQXJCbEMsVUFBVTs7OztZQVJGLFVBQVU7WUFLVixjQUFjO1lBSGQsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IGVtcHR5LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi8uLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVSZXBvc2l0b3J5IHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgZmluZE1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLnVzZXJVcmwpLnBpcGUobWFwKG1lID0+IE1lLmJ1aWxkKG1lLCB0aGlzLnJvb21SZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlQWxpdmVuZXNzKG1lOiBNZSk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuYWxpdmVVcmwsIHsgZGF0YTogeyB0eXBlOiBcImFsaXZlXCIgfX0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoKCkgPT4gZW1wdHkoKSksIG1hcCgoKSA9PiBudWxsKSk7XG4gIH1cblxuICBwcml2YXRlIGdldCB1c2VyVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuY29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXJgO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgYWxpdmVVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy51c2VyVXJsfS9hbGl2ZWA7XG4gIH1cbn1cblxuIl19