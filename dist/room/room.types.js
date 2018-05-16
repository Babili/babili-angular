"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const array_utils_1 = require("../array.utils");
const message_types_1 = require("../message/message.types");
const user_types_1 = require("../user/user.types");
class Room {
    constructor(id, name, lastActivityAt, open, unreadMessageCount, users, senders, messages, initiator, roomRepository) {
        this.id = id;
        this.users = users;
        this.senders = senders;
        this.messages = messages;
        this.initiator = initiator;
        this.roomRepository = roomRepository;
        this.internalOpen = new rxjs_1.BehaviorSubject(open);
        this.internalLastActivityAt = new rxjs_1.BehaviorSubject(lastActivityAt);
        this.internalName = new rxjs_1.BehaviorSubject(name);
        this.internalUnreadMessageCount = new rxjs_1.BehaviorSubject(unreadMessageCount);
        this.internalImageUrl = new rxjs_1.BehaviorSubject(undefined);
    }
    static build(json, roomRepository, messageRepository) {
        const attributes = json.attributes;
        const users = json.relationships && json.relationships.users ? user_types_1.User.map(json.relationships.users.data) : [];
        const senders = json.relationships && json.relationships.senders ? user_types_1.User.map(json.relationships.senders.data) : [];
        const messages = json.relationships && json.relationships.messages ? message_types_1.Message.map(json.relationships.messages.data) : [];
        const initiator = json.relationships && json.relationships.initiator ? user_types_1.User.build(json.relationships.initiator.data) : undefined;
        return new Room(json.id, attributes.name, attributes.lastActivityAt ? moment.utc(attributes.lastActivityAt) : undefined, attributes.open, attributes.unreadMessageCount, users, senders, messages, initiator, roomRepository);
    }
    static map(json, roomRepository, messageRepository) {
        if (json) {
            return json.map(room => Room.build(room, roomRepository, messageRepository));
        }
        else {
            return undefined;
        }
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
    get name() {
        return this.internalName.value;
    }
    set name(name) {
        this.internalName.next(name);
    }
    get observableName() {
        return this.internalName;
    }
    get open() {
        return this.internalOpen.value;
    }
    set open(open) {
        this.internalOpen.next(open);
    }
    get observableOpen() {
        return this.internalOpen;
    }
    get lastActivityAt() {
        return this.internalLastActivityAt.value;
    }
    set lastActivityAt(lastActivityAt) {
        this.internalLastActivityAt.next(lastActivityAt);
    }
    get observableLastActivityAt() {
        return this.internalLastActivityAt;
    }
    get imageUrl() {
        return this.internalImageUrl.value;
    }
    set imageUrl(imageUrl) {
        this.internalImageUrl.next(imageUrl);
    }
    get observableImageUrl() {
        return this.internalImageUrl;
    }
    openMembership() {
        return this.roomRepository.updateMembership(this, true);
    }
    closeMembership() {
        return this.roomRepository.updateMembership(this, false);
    }
    markAllMessagesAsRead() {
        return this.roomRepository.markAllReceivedMessagesAsRead(this);
    }
    addMessage(message) {
        this.messages.push(message);
        this.lastActivityAt = message.createdAt;
    }
    notifyNewMessage(message) {
        if (this.newMessageNotifier) {
            this.newMessageNotifier.apply(message);
        }
    }
    hasUser(userId) {
        return array_utils_1.ArrayUtils.find(this.users.map(user => user.id), id => id === userId) !== undefined;
    }
    fetchMoreMessage() {
        const params = {
            firstSeenMessageId: this.messages.length > 0 ? this.messages[0].id : undefined
        };
        return this.roomRepository
            .findMessages(this, params)
            .pipe(operators_1.map(messages => {
            this.messages.unshift.apply(this.messages, messages);
            return messages;
        }));
    }
    findMessageWithId(id) {
        return array_utils_1.ArrayUtils.find(this.messages, message => message.id === id);
    }
    update() {
        return this.roomRepository.update(this);
    }
    sendMessage(newMessage) {
        return this.roomRepository
            .createMessage(this, newMessage)
            .pipe(operators_1.map(message => {
            this.addMessage(message);
            return message;
        }));
    }
    removeMessage(messageToDelete) {
        const index = array_utils_1.ArrayUtils.findIndex(this.messages, message => message.id === messageToDelete.id);
        if (index > -1) {
            this.messages.splice(index, 1);
        }
        return messageToDelete;
    }
    delete(message) {
        return this.roomRepository
            .deleteMessage(this, message)
            .pipe(operators_1.map(deletedMessage => this.removeMessage(deletedMessage)));
    }
    replaceUsersWith(room) {
        this.users.splice(0, this.users.length);
        Array.prototype.push.apply(this.users, room.users);
        return this;
    }
    addUser(user) {
        if (!this.hasUser(user.id)) {
            this.users.push(user);
        }
    }
}
exports.Room = Room;
