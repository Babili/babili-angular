"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const array_utils_1 = require("../array.utils");
const room_types_1 = require("../room/room.types");
const user_types_1 = require("../user/user.types");
class Me {
    constructor(id, openedRooms, rooms, unreadMessageCount, roomCount, roomRepository) {
        this.id = id;
        this.openedRooms = openedRooms;
        this.rooms = rooms;
        this.roomRepository = roomRepository;
        this.internalUnreadMessageCount = new rxjs_1.BehaviorSubject(unreadMessageCount || 0);
        this.internalRoomCount = new rxjs_1.BehaviorSubject(roomCount || 0);
    }
    static build(json, roomRepository) {
        const unreadMessageCount = json.data && json.data.meta ? json.data.meta.unreadMessageCount : 0;
        const roomCount = json.data && json.data.meta ? json.data.meta.roomCount : 0;
        return new Me(json.data.id, [], [], unreadMessageCount, roomCount, roomRepository);
    }
    get unreadMessageCount() {
        return this.internalUnreadMessageCount.value;
    }
    set unreadMessageCount(count) {
        this.internalUnreadMessageCount.next(count);
    }
    get observableUnreadMessageCount() {
        return this.internalUnreadMessageCount;
    }
    get roomCount() {
        return this.internalRoomCount.value;
    }
    get observableRoomCount() {
        return this.internalRoomCount;
    }
    fetchOpenedRooms() {
        return this.roomRepository.findOpenedRooms().pipe(operators_1.map(rooms => {
            this.addRooms(rooms);
            return rooms;
        }));
    }
    fetchClosedRooms() {
        return this.roomRepository.findClosedRooms().pipe(operators_1.map(rooms => {
            this.addRooms(rooms);
            return rooms;
        }));
    }
    fetchMoreRooms() {
        if (this.firstSeenRoom) {
            return this.roomRepository.findRoomsAfter(this.firstSeenRoom.id).pipe(operators_1.map(rooms => {
                this.addRooms(rooms);
                return rooms;
            }));
        }
        else {
            return rxjs_1.of([]);
        }
    }
    fetchRoomsById(roomIds) {
        return this.roomRepository.findRoomsByIds(roomIds).pipe(operators_1.map(rooms => {
            this.addRooms(rooms);
            return rooms;
        }));
    }
    fetchRoomById(roomId) {
        return this.roomRepository.find(roomId).pipe(operators_1.map(room => {
            this.addRoom(room);
            return room;
        }));
    }
    findOrFetchRoomById(roomId) {
        const room = this.findRoomById(roomId);
        if (roomId) {
            return rxjs_1.of(room);
        }
        else {
            return this.fetchRoomById(roomId);
        }
    }
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
    addRoom(newRoom) {
        if (!this.hasRoom(newRoom)) {
            if (!this.firstSeenRoom || this.firstSeenRoom.lastActivityAt.isAfter(newRoom.lastActivityAt)) {
                this.firstSeenRoom = newRoom;
            }
            const roomIndex = array_utils_1.ArrayUtils.findIndex(this.rooms, room => room.id === newRoom.id);
            if (roomIndex > -1) {
                this.rooms[roomIndex] = newRoom;
            }
            else {
                this.rooms.push(newRoom);
            }
        }
    }
    findRoomById(roomId) {
        return array_utils_1.ArrayUtils.find(this.rooms, room => roomId === room.id);
    }
    openRoom(room) {
        if (!this.hasRoomOpened(room)) {
            return room.openMembership()
                .pipe(operators_1.flatMap((openedRoom) => {
                this.addToOpenedRoom(openedRoom);
                return this.markAllReceivedMessagesAsRead(openedRoom);
            }));
        }
        else {
            return rxjs_1.of(room);
        }
    }
    closeRoom(room) {
        if (this.hasRoomOpened(room)) {
            return room.closeMembership()
                .pipe(operators_1.map(closedRoom => {
                this.removeFromOpenedRoom(closedRoom);
                return closedRoom;
            }));
        }
        else {
            return rxjs_1.of(room);
        }
    }
    closeRooms(roomsToClose) {
        return rxjs_1.of(roomsToClose).pipe(operators_1.map(rooms => {
            rooms.forEach(room => this.closeRoom(room));
            return rooms;
        }));
    }
    openRoomAndCloseOthers(roomToOpen) {
        const roomsToBeClosed = this.openedRooms.filter(room => room.id !== roomToOpen.id);
        return this.closeRooms(roomsToBeClosed).pipe(operators_1.flatMap(rooms => this.openRoom(roomToOpen)));
    }
    hasOpenedRooms() {
        return this.openedRooms.length > 0;
    }
    createRoom(name, userIds, withoutDuplicate) {
        return this.roomRepository.create(name, userIds, withoutDuplicate)
            .pipe(operators_1.map(room => {
            this.addRoom(room);
            return room;
        }));
    }
    buildRoom(userIds) {
        const users = userIds.map(id => new user_types_1.User(id, ""));
        const noSenders = [];
        const noMessage = [];
        const noMessageUnread = 0;
        const noId = undefined;
        const initiator = this.toUser();
        return new room_types_1.Room(noId, undefined, undefined, true, noMessageUnread, users, noSenders, noMessage, initiator, this.roomRepository);
    }
    sendMessage(room, content, contentType) {
        return room.sendMessage({
            content: content,
            contentType: contentType,
            deviceSessionId: this.deviceSessionId
        });
    }
    isSentByMe(message) {
        return message && message.hasSenderId(this.id);
    }
    deleteMessage(message) {
        if (message) {
            const room = this.findRoomById(message.roomId);
            if (room) {
                return room.delete(message);
            }
            else {
                return rxjs_1.of(undefined);
            }
        }
        else {
            return rxjs_1.of(undefined);
        }
    }
    addUserTo(room, userId) {
        return this.roomRepository.addUser(room, userId);
    }
    addRooms(rooms) {
        rooms.forEach(room => {
            this.addRoom(room);
            if (room.open && !this.hasRoomOpened(room)) {
                this.openedRooms.push(room);
            }
        });
    }
    hasRoom(roomToFind) {
        return this.findRoom(roomToFind) !== undefined;
    }
    hasRoomOpened(roomToFind) {
        return this.findRoomOpened(roomToFind) !== undefined;
    }
    findRoom(room) {
        return this.findRoomById(room.id);
    }
    findRoomOpened(roomToFind) {
        return array_utils_1.ArrayUtils.find(this.openedRooms, room => roomToFind.id === room.id);
    }
    addToOpenedRoom(room) {
        if (!this.hasRoomOpened(room)) {
            this.openedRooms.push(room);
        }
    }
    removeFromOpenedRoom(closedRoom) {
        if (this.hasRoomOpened(closedRoom)) {
            const roomIndex = array_utils_1.ArrayUtils.findIndex(this.openedRooms, room => room.id === closedRoom.id);
            this.openedRooms.splice(roomIndex, 1);
        }
    }
    markAllReceivedMessagesAsRead(room) {
        return room.markAllMessagesAsRead()
            .pipe(operators_1.map(readMessageCount => {
            this.unreadMessageCount = Math.max(this.unreadMessageCount - readMessageCount, 0);
            return room;
        }));
    }
    toUser() {
        return new user_types_1.User(this.id, "");
    }
}
exports.Me = Me;
