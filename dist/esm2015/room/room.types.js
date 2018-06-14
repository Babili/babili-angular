/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as momentLoaded from "moment";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { Message } from "../message/message.types";
import { User } from "../user/user.types";
const /** @type {?} */ moment = momentLoaded;
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
        return this.users && this.users.some(user => user.id === userId);
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
        return this.messages ? this.messages.find(message => message.id === id) : undefined;
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
        const /** @type {?} */ index = this.messages ? this.messages.findIndex(message => message.id === messageToDelete.id) : -1;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbInJvb20vcm9vbS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUNuRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDckMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUcxQyx1QkFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBRTVCLE1BQU07Ozs7Ozs7Ozs7Ozs7SUFtQ0osWUFBcUIsRUFBVSxFQUNuQixJQUFZLEVBQ1osY0FBb0IsRUFDcEIsSUFBYSxFQUNiLGtCQUEwQixFQUNqQixLQUFhLEVBQ2IsT0FBZSxFQUNmLFFBQW1CLEVBQ25CLFNBQWUsRUFDaEI7UUFUQyxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBS1YsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQU07UUFDaEIsbUJBQWMsR0FBZCxjQUFjO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksZUFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFD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Q0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3RTs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFVO1FBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDO0tBQ2I7Ozs7O0lBRUQsT0FBTyxDQUFDLElBQVU7UUFDaEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7S0FDRjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9yb29tLnJlcG9zaXRvcnlcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuZXhwb3J0IGNsYXNzIFJvb20ge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGpzb24uYXR0cmlidXRlcztcbiAgICBjb25zdCB1c2VycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBzZW5kZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBtZXNzYWdlcyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMgPyBNZXNzYWdlLm1hcChqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBpbml0aWF0b3IgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvciA/IFVzZXIuYnVpbGQoanNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvci5kYXRhKSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gbmV3IFJvb20oanNvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0ID8gbW9tZW50KGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQpLnV0YygpLnRvRGF0ZSgpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm9wZW4sXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudW5yZWFkTWVzc2FnZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICB1c2VycyxcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVycyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRvcixcbiAgICAgICAgICAgICAgICAgICAgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKHJvb20gPT4gUm9vbS5idWlsZChyb29tLCByb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBuZXdNZXNzYWdlTm90aWZpZXI6IChtZXNzYWdlOiBNZXNzYWdlKSA9PiBhbnk7XG4gIHByaXZhdGUgaW50ZXJuYWxPcGVuOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsTmFtZTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG4gIHByaXZhdGUgaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDogQmVoYXZpb3JTdWJqZWN0PERhdGU+O1xuICBwcml2YXRlIGludGVybmFsSW1hZ2VVcmw6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgbGFzdEFjdGl2aXR5QXQ6IERhdGUsXG4gICAgICAgICAgICAgIG9wZW46IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByZWFkb25seSB1c2VyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG1lc3NhZ2VzOiBNZXNzYWdlW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGluaXRpYXRvcjogVXNlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsT3BlbiA9IG5ldyBCZWhhdmlvclN1YmplY3Qob3Blbik7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0ID0gbmV3IEJlaGF2aW9yU3ViamVjdChsYXN0QWN0aXZpdHlBdCk7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG5hbWUpO1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVucmVhZE1lc3NhZ2VDb3VudCk7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bmRlZmluZWQpO1xuICB9XG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lLnZhbHVlO1xuICB9XG5cbiAgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUubmV4dChuYW1lKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTmFtZSgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lO1xuICB9XG5cbiAgZ2V0IG9wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuLnZhbHVlO1xuICB9XG5cbiAgc2V0IG9wZW4ob3BlbjogYm9vbGVhbikge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuLm5leHQob3Blbik7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU9wZW4oKTogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW47XG4gIH1cblxuICBnZXQgbGFzdEFjdGl2aXR5QXQoKTogRGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC52YWx1ZTtcbiAgfVxuXG4gIHNldCBsYXN0QWN0aXZpdHlBdChsYXN0QWN0aXZpdHlBdDogRGF0ZSkge1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC5uZXh0KGxhc3RBY3Rpdml0eUF0KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTGFzdEFjdGl2aXR5QXQoKTogQmVoYXZpb3JTdWJqZWN0PERhdGU+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0O1xuICB9XG5cbiAgZ2V0IGltYWdlVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybC52YWx1ZTtcbiAgfVxuXG4gIHNldCBpbWFnZVVybChpbWFnZVVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsLm5leHQoaW1hZ2VVcmwpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVJbWFnZVVybCgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybDtcbiAgfVxuXG5cbiAgb3Blbk1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCB0cnVlKTtcbiAgfVxuXG4gIGNsb3NlTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIGZhbHNlKTtcbiAgfVxuXG4gIG1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5Lm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHRoaXMpO1xuICB9XG5cbiAgYWRkTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgIHRoaXMubGFzdEFjdGl2aXR5QXQgPSBtZXNzYWdlLmNyZWF0ZWRBdDtcbiAgfVxuXG4gIG5vdGlmeU5ld01lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGlmICh0aGlzLm5ld01lc3NhZ2VOb3RpZmllcikge1xuICAgICAgdGhpcy5uZXdNZXNzYWdlTm90aWZpZXIuYXBwbHkobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cblxuICBoYXNVc2VyKHVzZXJJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudXNlcnMgJiYgdGhpcy51c2Vycy5zb21lKHVzZXIgPT4gdXNlci5pZCAgPT09IHVzZXJJZCk7XG4gIH1cblxuICBmZXRjaE1vcmVNZXNzYWdlKCk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgZmlyc3RTZWVuTWVzc2FnZUlkOiB0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDAgPyB0aGlzLm1lc3NhZ2VzWzBdLmlkIDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmZpbmRNZXNzYWdlcyh0aGlzLCBwYXJhbXMpXG4gICAgICAgICAgICAgICAucGlwZShcbiAgICAgIG1hcChtZXNzYWdlcyA9PiB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMudW5zaGlmdC5hcHBseSh0aGlzLm1lc3NhZ2VzLCBtZXNzYWdlcyk7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGZpbmRNZXNzYWdlV2l0aElkKGlkOiBzdHJpbmcpOiBNZXNzYWdlIHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlcyA/IHRoaXMubWVzc2FnZXMuZmluZChtZXNzYWdlID0+IG1lc3NhZ2UuaWQgPT09IGlkKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHVwZGF0ZSgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGUodGhpcyk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShuZXdNZXNzYWdlOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5jcmVhdGVNZXNzYWdlKHRoaXMsIG5ld01lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgbWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICk7XG4gIH1cblxuICByZW1vdmVNZXNzYWdlKG1lc3NhZ2VUb0RlbGV0ZTogTWVzc2FnZSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5tZXNzYWdlcyA/IHRoaXMubWVzc2FnZXMuZmluZEluZGV4KG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gbWVzc2FnZVRvRGVsZXRlLmlkKSA6IC0xO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlVG9EZWxldGU7XG4gIH1cblxuICBkZWxldGUobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZGVsZXRlTWVzc2FnZSh0aGlzLCBtZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKGRlbGV0ZWRNZXNzYWdlID0+IHRoaXMucmVtb3ZlTWVzc2FnZShkZWxldGVkTWVzc2FnZSkpKTtcbiAgfVxuXG4gIHJlcGxhY2VVc2Vyc1dpdGgocm9vbTogUm9vbSk6IFJvb20ge1xuICAgIHRoaXMudXNlcnMuc3BsaWNlKDAsIHRoaXMudXNlcnMubGVuZ3RoKTtcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLnVzZXJzLCByb29tLnVzZXJzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZFVzZXIodXNlcjogVXNlcikge1xuICAgIGlmICghdGhpcy5oYXNVc2VyKHVzZXIuaWQpKSB7XG4gICAgICB0aGlzLnVzZXJzLnB1c2godXNlcik7XG4gICAgfVxuICB9XG59XG4iXX0=