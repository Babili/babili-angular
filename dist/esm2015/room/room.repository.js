/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { URL_CONFIGURATION } from "../configuration/url-configuration.types";
import { MessageRepository } from "../message/message.repository";
import { User } from "../user/user.types";
import { Room } from "./room.types";
export class RoomRepository {
    /**
     * @param {?} http
     * @param {?} messageRepository
     * @param {?} configuration
     */
    constructor(http, messageRepository, configuration) {
        this.http = http;
        this.messageRepository = messageRepository;
        this.roomUrl = `${configuration.apiUrl}/user/rooms`;
    }
    /**
     * @param {?} id
     * @return {?}
     */
    find(id) {
        return this.http.get(`${this.roomUrl}/${id}`)
            .pipe(map((json) => Room.build(json.data, this, this.messageRepository)));
    }
    /**
     * @param {?} query
     * @return {?}
     */
    findAll(query) {
        return this.http.get(this.roomUrl, { params: query })
            .pipe(map((json) => Room.map(json.data, this, this.messageRepository)));
    }
    /**
     * @return {?}
     */
    findOpenedRooms() {
        return this.findAll({ onlyOpened: "true" });
    }
    /**
     * @return {?}
     */
    findClosedRooms() {
        return this.findAll({ onlyClosed: "true" });
    }
    /**
     * @param {?} id
     * @return {?}
     */
    findRoomsAfter(id) {
        return this.findAll({ firstSeenRoomId: id });
    }
    /**
     * @param {?} roomIds
     * @return {?}
     */
    findRoomsByIds(roomIds) {
        return this.findAll({ "roomIds[]": roomIds });
    }
    /**
     * @param {?} room
     * @param {?} open
     * @return {?}
     */
    updateMembership(room, open) {
        return this.http.put(`${this.roomUrl}/${room.id}/membership`, {
            data: {
                type: "membership",
                attributes: {
                    open: open
                }
            }
        }).pipe(map((data) => {
            room.open = data.data.attributes.open;
            return room;
        }));
    }
    /**
     * @param {?} room
     * @return {?}
     */
    markAllReceivedMessagesAsRead(room) {
        if (room.unreadMessageCount > 0) {
            const /** @type {?} */ lastReadMessageId = room.messages.length > 0 ? room.messages[room.messages.length - 1].id : undefined;
            return this.http.put(`${this.roomUrl}/${room.id}/membership/unread-messages`, { data: { lastReadMessageId: lastReadMessageId } })
                .pipe(map((data) => {
                room.unreadMessageCount = 0;
                return data.meta.count;
            }));
        }
        else {
            return of(0);
        }
    }
    /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    create(name, userIds, withoutDuplicate) {
        return this.http.post(`${this.roomUrl}?noDuplicate=${withoutDuplicate}`, {
            data: {
                type: "room",
                attributes: {
                    name: name
                },
                relationships: {
                    users: {
                        data: userIds.map(userId => ({ type: "user", id: userId }))
                    }
                }
            }
        }, {
            params: {
                noDuplicate: `${withoutDuplicate}`
            }
        }).pipe(map((response) => Room.build(response.data, this, this.messageRepository)));
    }
    /**
     * @param {?} room
     * @return {?}
     */
    update(room) {
        return this.http.put(`${this.roomUrl}/${room.id}`, {
            data: {
                type: "room",
                attributes: {
                    name: room.name
                }
            }
        }).pipe(map((response) => {
            room.name = response.data.attributes.name;
            return room;
        }));
    }
    /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    addUser(room, userId) {
        return this.http.post(`${this.roomUrl}/${room.id}/memberships`, {
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
        }).pipe(map((response) => {
            const /** @type {?} */ newUser = User.build(response.data.relationships.user.data);
            room.addUser(newUser);
            return room;
        }));
    }
    /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    deleteMessage(room, message) {
        return this.messageRepository.delete(room, message);
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    findMessages(room, attributes) {
        return this.messageRepository.findAll(room, attributes);
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    createMessage(room, attributes) {
        return this.messageRepository.create(room, attributes);
    }
}
RoomRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
RoomRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: MessageRepository },
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
];
function RoomRepository_tsickle_Closure_declarations() {
    /** @type {?} */
    RoomRepository.prototype.roomUrl;
    /** @type {?} */
    RoomRepository.prototype.http;
    /** @type {?} */
    RoomRepository.prototype.messageRepository;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5yZXBvc2l0b3J5LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGJhYmlsaS5pby9hbmd1bGFyLyIsInNvdXJjZXMiOlsicm9vbS9yb29tLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLEVBQTBCLGlCQUFpQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDckcsT0FBTyxFQUFFLGlCQUFpQixFQUFjLE1BQU0sK0JBQStCLENBQUM7QUFDOUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFHcEMsTUFBTTs7Ozs7O0lBSUosWUFBb0IsSUFBZ0IsRUFDaEIsbUJBQ21CLGFBQXFDO1FBRnhELFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsc0JBQWlCLEdBQWpCLGlCQUFpQjtRQUVuQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sYUFBYSxDQUFDO0tBQ3JEOzs7OztJQUVELElBQUksQ0FBQyxFQUFVO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUUsQ0FBQzthQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFD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QU0sU0FBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi9yb29tLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb29tUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSByb29tVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMucm9vbVVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyL3Jvb21zYDtcbiAgfVxuXG4gIGZpbmQoaWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KGAke3RoaXMucm9vbVVybH0vJHtpZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGpzb246IGFueSkgPT4gUm9vbS5idWlsZChqc29uLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICBmaW5kQWxsKHF1ZXJ5OiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXSB9KTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLnJvb21VcmwsIHsgcGFyYW1zOiBxdWVyeSB9KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGpzb246IGFueSkgPT4gUm9vbS5tYXAoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZE9wZW5lZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IG9ubHlPcGVuZWQ6IFwidHJ1ZVwiIH0pO1xuICB9XG5cbiAgZmluZENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IG9ubHlDbG9zZWQ6IFwidHJ1ZVwiIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQWZ0ZXIoaWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IGZpcnN0U2VlblJvb21JZDogaWQgfSk7XG4gIH1cblxuICBmaW5kUm9vbXNCeUlkcyhyb29tSWRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBcInJvb21JZHNbXVwiOiByb29tSWRzIH0pO1xuICB9XG5cbiAgdXBkYXRlTWVtYmVyc2hpcChyb29tOiBSb29tLCBvcGVuOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBgLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVtYmVyc2hpcFwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgb3Blbjogb3BlblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgcm9vbS5vcGVuID0gZGF0YS5kYXRhLmF0dHJpYnV0ZXMub3BlbjtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIGlmIChyb29tLnVucmVhZE1lc3NhZ2VDb3VudCA+IDApIHtcbiAgICAgIGNvbnN0IGxhc3RSZWFkTWVzc2FnZUlkID0gcm9vbS5tZXNzYWdlcy5sZW5ndGggPiAwID8gcm9vbS5tZXNzYWdlc1tyb29tLm1lc3NhZ2VzLmxlbmd0aCAtIDFdLmlkIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXAvdW5yZWFkLW1lc3NhZ2VzYCwgeyBkYXRhOiB7IGxhc3RSZWFkTWVzc2FnZUlkOiBsYXN0UmVhZE1lc3NhZ2VJZCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLm1ldGEuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoMCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfT9ub0R1cGxpY2F0ZT0ke3dpdGhvdXREdXBsaWNhdGV9YCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcInJvb21cIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXJzOiB7XG4gICAgICAgICAgICBkYXRhOiB1c2VySWRzLm1hcCh1c2VySWQgPT4gKHsgdHlwZTogXCJ1c2VyXCIsIGlkOiB1c2VySWQgfSkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBub0R1cGxpY2F0ZTogYCR7d2l0aG91dER1cGxpY2F0ZX1gXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IFJvb20uYnVpbGQocmVzcG9uc2UuZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIHVwZGF0ZShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9YCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcInJvb21cIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG5hbWU6IHJvb20ubmFtZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIHJvb20ubmFtZSA9IHJlc3BvbnNlLmRhdGEuYXR0cmlidXRlcy5uYW1lO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgYWRkVXNlcihyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcHNgLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVtYmVyc2hpcFwiLFxuICAgICAgICByZWxhdGlvbnNoaXBzOiB7XG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICB0eXBlOiBcInVzZXJcIixcbiAgICAgICAgICAgICAgaWQ6IHVzZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICBjb25zdCBuZXdVc2VyID0gVXNlci5idWlsZChyZXNwb25zZS5kYXRhLnJlbGF0aW9uc2hpcHMudXNlci5kYXRhKTtcbiAgICAgIHJvb20uYWRkVXNlcihuZXdVc2VyKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2Uocm9vbTogUm9vbSwgbWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmRlbGV0ZShyb29tLCBtZXNzYWdlKTtcbiAgfVxuXG4gIGZpbmRNZXNzYWdlcyhyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmZpbmRBbGwocm9vbSwgYXR0cmlidXRlcyk7XG4gIH1cblxuICBjcmVhdGVNZXNzYWdlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5jcmVhdGUocm9vbSwgYXR0cmlidXRlcyk7XG4gIH1cbn1cbiJdfQ==