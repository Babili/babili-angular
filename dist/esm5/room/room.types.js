/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as momentLoaded from "moment";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { Message } from "../message/message.types";
import { User } from "../user/user.types";
var /** @type {?} */ moment = momentLoaded;
var Room = /** @class */ (function () {
    function Room(id, name, lastActivityAt, open, unreadMessageCount, users, senders, messages, initiator, roomRepository) {
        this.id = id;
        this.users = users;
        this.senders = senders;
        this.messages = messages;
        this.initiator = initiator;
        this.roomRepository = roomRepository;
        this.internalOpen = new BehaviorSubject(open);
        this.internalLastActivityAt = new BehaviorSubject(lastActivityAt);
        this.internalName = new BehaviorSubject(name);
        this.internalUnreadMessageCount = new BehaviorSubject(unreadMessageCount);
        this.internalImageUrl = new BehaviorSubject(undefined);
    }
    /**
     * @param {?} json
     * @param {?} roomRepository
     * @param {?} messageRepository
     * @return {?}
     */
    Room.build = /**
     * @param {?} json
     * @param {?} roomRepository
     * @param {?} messageRepository
     * @return {?}
     */
    function (json, roomRepository, messageRepository) {
        var /** @type {?} */ attributes = json.attributes;
        var /** @type {?} */ users = json.relationships && json.relationships.users ? User.map(json.relationships.users.data) : [];
        var /** @type {?} */ senders = json.relationships && json.relationships.senders ? User.map(json.relationships.senders.data) : [];
        var /** @type {?} */ messages = json.relationships && json.relationships.messages ? Message.map(json.relationships.messages.data) : [];
        var /** @type {?} */ initiator = json.relationships && json.relationships.initiator ? User.build(json.relationships.initiator.data) : undefined;
        return new Room(json.id, attributes.name, attributes.lastActivityAt ? moment(attributes.lastActivityAt).utc().toDate() : undefined, attributes.open, attributes.unreadMessageCount, users, senders, messages, initiator, roomRepository);
    };
    /**
     * @param {?} json
     * @param {?} roomRepository
     * @param {?} messageRepository
     * @return {?}
     */
    Room.map = /**
     * @param {?} json
     * @param {?} roomRepository
     * @param {?} messageRepository
     * @return {?}
     */
    function (json, roomRepository, messageRepository) {
        if (json) {
            return json.map(function (room) { return Room.build(room, roomRepository, messageRepository); });
        }
        else {
            return undefined;
        }
    };
    Object.defineProperty(Room.prototype, "unreadMessageCount", {
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
    Object.defineProperty(Room.prototype, "observableUnreadMessageCount", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalUnreadMessageCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "name", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalName.value;
        },
        set: /**
         * @param {?} name
         * @return {?}
         */
        function (name) {
            this.internalName.next(name);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "observableName", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "open", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalOpen.value;
        },
        set: /**
         * @param {?} open
         * @return {?}
         */
        function (open) {
            this.internalOpen.next(open);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "observableOpen", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalOpen;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "lastActivityAt", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalLastActivityAt.value;
        },
        set: /**
         * @param {?} lastActivityAt
         * @return {?}
         */
        function (lastActivityAt) {
            this.internalLastActivityAt.next(lastActivityAt);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "observableLastActivityAt", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalLastActivityAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "imageUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalImageUrl.value;
        },
        set: /**
         * @param {?} imageUrl
         * @return {?}
         */
        function (imageUrl) {
            this.internalImageUrl.next(imageUrl);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "observableImageUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.internalImageUrl;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    Room.prototype.openMembership = /**
     * @return {?}
     */
    function () {
        return this.roomRepository.updateMembership(this, true);
    };
    /**
     * @return {?}
     */
    Room.prototype.closeMembership = /**
     * @return {?}
     */
    function () {
        return this.roomRepository.updateMembership(this, false);
    };
    /**
     * @return {?}
     */
    Room.prototype.markAllMessagesAsRead = /**
     * @return {?}
     */
    function () {
        return this.roomRepository.markAllReceivedMessagesAsRead(this);
    };
    /**
     * @param {?} message
     * @return {?}
     */
    Room.prototype.addMessage = /**
     * @param {?} message
     * @return {?}
     */
    function (message) {
        this.messages.push(message);
        this.lastActivityAt = message.createdAt;
    };
    /**
     * @param {?} message
     * @return {?}
     */
    Room.prototype.notifyNewMessage = /**
     * @param {?} message
     * @return {?}
     */
    function (message) {
        if (this.newMessageNotifier) {
            this.newMessageNotifier.apply(message);
        }
    };
    /**
     * @param {?} userId
     * @return {?}
     */
    Room.prototype.hasUser = /**
     * @param {?} userId
     * @return {?}
     */
    function (userId) {
        return this.users && this.users.some(function (user) { return user.id === userId; });
    };
    /**
     * @return {?}
     */
    Room.prototype.fetchMoreMessage = /**
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ params = {
            firstSeenMessageId: this.messages.length > 0 ? this.messages[0].id : undefined
        };
        return this.roomRepository
            .findMessages(this, params)
            .pipe(map(function (messages) {
            _this.messages.unshift.apply(_this.messages, messages);
            return messages;
        }));
    };
    /**
     * @param {?} id
     * @return {?}
     */
    Room.prototype.findMessageWithId = /**
     * @param {?} id
     * @return {?}
     */
    function (id) {
        return this.messages ? this.messages.find(function (message) { return message.id === id; }) : undefined;
    };
    /**
     * @return {?}
     */
    Room.prototype.update = /**
     * @return {?}
     */
    function () {
        return this.roomRepository.update(this);
    };
    /**
     * @param {?} newMessage
     * @return {?}
     */
    Room.prototype.sendMessage = /**
     * @param {?} newMessage
     * @return {?}
     */
    function (newMessage) {
        var _this = this;
        return this.roomRepository
            .createMessage(this, newMessage)
            .pipe(map(function (message) {
            _this.addMessage(message);
            return message;
        }));
    };
    /**
     * @param {?} messageToDelete
     * @return {?}
     */
    Room.prototype.removeMessage = /**
     * @param {?} messageToDelete
     * @return {?}
     */
    function (messageToDelete) {
        var /** @type {?} */ index = this.messages ? this.messages.findIndex(function (message) { return message.id === messageToDelete.id; }) : -1;
        if (index > -1) {
            this.messages.splice(index, 1);
        }
        return messageToDelete;
    };
    /**
     * @param {?} message
     * @return {?}
     */
    Room.prototype.delete = /**
     * @param {?} message
     * @return {?}
     */
    function (message) {
        var _this = this;
        return this.roomRepository
            .deleteMessage(this, message)
            .pipe(map(function (deletedMessage) { return _this.removeMessage(deletedMessage); }));
    };
    /**
     * @param {?} room
     * @return {?}
     */
    Room.prototype.replaceUsersWith = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        this.users.splice(0, this.users.length);
        Array.prototype.push.apply(this.users, room.users);
        return this;
    };
    /**
     * @param {?} user
     * @return {?}
     */
    Room.prototype.addUser = /**
     * @param {?} user
     * @return {?}
     */
    function (user) {
        if (!this.hasUser(user.id)) {
            this.users.push(user);
        }
    };
    return Room;
}());
export { Room };
function Room_tsickle_Closure_declarations() {
    /** @type {?} */
    Room.prototype.newMessageNotifier;
    /** @type {?} */
    Room.prototype.internalOpen;
    /** @type {?} */
    Room.prototype.internalUnreadMessageCount;
    /** @type {?} */
    Room.prototype.internalName;
    /** @type {?} */
    Room.prototype.internalLastActivityAt;
    /** @type {?} */
    Room.prototype.internalImageUrl;
    /** @type {?} */
    Room.prototype.id;
    /** @type {?} */
    Room.prototype.users;
    /** @type {?} */
    Room.prototype.senders;
    /** @type {?} */
    Room.prototype.messages;
    /** @type {?} */
    Room.prototype.initiator;
    /** @type {?} */
    Room.prototype.roomRepository;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbInJvb20vcm9vbS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUNuRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDckMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUcxQyxxQkFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBRTVCLElBQUE7SUFtQ0UsY0FBcUIsRUFBVSxFQUNuQixJQUFZLEVBQ1osY0FBb0IsRUFDcEIsSUFBYSxFQUNiLGtCQUEwQixFQUNqQixLQUFhLEVBQ2IsT0FBZSxFQUNmLFFBQW1CLEVBQ25CLFNBQWUsRUFDaEI7UUFUQyxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBS1YsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQU07UUFDaEIsbUJBQWMsR0FBZCxjQUFjO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksZUFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLGdCQUFnQixHQUFH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Q0FBQyxDQUFDO1FBQ3pHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDaEM7UUFDRCxNQUFNLENBQUMsZUFBZSxDQUFDO0tBQ3hCOzs7OztJQUVELHFCQUFNOzs7O0lBQU4sVUFBTyxPQUFnQjtRQUF2QixpQkFJQztRQUhDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYzthQUNkLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxjQUFjLElBQUksT0FBQSxLQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDLENBQUMsQ0FBQztLQUM3RTs7Ozs7SUFFRCwrQkFBZ0I7Ozs7SUFBaEIsVUFBaUIsSUFBVTtRQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQztLQUNiOzs7OztJQUVELHNCQUFPOzs7O0lBQVAsVUFBUSxJQUFVO1FBQ2hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO0tBQ0Y7ZUEvTUg7SUFnTkMsQ0FBQTtBQXZNRCxnQkF1TUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20ucmVwb3NpdG9yeVwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5leHBvcnQgY2xhc3MgUm9vbSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIGNvbnN0IHVzZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy51c2VycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy51c2Vycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IHNlbmRlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcyA/IE1lc3NhZ2UubWFwKGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yLmRhdGEpIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBuZXcgUm9vbShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQgPyBtb21lbnQoYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCkudXRjKCkudG9EYXRlKCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy51bnJlYWRNZXNzYWdlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJzLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXJzLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdG9yLFxuICAgICAgICAgICAgICAgICAgICByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAocm9vbSA9PiBSb29tLmJ1aWxkKHJvb20sIHJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIG5ld01lc3NhZ2VOb3RpZmllcjogKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGFueTtcbiAgcHJpdmF0ZSBpbnRlcm5hbE9wZW46IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxOYW1lOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbExhc3RBY3Rpdml0eUF0OiBCZWhhdmlvclN1YmplY3Q8RGF0ZT47XG4gIHByaXZhdGUgaW50ZXJuYWxJbWFnZVVybDogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBsYXN0QWN0aXZpdHlBdDogRGF0ZSxcbiAgICAgICAgICAgICAgb3BlbjogYm9vbGVhbixcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHVzZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgbWVzc2FnZXM6IE1lc3NhZ2VbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgaW5pdGlhdG9yOiBVc2VyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuID0gbmV3IEJlaGF2aW9yU3ViamVjdChvcGVuKTtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGxhc3RBY3Rpdml0eUF0KTtcbiAgICB0aGlzLmludGVybmFsTmFtZSA9IG5ldyBCZWhhdmlvclN1YmplY3QobmFtZSk7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50KTtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWUudmFsdWU7XG4gIH1cblxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsTmFtZS5uZXh0KG5hbWUpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVOYW1lKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWU7XG4gIH1cblxuICBnZXQgb3BlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW4udmFsdWU7XG4gIH1cblxuICBzZXQgb3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4ubmV4dChvcGVuKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlT3BlbigpOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3BlbjtcbiAgfVxuXG4gIGdldCBsYXN0QWN0aXZpdHlBdCgpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0LnZhbHVlO1xuICB9XG5cbiAgc2V0IGxhc3RBY3Rpdml0eUF0KGxhc3RBY3Rpdml0eUF0OiBEYXRlKSB7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0Lm5leHQobGFzdEFjdGl2aXR5QXQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVMYXN0QWN0aXZpdHlBdCgpOiBCZWhhdmlvclN1YmplY3Q8RGF0ZT4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQ7XG4gIH1cblxuICBnZXQgaW1hZ2VVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsLnZhbHVlO1xuICB9XG5cbiAgc2V0IGltYWdlVXJsKGltYWdlVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwubmV4dChpbWFnZVVybCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUltYWdlVXJsKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsO1xuICB9XG5cblxuICBvcGVuTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIHRydWUpO1xuICB9XG5cbiAgY2xvc2VNZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgZmFsc2UpO1xuICB9XG5cbiAgbWFya0FsbE1lc3NhZ2VzQXNSZWFkKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkubWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQodGhpcyk7XG4gIH1cblxuICBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHlBdCA9IG1lc3NhZ2UuY3JlYXRlZEF0O1xuICB9XG5cbiAgbm90aWZ5TmV3TWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyKSB7XG4gICAgICB0aGlzLm5ld01lc3NhZ2VOb3RpZmllci5hcHBseShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuXG4gIGhhc1VzZXIodXNlcklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy51c2VycyAmJiB0aGlzLnVzZXJzLnNvbWUodXNlciA9PiB1c2VyLmlkICA9PT0gdXNlcklkKTtcbiAgfVxuXG4gIGZldGNoTW9yZU1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBmaXJzdFNlZW5NZXNzYWdlSWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCA/IHRoaXMubWVzc2FnZXNbMF0uaWQgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZmluZE1lc3NhZ2VzKHRoaXMsIHBhcmFtcylcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgbWFwKG1lc3NhZ2VzID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0LmFwcGx5KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2VzKTtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VXaXRoSWQoaWQ6IHN0cmluZyk6IE1lc3NhZ2Uge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kKG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgdXBkYXRlKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKG5ld01lc3NhZ2U6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmNyZWF0ZU1lc3NhZ2UodGhpcywgbmV3TWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICBtYXAobWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgKTtcbiAgfVxuXG4gIHJlbW92ZU1lc3NhZ2UobWVzc2FnZVRvRGVsZXRlOiBNZXNzYWdlKTogTWVzc2FnZSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kSW5kZXgobWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBtZXNzYWdlVG9EZWxldGUuaWQpIDogLTE7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VUb0RlbGV0ZTtcbiAgfVxuXG4gIGRlbGV0ZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5kZWxldGVNZXNzYWdlKHRoaXMsIG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShtYXAoZGVsZXRlZE1lc3NhZ2UgPT4gdGhpcy5yZW1vdmVNZXNzYWdlKGRlbGV0ZWRNZXNzYWdlKSkpO1xuICB9XG5cbiAgcmVwbGFjZVVzZXJzV2l0aChyb29tOiBSb29tKTogUm9vbSB7XG4gICAgdGhpcy51c2Vycy5zcGxpY2UoMCwgdGhpcy51c2Vycy5sZW5ndGgpO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMudXNlcnMsIHJvb20udXNlcnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkVXNlcih1c2VyOiBVc2VyKSB7XG4gICAgaWYgKCF0aGlzLmhhc1VzZXIodXNlci5pZCkpIHtcbiAgICAgIHRoaXMudXNlcnMucHVzaCh1c2VyKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==