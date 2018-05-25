/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as momentLoaded from "moment";
const /** @type {?} */ moment = momentLoaded;
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { ArrayUtils } from "../array.utils";
import { Message } from "../message/message.types";
import { User } from "../user/user.types";
export class Room {
    /**
     * @param {?} id
     * @param {?} name
     * @param {?} lastActivityAt
     * @param {?} open
     * @param {?} unreadMessageCount
     * @param {?} users
     * @param {?} senders
     * @param {?} messages
     * @param {?} initiator
     * @param {?} roomRepository
     */
    constructor(id, name, lastActivityAt, open, unreadMessageCount, users, senders, messages, initiator, roomRepository) {
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
    static build(json, roomRepository, messageRepository) {
        const /** @type {?} */ attributes = json.attributes;
        const /** @type {?} */ users = json.relationships && json.relationships.users ? User.map(json.relationships.users.data) : [];
        const /** @type {?} */ senders = json.relationships && json.relationships.senders ? User.map(json.relationships.senders.data) : [];
        const /** @type {?} */ messages = json.relationships && json.relationships.messages ? Message.map(json.relationships.messages.data) : [];
        const /** @type {?} */ initiator = json.relationships && json.relationships.initiator ? User.build(json.relationships.initiator.data) : undefined;
        return new Room(json.id, attributes.name, attributes.lastActivityAt ? moment(attributes.lastActivityAt).utc().toDate() : undefined, attributes.open, attributes.unreadMessageCount, users, senders, messages, initiator, roomRepository);
    }
    /**
     * @param {?} json
     * @param {?} roomRepository
     * @param {?} messageRepository
     * @return {?}
     */
    static map(json, roomRepository, messageRepository) {
        if (json) {
            return json.map(room => Room.build(room, roomRepository, messageRepository));
        }
        else {
            return undefined;
        }
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
    get name() {
        return this.internalName.value;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    set name(name) {
        this.internalName.next(name);
    }
    /**
     * @return {?}
     */
    get observableName() {
        return this.internalName;
    }
    /**
     * @return {?}
     */
    get open() {
        return this.internalOpen.value;
    }
    /**
     * @param {?} open
     * @return {?}
     */
    set open(open) {
        this.internalOpen.next(open);
    }
    /**
     * @return {?}
     */
    get observableOpen() {
        return this.internalOpen;
    }
    /**
     * @return {?}
     */
    get lastActivityAt() {
        return this.internalLastActivityAt.value;
    }
    /**
     * @param {?} lastActivityAt
     * @return {?}
     */
    set lastActivityAt(lastActivityAt) {
        this.internalLastActivityAt.next(lastActivityAt);
    }
    /**
     * @return {?}
     */
    get observableLastActivityAt() {
        return this.internalLastActivityAt;
    }
    /**
     * @return {?}
     */
    get imageUrl() {
        return this.internalImageUrl.value;
    }
    /**
     * @param {?} imageUrl
     * @return {?}
     */
    set imageUrl(imageUrl) {
        this.internalImageUrl.next(imageUrl);
    }
    /**
     * @return {?}
     */
    get observableImageUrl() {
        return this.internalImageUrl;
    }
    /**
     * @return {?}
     */
    openMembership() {
        return this.roomRepository.updateMembership(this, true);
    }
    /**
     * @return {?}
     */
    closeMembership() {
        return this.roomRepository.updateMembership(this, false);
    }
    /**
     * @return {?}
     */
    markAllMessagesAsRead() {
        return this.roomRepository.markAllReceivedMessagesAsRead(this);
    }
    /**
     * @param {?} message
     * @return {?}
     */
    addMessage(message) {
        this.messages.push(message);
        this.lastActivityAt = message.createdAt;
    }
    /**
     * @param {?} message
     * @return {?}
     */
    notifyNewMessage(message) {
        if (this.newMessageNotifier) {
            this.newMessageNotifier.apply(message);
        }
    }
    /**
     * @param {?} userId
     * @return {?}
     */
    hasUser(userId) {
        return ArrayUtils.find(this.users.map(user => user.id), id => id === userId) !== undefined;
    }
    /**
     * @return {?}
     */
    fetchMoreMessage() {
        const /** @type {?} */ params = {
            firstSeenMessageId: this.messages.length > 0 ? this.messages[0].id : undefined
        };
        return this.roomRepository
            .findMessages(this, params)
            .pipe(map(messages => {
            this.messages.unshift.apply(this.messages, messages);
            return messages;
        }));
    }
    /**
     * @param {?} id
     * @return {?}
     */
    findMessageWithId(id) {
        return ArrayUtils.find(this.messages, message => message.id === id);
    }
    /**
     * @return {?}
     */
    update() {
        return this.roomRepository.update(this);
    }
    /**
     * @param {?} newMessage
     * @return {?}
     */
    sendMessage(newMessage) {
        return this.roomRepository
            .createMessage(this, newMessage)
            .pipe(map(message => {
            this.addMessage(message);
            return message;
        }));
    }
    /**
     * @param {?} messageToDelete
     * @return {?}
     */
    removeMessage(messageToDelete) {
        const /** @type {?} */ index = ArrayUtils.findIndex(this.messages, message => message.id === messageToDelete.id);
        if (index > -1) {
            this.messages.splice(index, 1);
        }
        return messageToDelete;
    }
    /**
     * @param {?} message
     * @return {?}
     */
    delete(message) {
        return this.roomRepository
            .deleteMessage(this, message)
            .pipe(map(deletedMessage => this.removeMessage(deletedMessage)));
    }
    /**
     * @param {?} room
     * @return {?}
     */
    replaceUsersWith(room) {
        this.users.splice(0, this.users.length);
        Array.prototype.push.apply(this.users, room.users);
        return this;
    }
    /**
     * @param {?} user
     * @return {?}
     */
    addUser(user) {
        if (!this.hasUser(user.id)) {
            this.users.push(user);
        }
    }
}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbInJvb20vcm9vbS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsdUJBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQztBQUM1QixPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUkxQyxNQUFNOzs7Ozs7Ozs7Ozs7O0lBbUNKLFlBQXFCLEVBQVUsRUFDbkIsSUFBWSxFQUNaLGNBQW9CLEVBQ3BCLElBQWEsRUFDYixrQkFBMEIsRUFDakIsS0FBYSxFQUNiLE9BQWUsRUFDZixRQUFtQixFQUNuQixTQUFlLEVBQ2hCO1FBVEMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUtWLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUNuQixjQUFTLEdBQVQsU0FBUyxDQUFNO1FBQ2hCLG1CQUFjLEdBQWQsY0FBYztRQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJ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QWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3RTs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFVO1FBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDO0tBQ2I7Ozs7O0lBRUQsT0FBTyxDQUFDLElBQVU7UUFDaEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7S0FDRjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEFycmF5VXRpbHMgfSBmcm9tIFwiLi4vYXJyYXkudXRpbHNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9yb29tLnJlcG9zaXRvcnlcIjtcblxuZXhwb3J0IGNsYXNzIFJvb20ge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGpzb24uYXR0cmlidXRlcztcbiAgICBjb25zdCB1c2VycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBzZW5kZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBtZXNzYWdlcyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMgPyBNZXNzYWdlLm1hcChqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBpbml0aWF0b3IgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvciA/IFVzZXIuYnVpbGQoanNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvci5kYXRhKSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gbmV3IFJvb20oanNvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0ID8gbW9tZW50KGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQpLnV0YygpLnRvRGF0ZSgpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm9wZW4sXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudW5yZWFkTWVzc2FnZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICB1c2VycyxcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVycyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRvcixcbiAgICAgICAgICAgICAgICAgICAgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKHJvb20gPT4gUm9vbS5idWlsZChyb29tLCByb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBuZXdNZXNzYWdlTm90aWZpZXI6IChtZXNzYWdlOiBNZXNzYWdlKSA9PiBhbnk7XG4gIHByaXZhdGUgaW50ZXJuYWxPcGVuOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsTmFtZTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG4gIHByaXZhdGUgaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDogQmVoYXZpb3JTdWJqZWN0PERhdGU+O1xuICBwcml2YXRlIGludGVybmFsSW1hZ2VVcmw6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgbGFzdEFjdGl2aXR5QXQ6IERhdGUsXG4gICAgICAgICAgICAgIG9wZW46IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByZWFkb25seSB1c2VyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG1lc3NhZ2VzOiBNZXNzYWdlW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGluaXRpYXRvcjogVXNlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsT3BlbiA9IG5ldyBCZWhhdmlvclN1YmplY3Qob3Blbik7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0ID0gbmV3IEJlaGF2aW9yU3ViamVjdChsYXN0QWN0aXZpdHlBdCk7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG5hbWUpO1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVucmVhZE1lc3NhZ2VDb3VudCk7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bmRlZmluZWQpO1xuICB9XG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lLnZhbHVlO1xuICB9XG5cbiAgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUubmV4dChuYW1lKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTmFtZSgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lO1xuICB9XG5cbiAgZ2V0IG9wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuLnZhbHVlO1xuICB9XG5cbiAgc2V0IG9wZW4ob3BlbjogYm9vbGVhbikge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuLm5leHQob3Blbik7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU9wZW4oKTogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW47XG4gIH1cblxuICBnZXQgbGFzdEFjdGl2aXR5QXQoKTogRGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC52YWx1ZTtcbiAgfVxuXG4gIHNldCBsYXN0QWN0aXZpdHlBdChsYXN0QWN0aXZpdHlBdDogRGF0ZSkge1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC5uZXh0KGxhc3RBY3Rpdml0eUF0KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTGFzdEFjdGl2aXR5QXQoKTogQmVoYXZpb3JTdWJqZWN0PERhdGU+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0O1xuICB9XG5cbiAgZ2V0IGltYWdlVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybC52YWx1ZTtcbiAgfVxuXG4gIHNldCBpbWFnZVVybChpbWFnZVVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsLm5leHQoaW1hZ2VVcmwpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVJbWFnZVVybCgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybDtcbiAgfVxuXG5cbiAgb3Blbk1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCB0cnVlKTtcbiAgfVxuXG4gIGNsb3NlTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIGZhbHNlKTtcbiAgfVxuXG4gIG1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5Lm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHRoaXMpO1xuICB9XG5cbiAgYWRkTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgIHRoaXMubGFzdEFjdGl2aXR5QXQgPSBtZXNzYWdlLmNyZWF0ZWRBdDtcbiAgfVxuXG4gIG5vdGlmeU5ld01lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGlmICh0aGlzLm5ld01lc3NhZ2VOb3RpZmllcikge1xuICAgICAgdGhpcy5uZXdNZXNzYWdlTm90aWZpZXIuYXBwbHkobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cblxuICBoYXNVc2VyKHVzZXJJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLnVzZXJzLm1hcCh1c2VyID0+IHVzZXIuaWQpLCBpZCA9PiBpZCA9PT0gdXNlcklkKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZmV0Y2hNb3JlTWVzc2FnZSgpOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGZpcnN0U2Vlbk1lc3NhZ2VJZDogdGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwID8gdGhpcy5tZXNzYWdlc1swXS5pZCA6IHVuZGVmaW5lZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5maW5kTWVzc2FnZXModGhpcywgcGFyYW1zKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICBtYXAobWVzc2FnZXMgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQuYXBwbHkodGhpcy5tZXNzYWdlcywgbWVzc2FnZXMpO1xuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBmaW5kTWVzc2FnZVdpdGhJZChpZDogc3RyaW5nKTogTWVzc2FnZSB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLm1lc3NhZ2VzLCBtZXNzYWdlID0+IG1lc3NhZ2UuaWQgPT09IGlkKTtcbiAgfVxuXG4gIHVwZGF0ZSgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGUodGhpcyk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShuZXdNZXNzYWdlOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5jcmVhdGVNZXNzYWdlKHRoaXMsIG5ld01lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgbWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICk7XG4gIH1cblxuICByZW1vdmVNZXNzYWdlKG1lc3NhZ2VUb0RlbGV0ZTogTWVzc2FnZSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5tZXNzYWdlcywgbWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBtZXNzYWdlVG9EZWxldGUuaWQpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlVG9EZWxldGU7XG4gIH1cblxuICBkZWxldGUobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZGVsZXRlTWVzc2FnZSh0aGlzLCBtZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKGRlbGV0ZWRNZXNzYWdlID0+IHRoaXMucmVtb3ZlTWVzc2FnZShkZWxldGVkTWVzc2FnZSkpKTtcbiAgfVxuXG4gIHJlcGxhY2VVc2Vyc1dpdGgocm9vbTogUm9vbSk6IFJvb20ge1xuICAgIHRoaXMudXNlcnMuc3BsaWNlKDAsIHRoaXMudXNlcnMubGVuZ3RoKTtcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLnVzZXJzLCByb29tLnVzZXJzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZFVzZXIodXNlcjogVXNlcikge1xuICAgIGlmICghdGhpcy5oYXNVc2VyKHVzZXIuaWQpKSB7XG4gICAgICB0aGlzLnVzZXJzLnB1c2godXNlcik7XG4gICAgfVxuICB9XG59XG4iXX0=