/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { MessageRepository } from "../message/message.repository";
import { User } from "../user/user.types";
import { Room } from "./room.types";
var RoomRepository = /** @class */ (function () {
    function RoomRepository(http, messageRepository, configuration) {
        this.http = http;
        this.messageRepository = messageRepository;
        this.configuration = configuration;
    }
    /**
     * @param {?} id
     * @return {?}
     */
    RoomRepository.prototype.find = /**
     * @param {?} id
     * @return {?}
     */
    function (id) {
        var _this = this;
        return this.http.get(this.roomUrl + "/" + id)
            .pipe(map(function (json) { return Room.build(json.data, _this, _this.messageRepository); }));
    };
    /**
     * @param {?} query
     * @return {?}
     */
    RoomRepository.prototype.findAll = /**
     * @param {?} query
     * @return {?}
     */
    function (query) {
        var _this = this;
        return this.http.get(this.roomUrl, { params: query })
            .pipe(map(function (json) { return Room.map(json.data, _this, _this.messageRepository); }));
    };
    /**
     * @return {?}
     */
    RoomRepository.prototype.findOpenedRooms = /**
     * @return {?}
     */
    function () {
        return this.findAll({ onlyOpened: "true" });
    };
    /**
     * @return {?}
     */
    RoomRepository.prototype.findClosedRooms = /**
     * @return {?}
     */
    function () {
        return this.findAll({ onlyClosed: "true" });
    };
    /**
     * @param {?} id
     * @return {?}
     */
    RoomRepository.prototype.findRoomsAfter = /**
     * @param {?} id
     * @return {?}
     */
    function (id) {
        return this.findAll({ firstSeenRoomId: id });
    };
    /**
     * @param {?} roomIds
     * @return {?}
     */
    RoomRepository.prototype.findRoomsByIds = /**
     * @param {?} roomIds
     * @return {?}
     */
    function (roomIds) {
        return this.findAll({ "roomIds[]": roomIds });
    };
    /**
     * @param {?} room
     * @param {?} open
     * @return {?}
     */
    RoomRepository.prototype.updateMembership = /**
     * @param {?} room
     * @param {?} open
     * @return {?}
     */
    function (room, open) {
        return this.http.put(this.roomUrl + "/" + room.id + "/membership", {
            data: {
                type: "membership",
                attributes: {
                    open: open
                }
            }
        }).pipe(map(function (data) {
            room.open = data.data.attributes.open;
            return room;
        }));
    };
    /**
     * @param {?} room
     * @return {?}
     */
    RoomRepository.prototype.markAllReceivedMessagesAsRead = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        if (room.unreadMessageCount > 0) {
            var /** @type {?} */ lastReadMessageId = room.messages.length > 0 ? room.messages[room.messages.length - 1].id : undefined;
            return this.http.put(this.roomUrl + "/" + room.id + "/membership/unread-messages", { data: { lastReadMessageId: lastReadMessageId } })
                .pipe(map(function (data) {
                room.unreadMessageCount = 0;
                return data.meta.count;
            }));
        }
        else {
            return of(0);
        }
    };
    /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    RoomRepository.prototype.create = /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    function (name, userIds, withoutDuplicate) {
        var _this = this;
        return this.http.post(this.roomUrl + "?noDuplicate=" + withoutDuplicate, {
            data: {
                type: "room",
                attributes: {
                    name: name
                },
                relationships: {
                    users: {
                        data: userIds.map(function (userId) { return ({ type: "user", id: userId }); })
                    }
                }
            }
        }, {
            params: {
                noDuplicate: "" + withoutDuplicate
            }
        }).pipe(map(function (response) { return Room.build(response.data, _this, _this.messageRepository); }));
    };
    /**
     * @param {?} room
     * @return {?}
     */
    RoomRepository.prototype.update = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        return this.http.put(this.roomUrl + "/" + room.id, {
            data: {
                type: "room",
                attributes: {
                    name: room.name
                }
            }
        }).pipe(map(function (response) {
            room.name = response.data.attributes.name;
            return room;
        }));
    };
    /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    RoomRepository.prototype.addUser = /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    function (room, userId) {
        return this.http.post(this.roomUrl + "/" + room.id + "/memberships", {
            data: {
                type: "membership",
                relationships: {
                    user: {
                        data: {
                            type: "user",
                            id: userId
                        }
                    }
                }
            }
        }).pipe(map(function (response) {
            var /** @type {?} */ newUser = User.build(response.data.relationships.user.data);
            room.addUser(newUser);
            return room;
        }));
    };
    /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    RoomRepository.prototype.deleteMessage = /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    function (room, message) {
        return this.messageRepository.delete(room, message);
    };
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    RoomRepository.prototype.findMessages = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.messageRepository.findAll(room, attributes);
    };
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    RoomRepository.prototype.createMessage = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.messageRepository.create(room, attributes);
    };
    Object.defineProperty(RoomRepository.prototype, "roomUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.configuration.apiUrl + "/user/rooms";
        },
        enumerable: true,
        configurable: true
    });
    RoomRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    RoomRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: MessageRepository },
        { type: BabiliConfiguration }
    ]; };
    return RoomRepository;
}());
export { RoomRepository };
function RoomRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    RoomRepository.prototype.http;
    /** @type {?} */
    RoomRepository.prototype.messageRepository;
    /** @type {?} */
    RoomRepository.prototype.configuration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5yZXBvc2l0b3J5LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGJhYmlsaS5pby9hbmd1bGFyLyIsInNvdXJjZXMiOlsicm9vbS9yb29tLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sRUFBYyxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sRUFBRSxpQkFBaUIsRUFBYyxNQUFNLCtCQUErQixDQUFDO0FBQzlFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUUxQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sY0FBYyxDQUFDOztJQUtsQyx3QkFBb0IsSUFBZ0IsRUFDaEIsbUJBQ0E7UUFGQSxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLHNCQUFpQixHQUFqQixpQkFBaUI7UUFDakIsa0JBQWEsR0FBYixhQUFhO0tBQXlCOzs7OztJQUUxRCw2QkFBSTs7OztJQUFKLFVBQUssRUFBVTtRQUFmLGlCQUdDO1FBRkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFJLElBQUksQ0FBQyxPQUFPLFNBQUksRUFBSSxDQUFDO2FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFTLElBQUssT0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSSxFQUFFLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFuRCxDQUFtRCxDQUFDLENBQUMsQ0FBQztLQUNoRzs7Ozs7SUFFRCxnQ0FBTzs7OztJQUFQLFVBQVEsS0FB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RDswQkFFVyxtQ0FBTzs7Ozs7WUFDakIsTUFBTSxDQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxnQkFBYSxDQUFDOzs7Ozs7Z0JBL0hwRCxVQUFVOzs7O2dCQVZGLFVBQVU7Z0JBS1YsaUJBQWlCO2dCQUhqQixtQkFBbUI7O3lCQUY1Qjs7U0FXYSxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4vcm9vbS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vbVJlcG9zaXRvcnkge1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBmaW5kKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldChgJHt0aGlzLnJvb21Vcmx9LyR7aWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20uYnVpbGQoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZEFsbChxdWVyeToge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy5yb29tVXJsLCB7IHBhcmFtczogcXVlcnkgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20ubWFwKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5T3BlbmVkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5Q2xvc2VkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0FmdGVyKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBmaXJzdFNlZW5Sb29tSWQ6IGlkIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQnlJZHMocm9vbUlkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgXCJyb29tSWRzW11cIjogcm9vbUlkcyB9KTtcbiAgfVxuXG4gIHVwZGF0ZU1lbWJlcnNoaXAocm9vbTogUm9vbSwgb3BlbjogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG9wZW46IG9wZW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgIHJvb20ub3BlbiA9IGRhdGEuZGF0YS5hdHRyaWJ1dGVzLm9wZW47XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICBpZiAocm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPiAwKSB7XG4gICAgICBjb25zdCBsYXN0UmVhZE1lc3NhZ2VJZCA9IHJvb20ubWVzc2FnZXMubGVuZ3RoID4gMCA/IHJvb20ubWVzc2FnZXNbcm9vbS5tZXNzYWdlcy5sZW5ndGggLSAxXS5pZCA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwL3VucmVhZC1tZXNzYWdlc2AsIHsgZGF0YTogeyBsYXN0UmVhZE1lc3NhZ2VJZDogbGFzdFJlYWRNZXNzYWdlSWQgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5tZXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKDApO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0/bm9EdXBsaWNhdGU9JHt3aXRob3V0RHVwbGljYXRlfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2Vyczoge1xuICAgICAgICAgICAgZGF0YTogdXNlcklkcy5tYXAodXNlcklkID0+ICh7IHR5cGU6IFwidXNlclwiLCBpZDogdXNlcklkIH0pIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgbm9EdXBsaWNhdGU6IGAke3dpdGhvdXREdXBsaWNhdGV9YFxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBSb29tLmJ1aWxkKHJlc3BvbnNlLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGUocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiByb29tLm5hbWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICByb29tLm5hbWUgPSByZXNwb25zZS5kYXRhLmF0dHJpYnV0ZXMubmFtZTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGFkZFVzZXIocm9vbTogUm9vbSwgdXNlcklkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBzYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogXCJ1c2VyXCIsXG4gICAgICAgICAgICAgIGlkOiB1c2VySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgY29uc3QgbmV3VXNlciA9IFVzZXIuYnVpbGQocmVzcG9uc2UuZGF0YS5yZWxhdGlvbnNoaXBzLnVzZXIuZGF0YSk7XG4gICAgICByb29tLmFkZFVzZXIobmV3VXNlcik7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBkZWxldGVNZXNzYWdlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5kZWxldGUocm9vbSwgbWVzc2FnZSk7XG4gIH1cblxuICBmaW5kTWVzc2FnZXMocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5maW5kQWxsKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgY3JlYXRlTWVzc2FnZShyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuY3JlYXRlKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcm9vbVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyL3Jvb21zYDtcbiAgfVxufVxuIl19