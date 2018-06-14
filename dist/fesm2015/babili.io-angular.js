import { Injectable, Pipe, NgModule } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { throwError, BehaviorSubject, of, empty, timer } from 'rxjs';
import { catchError, map, flatMap, publishReplay, refCount, share, takeWhile } from 'rxjs/operators';
import * as momentLoaded from 'moment';
import { connect } from 'socket.io-client';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class BabiliConfiguration {
    /**
     * @param {?} apiUrl
     * @param {?} socketUrl
     * @param {?=} aliveIntervalInMs
     * @return {?}
     */
    init(apiUrl, socketUrl, aliveIntervalInMs) {
        this.url = {
            apiUrl: apiUrl,
            socketUrl: socketUrl,
            aliveIntervalInMs: aliveIntervalInMs
        };
    }
    /**
     * @return {?}
     */
    get apiUrl() {
        return this.url ? this.url.apiUrl : undefined;
    }
    /**
     * @return {?}
     */
    get socketUrl() {
        return this.url ? this.url.socketUrl : undefined;
    }
    /**
     * @return {?}
     */
    get aliveIntervalInMs() {
        return this.url ? this.url.aliveIntervalInMs : 30000;
    }
}
BabiliConfiguration.decorators = [
    { type: Injectable },
];

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
     * @param {?} configuration
     * @param {?} tokenConfiguration
     */
    constructor(configuration, tokenConfiguration) {
        this.configuration = configuration;
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
        return request.url.startsWith(this.configuration.apiUrl);
    }
}
HttpAuthenticationInterceptor.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpAuthenticationInterceptor.ctorParameters = () => [
    { type: BabiliConfiguration },
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
        this.configuration = configuration;
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
    /**
     * @return {?}
     */
    get roomUrl() {
        return `${this.configuration.apiUrl}/user/rooms`;
    }
}
MessageRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MessageRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: BabiliConfiguration }
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
        this.configuration = configuration;
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
    /**
     * @return {?}
     */
    get roomUrl() {
        return `${this.configuration.apiUrl}/user/rooms`;
    }
}
RoomRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
RoomRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: MessageRepository },
    { type: BabiliConfiguration }
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
        this.configuration = configuration;
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
    /**
     * @return {?}
     */
    get userUrl() {
        return `${this.configuration.apiUrl}/user`;
    }
    /**
     * @return {?}
     */
    get aliveUrl() {
        return `${this.userUrl}/alive`;
    }
}
MeRepository.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MeRepository.ctorParameters = () => [
    { type: HttpClient },
    { type: RoomRepository },
    { type: BabiliConfiguration }
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
    { type: BabiliConfiguration }
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
    { type: BabiliConfiguration },
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
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: BabiliModule,
            providers: [
                BabiliConfiguration,
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

export { HttpAuthenticationInterceptor, NotAuthorizedError, BabiliModule, TokenConfiguration, MeRepository, MeService, Me, MessageRepository, Message, SortRoomPipe, RoomRepository, Room, BootstrapSocket, User, BabiliConfiguration };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vbm90LWF1dGhvcml6ZWQtZXJyb3IudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvdXNlci91c2VyLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20ucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3NvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUuc2VydmljZS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3BpcGUvc29ydC1yb29tLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYmFiaWxpLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3RvciB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhYmlsaUNvbmZpZ3VyYXRpb24ge1xuXG4gIHByaXZhdGUgdXJsOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uO1xuXG4gIGluaXQoYXBpVXJsOiBzdHJpbmcsIHNvY2tldFVybDogc3RyaW5nLCBhbGl2ZUludGVydmFsSW5Ncz86IG51bWJlcikge1xuICAgIHRoaXMudXJsID0ge1xuICAgICAgYXBpVXJsOiBhcGlVcmwsXG4gICAgICBzb2NrZXRVcmw6IHNvY2tldFVybCxcbiAgICAgIGFsaXZlSW50ZXJ2YWxJbk1zOiBhbGl2ZUludGVydmFsSW5Nc1xuICAgIH07XG4gIH1cblxuICBnZXQgYXBpVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsID8gdGhpcy51cmwuYXBpVXJsIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0IHNvY2tldFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybCA/IHRoaXMudXJsLnNvY2tldFVybCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBhbGl2ZUludGVydmFsSW5NcygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVybCA/IHRoaXMudXJsLmFsaXZlSW50ZXJ2YWxJbk1zIDogMzAwMDA7XG4gIH1cbn1cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVG9rZW5Db25maWd1cmF0aW9uIHtcbiAgcHVibGljIGFwaVRva2VuOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGlzQXBpVG9rZW5TZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXBpVG9rZW4gIT09IHVuZGVmaW5lZCAmJiB0aGlzLmFwaVRva2VuICE9PSBudWxsICYmIHRoaXMuYXBpVG9rZW4gIT09IFwiXCI7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmFwaVRva2VuID0gdW5kZWZpbmVkO1xuICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBOb3RBdXRob3JpemVkRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBlcnJvcjogYW55KSB7fVxufVxuIiwiaW1wb3J0IHsgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEhhbmRsZXIsIEh0dHBJbnRlcmNlcHRvciwgSHR0cFJlcXVlc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aHJvd0Vycm9yIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGNhdGNoRXJyb3IgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yIH0gZnJvbSBcIi4vbm90LWF1dGhvcml6ZWQtZXJyb3JcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgaW50ZXJjZXB0KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLnNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUodGhpcy5hZGRIZWFkZXJUbyhyZXF1ZXN0LCB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbikpXG4gICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGVycm9yLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgTm90QXV0aG9yaXplZEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgdG9rZW46IHN0cmluZyk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIHJldHVybiByZXF1ZXN0LmNsb25lKHtcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycy5zZXQoXCJBdXRob3JpemF0aW9uXCIsIGBCZWFyZXIgJHt0b2tlbn1gKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJlcXVlc3QudXJsLnN0YXJ0c1dpdGgodGhpcy5jb25maWd1cmF0aW9uLmFwaVVybCk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBVc2VyIHtcbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IFVzZXIge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4gbmV3IFVzZXIoanNvbi5pZCwganNvbi5hdHRyaWJ1dGVzID8ganNvbi5hdHRyaWJ1dGVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBVc2VyW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoVXNlci5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc3RhdHVzOiBzdHJpbmcpIHt9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgcmV0dXJuIG5ldyBNZXNzYWdlKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50KGF0dHJpYnV0ZXMuY3JlYXRlZEF0KS50b0RhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIuZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMucm9vbS5kYXRhLmlkKTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogTWVzc2FnZVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKE1lc3NhZ2UuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY3JlYXRlZEF0OiBEYXRlLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXI6IFVzZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21JZDogc3RyaW5nKSB7fVxuXG4gIGhhc1NlbmRlcklkKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZGVyICYmIHRoaXMuc2VuZGVyLmlkID09PSB1c2VySWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBOZXdNZXNzYWdlIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZW50VHlwZTogc3RyaW5nO1xuICBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VSZXBvc2l0b3J5IHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBjcmVhdGUocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5idWlsZChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZmluZEFsbChyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwgeyBwYXJhbXM6IGF0dHJpYnV0ZXMgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLm1hcChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZGVsZXRlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCl9LyR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocmVzcG9uc2UgPT4gbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBtZXNzYWdlVXJsKHJvb21JZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucm9vbVVybH0vJHtyb29tSWR9L21lc3NhZ2VzYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJvb21VcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS5yZXBvc2l0b3J5XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmV4cG9ydCBjbGFzcyBSb29tIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb20ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgY29uc3QgdXNlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzLmRhdGEpIDogW107XG4gICAgY29uc3Qgc2VuZGVycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzLmRhdGEpIDogW107XG4gICAgY29uc3QgbWVzc2FnZXMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzID8gTWVzc2FnZS5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzLmRhdGEpIDogW107XG4gICAgY29uc3QgaW5pdGlhdG9yID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IuZGF0YSkgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIG5ldyBSb29tKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCA/IG1vbWVudChhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0KS51dGMoKS50b0RhdGUoKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnVucmVhZE1lc3NhZ2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcnMsXG4gICAgICAgICAgICAgICAgICAgIHNlbmRlcnMsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHJvb21SZXBvc2l0b3J5KTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb21bXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChyb29tID0+IFJvb20uYnVpbGQocm9vbSwgcm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgbmV3TWVzc2FnZU5vdGlmaWVyOiAobWVzc2FnZTogTWVzc2FnZSkgPT4gYW55O1xuICBwcml2YXRlIGludGVybmFsT3BlbjogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbE5hbWU6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuICBwcml2YXRlIGludGVybmFsTGFzdEFjdGl2aXR5QXQ6IEJlaGF2aW9yU3ViamVjdDxEYXRlPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbEltYWdlVXJsOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIGxhc3RBY3Rpdml0eUF0OiBEYXRlLFxuICAgICAgICAgICAgICBvcGVuOiBib29sZWFuLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcmVhZG9ubHkgdXNlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc2VuZGVyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBtZXNzYWdlczogTWVzc2FnZVtdLFxuICAgICAgICAgICAgICByZWFkb25seSBpbml0aWF0b3I6IFVzZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG9wZW4pO1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdCA9IG5ldyBCZWhhdmlvclN1YmplY3QobGFzdEFjdGl2aXR5QXQpO1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lID0gbmV3IEJlaGF2aW9yU3ViamVjdChuYW1lKTtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQpO1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5kZWZpbmVkKTtcbiAgfVxuXG4gIGdldCB1bnJlYWRNZXNzYWdlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC52YWx1ZTtcbiAgfVxuXG4gIHNldCB1bnJlYWRNZXNzYWdlQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQubmV4dChjb3VudCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVVucmVhZE1lc3NhZ2VDb3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZS52YWx1ZTtcbiAgfVxuXG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lLm5leHQobmFtZSk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU5hbWUoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZTtcbiAgfVxuXG4gIGdldCBvcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3Blbi52YWx1ZTtcbiAgfVxuXG4gIHNldCBvcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICB0aGlzLmludGVybmFsT3Blbi5uZXh0KG9wZW4pO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVPcGVuKCk6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuO1xuICB9XG5cbiAgZ2V0IGxhc3RBY3Rpdml0eUF0KCk6IERhdGUge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQudmFsdWU7XG4gIH1cblxuICBzZXQgbGFzdEFjdGl2aXR5QXQobGFzdEFjdGl2aXR5QXQ6IERhdGUpIHtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQubmV4dChsYXN0QWN0aXZpdHlBdCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUxhc3RBY3Rpdml0eUF0KCk6IEJlaGF2aW9yU3ViamVjdDxEYXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDtcbiAgfVxuXG4gIGdldCBpbWFnZVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmwudmFsdWU7XG4gIH1cblxuICBzZXQgaW1hZ2VVcmwoaW1hZ2VVcmw6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybC5uZXh0KGltYWdlVXJsKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlSW1hZ2VVcmwoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmw7XG4gIH1cblxuXG4gIG9wZW5NZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgdHJ1ZSk7XG4gIH1cblxuICBjbG9zZU1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCBmYWxzZSk7XG4gIH1cblxuICBtYXJrQWxsTWVzc2FnZXNBc1JlYWQoKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZCh0aGlzKTtcbiAgfVxuXG4gIGFkZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eUF0ID0gbWVzc2FnZS5jcmVhdGVkQXQ7XG4gIH1cblxuICBub3RpZnlOZXdNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBpZiAodGhpcy5uZXdNZXNzYWdlTm90aWZpZXIpIHtcbiAgICAgIHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyLmFwcGx5KG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG5cbiAgaGFzVXNlcih1c2VySWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnVzZXJzICYmIHRoaXMudXNlcnMuc29tZSh1c2VyID0+IHVzZXIuaWQgID09PSB1c2VySWQpO1xuICB9XG5cbiAgZmV0Y2hNb3JlTWVzc2FnZSgpOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGZpcnN0U2Vlbk1lc3NhZ2VJZDogdGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwID8gdGhpcy5tZXNzYWdlc1swXS5pZCA6IHVuZGVmaW5lZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5maW5kTWVzc2FnZXModGhpcywgcGFyYW1zKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICBtYXAobWVzc2FnZXMgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQuYXBwbHkodGhpcy5tZXNzYWdlcywgbWVzc2FnZXMpO1xuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBmaW5kTWVzc2FnZVdpdGhJZChpZDogc3RyaW5nKTogTWVzc2FnZSB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZXMgPyB0aGlzLm1lc3NhZ2VzLmZpbmQobWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBpZCkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICB1cGRhdGUoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UobmV3TWVzc2FnZTogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuY3JlYXRlTWVzc2FnZSh0aGlzLCBuZXdNZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgIG1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICApO1xuICB9XG5cbiAgcmVtb3ZlTWVzc2FnZShtZXNzYWdlVG9EZWxldGU6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMubWVzc2FnZXMgPyB0aGlzLm1lc3NhZ2VzLmZpbmRJbmRleChtZXNzYWdlID0+IG1lc3NhZ2UuaWQgPT09IG1lc3NhZ2VUb0RlbGV0ZS5pZCkgOiAtMTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gbWVzc2FnZVRvRGVsZXRlO1xuICB9XG5cbiAgZGVsZXRlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmRlbGV0ZU1lc3NhZ2UodGhpcywgbWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKG1hcChkZWxldGVkTWVzc2FnZSA9PiB0aGlzLnJlbW92ZU1lc3NhZ2UoZGVsZXRlZE1lc3NhZ2UpKSk7XG4gIH1cblxuICByZXBsYWNlVXNlcnNXaXRoKHJvb206IFJvb20pOiBSb29tIHtcbiAgICB0aGlzLnVzZXJzLnNwbGljZSgwLCB0aGlzLnVzZXJzLmxlbmd0aCk7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy51c2Vycywgcm9vbS51c2Vycyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRVc2VyKHVzZXI6IFVzZXIpIHtcbiAgICBpZiAoIXRoaXMuaGFzVXNlcih1c2VyLmlkKSkge1xuICAgICAgdGhpcy51c2Vycy5wdXNoKHVzZXIpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4vcm9vbS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vbVJlcG9zaXRvcnkge1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBmaW5kKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldChgJHt0aGlzLnJvb21Vcmx9LyR7aWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20uYnVpbGQoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZEFsbChxdWVyeToge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy5yb29tVXJsLCB7IHBhcmFtczogcXVlcnkgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20ubWFwKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5T3BlbmVkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5Q2xvc2VkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0FmdGVyKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBmaXJzdFNlZW5Sb29tSWQ6IGlkIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQnlJZHMocm9vbUlkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgXCJyb29tSWRzW11cIjogcm9vbUlkcyB9KTtcbiAgfVxuXG4gIHVwZGF0ZU1lbWJlcnNoaXAocm9vbTogUm9vbSwgb3BlbjogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG9wZW46IG9wZW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgIHJvb20ub3BlbiA9IGRhdGEuZGF0YS5hdHRyaWJ1dGVzLm9wZW47XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICBpZiAocm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPiAwKSB7XG4gICAgICBjb25zdCBsYXN0UmVhZE1lc3NhZ2VJZCA9IHJvb20ubWVzc2FnZXMubGVuZ3RoID4gMCA/IHJvb20ubWVzc2FnZXNbcm9vbS5tZXNzYWdlcy5sZW5ndGggLSAxXS5pZCA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwL3VucmVhZC1tZXNzYWdlc2AsIHsgZGF0YTogeyBsYXN0UmVhZE1lc3NhZ2VJZDogbGFzdFJlYWRNZXNzYWdlSWQgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5tZXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKDApO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0/bm9EdXBsaWNhdGU9JHt3aXRob3V0RHVwbGljYXRlfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2Vyczoge1xuICAgICAgICAgICAgZGF0YTogdXNlcklkcy5tYXAodXNlcklkID0+ICh7IHR5cGU6IFwidXNlclwiLCBpZDogdXNlcklkIH0pIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgbm9EdXBsaWNhdGU6IGAke3dpdGhvdXREdXBsaWNhdGV9YFxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBSb29tLmJ1aWxkKHJlc3BvbnNlLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGUocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiByb29tLm5hbWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICByb29tLm5hbWUgPSByZXNwb25zZS5kYXRhLmF0dHJpYnV0ZXMubmFtZTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGFkZFVzZXIocm9vbTogUm9vbSwgdXNlcklkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBzYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogXCJ1c2VyXCIsXG4gICAgICAgICAgICAgIGlkOiB1c2VySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgY29uc3QgbmV3VXNlciA9IFVzZXIuYnVpbGQocmVzcG9uc2UuZGF0YS5yZWxhdGlvbnNoaXBzLnVzZXIuZGF0YSk7XG4gICAgICByb29tLmFkZFVzZXIobmV3VXNlcik7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBkZWxldGVNZXNzYWdlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5kZWxldGUocm9vbSwgbWVzc2FnZSk7XG4gIH1cblxuICBmaW5kTWVzc2FnZXMocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5maW5kQWxsKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgY3JlYXRlTWVzc2FnZShyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuY3JlYXRlKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcm9vbVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyL3Jvb21zYDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZmxhdE1hcCwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuZXhwb3J0IGNsYXNzIE1lIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpOiBNZSB7XG4gICAgY29uc3QgdW5yZWFkTWVzc2FnZUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEudW5yZWFkTWVzc2FnZUNvdW50IDogMDtcbiAgICBjb25zdCByb29tQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS5yb29tQ291bnQgOiAwO1xuICAgIHJldHVybiBuZXcgTWUoanNvbi5kYXRhLmlkLCBbXSwgW10sIHVucmVhZE1lc3NhZ2VDb3VudCwgcm9vbUNvdW50LCByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBwdWJsaWMgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsUm9vbUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBmaXJzdFNlZW5Sb29tOiBSb29tO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG9wZW5lZFJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByb29tQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQgfHwgMCk7XG4gICAgdGhpcy5pbnRlcm5hbFJvb21Db3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3Qocm9vbUNvdW50IHx8IDApO1xuICB9XG5cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IHJvb21Db3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50LnZhbHVlO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVSb29tQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50O1xuICB9XG5cbiAgZmV0Y2hPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRPcGVuZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kQ2xvc2VkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaE1vcmVSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIGlmICh0aGlzLmZpcnN0U2VlblJvb20pIHtcbiAgICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0FmdGVyKHRoaXMuZmlyc3RTZWVuUm9vbS5pZCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoW10pO1xuICAgIH1cbiAgfVxuXG4gIGZldGNoUm9vbXNCeUlkKHJvb21JZHM6IHN0cmluZ1tdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNCeUlkcyhyb29tSWRzKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZChyb29tSWQpLnBpcGUobWFwKHJvb20gPT4ge1xuICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZmluZE9yRmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChyb29tSWQpO1xuICAgIGlmIChyb29tSWQpIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hSb29tQnlJZChyb29tSWQpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU5ld01lc3NhZ2UobmV3TWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMuZmluZE9yRmV0Y2hSb29tQnlJZChuZXdNZXNzYWdlLnJvb21JZClcbiAgICAgICAgLnN1YnNjcmliZShyb29tID0+IHtcbiAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgcm9vbS5hZGRNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgcm9vbS5ub3RpZnlOZXdNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKCFuZXdNZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICBpZiAoIXJvb20ub3Blbikge1xuICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGFkZFJvb20obmV3Um9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tKG5ld1Jvb20pKSB7XG4gICAgICBpZiAoIXRoaXMuZmlyc3RTZWVuUm9vbSB8fCBtb21lbnQodGhpcy5maXJzdFNlZW5Sb29tLmxhc3RBY3Rpdml0eUF0KS5pc0FmdGVyKG5ld1Jvb20ubGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RTZWVuUm9vbSA9IG5ld1Jvb207XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMucm9vbXMgPyB0aGlzLnJvb21zLmZpbmRJbmRleChyb29tID0+IHJvb20uaWQgPT09IG5ld1Jvb20uaWQpIDogLTE7XG4gICAgICBpZiAocm9vbUluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5yb29tc1tyb29tSW5kZXhdID0gbmV3Um9vbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm9vbXMucHVzaChuZXdSb29tKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5yb29tcyA/IHRoaXMucm9vbXMuZmluZChyb29tID0+IHJvb21JZCA9PT0gcm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBvcGVuUm9vbShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLm9wZW5NZW1iZXJzaGlwKClcbiAgICAgICAgICAgICAgICAgLnBpcGUoZmxhdE1hcCgob3BlbmVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkVG9PcGVuZWRSb29tKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLmNsb3NlTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKG1hcChjbG9zZWRSb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb3NlZFJvb207XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb21zKHJvb21zVG9DbG9zZTogUm9vbVtdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gb2Yocm9vbXNUb0Nsb3NlKS5waXBlKFxuICAgICAgbWFwKHJvb21zID0+IHtcbiAgICAgICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHRoaXMuY2xvc2VSb29tKHJvb20pKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgb3BlblJvb21BbmRDbG9zZU90aGVycyhyb29tVG9PcGVuOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbXNUb0JlQ2xvc2VkID0gdGhpcy5vcGVuZWRSb29tcy5maWx0ZXIocm9vbSA9PiByb29tLmlkICE9PSByb29tVG9PcGVuLmlkKTtcbiAgICByZXR1cm4gdGhpcy5jbG9zZVJvb21zKHJvb21zVG9CZUNsb3NlZCkucGlwZShmbGF0TWFwKHJvb21zID0+IHRoaXMub3BlblJvb20ocm9vbVRvT3BlbikpKTtcbiAgfVxuXG4gIGhhc09wZW5lZFJvb21zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wZW5lZFJvb21zLmxlbmd0aCA+IDA7XG4gIH1cblxuICBjcmVhdGVSb29tKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5jcmVhdGUobmFtZSwgdXNlcklkcywgd2l0aG91dER1cGxpY2F0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIGJ1aWxkUm9vbSh1c2VySWRzOiBzdHJpbmdbXSk6IFJvb20ge1xuICAgIGNvbnN0IHVzZXJzID0gdXNlcklkcy5tYXAoaWQgPT4gbmV3IFVzZXIoaWQsIFwiXCIpKTtcbiAgICBjb25zdCBub1NlbmRlcnMgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2UgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2VVbnJlYWQgPSAwO1xuICAgIGNvbnN0IG5vSWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaW5pdGlhdG9yID0gdGhpcy50b1VzZXIoKTtcbiAgICByZXR1cm4gbmV3IFJvb20obm9JZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHRydWUsXG4gICAgICBub01lc3NhZ2VVbnJlYWQsXG4gICAgICB1c2VycyxcbiAgICAgIG5vU2VuZGVycyxcbiAgICAgIG5vTWVzc2FnZSxcbiAgICAgIGluaXRpYXRvcixcbiAgICAgIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKHJvb206IFJvb20sIGNvbnRlbnQ6IHN0cmluZywgY29udGVudFR5cGU6IHN0cmluZyk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiByb29tLnNlbmRNZXNzYWdlKHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBjb250ZW50VHlwZTogY29udGVudFR5cGUsXG4gICAgICBkZXZpY2VTZXNzaW9uSWQ6IHRoaXMuZGV2aWNlU2Vzc2lvbklkXG4gICAgfSk7XG4gIH1cblxuICBpc1NlbnRCeU1lKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbWVzc2FnZSAmJiBtZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChtZXNzYWdlLnJvb21JZCk7XG4gICAgICBpZiAocm9vbSkge1xuICAgICAgICByZXR1cm4gcm9vbS5kZWxldGUobWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgYWRkVXNlclRvKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuYWRkVXNlcihyb29tLCB1c2VySWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRSb29tcyhyb29tczogUm9vbVtdKSB7XG4gICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIGlmIChyb29tLm9wZW4gJiYgIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb20ocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb21PcGVuZWQocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tKHJvb206IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbUJ5SWQocm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZChyb29tID0+IHJvb21Ub0ZpbmQuaWQgPT09IHJvb20uaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb09wZW5lZFJvb20ocm9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tOiBSb29tKSB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChjbG9zZWRSb29tKSkge1xuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZEluZGV4KHJvb20gPT4gcm9vbS5pZCA9PT0gY2xvc2VkUm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnNwbGljZShyb29tSW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiByb29tLm1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpXG4gICAgICAgICAgICAgICAucGlwZShtYXAocmVhZE1lc3NhZ2VDb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IE1hdGgubWF4KHRoaXMudW5yZWFkTWVzc2FnZUNvdW50IC0gcmVhZE1lc3NhZ2VDb3VudCwgMCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIHRvVXNlcigpOiBVc2VyIHtcbiAgICByZXR1cm4gbmV3IFVzZXIodGhpcy5pZCwgXCJcIik7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBlbXB0eSwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lUmVwb3NpdG9yeSB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlDb25maWd1cmF0aW9uKSB7fVxuXG4gIGZpbmRNZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy51c2VyVXJsKS5waXBlKG1hcChtZSA9PiBNZS5idWlsZChtZSwgdGhpcy5yb29tUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIHVwZGF0ZUFsaXZlbmVzcyhtZTogTWUpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dCh0aGlzLmFsaXZlVXJsLCB7IGRhdGE6IHsgdHlwZTogXCJhbGl2ZVwiIH19KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShjYXRjaEVycm9yKCgpID0+IGVtcHR5KCkpLCBtYXAoKCkgPT4gbnVsbCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgdXNlclVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGFsaXZlVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMudXNlclVybH0vYWxpdmVgO1xuICB9XG59XG5cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgKiBhcyBpbyBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwU29ja2V0IHtcblxuICBwcml2YXRlIHNvY2tldDogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBjb25uZWN0KHRva2VuOiBzdHJpbmcpOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCh0aGlzLmNvbmZpZ3VyYXRpb24uc29ja2V0VXJsLCB7XG4gICAgICBmb3JjZU5ldzogdHJ1ZSxcbiAgICAgIHF1ZXJ5OiBgdG9rZW49JHt0b2tlbn1gXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0O1xuICB9XG5cbiAgc29ja2V0RXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNvY2tldCAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBpZiAodGhpcy5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRpbWVyIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCwgcHVibGlzaFJlcGxheSwgcmVmQ291bnQsIHNoYXJlLCB0YWtlV2hpbGUgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vLi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lU2VydmljZSB7XG5cbiAgcHJpdmF0ZSBjYWNoZWRNZTogT2JzZXJ2YWJsZTxNZT47XG4gIHByaXZhdGUgYWxpdmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtZVJlcG9zaXRvcnk6IE1lUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBzb2NrZXRDbGllbnQ6IEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0dXAodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uaXNBcGlUb2tlblNldCgpKSB7XG4gICAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbiA9IHRva2VuO1xuICAgIH1cbiAgfVxuXG4gIG1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICBpZiAoIXRoaXMuaGFzQ2FjaGVkTWUoKSkge1xuICAgICAgdGhpcy5jYWNoZWRNZSA9IHRoaXMubWVSZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kTWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAobWUgPT4gdGhpcy5zY2hlZHVsZUFsaXZlbmVzcyhtZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2hSZXBsYXkoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmQ291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFyZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lLnBpcGUobWFwKG1lID0+IHRoaXMuY29ubmVjdFNvY2tldChtZSkpKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmNsZWFyKCk7XG4gICAgdGhpcy5jYWNoZWRNZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQWxpdmVuZXNzKG1lOiBNZSk6IE1lIHtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICB0aW1lcigwLCB0aGlzLmNvbmZpZ3VyYXRpb24uYWxpdmVJbnRlcnZhbEluTXMpLnBpcGUoXG4gICAgICB0YWtlV2hpbGUoKCkgPT4gdGhpcy5hbGl2ZSlcbiAgICApXG4gICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLm1lUmVwb3NpdG9yeS51cGRhdGVBbGl2ZW5lc3MobWUpKTtcbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIGhhc0NhY2hlZE1lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGNvbm5lY3RTb2NrZXQobWU6IE1lKTogTWUge1xuICAgIGlmICghdGhpcy5zb2NrZXRDbGllbnQuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuc29ja2V0Q2xpZW50LmNvbm5lY3QodGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pO1xuICAgICAgc29ja2V0Lm9uKFwibmV3IG1lc3NhZ2VcIiwgZGF0YSA9PiB0aGlzLnJlY2VpdmVOZXdNZXNzYWdlKGRhdGEpKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RlZFwiLCBkYXRhID0+IG1lLmRldmljZVNlc3Npb25JZCA9IGRhdGEuZGV2aWNlU2Vzc2lvbklkKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSByZWNlaXZlTmV3TWVzc2FnZShqc29uOiBhbnkpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gTWVzc2FnZS5idWlsZChqc29uLmRhdGEpO1xuICAgIHRoaXMubWUoKS5zdWJzY3JpYmUobWUgPT4gbWUuaGFuZGxlTmV3TWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbkBQaXBlKHtcbiAgbmFtZTogXCJzb3J0Um9vbXNcIlxufSlcbmV4cG9ydCBjbGFzcyBTb3J0Um9vbVBpcGUgIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybShyb29tczogUm9vbVtdLCBmaWVsZDogc3RyaW5nKTogYW55W10ge1xuICAgIGlmIChyb29tcyAhPT0gdW5kZWZpbmVkICYmIHJvb21zICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcm9vbXMuc29ydCgocm9vbTogUm9vbSwgb3RoZXJSb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RBY3Rpdml0eUF0ICAgICAgPSByb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBjb25zdCBvdGhlckxhc3RBY3Rpdml0eUF0ID0gb3RoZXJSb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBpZiAobW9tZW50KGxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShvdGhlckxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKG1vbWVudChvdGhlckxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShsYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50TW9kdWxlLCBIVFRQX0lOVEVSQ0VQVE9SUyB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIH0gZnJvbSBcIi4vYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvclwiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZS9tZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZVNlcnZpY2UgfSBmcm9tIFwiLi9tZS9tZS5zZXJ2aWNlXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBTb3J0Um9vbVBpcGUgfSBmcm9tIFwiLi9waXBlL3NvcnQtcm9vbVwiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgU29ydFJvb21QaXBlXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBTb3J0Um9vbVBpcGVcbiAgXVxuIH0pXG5leHBvcnQgY2xhc3MgQmFiaWxpTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCYWJpbGlNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgQmFiaWxpQ29uZmlndXJhdGlvbixcbiAgICAgICAgU29ydFJvb21QaXBlLFxuICAgICAgICBUb2tlbkNvbmZpZ3VyYXRpb24sXG4gICAgICAgIEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLFxuICAgICAgICAgIHVzZUNsYXNzOiBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvcixcbiAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBNZXNzYWdlUmVwb3NpdG9yeSxcbiAgICAgICAgUm9vbVJlcG9zaXRvcnksXG4gICAgICAgIE1lUmVwb3NpdG9yeSxcbiAgICAgICAgTWVTZXJ2aWNlXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIm1vbWVudCIsImlvLmNvbm5lY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7SUFRRSxJQUFJLENBQUMsTUFBYyxFQUFFLFNBQWlCLEVBQUUsaUJBQTBCO1FBQ2hFLElBQUksQ0FBQyxHQUFHLEdBQUc7WUFDVCxNQUFNLEVBQUUsTUFBTTtZQUNkLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLGlCQUFpQixFQUFFLGlCQUFpQjtTQUNyQyxDQUFDO0tBQ0g7Ozs7SUFFRCxJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdB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