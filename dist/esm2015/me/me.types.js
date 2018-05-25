/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as momentLoaded from "moment";
import { BehaviorSubject, of } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { ArrayUtils } from "../array.utils";
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
            const /** @type {?} */ roomIndex = ArrayUtils.findIndex(this.rooms, room => room.id === newRoom.id);
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
        return ArrayUtils.find(this.rooms, room => roomId === room.id);
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
        return ArrayUtils.find(this.openedRooms, room => roomToFind.id === room.id);
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
            const /** @type {?} */ roomIndex = ArrayUtils.findIndex(this.openedRooms, room => room.id === closedRoom.id);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUudHlwZXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvIiwic291cmNlcyI6WyJtZS9tZS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFFLGVBQWUsRUFBYyxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUcxQyx1QkFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBRTVCLE1BQU07Ozs7Ozs7OztJQWFKLFlBQXFCLEVBQVUsRUFDVixXQUFtQixFQUNuQixLQUFhLEVBQ3RCLGtCQUEwQixFQUMxQixTQUFpQixFQUNUO1FBTEMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUNWLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLFVBQUssR0FBTCxLQUFLLENBQVE7UUFHZCxtQkFBYyxHQUFkLGNBQWM7UUFDaEMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksZUFBZSxDQUFDLGtCQUFrQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLGVBQWUsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDOUQ7Ozs7OztJQW5CRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQVMsRUFBRSxjQUE4QjtRQUNwRCx1QkFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9GLHVCQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDcEY7Ozs7SUFrQkQsSUFBSSxrQkFBa0I7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7S0FDOUM7Ozs7O0lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxLQUFhO1FBQ2xDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0M7Ozs7SUFFRCxJQUFJLDRCQUE0QjtRQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDO0tBQ3hDOzs7O0lBRUQsSUFBSSxTQUFTO1FBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7S0FDckM7Ozs7SUFFRCxJQUFJLG1CQUFtQjtRQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0tBQy9COzs7O0lBRUQsZ0JBQWdCO1FBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FDZCxDQUFDLENBQUMsQ0FBQztLQUNMOzs7O0lBRUQsZ0JBQWdCO1FBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FDZCxDQUFDLENBQUMsQ0FBQztLQUNMOzs7O0lBRUQsY0FBYztRQUNaLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2hGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUM7YUFDZCxDQUFDLENBQUMsQ0FBQztTQUNMO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2Y7S0FDRjs7Ozs7SUFFRCxjQUFjLENBQUMsT0FBaUI7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixNQUFNLENBQUMsS0FBSyxDQUFDO1NBQ2QsQ0FBQyxDQUFDLENBQUM7S0FDTDs7Ozs7SUFFRCxhQUFhLENBQUMsTUFBYztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDYixDQUFDLENBQUMsQ0FBQztLQUNMOzs7OztJQUVELG1CQUFtQixDQUFDLE1BQWM7UUFDaEMsdUJBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakI7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ25DO0tBQ0Y7Ozs7O0lBRUQsZ0JBQWdCLENBQUMsVUFBbUI7UUFDbEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7YUFDdEMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7b0JBQ3RELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ2YsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7cUJBQ3ZEO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7S0FDUjs7Ozs7SUFFRCxPQUFPLENBQUMsT0FBYTtRQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUM7YUFDOUI7WUFFRCx1QkFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkYsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7YUFDakM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMxQjtTQUNGO0tBQ0Y7Ozs7O0lBRUQsWUFBWSxDQUFDLE1BQWM7UUFDekIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDaEU7Ozs7O0lBRUQsUUFBUSxDQUFDLElBQVU7UUFDakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtpQkFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQWdCLEVBQUUsRUFBRTtnQkFDakMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2RCxDQUFDLENBQUMsQ0FBQztTQUNoQjtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqQjtLQUNGOzs7OztJQUVELFNBQVMsQ0FBQyxJQUFVO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO2lCQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNwQixJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxVQUFVLENBQUM7YUFDbkIsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakI7S0FDRjs7Ozs7SUFFRCxVQUFVLENBQUMsWUFBb0I7UUFDN0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNWLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLEtBQUssQ0FBQztTQUNkLENBQUMsQ0FDSCxDQUFDO0tBQ0g7Ozs7O0lBRUQsc0JBQXNCLENBQUMsVUFBZ0I7UUFDckMsdUJBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzNGOzs7O0lBRUQsY0FBYztRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDcEM7Ozs7Ozs7SUFFRCxVQUFVLENBQUMsSUFBWSxFQUFFLE9BQWlCLEVBQUUsZ0JBQXlCO1FBQ25FLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixDQUFDO2FBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDYixDQUFDLENBQUMsQ0FBQztLQUMvQjs7Ozs7SUFFRCxTQUFTLENBQUMsT0FBaUI7UUFDekIsdUJBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsRCx1QkFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLHVCQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDckIsdUJBQU0sZUFBZSxHQUFHLENBQUMsQ0FBQztRQUMxQix1QkFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3ZCLHVCQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFDbEIsU0FBUyxFQUNULFNBQVMsRUFDVCxJQUFJLEVBQ0osZUFBZSxFQUNmLEtBQUssRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULFNBQVMsRUFDVCxJQUFJLENBQUMsY0FBYyxDQUNuQixDQUFDO0tBQ0o7Ozs7Ozs7SUFFRCxXQUFXLENBQUMsSUFBVSxFQUFFLE9BQWUsRUFBRSxXQUFtQjtRQUMxRCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUN0QixPQUFPLEVBQUUsT0FBTztZQUNoQixXQUFXLEVBQUUsV0FBVztZQUN4QixlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7U0FDdEMsQ0FBQyxDQUFDO0tBQ0o7Ozs7O0lBRUQsVUFBVSxDQUFDLE9BQWdCO1FBQ3pCLE1BQU0sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDaEQ7Ozs7O0lBRUQsYUFBYSxDQUFDLE9BQWdCO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDWix1QkFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM3QjtZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN0QjtLQUNGOzs7Ozs7SUFFRCxTQUFTLENBQUMsSUFBVSxFQUFFLE1BQWM7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNsRDs7Ozs7SUFFTyxRQUFRLENBQUMsS0FBYTtRQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM3QjtTQUNGLENBQUMsQ0FBQzs7Ozs7O0lBR0csT0FBTyxDQUFDLFVBQWdCO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLFNBQVMsQ0FBQzs7Ozs7O0lBR3pDLGFBQWEsQ0FBQyxVQUFnQjtRQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLENBQUM7Ozs7OztJQUcvQyxRQUFRLENBQUMsSUFBVTtRQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Ozs7OztJQUc1QixjQUFjLENBQUMsVUFBZ0I7UUFDckMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7SUFHdEUsZUFBZSxDQUFDLElBQVU7UUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3Qjs7Ozs7O0lBR0ssb0JBQW9CLENBQUMsVUFBZ0I7UUFDM0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsdUJBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN2Qzs7Ozs7O0lBR0ssNkJBQTZCLENBQUMsSUFBVTtRQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEYsTUFBTSxDQUFDLElBQUksQ0FBQztTQUNiLENBQUMsQ0FBQyxDQUFDOzs7OztJQUdWLE1BQU07UUFDWixNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzs7Q0FFaEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZiB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBmbGF0TWFwLCBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEFycmF5VXRpbHMgfSBmcm9tIFwiLi4vYXJyYXkudXRpbHNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi8uLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5leHBvcnQgY2xhc3MgTWUge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSk6IE1lIHtcbiAgICBjb25zdCB1bnJlYWRNZXNzYWdlQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS51bnJlYWRNZXNzYWdlQ291bnQgOiAwO1xuICAgIGNvbnN0IHJvb21Db3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnJvb21Db3VudCA6IDA7XG4gICAgcmV0dXJuIG5ldyBNZShqc29uLmRhdGEuaWQsIFtdLCBbXSwgdW5yZWFkTWVzc2FnZUNvdW50LCByb29tQ291bnQsIHJvb21SZXBvc2l0b3J5KTtcbiAgfVxuXG4gIHB1YmxpYyBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxSb29tQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGZpcnN0U2VlblJvb206IFJvb207XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgb3BlbmVkUm9vbXM6IFJvb21bXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgcm9vbXM6IFJvb21bXSxcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJvb21Db3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVucmVhZE1lc3NhZ2VDb3VudCB8fCAwKTtcbiAgICB0aGlzLmludGVybmFsUm9vbUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdChyb29tQ291bnQgfHwgMCk7XG4gIH1cblxuXG4gIGdldCB1bnJlYWRNZXNzYWdlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC52YWx1ZTtcbiAgfVxuXG4gIHNldCB1bnJlYWRNZXNzYWdlQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQubmV4dChjb3VudCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVVucmVhZE1lc3NhZ2VDb3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ7XG4gIH1cblxuICBnZXQgcm9vbUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxSb29tQ291bnQudmFsdWU7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVJvb21Db3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxSb29tQ291bnQ7XG4gIH1cblxuICBmZXRjaE9wZW5lZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZE9wZW5lZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRDbG9zZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoTW9yZVJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgaWYgKHRoaXMuZmlyc3RTZWVuUm9vbSkge1xuICAgICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQWZ0ZXIodGhpcy5maXJzdFNlZW5Sb29tLmlkKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgICByZXR1cm4gcm9vbXM7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihbXSk7XG4gICAgfVxuICB9XG5cbiAgZmV0Y2hSb29tc0J5SWQocm9vbUlkczogc3RyaW5nW10pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0J5SWRzKHJvb21JZHMpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kKHJvb21JZCkucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBmaW5kT3JGZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbSA9IHRoaXMuZmluZFJvb21CeUlkKHJvb21JZCk7XG4gICAgaWYgKHJvb21JZCkge1xuICAgICAgcmV0dXJuIG9mKHJvb20pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaFJvb21CeUlkKHJvb21JZCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTmV3TWVzc2FnZShuZXdNZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgdGhpcy5maW5kT3JGZXRjaFJvb21CeUlkKG5ld01lc3NhZ2Uucm9vbUlkKVxuICAgICAgICAuc3Vic2NyaWJlKHJvb20gPT4ge1xuICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICByb29tLmFkZE1lc3NhZ2UobmV3TWVzc2FnZSk7XG4gICAgICAgICAgICByb29tLm5vdGlmeU5ld01lc3NhZ2UobmV3TWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoIW5ld01lc3NhZ2UuaGFzU2VuZGVySWQodGhpcy5pZCkpIHtcbiAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCArIDE7XG4gICAgICAgICAgICAgIGlmICghcm9vbS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPSByb29tLnVucmVhZE1lc3NhZ2VDb3VudCArIDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgYWRkUm9vbShuZXdSb29tOiBSb29tKSB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb20obmV3Um9vbSkpIHtcbiAgICAgIGlmICghdGhpcy5maXJzdFNlZW5Sb29tIHx8IG1vbWVudCh0aGlzLmZpcnN0U2VlblJvb20ubGFzdEFjdGl2aXR5QXQpLmlzQWZ0ZXIobmV3Um9vbS5sYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgdGhpcy5maXJzdFNlZW5Sb29tID0gbmV3Um9vbTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5yb29tcywgcm9vbSA9PiByb29tLmlkID09PSBuZXdSb29tLmlkKTtcbiAgICAgIGlmIChyb29tSW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLnJvb21zW3Jvb21JbmRleF0gPSBuZXdSb29tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb29tcy5wdXNoKG5ld1Jvb20pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbmRSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IFJvb20ge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy5yb29tcywgcm9vbSA9PiByb29tSWQgPT09IHJvb20uaWQpO1xuICB9XG5cbiAgb3BlblJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5vcGVuTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKGZsYXRNYXAoKG9wZW5lZFJvb206IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFRvT3BlbmVkUm9vbShvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5jbG9zZU1lbWJlcnNoaXAoKVxuICAgICAgICAgICAgICAgICAucGlwZShtYXAoY2xvc2VkUm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9zZWRSb29tO1xuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tcyhyb29tc1RvQ2xvc2U6IFJvb21bXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIG9mKHJvb21zVG9DbG9zZSkucGlwZShcbiAgICAgIG1hcChyb29tcyA9PiB7XG4gICAgICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB0aGlzLmNsb3NlUm9vbShyb29tKSk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIG9wZW5Sb29tQW5kQ2xvc2VPdGhlcnMocm9vbVRvT3BlbjogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb21zVG9CZUNsb3NlZCA9IHRoaXMub3BlbmVkUm9vbXMuZmlsdGVyKHJvb20gPT4gcm9vbS5pZCAhPT0gcm9vbVRvT3Blbi5pZCk7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VSb29tcyhyb29tc1RvQmVDbG9zZWQpLnBpcGUoZmxhdE1hcChyb29tcyA9PiB0aGlzLm9wZW5Sb29tKHJvb21Ub09wZW4pKSk7XG4gIH1cblxuICBoYXNPcGVuZWRSb29tcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcy5sZW5ndGggPiAwO1xuICB9XG5cbiAgY3JlYXRlUm9vbShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuY3JlYXRlKG5hbWUsIHVzZXJJZHMsIHdpdGhvdXREdXBsaWNhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBidWlsZFJvb20odXNlcklkczogc3RyaW5nW10pOiBSb29tIHtcbiAgICBjb25zdCB1c2VycyA9IHVzZXJJZHMubWFwKGlkID0+IG5ldyBVc2VyKGlkLCBcIlwiKSk7XG4gICAgY29uc3Qgbm9TZW5kZXJzID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlVW5yZWFkID0gMDtcbiAgICBjb25zdCBub0lkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IHRoaXMudG9Vc2VyKCk7XG4gICAgcmV0dXJuIG5ldyBSb29tKG5vSWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB0cnVlLFxuICAgICAgbm9NZXNzYWdlVW5yZWFkLFxuICAgICAgdXNlcnMsXG4gICAgICBub1NlbmRlcnMsXG4gICAgICBub01lc3NhZ2UsXG4gICAgICBpbml0aWF0b3IsXG4gICAgICB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShyb29tOiBSb29tLCBjb250ZW50OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gcm9vbS5zZW5kTWVzc2FnZSh7XG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgY29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgICAgZGV2aWNlU2Vzc2lvbklkOiB0aGlzLmRldmljZVNlc3Npb25JZFxuICAgIH0pO1xuICB9XG5cbiAgaXNTZW50QnlNZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2UgJiYgbWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQobWVzc2FnZS5yb29tSWQpO1xuICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgcmV0dXJuIHJvb20uZGVsZXRlKG1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFVzZXJUbyhyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmFkZFVzZXIocm9vbSwgdXNlcklkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm9vbXMocm9vbXM6IFJvb21bXSkge1xuICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICBpZiAocm9vbS5vcGVuICYmICF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbShyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbU9wZW5lZChyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbShyb29tOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb21CeUlkKHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbU9wZW5lZChyb29tVG9GaW5kOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLm9wZW5lZFJvb21zLCByb29tID0+IHJvb21Ub0ZpbmQuaWQgPT09IHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb09wZW5lZFJvb20ocm9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tOiBSb29tKSB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChjbG9zZWRSb29tKSkge1xuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5vcGVuZWRSb29tcywgcm9vbSA9PiByb29tLmlkID09PSBjbG9zZWRSb29tLmlkKTtcbiAgICAgIHRoaXMub3BlbmVkUm9vbXMuc3BsaWNlKHJvb21JbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHJvb20ubWFya0FsbE1lc3NhZ2VzQXNSZWFkKClcbiAgICAgICAgICAgICAgIC5waXBlKG1hcChyZWFkTWVzc2FnZUNvdW50ID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gTWF0aC5tYXgodGhpcy51bnJlYWRNZXNzYWdlQ291bnQgLSByZWFkTWVzc2FnZUNvdW50LCAwKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByb29tO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgdG9Vc2VyKCk6IFVzZXIge1xuICAgIHJldHVybiBuZXcgVXNlcih0aGlzLmlkLCBcIlwiKTtcbiAgfVxufVxuIl19