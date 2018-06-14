/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as momentLoaded from "moment";
import { BehaviorSubject, of } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { Room } from "../room/room.types";
import { User } from "../user/user.types";
const /** @type {?} */ moment = momentLoaded;
export class Me {
    /**
     * @param {?} id
     * @param {?} openedRooms
     * @param {?} rooms
     * @param {?} unreadMessageCount
     * @param {?} roomCount
     * @param {?} roomRepository
     */
    constructor(id, openedRooms, rooms, unreadMessageCount, roomCount, roomRepository) {
        this.id = id;
        this.openedRooms = openedRooms;
        this.rooms = rooms;
        this.roomRepository = roomRepository;
        this.internalUnreadMessageCount = new BehaviorSubject(unreadMessageCount || 0);
        this.internalRoomCount = new BehaviorSubject(roomCount || 0);
    }
    /**
     * @param {?} json
     * @param {?} roomRepository
     * @return {?}
     */
    static build(json, roomRepository) {
        const /** @type {?} */ unreadMessageCount = json.data && json.data.meta ? json.data.meta.unreadMessageCount : 0;
        const /** @type {?} */ roomCount = json.data && json.data.meta ? json.data.meta.roomCount : 0;
        return new Me(json.data.id, [], [], unreadMessageCount, roomCount, roomRepository);
    }
    /**
     * @return {?}
     */
    get unreadMessageCount() {
        return this.internalUnreadMessageCount.value;
    }
    /**
     * @param {?} count
     * @return {?}
     */
    set unreadMessageCount(count) {
        this.internalUnreadMessageCount.next(count);
    }
    /**
     * @return {?}
     */
    get observableUnreadMessageCount() {
        return this.internalUnreadMessageCount;
    }
    /**
     * @return {?}
     */
    get roomCount() {
        return this.internalRoomCount.value;
    }
    /**
     * @return {?}
     */
    get observableRoomCount() {
        return this.internalRoomCount;
    }
    /**
     * @return {?}
     */
    fetchOpenedRooms() {
        return this.roomRepository.findOpenedRooms().pipe(map(rooms => {
            this.addRooms(rooms);
            return rooms;
        }));
    }
    /**
     * @return {?}
     */
    fetchClosedRooms() {
        return this.roomRepository.findClosedRooms().pipe(map(rooms => {
            this.addRooms(rooms);
            return rooms;
        }));
    }
    /**
     * @return {?}
     */
    fetchMoreRooms() {
        if (this.firstSeenRoom) {
            return this.roomRepository.findRoomsAfter(this.firstSeenRoom.id).pipe(map(rooms => {
                this.addRooms(rooms);
                return rooms;
            }));
        }
        else {
            return of([]);
        }
    }
    /**
     * @param {?} roomIds
     * @return {?}
     */
    fetchRoomsById(roomIds) {
        return this.roomRepository.findRoomsByIds(roomIds).pipe(map(rooms => {
            this.addRooms(rooms);
            return rooms;
        }));
    }
    /**
     * @param {?} roomId
     * @return {?}
     */
    fetchRoomById(roomId) {
        return this.roomRepository.find(roomId).pipe(map(room => {
            this.addRoom(room);
            return room;
        }));
    }
    /**
     * @param {?} roomId
     * @return {?}
     */
    findOrFetchRoomById(roomId) {
        const /** @type {?} */ room = this.findRoomById(roomId);
        if (roomId) {
            return of(room);
        }
        else {
            return this.fetchRoomById(roomId);
        }
    }
    /**
     * @param {?} newMessage
     * @return {?}
     */
    handleNewMessage(newMessage) {
        this.findOrFetchRoomById(newMessage.roomId)
            .subscribe(room => {
            if (room) {
                room.addMessage(newMessage);
                room.notifyNewMessage(newMessage);
                if (!newMessage.hasSenderId(this.id)) {
                    this.unreadMessageCount = this.unreadMessageCount + 1;
                    if (!room.open) {
                        room.unreadMessageCount = room.unreadMessageCount + 1;
                    }
                }
            }
        });
    }
    /**
     * @param {?} newRoom
     * @return {?}
     */
    addRoom(newRoom) {
        if (!this.hasRoom(newRoom)) {
            if (!this.firstSeenRoom || moment(this.firstSeenRoom.lastActivityAt).isAfter(newRoom.lastActivityAt)) {
                this.firstSeenRoom = newRoom;
            }
            const /** @type {?} */ roomIndex = this.rooms ? this.rooms.findIndex(room => room.id === newRoom.id) : -1;
            if (roomIndex > -1) {
                this.rooms[roomIndex] = newRoom;
            }
            else {
                this.rooms.push(newRoom);
            }
        }
    }
    /**
     * @param {?} roomId
     * @return {?}
     */
    findRoomById(roomId) {
        return this.rooms ? this.rooms.find(room => roomId === room.id) : undefined;
    }
    /**
     * @param {?} room
     * @return {?}
     */
    openRoom(room) {
        if (!this.hasRoomOpened(room)) {
            return room.openMembership()
                .pipe(flatMap((openedRoom) => {
                this.addToOpenedRoom(openedRoom);
                return this.markAllReceivedMessagesAsRead(openedRoom);
            }));
        }
        else {
            return of(room);
        }
    }
    /**
     * @param {?} room
     * @return {?}
     */
    closeRoom(room) {
        if (this.hasRoomOpened(room)) {
            return room.closeMembership()
                .pipe(map(closedRoom => {
                this.removeFromOpenedRoom(closedRoom);
                return closedRoom;
            }));
        }
        else {
            return of(room);
        }
    }
    /**
     * @param {?} roomsToClose
     * @return {?}
     */
    closeRooms(roomsToClose) {
        return of(roomsToClose).pipe(map(rooms => {
            rooms.forEach(room => this.closeRoom(room));
            return rooms;
        }));
    }
    /**
     * @param {?} roomToOpen
     * @return {?}
     */
    openRoomAndCloseOthers(roomToOpen) {
        const /** @type {?} */ roomsToBeClosed = this.openedRooms.filter(room => room.id !== roomToOpen.id);
        return this.closeRooms(roomsToBeClosed).pipe(flatMap(rooms => this.openRoom(roomToOpen)));
    }
    /**
     * @return {?}
     */
    hasOpenedRooms() {
        return this.openedRooms.length > 0;
    }
    /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    createRoom(name, userIds, withoutDuplicate) {
        return this.roomRepository.create(name, userIds, withoutDuplicate)
            .pipe(map(room => {
            this.addRoom(room);
            return room;
        }));
    }
    /**
     * @param {?} userIds
     * @return {?}
     */
    buildRoom(userIds) {
        const /** @type {?} */ users = userIds.map(id => new User(id, ""));
        const /** @type {?} */ noSenders = [];
        const /** @type {?} */ noMessage = [];
        const /** @type {?} */ noMessageUnread = 0;
        const /** @type {?} */ noId = undefined;
        const /** @type {?} */ initiator = this.toUser();
        return new Room(noId, undefined, undefined, true, noMessageUnread, users, noSenders, noMessage, initiator, this.roomRepository);
    }
    /**
     * @param {?} room
     * @param {?} content
     * @param {?} contentType
     * @return {?}
     */
    sendMessage(room, content, contentType) {
        return room.sendMessage({
            content: content,
            contentType: contentType,
            deviceSessionId: this.deviceSessionId
        });
    }
    /**
     * @param {?} message
     * @return {?}
     */
    isSentByMe(message) {
        return message && message.hasSenderId(this.id);
    }
    /**
     * @param {?} message
     * @return {?}
     */
    deleteMessage(message) {
        if (message) {
            const /** @type {?} */ room = this.findRoomById(message.roomId);
            if (room) {
                return room.delete(message);
            }
            else {
                return of(undefined);
            }
        }
        else {
            return of(undefined);
        }
    }
    /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    addUserTo(room, userId) {
        return this.roomRepository.addUser(room, userId);
    }
    /**
     * @param {?} rooms
     * @return {?}
     */
    addRooms(rooms) {
        rooms.forEach(room => {
            this.addRoom(room);
            if (room.open && !this.hasRoomOpened(room)) {
                this.openedRooms.push(room);
            }
        });
    }
    /**
     * @param {?} roomToFind
     * @return {?}
     */
    hasRoom(roomToFind) {
        return this.findRoom(roomToFind) !== undefined;
    }
    /**
     * @param {?} roomToFind
     * @return {?}
     */
    hasRoomOpened(roomToFind) {
        return this.findRoomOpened(roomToFind) !== undefined;
    }
    /**
     * @param {?} room
     * @return {?}
     */
    findRoom(room) {
        return this.findRoomById(room.id);
    }
    /**
     * @param {?} roomToFind
     * @return {?}
     */
    findRoomOpened(roomToFind) {
        return this.openedRooms ? this.openedRooms.find(room => roomToFind.id === room.id) : undefined;
    }
    /**
     * @param {?} room
     * @return {?}
     */
    addToOpenedRoom(room) {
        if (!this.hasRoomOpened(room)) {
            this.openedRooms.push(room);
        }
    }
    /**
     * @param {?} closedRoom
     * @return {?}
     */
    removeFromOpenedRoom(closedRoom) {
        if (this.hasRoomOpened(closedRoom)) {
            const /** @type {?} */ roomIndex = this.openedRooms ? this.openedRooms.findIndex(room => room.id === closedRoom.id) : undefined;
            this.openedRooms.splice(roomIndex, 1);
        }
    }
    /**
     * @param {?} room
     * @return {?}
     */
    markAllReceivedMessagesAsRead(room) {
        return room.markAllMessagesAsRead()
            .pipe(map(readMessageCount => {
            this.unreadMessageCount = Math.max(this.unreadMessageCount - readMessageCount, 0);
            return room;
        }));
    }
    /**
     * @return {?}
     */
    toUser() {
        return new User(this.id, "");
    }
}
function Me_tsickle_Closure_declarations() {
    /** @type {?} */
    Me.prototype.deviceSessionId;
    /** @type {?} */
    Me.prototype.internalUnreadMessageCount;
    /** @type {?} */
    Me.prototype.internalRoomCount;
    /** @type {?} */
    Me.prototype.firstSeenRoom;
    /** @type {?} */
    Me.prototype.id;
    /** @type {?} */
    Me.prototype.openedRooms;
    /** @type {?} */
    Me.prototype.rooms;
    /** @type {?} */
    Me.prototype.roomRepository;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUudHlwZXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvIiwic291cmNlcyI6WyJtZS9tZS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFFLGVBQWUsRUFBYyxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRzFDLHVCQUFNLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFFNUIsTUFBTTs7Ozs7Ozs7O0lBYUosWUFBcUIsRUFBVSxFQUNWLFdBQW1CLEVBQ25CLEtBQWEsRUFDdEIsa0JBQTBCLEVBQzFCLFNBQWlCLEVBQ1Q7UUFMQyxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFDbkIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUdkLG1CQUFjLEdBQWQsY0FBYztRQUNoQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxlQUFlLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0UsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksZUFBZSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUM5RDs7Ozs7O0lBbkJELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBUyxFQUFFLGNBQThCO1FBQ3BELHVCQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxD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LENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDL0csSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3ZDOzs7Ozs7SUFHSyw2QkFBNkIsQ0FBQyxJQUFVO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7YUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQzFCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ2IsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBR1YsTUFBTTtRQUNaLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztDQUVoQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGZsYXRNYXAsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmV4cG9ydCBjbGFzcyBNZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KTogTWUge1xuICAgIGNvbnN0IHVucmVhZE1lc3NhZ2VDb3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnVucmVhZE1lc3NhZ2VDb3VudCA6IDA7XG4gICAgY29uc3Qgcm9vbUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEucm9vbUNvdW50IDogMDtcbiAgICByZXR1cm4gbmV3IE1lKGpzb24uZGF0YS5pZCwgW10sIFtdLCB1bnJlYWRNZXNzYWdlQ291bnQsIHJvb21Db3VudCwgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgcHVibGljIGRldmljZVNlc3Npb25JZDogc3RyaW5nO1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFJvb21Db3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgZmlyc3RTZWVuUm9vbTogUm9vbTtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBvcGVuZWRSb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcm9vbUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50IHx8IDApO1xuICAgIHRoaXMuaW50ZXJuYWxSb29tQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHJvb21Db3VudCB8fCAwKTtcbiAgfVxuXG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCByb29tQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudC52YWx1ZTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlUm9vbUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudDtcbiAgfVxuXG4gIGZldGNoT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kT3BlbmVkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZENsb3NlZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hNb3JlUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICBpZiAodGhpcy5maXJzdFNlZW5Sb29tKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNBZnRlcih0aGlzLmZpcnN0U2VlblJvb20uaWQpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKFtdKTtcbiAgICB9XG4gIH1cblxuICBmZXRjaFJvb21zQnlJZChyb29tSWRzOiBzdHJpbmdbXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQnlJZHMocm9vbUlkcykucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmQocm9vbUlkKS5waXBlKG1hcChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZpbmRPckZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQocm9vbUlkKTtcbiAgICBpZiAocm9vbUlkKSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZldGNoUm9vbUJ5SWQocm9vbUlkKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVOZXdNZXNzYWdlKG5ld01lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLmZpbmRPckZldGNoUm9vbUJ5SWQobmV3TWVzc2FnZS5yb29tSWQpXG4gICAgICAgIC5zdWJzY3JpYmUocm9vbSA9PiB7XG4gICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIHJvb20uYWRkTWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIHJvb20ubm90aWZ5TmV3TWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIGlmICghbmV3TWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgaWYgKCFyb29tLm9wZW4pIHtcbiAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IHJvb20udW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBhZGRSb29tKG5ld1Jvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbShuZXdSb29tKSkge1xuICAgICAgaWYgKCF0aGlzLmZpcnN0U2VlblJvb20gfHwgbW9tZW50KHRoaXMuZmlyc3RTZWVuUm9vbS5sYXN0QWN0aXZpdHlBdCkuaXNBZnRlcihuZXdSb29tLmxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICB0aGlzLmZpcnN0U2VlblJvb20gPSBuZXdSb29tO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByb29tSW5kZXggPSB0aGlzLnJvb21zID8gdGhpcy5yb29tcy5maW5kSW5kZXgocm9vbSA9PiByb29tLmlkID09PSBuZXdSb29tLmlkKSA6IC0xO1xuICAgICAgaWYgKHJvb21JbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMucm9vbXNbcm9vbUluZGV4XSA9IG5ld1Jvb207XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb21zLnB1c2gobmV3Um9vbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmluZFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMucm9vbXMgPyB0aGlzLnJvb21zLmZpbmQocm9vbSA9PiByb29tSWQgPT09IHJvb20uaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgb3BlblJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5vcGVuTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKGZsYXRNYXAoKG9wZW5lZFJvb206IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFRvT3BlbmVkUm9vbShvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5jbG9zZU1lbWJlcnNoaXAoKVxuICAgICAgICAgICAgICAgICAucGlwZShtYXAoY2xvc2VkUm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9zZWRSb29tO1xuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tcyhyb29tc1RvQ2xvc2U6IFJvb21bXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIG9mKHJvb21zVG9DbG9zZSkucGlwZShcbiAgICAgIG1hcChyb29tcyA9PiB7XG4gICAgICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB0aGlzLmNsb3NlUm9vbShyb29tKSk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIG9wZW5Sb29tQW5kQ2xvc2VPdGhlcnMocm9vbVRvT3BlbjogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb21zVG9CZUNsb3NlZCA9IHRoaXMub3BlbmVkUm9vbXMuZmlsdGVyKHJvb20gPT4gcm9vbS5pZCAhPT0gcm9vbVRvT3Blbi5pZCk7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VSb29tcyhyb29tc1RvQmVDbG9zZWQpLnBpcGUoZmxhdE1hcChyb29tcyA9PiB0aGlzLm9wZW5Sb29tKHJvb21Ub09wZW4pKSk7XG4gIH1cblxuICBoYXNPcGVuZWRSb29tcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcy5sZW5ndGggPiAwO1xuICB9XG5cbiAgY3JlYXRlUm9vbShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuY3JlYXRlKG5hbWUsIHVzZXJJZHMsIHdpdGhvdXREdXBsaWNhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBidWlsZFJvb20odXNlcklkczogc3RyaW5nW10pOiBSb29tIHtcbiAgICBjb25zdCB1c2VycyA9IHVzZXJJZHMubWFwKGlkID0+IG5ldyBVc2VyKGlkLCBcIlwiKSk7XG4gICAgY29uc3Qgbm9TZW5kZXJzID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlVW5yZWFkID0gMDtcbiAgICBjb25zdCBub0lkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IHRoaXMudG9Vc2VyKCk7XG4gICAgcmV0dXJuIG5ldyBSb29tKG5vSWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB0cnVlLFxuICAgICAgbm9NZXNzYWdlVW5yZWFkLFxuICAgICAgdXNlcnMsXG4gICAgICBub1NlbmRlcnMsXG4gICAgICBub01lc3NhZ2UsXG4gICAgICBpbml0aWF0b3IsXG4gICAgICB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShyb29tOiBSb29tLCBjb250ZW50OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gcm9vbS5zZW5kTWVzc2FnZSh7XG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgY29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgICAgZGV2aWNlU2Vzc2lvbklkOiB0aGlzLmRldmljZVNlc3Npb25JZFxuICAgIH0pO1xuICB9XG5cbiAgaXNTZW50QnlNZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2UgJiYgbWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQobWVzc2FnZS5yb29tSWQpO1xuICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgcmV0dXJuIHJvb20uZGVsZXRlKG1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFVzZXJUbyhyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmFkZFVzZXIocm9vbSwgdXNlcklkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm9vbXMocm9vbXM6IFJvb21bXSkge1xuICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICBpZiAocm9vbS5vcGVuICYmICF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbShyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbU9wZW5lZChyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbShyb29tOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb21CeUlkKHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbU9wZW5lZChyb29tVG9GaW5kOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMub3BlbmVkUm9vbXMgPyB0aGlzLm9wZW5lZFJvb21zLmZpbmQocm9vbSA9PiByb29tVG9GaW5kLmlkID09PSByb29tLmlkKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9PcGVuZWRSb29tKHJvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbTogUm9vbSkge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQoY2xvc2VkUm9vbSkpIHtcbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMub3BlbmVkUm9vbXMgPyB0aGlzLm9wZW5lZFJvb21zLmZpbmRJbmRleChyb29tID0+IHJvb20uaWQgPT09IGNsb3NlZFJvb20uaWQpIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5zcGxpY2Uocm9vbUluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gcm9vbS5tYXJrQWxsTWVzc2FnZXNBc1JlYWQoKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlYWRNZXNzYWdlQ291bnQgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSBNYXRoLm1heCh0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCAtIHJlYWRNZXNzYWdlQ291bnQsIDApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1VzZXIoKTogVXNlciB7XG4gICAgcmV0dXJuIG5ldyBVc2VyKHRoaXMuaWQsIFwiXCIpO1xuICB9XG59XG4iXX0=