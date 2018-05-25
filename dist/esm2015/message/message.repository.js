/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { URL_CONFIGURATION } from "../configuration/url-configuration.types";
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
        this.roomUrl = `${configuration.apiUrl}/user/rooms`;
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
}
MessageRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MessageRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
];
function MessageRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    MessageRepository.prototype.roomUrl;
    /** @type {?} */
    MessageRepository.prototype.http;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5yZXBvc2l0b3J5LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGJhYmlsaS5pby9hbmd1bGFyLyIsInNvdXJjZXMiOlsibWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVuRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDckMsT0FBTyxFQUFFLGlCQUFpQixFQUFvQixNQUFNLDBDQUEwQyxDQUFDO0FBRS9GLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUxQyxNQUFNO0NBSUw7Ozs7Ozs7OztBQUdELE1BQU07Ozs7O0lBSUosWUFBb0IsSUFBZ0IsRUFDRyxhQUErQjtRQURsRCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBRWxDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxhQUFhLENBQUMsTUFBTSxhQUFhLENBQUM7S0FDckQ7Ozs7OztJQUVELE1BQU0sQ0FBQyxJQUFVLEVBQUUsVUFBc0I7UUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzlDLElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsU0FBUztnQkFDZixVQUFVLEVBQUUsVUFBVTthQUN2QjtTQUNGLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0Q7Ozs7OztJQUVELE9BQU8sQ0FBQyxJQUFVLEVBQUUsVUFBZ0Q7UUFDbEUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDO2FBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFhLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMzRTs7Ozs7O0lBRUQsTUFBTSxDQUFDLElBQVUsRUFBRSxPQUFnQjtRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUM7YUFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDakQ7Ozs7O0lBRU8sVUFBVSxDQUFDLE1BQWM7UUFDL0IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQzs7OztZQTlCL0MsVUFBVTs7OztZQWRGLFVBQVU7NENBb0JKLE1BQU0sU0FBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnZS50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTmV3TWVzc2FnZSB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgY29udGVudFR5cGU6IHN0cmluZztcbiAgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZXNzYWdlUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSByb29tVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5yb29tVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG5cbiAgY3JlYXRlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QodGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IE1lc3NhZ2UuYnVpbGQocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHsgcGFyYW1zOiBhdHRyaWJ1dGVzIH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5tYXAocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGRlbGV0ZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUoYCR7dGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpfS8ke21lc3NhZ2UuaWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlc3BvbnNlID0+IG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgbWVzc2FnZVVybChyb29tSWQ6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbUlkfS9tZXNzYWdlc2A7XG4gIH1cblxufVxuIl19