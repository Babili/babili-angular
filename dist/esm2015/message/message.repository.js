/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { map } from "rxjs/operators";
import { Message } from "./message.types";
export class NewMessage {
}
function NewMessage_tsickle_Closure_declarations() {
    /** @type {?} */
    NewMessage.prototype.content;
    /** @type {?} */
    NewMessage.prototype.contentType;
    /** @type {?} */
    NewMessage.prototype.deviceSessionId;
}
export class MessageRepository {
    /**
     * @param {?} http
     * @param {?} configuration
     */
    constructor(http, configuration) {
        this.http = http;
        this.configuration = configuration;
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    create(room, attributes) {
        return this.http.post(this.messageUrl(room.id), {
            data: {
                type: "message",
                attributes: attributes
            }
        }).pipe(map((response) => Message.build(response.data)));
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    findAll(room, attributes) {
        return this.http.get(this.messageUrl(room.id), { params: attributes })
            .pipe(map((response) => Message.map(response.data)));
    }
    /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    delete(room, message) {
        return this.http.delete(`${this.messageUrl(room.id)}/${message.id}`)
            .pipe(map(response => message));
    }
    /**
     * @param {?} roomId
     * @return {?}
     */
    messageUrl(roomId) {
        return `${this.roomUrl}/${roomId}/messages`;
    }
    /**
     * @return {?}
     */
    get roomUrl() {
        return `${this.configuration.apiUrl}/user/rooms`;
    }
}
MessageRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MessageRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: BabiliConfiguration }
];
function MessageRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    MessageRepository.prototype.http;
    /** @type {?} */
    MessageRepository.prototype.configuration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5yZXBvc2l0b3J5LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGJhYmlsaS5pby9hbmd1bGFyLyIsInNvdXJjZXMiOlsibWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRTVFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsTUFBTTtDQUlMOzs7Ozs7Ozs7QUFHRCxNQUFNOzs7OztJQUVKLFlBQW9CLElBQWdCLEVBQ2hCO1FBREEsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixrQkFBYSxHQUFiLGFBQWE7S0FBeUI7Ozs7OztJQUUxRCxNQUFNLENBQUMsSUFBVSxFQUFFLFVBQXNCO1FBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUM5QyxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsVUFBVSxFQUFFLFVBQVU7YUFDdkI7U0FDRixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQWEsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9EOzs7Ozs7SUFFRCxPQUFPLENBQUMsSUFBVSxFQUFFLFVBQWdEO1FBQ2xFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQzthQUNyRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDM0U7Ozs7OztJQUVELE1BQU0sQ0FBQyxJQUFVLEVBQUUsT0FBZ0I7UUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ2pEOzs7OztJQUVPLFVBQVUsQ0FBQyxNQUFjO1FBQy9CLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxXQUFXLENBQUM7Ozs7O1FBR2xDLE9BQU87UUFDakIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLGFBQWEsQ0FBQzs7OztZQTlCcEQsVUFBVTs7OztZQWRGLFVBQVU7WUFFVixtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnZS50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTmV3TWVzc2FnZSB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgY29udGVudFR5cGU6IHN0cmluZztcbiAgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZXNzYWdlUmVwb3NpdG9yeSB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgY3JlYXRlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QodGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IE1lc3NhZ2UuYnVpbGQocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHsgcGFyYW1zOiBhdHRyaWJ1dGVzIH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5tYXAocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGRlbGV0ZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUoYCR7dGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpfS8ke21lc3NhZ2UuaWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlc3BvbnNlID0+IG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgbWVzc2FnZVVybChyb29tSWQ6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbUlkfS9tZXNzYWdlc2A7XG4gIH1cblxuICBwcml2YXRlIGdldCByb29tVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuY29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG59XG4iXX0=