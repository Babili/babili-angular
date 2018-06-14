/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { map } from "rxjs/operators";
import { Message } from "./message.types";
var NewMessage = /** @class */ (function () {
    function NewMessage() {
    }
    return NewMessage;
}());
export { NewMessage };
function NewMessage_tsickle_Closure_declarations() {
    /** @type {?} */
    NewMessage.prototype.content;
    /** @type {?} */
    NewMessage.prototype.contentType;
    /** @type {?} */
    NewMessage.prototype.deviceSessionId;
}
var MessageRepository = /** @class */ (function () {
    function MessageRepository(http, configuration) {
        this.http = http;
        this.configuration = configuration;
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    MessageRepository.prototype.create = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.http.post(this.messageUrl(room.id), {
            data: {
                type: "message",
                attributes: attributes
            }
        }).pipe(map(function (response) { return Message.build(response.data); }));
    };
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    MessageRepository.prototype.findAll = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.http.get(this.messageUrl(room.id), { params: attributes })
            .pipe(map(function (response) { return Message.map(response.data); }));
    };
    /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    MessageRepository.prototype.delete = /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    function (room, message) {
        return this.http.delete(this.messageUrl(room.id) + "/" + message.id)
            .pipe(map(function (response) { return message; }));
    };
    /**
     * @param {?} roomId
     * @return {?}
     */
    MessageRepository.prototype.messageUrl = /**
     * @param {?} roomId
     * @return {?}
     */
    function (roomId) {
        return this.roomUrl + "/" + roomId + "/messages";
    };
    Object.defineProperty(MessageRepository.prototype, "roomUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.configuration.apiUrl + "/user/rooms";
        },
        enumerable: true,
        configurable: true
    });
    MessageRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MessageRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: BabiliConfiguration }
    ]; };
    return MessageRepository;
}());
export { MessageRepository };
function MessageRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    MessageRepository.prototype.http;
    /** @type {?} */
    MessageRepository.prototype.configuration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5yZXBvc2l0b3J5LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGJhYmlsaS5pby9hbmd1bGFyLyIsInNvdXJjZXMiOlsibWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRTVFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsSUFBQTs7O3FCQVJBO0lBWUMsQ0FBQTtBQUpELHNCQUlDOzs7Ozs7Ozs7O0lBS0MsMkJBQW9CLElBQWdCLEVBQ2hCO1FBREEsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixrQkFBYSxHQUFiLGFBQWE7S0FBeUI7Ozs7OztJQUUxRCxrQ0FBTTs7Ozs7SUFBTixVQUFPLElBQVUsRUFBRSxVQUFzQjtRQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDOUMsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSxTQUFTO2dCQUNmLFVBQVUsRUFBRSxVQUFVO2FBQ3ZCO1NBQ0YsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxRQUFhLElBQUssT0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDLENBQUM7S0FDL0Q7Ozs7OztJQUVELG1DQUFPOzs7OztJQUFQLFVBQVEsSUFBVSxFQUFFLFVBQWdEO1FBQ2xFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQzthQUNyRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUMsUUFBYSxJQUFLLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQyxDQUFDO0tBQzNFOzs7Ozs7SUFFRCxrQ0FBTTs7Ozs7SUFBTixVQUFPLElBQVUsRUFBRSxPQUFnQjtRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQUksT0FBTyxDQUFDLEVBQUksQ0FBQzthQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsUUFBUSxJQUFJLE9BQUEsT0FBTyxFQUFQLENBQU8sQ0FBQyxDQUFDLENBQUM7S0FDakQ7Ozs7O0lBRU8sc0NBQVU7Ozs7Y0FBQyxNQUFjO1FBQy9CLE1BQU0sQ0FBSSxJQUFJLENBQUMsT0FBTyxTQUFJLE1BQU0sY0FBVyxDQUFDOzswQkFHbEMsc0NBQU87Ozs7O1lBQ2pCLE1BQU0sQ0FBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sZ0JBQWEsQ0FBQzs7Ozs7O2dCQTlCcEQsVUFBVTs7OztnQkFkRixVQUFVO2dCQUVWLG1CQUFtQjs7NEJBRjVCOztTQWVhLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBOZXdNZXNzYWdlIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZW50VHlwZTogc3RyaW5nO1xuICBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VSZXBvc2l0b3J5IHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBjcmVhdGUocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5idWlsZChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZmluZEFsbChyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwgeyBwYXJhbXM6IGF0dHJpYnV0ZXMgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLm1hcChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZGVsZXRlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCl9LyR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocmVzcG9uc2UgPT4gbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBtZXNzYWdlVXJsKHJvb21JZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucm9vbVVybH0vJHtyb29tSWR9L21lc3NhZ2VzYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJvb21VcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cbn1cbiJdfQ==