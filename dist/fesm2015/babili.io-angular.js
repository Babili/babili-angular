import { Injectable, InjectionToken, Inject, Pipe, NgModule } from '@angular/core';
import { HttpErrorResponse, HttpClient, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { throwError, BehaviorSubject, of, empty, timer } from 'rxjs';
import { catchError, map, flatMap, publishReplay, refCount, share, takeWhile } from 'rxjs/operators';
import * as momentLoaded from 'moment';
import { connect } from 'socket.io-client';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class TokenConfiguration {
    constructor() { }
    /**
     * @return {?}
     */
    isApiTokenSet() {
        return this.apiToken !== undefined && this.apiToken !== null && this.apiToken !== "";
    }
    /**
     * @return {?}
     */
    clear() {
        this.apiToken = undefined;
    }
}
TokenConfiguration.decorators = [
    { type: Injectable },
];
/** @nocollapse */
TokenConfiguration.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ URL_CONFIGURATION = new InjectionToken("BabiliUrlConfiguration");

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class NotAuthorizedError {
    /**
     * @param {?} error
     */
    constructor(error) {
        this.error = error;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class HttpAuthenticationInterceptor {
    /**
     * @param {?} urls
     * @param {?} tokenConfiguration
     */
    constructor(urls, tokenConfiguration) {
        this.urls = urls;
        this.tokenConfiguration = tokenConfiguration;
    }
    /**
     * @param {?} request
     * @param {?} next
     * @return {?}
     */
    intercept(request, next) {
        if (this.shouldAddHeaderTo(request)) {
            return next.handle(this.addHeaderTo(request, this.tokenConfiguration.apiToken))
                .pipe(catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return throwError(new NotAuthorizedError(error));
                }
                else {
                    return throwError(error);
                }
            }));
        }
        else {
            return next.handle(request);
        }
    }
    /**
     * @param {?} request
     * @param {?} token
     * @return {?}
     */
    addHeaderTo(request, token) {
        return request.clone({
            headers: request.headers.set("Authorization", `Bearer ${token}`)
        });
    }
    /**
     * @param {?} request
     * @return {?}
     */
    shouldAddHeaderTo(request) {
        return request.url.startsWith(this.urls.apiUrl);
    }
}
HttpAuthenticationInterceptor.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpAuthenticationInterceptor.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] },
    { type: TokenConfiguration }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class User {
    /**
     * @param {?} id
     * @param {?} status
     */
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static build(json) {
        if (json) {
            return new User(json.id, json.attributes ? json.attributes.status : undefined);
        }
        else {
            return undefined;
        }
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static map(json) {
        if (json) {
            return json.map(User.build);
        }
        else {
            return undefined;
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ moment = momentLoaded;
class Message {
    /**
     * @param {?} id
     * @param {?} content
     * @param {?} contentType
     * @param {?} createdAt
     * @param {?} sender
     * @param {?} roomId
     */
    constructor(id, content, contentType, createdAt, sender, roomId) {
        this.id = id;
        this.content = content;
        this.contentType = contentType;
        this.createdAt = createdAt;
        this.sender = sender;
        this.roomId = roomId;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static build(json) {
        const /** @type {?} */ attributes = json.attributes;
        return new Message(json.id, attributes.content, attributes.contentType, moment(attributes.createdAt).toDate(), json.relationships.sender ? User.build(json.relationships.sender.data) : undefined, json.relationships.room.data.id);
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static map(json) {
        if (json) {
            return json.map(Message.build);
        }
        else {
            return undefined;
        }
    }
    /**
     * @param {?} userId
     * @return {?}
     */
    hasSenderId(userId) {
        return this.sender && this.sender.id === userId;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class MessageRepository {
    /**
     * @param {?} http
     * @param {?} configuration
     */
    constructor(http, configuration) {
        this.http = http;
        this.roomUrl = `${configuration.apiUrl}/user/rooms`;
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    create(room, attributes) {
        return this.http.post(this.messageUrl(room.id), {
            data: {
                type: "message",
                attributes: attributes
            }
        }).pipe(map((response) => Message.build(response.data)));
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    findAll(room, attributes) {
        return this.http.get(this.messageUrl(room.id), { params: attributes })
            .pipe(map((response) => Message.map(response.data)));
    }
    /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    delete(room, message) {
        return this.http.delete(`${this.messageUrl(room.id)}/${message.id}`)
            .pipe(map(response => message));
    }
    /**
     * @param {?} roomId
     * @return {?}
     */
    messageUrl(roomId) {
        return `${this.roomUrl}/${roomId}/messages`;
    }
}
MessageRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MessageRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ moment$1 = momentLoaded;
class Room {
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
        return new Room(json.id, attributes.name, attributes.lastActivityAt ? moment$1(attributes.lastActivityAt).utc().toDate() : undefined, attributes.open, attributes.unreadMessageCount, users, senders, messages, initiator, roomRepository);
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class RoomRepository {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ moment$2 = momentLoaded;
class Me {
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
            if (!this.firstSeenRoom || moment$2(this.firstSeenRoom.lastActivityAt).isAfter(newRoom.lastActivityAt)) {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class MeRepository {
    /**
     * @param {?} http
     * @param {?} roomRepository
     * @param {?} configuration
     */
    constructor(http, roomRepository, configuration) {
        this.http = http;
        this.roomRepository = roomRepository;
        this.userUrl = `${configuration.apiUrl}/user`;
        this.aliveUrl = `${this.userUrl}/alive`;
    }
    /**
     * @return {?}
     */
    findMe() {
        return this.http.get(this.userUrl).pipe(map(me => Me.build(me, this.roomRepository)));
    }
    /**
     * @param {?} me
     * @return {?}
     */
    updateAliveness(me) {
        return this.http.put(this.aliveUrl, { data: { type: "alive" } })
            .pipe(catchError(() => empty()), map(() => null));
    }
}
MeRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MeRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: RoomRepository },
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class BootstrapSocket {
    /**
     * @param {?} configuration
     */
    constructor(configuration) {
        this.configuration = configuration;
    }
    /**
     * @param {?} token
     * @return {?}
     */
    connect(token) {
        this.socket = connect(this.configuration.socketUrl, {
            forceNew: true,
            query: `token=${token}`
        });
        return this.socket;
    }
    /**
     * @return {?}
     */
    socketExists() {
        return this.socket !== undefined;
    }
    /**
     * @return {?}
     */
    disconnect() {
        if (this.socketExists()) {
            this.socket.close();
            this.socket = undefined;
        }
    }
}
BootstrapSocket.decorators = [
    { type: Injectable },
];
/** @nocollapse */
BootstrapSocket.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class MeService {
    /**
     * @param {?} meRepository
     * @param {?} socketClient
     * @param {?} configuration
     * @param {?} tokenConfiguration
     */
    constructor(meRepository, socketClient, configuration, tokenConfiguration) {
        this.meRepository = meRepository;
        this.socketClient = socketClient;
        this.configuration = configuration;
        this.tokenConfiguration = tokenConfiguration;
        this.alive = false;
    }
    /**
     * @param {?} token
     * @return {?}
     */
    setup(token) {
        if (!this.tokenConfiguration.isApiTokenSet()) {
            this.tokenConfiguration.apiToken = token;
        }
    }
    /**
     * @return {?}
     */
    me() {
        if (!this.hasCachedMe()) {
            this.cachedMe = this.meRepository
                .findMe()
                .pipe(map(me => this.scheduleAliveness(me)), publishReplay(1), refCount(), share());
        }
        return this.cachedMe.pipe(map(me => this.connectSocket(me)));
    }
    /**
     * @return {?}
     */
    clear() {
        this.tokenConfiguration.clear();
        this.cachedMe = undefined;
        this.alive = false;
    }
    /**
     * @param {?} me
     * @return {?}
     */
    scheduleAliveness(me) {
        this.alive = true;
        timer(0, this.configuration.aliveIntervalInMs).pipe(takeWhile(() => this.alive))
            .subscribe(() => this.meRepository.updateAliveness(me));
        return me;
    }
    /**
     * @return {?}
     */
    hasCachedMe() {
        return this.cachedMe !== undefined;
    }
    /**
     * @param {?} me
     * @return {?}
     */
    connectSocket(me) {
        if (!this.socketClient.socketExists()) {
            const /** @type {?} */ socket = this.socketClient.connect(this.tokenConfiguration.apiToken);
            socket.on("new message", data => this.receiveNewMessage(data));
            socket.on("connected", data => me.deviceSessionId = data.deviceSessionId);
        }
        return me;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    receiveNewMessage(json) {
        const /** @type {?} */ message = Message.build(json.data);
        this.me().subscribe(me => me.handleNewMessage(message));
    }
}
MeService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MeService.ctorParameters = () => [
    { type: MeRepository },
    { type: BootstrapSocket },
    { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] },
    { type: TokenConfiguration }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ moment$3 = momentLoaded;
class SortRoomPipe {
    /**
     * @param {?} rooms
     * @param {?} field
     * @return {?}
     */
    transform(rooms, field) {
        if (rooms !== undefined && rooms !== null) {
            return rooms.sort((room, otherRoom) => {
                const /** @type {?} */ lastActivityAt = room.lastActivityAt;
                const /** @type {?} */ otherLastActivityAt = otherRoom.lastActivityAt;
                if (moment$3(lastActivityAt).isBefore(otherLastActivityAt)) {
                    return 1;
                }
                else if (moment$3(otherLastActivityAt).isBefore(lastActivityAt)) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
        }
        else {
            return rooms;
        }
    }
}
SortRoomPipe.decorators = [
    { type: Pipe, args: [{
                name: "sortRooms"
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class BabiliModule {
    /**
     * @param {?} urlConfiguration
     * @return {?}
     */
    static forRoot(urlConfiguration) {
        return {
            ngModule: BabiliModule,
            providers: [
                {
                    provide: URL_CONFIGURATION,
                    useValue: urlConfiguration
                },
                SortRoomPipe,
                TokenConfiguration,
                BootstrapSocket,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpAuthenticationInterceptor,
                    multi: true
                },
                MessageRepository,
                RoomRepository,
                MeRepository,
                MeService
            ]
        };
    }
}
BabiliModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    HttpClientModule
                ],
                declarations: [
                    SortRoomPipe
                ],
                exports: [
                    SortRoomPipe
                ]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { BabiliModule, SortRoomPipe, User, Message, Me, MeService, HttpAuthenticationInterceptor, NotAuthorizedError, Room, URL_CONFIGURATION, TokenConfiguration, MeRepository, MessageRepository, RoomRepository, BootstrapSocket };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vbm90LWF1dGhvcml6ZWQtZXJyb3IudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvdXNlci91c2VyLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20ucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3NvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUuc2VydmljZS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3BpcGUvc29ydC1yb29tLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYmFiaWxpLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRva2VuQ29uZmlndXJhdGlvbiB7XG4gIHB1YmxpYyBhcGlUb2tlbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBpc0FwaVRva2VuU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFwaVRva2VuICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hcGlUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmFwaVRva2VuICE9PSBcIlwiO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5hcGlUb2tlbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmV4cG9ydCBjb25zdCBVUkxfQ09ORklHVVJBVElPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxCYWJpbGlVcmxDb25maWd1cmF0aW9uPihcIkJhYmlsaVVybENvbmZpZ3VyYXRpb25cIik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiB7XG4gIGFwaVVybDogc3RyaW5nO1xuICBzb2NrZXRVcmw6IHN0cmluZztcbiAgYWxpdmVJbnRlcnZhbEluTXM/OiBudW1iZXI7XG59XG4iLCJleHBvcnQgY2xhc3MgTm90QXV0aG9yaXplZEVycm9yIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgZXJyb3I6IGFueSkge31cbn1cbiIsImltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBIYW5kbGVyLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBSZXF1ZXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGhyb3dFcnJvciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yIH0gZnJvbSBcIi4vbm90LWF1dGhvcml6ZWQtZXJyb3JcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIHVybHM6IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgaW50ZXJjZXB0KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLnNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUodGhpcy5hZGRIZWFkZXJUbyhyZXF1ZXN0LCB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbikpXG4gICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGVycm9yLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgTm90QXV0aG9yaXplZEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgdG9rZW46IHN0cmluZyk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIHJldHVybiByZXF1ZXN0LmNsb25lKHtcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycy5zZXQoXCJBdXRob3JpemF0aW9uXCIsIGBCZWFyZXIgJHt0b2tlbn1gKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJlcXVlc3QudXJsLnN0YXJ0c1dpdGgodGhpcy51cmxzLmFwaVVybCk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBVc2VyIHtcbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IFVzZXIge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4gbmV3IFVzZXIoanNvbi5pZCwganNvbi5hdHRyaWJ1dGVzID8ganNvbi5hdHRyaWJ1dGVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBVc2VyW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoVXNlci5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc3RhdHVzOiBzdHJpbmcpIHt9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgcmV0dXJuIG5ldyBNZXNzYWdlKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50KGF0dHJpYnV0ZXMuY3JlYXRlZEF0KS50b0RhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIuZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMucm9vbS5kYXRhLmlkKTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogTWVzc2FnZVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKE1lc3NhZ2UuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY3JlYXRlZEF0OiBEYXRlLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXI6IFVzZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21JZDogc3RyaW5nKSB7fVxuXG4gIGhhc1NlbmRlcklkKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZGVyICYmIHRoaXMuc2VuZGVyLmlkID09PSB1c2VySWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBOZXdNZXNzYWdlIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZW50VHlwZTogc3RyaW5nO1xuICBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VSZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHJvb21Vcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnJvb21VcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cblxuICBjcmVhdGUocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5idWlsZChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZmluZEFsbChyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwgeyBwYXJhbXM6IGF0dHJpYnV0ZXMgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLm1hcChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZGVsZXRlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCl9LyR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocmVzcG9uc2UgPT4gbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBtZXNzYWdlVXJsKHJvb21JZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucm9vbVVybH0vJHtyb29tSWR9L21lc3NhZ2VzYDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20ucmVwb3NpdG9yeVwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5leHBvcnQgY2xhc3MgUm9vbSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIGNvbnN0IHVzZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy51c2VycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy51c2Vycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IHNlbmRlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcyA/IE1lc3NhZ2UubWFwKGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yLmRhdGEpIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBuZXcgUm9vbShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQgPyBtb21lbnQoYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCkudXRjKCkudG9EYXRlKCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy51bnJlYWRNZXNzYWdlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJzLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXJzLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdG9yLFxuICAgICAgICAgICAgICAgICAgICByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAocm9vbSA9PiBSb29tLmJ1aWxkKHJvb20sIHJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIG5ld01lc3NhZ2VOb3RpZmllcjogKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGFueTtcbiAgcHJpdmF0ZSBpbnRlcm5hbE9wZW46IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxOYW1lOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbExhc3RBY3Rpdml0eUF0OiBCZWhhdmlvclN1YmplY3Q8RGF0ZT47XG4gIHByaXZhdGUgaW50ZXJuYWxJbWFnZVVybDogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBsYXN0QWN0aXZpdHlBdDogRGF0ZSxcbiAgICAgICAgICAgICAgb3BlbjogYm9vbGVhbixcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHVzZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgbWVzc2FnZXM6IE1lc3NhZ2VbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgaW5pdGlhdG9yOiBVc2VyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuID0gbmV3IEJlaGF2aW9yU3ViamVjdChvcGVuKTtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGxhc3RBY3Rpdml0eUF0KTtcbiAgICB0aGlzLmludGVybmFsTmFtZSA9IG5ldyBCZWhhdmlvclN1YmplY3QobmFtZSk7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50KTtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWUudmFsdWU7XG4gIH1cblxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsTmFtZS5uZXh0KG5hbWUpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVOYW1lKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWU7XG4gIH1cblxuICBnZXQgb3BlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW4udmFsdWU7XG4gIH1cblxuICBzZXQgb3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4ubmV4dChvcGVuKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlT3BlbigpOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3BlbjtcbiAgfVxuXG4gIGdldCBsYXN0QWN0aXZpdHlBdCgpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0LnZhbHVlO1xuICB9XG5cbiAgc2V0IGxhc3RBY3Rpdml0eUF0KGxhc3RBY3Rpdml0eUF0OiBEYXRlKSB7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0Lm5leHQobGFzdEFjdGl2aXR5QXQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVMYXN0QWN0aXZpdHlBdCgpOiBCZWhhdmlvclN1YmplY3Q8RGF0ZT4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQ7XG4gIH1cblxuICBnZXQgaW1hZ2VVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsLnZhbHVlO1xuICB9XG5cbiAgc2V0IGltYWdlVXJsKGltYWdlVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwubmV4dChpbWFnZVVybCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUltYWdlVXJsKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsO1xuICB9XG5cblxuICBvcGVuTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIHRydWUpO1xuICB9XG5cbiAgY2xvc2VNZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgZmFsc2UpO1xuICB9XG5cbiAgbWFya0FsbE1lc3NhZ2VzQXNSZWFkKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkubWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQodGhpcyk7XG4gIH1cblxuICBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHlBdCA9IG1lc3NhZ2UuY3JlYXRlZEF0O1xuICB9XG5cbiAgbm90aWZ5TmV3TWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyKSB7XG4gICAgICB0aGlzLm5ld01lc3NhZ2VOb3RpZmllci5hcHBseShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuXG4gIGhhc1VzZXIodXNlcklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy51c2VycyAmJiB0aGlzLnVzZXJzLnNvbWUodXNlciA9PiB1c2VyLmlkICA9PT0gdXNlcklkKTtcbiAgfVxuXG4gIGZldGNoTW9yZU1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBmaXJzdFNlZW5NZXNzYWdlSWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCA/IHRoaXMubWVzc2FnZXNbMF0uaWQgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZmluZE1lc3NhZ2VzKHRoaXMsIHBhcmFtcylcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgbWFwKG1lc3NhZ2VzID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0LmFwcGx5KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2VzKTtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VXaXRoSWQoaWQ6IHN0cmluZyk6IE1lc3NhZ2Uge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kKG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgdXBkYXRlKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKG5ld01lc3NhZ2U6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmNyZWF0ZU1lc3NhZ2UodGhpcywgbmV3TWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICBtYXAobWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgKTtcbiAgfVxuXG4gIHJlbW92ZU1lc3NhZ2UobWVzc2FnZVRvRGVsZXRlOiBNZXNzYWdlKTogTWVzc2FnZSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kSW5kZXgobWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBtZXNzYWdlVG9EZWxldGUuaWQpIDogLTE7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VUb0RlbGV0ZTtcbiAgfVxuXG4gIGRlbGV0ZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5kZWxldGVNZXNzYWdlKHRoaXMsIG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShtYXAoZGVsZXRlZE1lc3NhZ2UgPT4gdGhpcy5yZW1vdmVNZXNzYWdlKGRlbGV0ZWRNZXNzYWdlKSkpO1xuICB9XG5cbiAgcmVwbGFjZVVzZXJzV2l0aChyb29tOiBSb29tKTogUm9vbSB7XG4gICAgdGhpcy51c2Vycy5zcGxpY2UoMCwgdGhpcy51c2Vycy5sZW5ndGgpO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMudXNlcnMsIHJvb20udXNlcnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkVXNlcih1c2VyOiBVc2VyKSB7XG4gICAgaWYgKCF0aGlzLmhhc1VzZXIodXNlci5pZCkpIHtcbiAgICAgIHRoaXMudXNlcnMucHVzaCh1c2VyKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuL3Jvb20udHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvb21SZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHJvb21Vcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5yb29tVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG5cbiAgZmluZChpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQoYCR7dGhpcy5yb29tVXJsfS8ke2lkfWApXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLmJ1aWxkKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocXVlcnk6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIH0pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMucm9vbVVybCwgeyBwYXJhbXM6IHF1ZXJ5IH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLm1hcChqc29uLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICBmaW5kT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seU9wZW5lZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seUNsb3NlZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kUm9vbXNBZnRlcihpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgZmlyc3RTZWVuUm9vbUlkOiBpZCB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0J5SWRzKHJvb21JZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IFwicm9vbUlkc1tdXCI6IHJvb21JZHMgfSk7XG4gIH1cblxuICB1cGRhdGVNZW1iZXJzaGlwKHJvb206IFJvb20sIG9wZW46IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcGAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBvcGVuOiBvcGVuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICByb29tLm9wZW4gPSBkYXRhLmRhdGEuYXR0cmlidXRlcy5vcGVuO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgaWYgKHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID4gMCkge1xuICAgICAgY29uc3QgbGFzdFJlYWRNZXNzYWdlSWQgPSByb29tLm1lc3NhZ2VzLmxlbmd0aCA+IDAgPyByb29tLm1lc3NhZ2VzW3Jvb20ubWVzc2FnZXMubGVuZ3RoIC0gMV0uaWQgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcC91bnJlYWQtbWVzc2FnZXNgLCB7IGRhdGE6IHsgbGFzdFJlYWRNZXNzYWdlSWQ6IGxhc3RSZWFkTWVzc2FnZUlkIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEubWV0YS5jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZigwKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGUobmFtZTogc3RyaW5nLCB1c2VySWRzOiBzdHJpbmdbXSwgd2l0aG91dER1cGxpY2F0ZTogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdChgJHt0aGlzLnJvb21Vcmx9P25vRHVwbGljYXRlPSR7d2l0aG91dER1cGxpY2F0ZX1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9LFxuICAgICAgICByZWxhdGlvbnNoaXBzOiB7XG4gICAgICAgICAgdXNlcnM6IHtcbiAgICAgICAgICAgIGRhdGE6IHVzZXJJZHMubWFwKHVzZXJJZCA9PiAoeyB0eXBlOiBcInVzZXJcIiwgaWQ6IHVzZXJJZCB9KSApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIG5vRHVwbGljYXRlOiBgJHt3aXRob3V0RHVwbGljYXRlfWBcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gUm9vbS5idWlsZChyZXNwb25zZS5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogcm9vbS5uYW1lXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgcm9vbS5uYW1lID0gcmVzcG9uc2UuZGF0YS5hdHRyaWJ1dGVzLm5hbWU7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBhZGRVc2VyKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwc2AsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwidXNlclwiLFxuICAgICAgICAgICAgICBpZDogdXNlcklkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IG5ld1VzZXIgPSBVc2VyLmJ1aWxkKHJlc3BvbnNlLmRhdGEucmVsYXRpb25zaGlwcy51c2VyLmRhdGEpO1xuICAgICAgcm9vbS5hZGRVc2VyKG5ld1VzZXIpO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZGVsZXRlKHJvb20sIG1lc3NhZ2UpO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VzKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZmluZEFsbChyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIGNyZWF0ZU1lc3NhZ2Uocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmNyZWF0ZShyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZmxhdE1hcCwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuZXhwb3J0IGNsYXNzIE1lIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpOiBNZSB7XG4gICAgY29uc3QgdW5yZWFkTWVzc2FnZUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEudW5yZWFkTWVzc2FnZUNvdW50IDogMDtcbiAgICBjb25zdCByb29tQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS5yb29tQ291bnQgOiAwO1xuICAgIHJldHVybiBuZXcgTWUoanNvbi5kYXRhLmlkLCBbXSwgW10sIHVucmVhZE1lc3NhZ2VDb3VudCwgcm9vbUNvdW50LCByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBwdWJsaWMgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsUm9vbUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBmaXJzdFNlZW5Sb29tOiBSb29tO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG9wZW5lZFJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByb29tQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQgfHwgMCk7XG4gICAgdGhpcy5pbnRlcm5hbFJvb21Db3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3Qocm9vbUNvdW50IHx8IDApO1xuICB9XG5cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IHJvb21Db3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50LnZhbHVlO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVSb29tQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50O1xuICB9XG5cbiAgZmV0Y2hPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRPcGVuZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kQ2xvc2VkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaE1vcmVSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIGlmICh0aGlzLmZpcnN0U2VlblJvb20pIHtcbiAgICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0FmdGVyKHRoaXMuZmlyc3RTZWVuUm9vbS5pZCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoW10pO1xuICAgIH1cbiAgfVxuXG4gIGZldGNoUm9vbXNCeUlkKHJvb21JZHM6IHN0cmluZ1tdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNCeUlkcyhyb29tSWRzKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZChyb29tSWQpLnBpcGUobWFwKHJvb20gPT4ge1xuICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZmluZE9yRmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChyb29tSWQpO1xuICAgIGlmIChyb29tSWQpIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hSb29tQnlJZChyb29tSWQpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU5ld01lc3NhZ2UobmV3TWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMuZmluZE9yRmV0Y2hSb29tQnlJZChuZXdNZXNzYWdlLnJvb21JZClcbiAgICAgICAgLnN1YnNjcmliZShyb29tID0+IHtcbiAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgcm9vbS5hZGRNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgcm9vbS5ub3RpZnlOZXdNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKCFuZXdNZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICBpZiAoIXJvb20ub3Blbikge1xuICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGFkZFJvb20obmV3Um9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tKG5ld1Jvb20pKSB7XG4gICAgICBpZiAoIXRoaXMuZmlyc3RTZWVuUm9vbSB8fCBtb21lbnQodGhpcy5maXJzdFNlZW5Sb29tLmxhc3RBY3Rpdml0eUF0KS5pc0FmdGVyKG5ld1Jvb20ubGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RTZWVuUm9vbSA9IG5ld1Jvb207XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMucm9vbXMgPyB0aGlzLnJvb21zLmZpbmRJbmRleChyb29tID0+IHJvb20uaWQgPT09IG5ld1Jvb20uaWQpIDogLTE7XG4gICAgICBpZiAocm9vbUluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5yb29tc1tyb29tSW5kZXhdID0gbmV3Um9vbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm9vbXMucHVzaChuZXdSb29tKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5yb29tcyA/IHRoaXMucm9vbXMuZmluZChyb29tID0+IHJvb21JZCA9PT0gcm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBvcGVuUm9vbShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLm9wZW5NZW1iZXJzaGlwKClcbiAgICAgICAgICAgICAgICAgLnBpcGUoZmxhdE1hcCgob3BlbmVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkVG9PcGVuZWRSb29tKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLmNsb3NlTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKG1hcChjbG9zZWRSb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb3NlZFJvb207XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb21zKHJvb21zVG9DbG9zZTogUm9vbVtdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gb2Yocm9vbXNUb0Nsb3NlKS5waXBlKFxuICAgICAgbWFwKHJvb21zID0+IHtcbiAgICAgICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHRoaXMuY2xvc2VSb29tKHJvb20pKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgb3BlblJvb21BbmRDbG9zZU90aGVycyhyb29tVG9PcGVuOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbXNUb0JlQ2xvc2VkID0gdGhpcy5vcGVuZWRSb29tcy5maWx0ZXIocm9vbSA9PiByb29tLmlkICE9PSByb29tVG9PcGVuLmlkKTtcbiAgICByZXR1cm4gdGhpcy5jbG9zZVJvb21zKHJvb21zVG9CZUNsb3NlZCkucGlwZShmbGF0TWFwKHJvb21zID0+IHRoaXMub3BlblJvb20ocm9vbVRvT3BlbikpKTtcbiAgfVxuXG4gIGhhc09wZW5lZFJvb21zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wZW5lZFJvb21zLmxlbmd0aCA+IDA7XG4gIH1cblxuICBjcmVhdGVSb29tKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5jcmVhdGUobmFtZSwgdXNlcklkcywgd2l0aG91dER1cGxpY2F0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIGJ1aWxkUm9vbSh1c2VySWRzOiBzdHJpbmdbXSk6IFJvb20ge1xuICAgIGNvbnN0IHVzZXJzID0gdXNlcklkcy5tYXAoaWQgPT4gbmV3IFVzZXIoaWQsIFwiXCIpKTtcbiAgICBjb25zdCBub1NlbmRlcnMgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2UgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2VVbnJlYWQgPSAwO1xuICAgIGNvbnN0IG5vSWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaW5pdGlhdG9yID0gdGhpcy50b1VzZXIoKTtcbiAgICByZXR1cm4gbmV3IFJvb20obm9JZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHRydWUsXG4gICAgICBub01lc3NhZ2VVbnJlYWQsXG4gICAgICB1c2VycyxcbiAgICAgIG5vU2VuZGVycyxcbiAgICAgIG5vTWVzc2FnZSxcbiAgICAgIGluaXRpYXRvcixcbiAgICAgIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKHJvb206IFJvb20sIGNvbnRlbnQ6IHN0cmluZywgY29udGVudFR5cGU6IHN0cmluZyk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiByb29tLnNlbmRNZXNzYWdlKHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBjb250ZW50VHlwZTogY29udGVudFR5cGUsXG4gICAgICBkZXZpY2VTZXNzaW9uSWQ6IHRoaXMuZGV2aWNlU2Vzc2lvbklkXG4gICAgfSk7XG4gIH1cblxuICBpc1NlbnRCeU1lKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbWVzc2FnZSAmJiBtZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChtZXNzYWdlLnJvb21JZCk7XG4gICAgICBpZiAocm9vbSkge1xuICAgICAgICByZXR1cm4gcm9vbS5kZWxldGUobWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgYWRkVXNlclRvKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuYWRkVXNlcihyb29tLCB1c2VySWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRSb29tcyhyb29tczogUm9vbVtdKSB7XG4gICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIGlmIChyb29tLm9wZW4gJiYgIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb20ocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb21PcGVuZWQocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tKHJvb206IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbUJ5SWQocm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZChyb29tID0+IHJvb21Ub0ZpbmQuaWQgPT09IHJvb20uaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb09wZW5lZFJvb20ocm9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tOiBSb29tKSB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChjbG9zZWRSb29tKSkge1xuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZEluZGV4KHJvb20gPT4gcm9vbS5pZCA9PT0gY2xvc2VkUm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnNwbGljZShyb29tSW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiByb29tLm1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpXG4gICAgICAgICAgICAgICAucGlwZShtYXAocmVhZE1lc3NhZ2VDb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IE1hdGgubWF4KHRoaXMudW5yZWFkTWVzc2FnZUNvdW50IC0gcmVhZE1lc3NhZ2VDb3VudCwgMCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIHRvVXNlcigpOiBVc2VyIHtcbiAgICByZXR1cm4gbmV3IFVzZXIodGhpcy5pZCwgXCJcIik7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVtcHR5IH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi8uLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVSZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHVzZXJVcmw6IHN0cmluZztcbiAgcHJpdmF0ZSBhbGl2ZVVybDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnVzZXJVcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlcmA7XG4gICAgdGhpcy5hbGl2ZVVybCA9IGAke3RoaXMudXNlclVybH0vYWxpdmVgO1xuICB9XG5cbiAgZmluZE1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLnVzZXJVcmwpLnBpcGUobWFwKG1lID0+IE1lLmJ1aWxkKG1lLCB0aGlzLnJvb21SZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlQWxpdmVuZXNzKG1lOiBNZSk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuYWxpdmVVcmwsIHsgZGF0YTogeyB0eXBlOiBcImFsaXZlXCIgfX0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoKCkgPT4gZW1wdHkoKSksIG1hcCgoKSA9PiBudWxsKSk7XG4gIH1cbn1cblxuIiwiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIGlvIGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcblxuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCb290c3RyYXBTb2NrZXQge1xuXG4gIHByaXZhdGUgc29ja2V0OiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKSB7fVxuXG4gIGNvbm5lY3QodG9rZW46IHN0cmluZyk6IFNvY2tldElPQ2xpZW50LlNvY2tldCB7XG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHRoaXMuY29uZmlndXJhdGlvbi5zb2NrZXRVcmwsIHtcbiAgICAgIGZvcmNlTmV3OiB0cnVlLFxuICAgICAgcXVlcnk6IGB0b2tlbj0ke3Rva2VufWBcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQ7XG4gIH1cblxuICBzb2NrZXRFeGlzdHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0ICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLnNvY2tldEV4aXN0cygpKSB7XG4gICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGltZXIgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwLCBwdWJsaXNoUmVwbGF5LCByZWZDb3VudCwgc2hhcmUsIHRha2VXaGlsZSB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuLy4uL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5pbXBvcnQgeyBNZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVNlcnZpY2Uge1xuXG4gIHByaXZhdGUgY2FjaGVkTWU6IE9ic2VydmFibGU8TWU+O1xuICBwcml2YXRlIGFsaXZlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVSZXBvc2l0b3J5OiBNZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgc29ja2V0Q2xpZW50OiBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgcHJpdmF0ZSB0b2tlbkNvbmZpZ3VyYXRpb246IFRva2VuQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHNldHVwKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudG9rZW5Db25maWd1cmF0aW9uLmlzQXBpVG9rZW5TZXQoKSkge1xuICAgICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4gPSB0b2tlbjtcbiAgICB9XG4gIH1cblxuICBtZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgaWYgKCF0aGlzLmhhc0NhY2hlZE1lKCkpIHtcbiAgICAgIHRoaXMuY2FjaGVkTWUgPSB0aGlzLm1lUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZE1lKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwKG1lID0+IHRoaXMuc2NoZWR1bGVBbGl2ZW5lc3MobWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoUmVwbGF5KDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZkNvdW50KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZS5waXBlKG1hcChtZSA9PiB0aGlzLmNvbm5lY3RTb2NrZXQobWUpKSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5jbGVhcigpO1xuICAgIHRoaXMuY2FjaGVkTWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZUFsaXZlbmVzcyhtZTogTWUpOiBNZSB7XG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG4gICAgdGltZXIoMCwgdGhpcy5jb25maWd1cmF0aW9uLmFsaXZlSW50ZXJ2YWxJbk1zKS5waXBlKFxuICAgICAgdGFrZVdoaWxlKCgpID0+IHRoaXMuYWxpdmUpXG4gICAgKVxuICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5tZVJlcG9zaXRvcnkudXBkYXRlQWxpdmVuZXNzKG1lKSk7XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNDYWNoZWRNZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25uZWN0U29ja2V0KG1lOiBNZSk6IE1lIHtcbiAgICBpZiAoIXRoaXMuc29ja2V0Q2xpZW50LnNvY2tldEV4aXN0cygpKSB7XG4gICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLnNvY2tldENsaWVudC5jb25uZWN0KHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuKTtcbiAgICAgIHNvY2tldC5vbihcIm5ldyBtZXNzYWdlXCIsIGRhdGEgPT4gdGhpcy5yZWNlaXZlTmV3TWVzc2FnZShkYXRhKSk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0ZWRcIiwgZGF0YSA9PiBtZS5kZXZpY2VTZXNzaW9uSWQgPSBkYXRhLmRldmljZVNlc3Npb25JZCk7XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVjZWl2ZU5ld01lc3NhZ2UoanNvbjogYW55KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IE1lc3NhZ2UuYnVpbGQoanNvbi5kYXRhKTtcbiAgICB0aGlzLm1lKCkuc3Vic2NyaWJlKG1lID0+IG1lLmhhbmRsZU5ld01lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5AUGlwZSh7XG4gIG5hbWU6IFwic29ydFJvb21zXCJcbn0pXG5leHBvcnQgY2xhc3MgU29ydFJvb21QaXBlICBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0ocm9vbXM6IFJvb21bXSwgZmllbGQ6IHN0cmluZyk6IGFueVtdIHtcbiAgICBpZiAocm9vbXMgIT09IHVuZGVmaW5lZCAmJiByb29tcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJvb21zLnNvcnQoKHJvb206IFJvb20sIG90aGVyUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBjb25zdCBsYXN0QWN0aXZpdHlBdCAgICAgID0gcm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgY29uc3Qgb3RoZXJMYXN0QWN0aXZpdHlBdCA9IG90aGVyUm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgaWYgKG1vbWVudChsYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUob3RoZXJMYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmIChtb21lbnQob3RoZXJMYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUobGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMsIEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIH0gZnJvbSBcIi4vYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvclwiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lU2VydmljZSB9IGZyb20gXCIuL21lL21lLnNlcnZpY2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFNvcnRSb29tUGlwZSB9IGZyb20gXCIuL3BpcGUvc29ydC1yb29tXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudE1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBTb3J0Um9vbVBpcGVcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFNvcnRSb29tUGlwZVxuICBdXG4gfSlcbmV4cG9ydCBjbGFzcyBCYWJpbGlNb2R1bGUge1xuICBzdGF0aWMgZm9yUm9vdCh1cmxDb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCYWJpbGlNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFVSTF9DT05GSUdVUkFUSU9OLFxuICAgICAgICAgIHVzZVZhbHVlOiB1cmxDb25maWd1cmF0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIFNvcnRSb29tUGlwZSxcbiAgICAgICAgVG9rZW5Db25maWd1cmF0aW9uLFxuICAgICAgICBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgIFJvb21SZXBvc2l0b3J5LFxuICAgICAgICBNZVJlcG9zaXRvcnksXG4gICAgICAgIE1lU2VydmljZVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJtb21lbnQiLCJpby5jb25uZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0lBTUUsaUJBQWdCOzs7O0lBRWhCLGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDO0tBQ3RGOzs7O0lBRUQsS0FBSztRQUNILElB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