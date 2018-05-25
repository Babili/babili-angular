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
var /** @type {?} */ moment = momentLoaded;
var Me = /** @class */ (function () {
    function Me(id, openedRooms, rooms, unreadMessageCount, roomCount, roomRepository) {
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
    Me.build = /**
     * @param {?} json
     * @param {?} roomRepository
     * @return {?}
     */
    function (json, roomRepository) {
        var /** @type {?} */ unreadMessageCount = json.data && json.data.meta ? json.data.meta.unreadMessageCount : 0;
        var /** @type {?} */ roomCount = json.data && json.data.meta ? json.data.meta.roomCount : 0;
        return new Me(json.data.id, [], [], unreadMessageCount, roomCount, roomRepository);
    };
    Object.defineProperty(Me.prototype, "unreadMessageCount", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalUnreadMessageCount.value;
        },
        set: /**
         * @param {?} count
         * @return {?}
         */
        function (count) {
            this.internalUnreadMessageCount.next(count);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Me.prototype, "observableUnreadMessageCount", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalUnreadMessageCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Me.prototype, "roomCount", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalRoomCount.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Me.prototype, "observableRoomCount", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalRoomCount;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    Me.prototype.fetchOpenedRooms = /**
     * @return {?}
     */
    function () {
        var _this = this;
        return this.roomRepository.findOpenedRooms().pipe(map(function (rooms) {
            _this.addRooms(rooms);
            return rooms;
        }));
    };
    /**
     * @return {?}
     */
    Me.prototype.fetchClosedRooms = /**
     * @return {?}
     */
    function () {
        var _this = this;
        return this.roomRepository.findClosedRooms().pipe(map(function (rooms) {
            _this.addRooms(rooms);
            return rooms;
        }));
    };
    /**
     * @return {?}
     */
    Me.prototype.fetchMoreRooms = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.firstSeenRoom) {
            return this.roomRepository.findRoomsAfter(this.firstSeenRoom.id).pipe(map(function (rooms) {
                _this.addRooms(rooms);
                return rooms;
            }));
        }
        else {
            return of([]);
        }
    };
    /**
     * @param {?} roomIds
     * @return {?}
     */
    Me.prototype.fetchRoomsById = /**
     * @param {?} roomIds
     * @return {?}
     */
    function (roomIds) {
        var _this = this;
        return this.roomRepository.findRoomsByIds(roomIds).pipe(map(function (rooms) {
            _this.addRooms(rooms);
            return rooms;
        }));
    };
    /**
     * @param {?} roomId
     * @return {?}
     */
    Me.prototype.fetchRoomById = /**
     * @param {?} roomId
     * @return {?}
     */
    function (roomId) {
        var _this = this;
        return this.roomRepository.find(roomId).pipe(map(function (room) {
            _this.addRoom(room);
            return room;
        }));
    };
    /**
     * @param {?} roomId
     * @return {?}
     */
    Me.prototype.findOrFetchRoomById = /**
     * @param {?} roomId
     * @return {?}
     */
    function (roomId) {
        var /** @type {?} */ room = this.findRoomById(roomId);
        if (roomId) {
            return of(room);
        }
        else {
            return this.fetchRoomById(roomId);
        }
    };
    /**
     * @param {?} newMessage
     * @return {?}
     */
    Me.prototype.handleNewMessage = /**
     * @param {?} newMessage
     * @return {?}
     */
    function (newMessage) {
        var _this = this;
        this.findOrFetchRoomById(newMessage.roomId)
            .subscribe(function (room) {
            if (room) {
                room.addMessage(newMessage);
                room.notifyNewMessage(newMessage);
                if (!newMessage.hasSenderId(_this.id)) {
                    _this.unreadMessageCount = _this.unreadMessageCount + 1;
                    if (!room.open) {
                        room.unreadMessageCount = room.unreadMessageCount + 1;
                    }
                }
            }
        });
    };
    /**
     * @param {?} newRoom
     * @return {?}
     */
    Me.prototype.addRoom = /**
     * @param {?} newRoom
     * @return {?}
     */
    function (newRoom) {
        if (!this.hasRoom(newRoom)) {
            if (!this.firstSeenRoom || moment(this.firstSeenRoom.lastActivityAt).isAfter(newRoom.lastActivityAt)) {
                this.firstSeenRoom = newRoom;
            }
            var /** @type {?} */ roomIndex = ArrayUtils.findIndex(this.rooms, function (room) { return room.id === newRoom.id; });
            if (roomIndex > -1) {
                this.rooms[roomIndex] = newRoom;
            }
            else {
                this.rooms.push(newRoom);
            }
        }
    };
    /**
     * @param {?} roomId
     * @return {?}
     */
    Me.prototype.findRoomById = /**
     * @param {?} roomId
     * @return {?}
     */
    function (roomId) {
        return ArrayUtils.find(this.rooms, function (room) { return roomId === room.id; });
    };
    /**
     * @param {?} room
     * @return {?}
     */
    Me.prototype.openRoom = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        var _this = this;
        if (!this.hasRoomOpened(room)) {
            return room.openMembership()
                .pipe(flatMap(function (openedRoom) {
                _this.addToOpenedRoom(openedRoom);
                return _this.markAllReceivedMessagesAsRead(openedRoom);
            }));
        }
        else {
            return of(room);
        }
    };
    /**
     * @param {?} room
     * @return {?}
     */
    Me.prototype.closeRoom = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        var _this = this;
        if (this.hasRoomOpened(room)) {
            return room.closeMembership()
                .pipe(map(function (closedRoom) {
                _this.removeFromOpenedRoom(closedRoom);
                return closedRoom;
            }));
        }
        else {
            return of(room);
        }
    };
    /**
     * @param {?} roomsToClose
     * @return {?}
     */
    Me.prototype.closeRooms = /**
     * @param {?} roomsToClose
     * @return {?}
     */
    function (roomsToClose) {
        var _this = this;
        return of(roomsToClose).pipe(map(function (rooms) {
            rooms.forEach(function (room) { return _this.closeRoom(room); });
            return rooms;
        }));
    };
    /**
     * @param {?} roomToOpen
     * @return {?}
     */
    Me.prototype.openRoomAndCloseOthers = /**
     * @param {?} roomToOpen
     * @return {?}
     */
    function (roomToOpen) {
        var _this = this;
        var /** @type {?} */ roomsToBeClosed = this.openedRooms.filter(function (room) { return room.id !== roomToOpen.id; });
        return this.closeRooms(roomsToBeClosed).pipe(flatMap(function (rooms) { return _this.openRoom(roomToOpen); }));
    };
    /**
     * @return {?}
     */
    Me.prototype.hasOpenedRooms = /**
     * @return {?}
     */
    function () {
        return this.openedRooms.length > 0;
    };
    /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    Me.prototype.createRoom = /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    function (name, userIds, withoutDuplicate) {
        var _this = this;
        return this.roomRepository.create(name, userIds, withoutDuplicate)
            .pipe(map(function (room) {
            _this.addRoom(room);
            return room;
        }));
    };
    /**
     * @param {?} userIds
     * @return {?}
     */
    Me.prototype.buildRoom = /**
     * @param {?} userIds
     * @return {?}
     */
    function (userIds) {
        var /** @type {?} */ users = userIds.map(function (id) { return new User(id, ""); });
        var /** @type {?} */ noSenders = [];
        var /** @type {?} */ noMessage = [];
        var /** @type {?} */ noMessageUnread = 0;
        var /** @type {?} */ noId = undefined;
        var /** @type {?} */ initiator = this.toUser();
        return new Room(noId, undefined, undefined, true, noMessageUnread, users, noSenders, noMessage, initiator, this.roomRepository);
    };
    /**
     * @param {?} room
     * @param {?} content
     * @param {?} contentType
     * @return {?}
     */
    Me.prototype.sendMessage = /**
     * @param {?} room
     * @param {?} content
     * @param {?} contentType
     * @return {?}
     */
    function (room, content, contentType) {
        return room.sendMessage({
            content: content,
            contentType: contentType,
            deviceSessionId: this.deviceSessionId
        });
    };
    /**
     * @param {?} message
     * @return {?}
     */
    Me.prototype.isSentByMe = /**
     * @param {?} message
     * @return {?}
     */
    function (message) {
        return message && message.hasSenderId(this.id);
    };
    /**
     * @param {?} message
     * @return {?}
     */
    Me.prototype.deleteMessage = /**
     * @param {?} message
     * @return {?}
     */
    function (message) {
        if (message) {
            var /** @type {?} */ room = this.findRoomById(message.roomId);
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
    };
    /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    Me.prototype.addUserTo = /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    function (room, userId) {
        return this.roomRepository.addUser(room, userId);
    };
    /**
     * @param {?} rooms
     * @return {?}
     */
    Me.prototype.addRooms = /**
     * @param {?} rooms
     * @return {?}
     */
    function (rooms) {
        var _this = this;
        rooms.forEach(function (room) {
            _this.addRoom(room);
            if (room.open && !_this.hasRoomOpened(room)) {
                _this.openedRooms.push(room);
            }
        });
    };
    /**
     * @param {?} roomToFind
     * @return {?}
     */
    Me.prototype.hasRoom = /**
     * @param {?} roomToFind
     * @return {?}
     */
    function (roomToFind) {
        return this.findRoom(roomToFind) !== undefined;
    };
    /**
     * @param {?} roomToFind
     * @return {?}
     */
    Me.prototype.hasRoomOpened = /**
     * @param {?} roomToFind
     * @return {?}
     */
    function (roomToFind) {
        return this.findRoomOpened(roomToFind) !== undefined;
    };
    /**
     * @param {?} room
     * @return {?}
     */
    Me.prototype.findRoom = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        return this.findRoomById(room.id);
    };
    /**
     * @param {?} roomToFind
     * @return {?}
     */
    Me.prototype.findRoomOpened = /**
     * @param {?} roomToFind
     * @return {?}
     */
    function (roomToFind) {
        return ArrayUtils.find(this.openedRooms, function (room) { return roomToFind.id === room.id; });
    };
    /**
     * @param {?} room
     * @return {?}
     */
    Me.prototype.addToOpenedRoom = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        if (!this.hasRoomOpened(room)) {
            this.openedRooms.push(room);
        }
    };
    /**
     * @param {?} closedRoom
     * @return {?}
     */
    Me.prototype.removeFromOpenedRoom = /**
     * @param {?} closedRoom
     * @return {?}
     */
    function (closedRoom) {
        if (this.hasRoomOpened(closedRoom)) {
            var /** @type {?} */ roomIndex = ArrayUtils.findIndex(this.openedRooms, function (room) { return room.id === closedRoom.id; });
            this.openedRooms.splice(roomIndex, 1);
        }
    };
    /**
     * @param {?} room
     * @return {?}
     */
    Me.prototype.markAllReceivedMessagesAsRead = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        var _this = this;
        return room.markAllMessagesAsRead()
            .pipe(map(function (readMessageCount) {
            _this.unreadMessageCount = Math.max(_this.unreadMessageCount - readMessageCount, 0);
            return room;
        }));
    };
    /**
     * @return {?}
     */
    Me.prototype.toUser = /**
     * @return {?}
     */
    function () {
        return new User(this.id, "");
    };
    return Me;
}());
export { Me };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUudHlwZXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvIiwic291cmNlcyI6WyJtZS9tZS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFFLGVBQWUsRUFBYyxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUcxQyxxQkFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBRTVCLElBQUE7SUFhRSxZQUFxQixFQUFVLEVBQ1YsV0FBbUIsRUFDbkIsS0FBYSxFQUN0QixrQkFBMEIsRUFDMUIsU0FBaUIsRUFDVDtRQUxDLE9BQUUsR0FBRixFQUFFLENBQVE7UUFDVixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUNuQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBR2QsbUJBQWMsR0FBZCxjQUFjO1FBQ2hDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLGVBQWUsQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxlQUFlLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzlEOzs7Ozs7SUFuQk0sUUFBSzs7Ozs7SUFBWixVQUFhLElBQVMsRUFBRSxjQUE4QjtRQUNwRCxxQkFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElB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QUMsQ0FBQzs7Ozs7O0lBR3RFLDRCQUFlOzs7O2NBQUMsSUFBVTtRQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCOzs7Ozs7SUFHSyxpQ0FBb0I7Ozs7Y0FBQyxVQUFnQjtRQUMzQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxxQkFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLEVBQUUsS0FBSyxVQUFVLENBQUMsRUFBRSxFQUF6QixDQUF5QixDQUFDLENBQUM7WUFDNUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3ZDOzs7Ozs7SUFHSywwQ0FBNkI7Ozs7Y0FBQyxJQUFVOztRQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxnQkFBZ0I7WUFDdkIsS0FBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSSxDQUFDLGtCQUFrQixHQUFHLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDYixDQUFDLENBQUMsQ0FBQzs7Ozs7SUFHVixtQkFBTTs7OztRQUNaLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOzthQTNSakM7SUE2UkMsQ0FBQTtBQW5SRCxjQW1SQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGZsYXRNYXAsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQXJyYXlVdGlscyB9IGZyb20gXCIuLi9hcnJheS51dGlsc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmV4cG9ydCBjbGFzcyBNZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KTogTWUge1xuICAgIGNvbnN0IHVucmVhZE1lc3NhZ2VDb3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnVucmVhZE1lc3NhZ2VDb3VudCA6IDA7XG4gICAgY29uc3Qgcm9vbUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEucm9vbUNvdW50IDogMDtcbiAgICByZXR1cm4gbmV3IE1lKGpzb24uZGF0YS5pZCwgW10sIFtdLCB1bnJlYWRNZXNzYWdlQ291bnQsIHJvb21Db3VudCwgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgcHVibGljIGRldmljZVNlc3Npb25JZDogc3RyaW5nO1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFJvb21Db3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgZmlyc3RTZWVuUm9vbTogUm9vbTtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBvcGVuZWRSb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcm9vbUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50IHx8IDApO1xuICAgIHRoaXMuaW50ZXJuYWxSb29tQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHJvb21Db3VudCB8fCAwKTtcbiAgfVxuXG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCByb29tQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudC52YWx1ZTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlUm9vbUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudDtcbiAgfVxuXG4gIGZldGNoT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kT3BlbmVkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZENsb3NlZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hNb3JlUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICBpZiAodGhpcy5maXJzdFNlZW5Sb29tKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNBZnRlcih0aGlzLmZpcnN0U2VlblJvb20uaWQpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKFtdKTtcbiAgICB9XG4gIH1cblxuICBmZXRjaFJvb21zQnlJZChyb29tSWRzOiBzdHJpbmdbXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQnlJZHMocm9vbUlkcykucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmQocm9vbUlkKS5waXBlKG1hcChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZpbmRPckZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQocm9vbUlkKTtcbiAgICBpZiAocm9vbUlkKSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZldGNoUm9vbUJ5SWQocm9vbUlkKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVOZXdNZXNzYWdlKG5ld01lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLmZpbmRPckZldGNoUm9vbUJ5SWQobmV3TWVzc2FnZS5yb29tSWQpXG4gICAgICAgIC5zdWJzY3JpYmUocm9vbSA9PiB7XG4gICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIHJvb20uYWRkTWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIHJvb20ubm90aWZ5TmV3TWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIGlmICghbmV3TWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgaWYgKCFyb29tLm9wZW4pIHtcbiAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IHJvb20udW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBhZGRSb29tKG5ld1Jvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbShuZXdSb29tKSkge1xuICAgICAgaWYgKCF0aGlzLmZpcnN0U2VlblJvb20gfHwgbW9tZW50KHRoaXMuZmlyc3RTZWVuUm9vbS5sYXN0QWN0aXZpdHlBdCkuaXNBZnRlcihuZXdSb29tLmxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICB0aGlzLmZpcnN0U2VlblJvb20gPSBuZXdSb29tO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByb29tSW5kZXggPSBBcnJheVV0aWxzLmZpbmRJbmRleCh0aGlzLnJvb21zLCByb29tID0+IHJvb20uaWQgPT09IG5ld1Jvb20uaWQpO1xuICAgICAgaWYgKHJvb21JbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMucm9vbXNbcm9vbUluZGV4XSA9IG5ld1Jvb207XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb21zLnB1c2gobmV3Um9vbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmluZFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogUm9vbSB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLnJvb21zLCByb29tID0+IHJvb21JZCA9PT0gcm9vbS5pZCk7XG4gIH1cblxuICBvcGVuUm9vbShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLm9wZW5NZW1iZXJzaGlwKClcbiAgICAgICAgICAgICAgICAgLnBpcGUoZmxhdE1hcCgob3BlbmVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkVG9PcGVuZWRSb29tKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLmNsb3NlTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKG1hcChjbG9zZWRSb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb3NlZFJvb207XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb21zKHJvb21zVG9DbG9zZTogUm9vbVtdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gb2Yocm9vbXNUb0Nsb3NlKS5waXBlKFxuICAgICAgbWFwKHJvb21zID0+IHtcbiAgICAgICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHRoaXMuY2xvc2VSb29tKHJvb20pKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgb3BlblJvb21BbmRDbG9zZU90aGVycyhyb29tVG9PcGVuOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbXNUb0JlQ2xvc2VkID0gdGhpcy5vcGVuZWRSb29tcy5maWx0ZXIocm9vbSA9PiByb29tLmlkICE9PSByb29tVG9PcGVuLmlkKTtcbiAgICByZXR1cm4gdGhpcy5jbG9zZVJvb21zKHJvb21zVG9CZUNsb3NlZCkucGlwZShmbGF0TWFwKHJvb21zID0+IHRoaXMub3BlblJvb20ocm9vbVRvT3BlbikpKTtcbiAgfVxuXG4gIGhhc09wZW5lZFJvb21zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wZW5lZFJvb21zLmxlbmd0aCA+IDA7XG4gIH1cblxuICBjcmVhdGVSb29tKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5jcmVhdGUobmFtZSwgdXNlcklkcywgd2l0aG91dER1cGxpY2F0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIGJ1aWxkUm9vbSh1c2VySWRzOiBzdHJpbmdbXSk6IFJvb20ge1xuICAgIGNvbnN0IHVzZXJzID0gdXNlcklkcy5tYXAoaWQgPT4gbmV3IFVzZXIoaWQsIFwiXCIpKTtcbiAgICBjb25zdCBub1NlbmRlcnMgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2UgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2VVbnJlYWQgPSAwO1xuICAgIGNvbnN0IG5vSWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaW5pdGlhdG9yID0gdGhpcy50b1VzZXIoKTtcbiAgICByZXR1cm4gbmV3IFJvb20obm9JZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHRydWUsXG4gICAgICBub01lc3NhZ2VVbnJlYWQsXG4gICAgICB1c2VycyxcbiAgICAgIG5vU2VuZGVycyxcbiAgICAgIG5vTWVzc2FnZSxcbiAgICAgIGluaXRpYXRvcixcbiAgICAgIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKHJvb206IFJvb20sIGNvbnRlbnQ6IHN0cmluZywgY29udGVudFR5cGU6IHN0cmluZyk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiByb29tLnNlbmRNZXNzYWdlKHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBjb250ZW50VHlwZTogY29udGVudFR5cGUsXG4gICAgICBkZXZpY2VTZXNzaW9uSWQ6IHRoaXMuZGV2aWNlU2Vzc2lvbklkXG4gICAgfSk7XG4gIH1cblxuICBpc1NlbnRCeU1lKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbWVzc2FnZSAmJiBtZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChtZXNzYWdlLnJvb21JZCk7XG4gICAgICBpZiAocm9vbSkge1xuICAgICAgICByZXR1cm4gcm9vbS5kZWxldGUobWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgYWRkVXNlclRvKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuYWRkVXNlcihyb29tLCB1c2VySWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRSb29tcyhyb29tczogUm9vbVtdKSB7XG4gICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIGlmIChyb29tLm9wZW4gJiYgIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb20ocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb21PcGVuZWQocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tKHJvb206IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbUJ5SWQocm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gQXJyYXlVdGlscy5maW5kKHRoaXMub3BlbmVkUm9vbXMsIHJvb20gPT4gcm9vbVRvRmluZC5pZCA9PT0gcm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGFkZFRvT3BlbmVkUm9vbShyb29tOiBSb29tKSB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHRoaXMub3BlbmVkUm9vbXMucHVzaChyb29tKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbW92ZUZyb21PcGVuZWRSb29tKGNsb3NlZFJvb206IFJvb20pIHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKGNsb3NlZFJvb20pKSB7XG4gICAgICBjb25zdCByb29tSW5kZXggPSBBcnJheVV0aWxzLmZpbmRJbmRleCh0aGlzLm9wZW5lZFJvb21zLCByb29tID0+IHJvb20uaWQgPT09IGNsb3NlZFJvb20uaWQpO1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5zcGxpY2Uocm9vbUluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gcm9vbS5tYXJrQWxsTWVzc2FnZXNBc1JlYWQoKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlYWRNZXNzYWdlQ291bnQgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSBNYXRoLm1heCh0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCAtIHJlYWRNZXNzYWdlQ291bnQsIDApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1VzZXIoKTogVXNlciB7XG4gICAgcmV0dXJuIG5ldyBVc2VyKHRoaXMuaWQsIFwiXCIpO1xuICB9XG59XG4iXX0=