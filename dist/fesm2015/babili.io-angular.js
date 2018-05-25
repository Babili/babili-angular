import { Pipe, Injectable, InjectionToken, Inject, NgModule } from '@angular/core';
import * as momentLoaded from 'moment';
import { HttpErrorResponse, HttpClient, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { throwError, BehaviorSubject, of, empty, timer } from 'rxjs';
import { catchError, map, flatMap, publishReplay, refCount, share, takeWhile } from 'rxjs/operators';
import { connect } from 'socket.io-client';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ moment = momentLoaded;
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
                if (moment(lastActivityAt).isBefore(otherLastActivityAt)) {
                    return 1;
                }
                else if (moment(otherLastActivityAt).isBefore(lastActivityAt)) {
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
const /** @type {?} */ moment$1 = momentLoaded;
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
        return new Message(json.id, attributes.content, attributes.contentType, moment$1(attributes.createdAt).toDate(), json.relationships.sender ? User.build(json.relationships.sender.data) : undefined, json.relationships.room.data.id);
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
class ArrayUtils {
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element index
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @return {?}
     */
    static findIndex(items, predicate) {
        for (let /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            if (predicate.apply(items[currentIndex], currentIndex)) {
                return currentIndex;
            }
        }
        return -1;
    }
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @return {?}
     */
    static find(items, predicate) {
        for (let /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            const /** @type {?} */ item = items[currentIndex];
            if (predicate.apply(item, currentIndex)) {
                return item;
            }
        }
        return undefined;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const /** @type {?} */ moment$2 = momentLoaded;
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
        return new Room(json.id, attributes.name, attributes.lastActivityAt ? moment$2(attributes.lastActivityAt).utc().toDate() : undefined, attributes.open, attributes.unreadMessageCount, users, senders, messages, initiator, roomRepository);
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
const /** @type {?} */ moment$3 = momentLoaded;
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
            if (!this.firstSeenRoom || moment$3(this.firstSeenRoom.lastActivityAt).isAfter(newRoom.lastActivityAt)) {
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
                ]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

var babili_namespace = /*#__PURE__*/Object.freeze({
    SortRoomPipe: SortRoomPipe,
    BabiliModule: BabiliModule,
    User: User,
    Message: Message,
    Me: Me,
    MeService: MeService,
    HttpAuthenticationInterceptor: HttpAuthenticationInterceptor,
    NotAuthorizedError: NotAuthorizedError,
    Room: Room,
    URL_CONFIGURATION: URL_CONFIGURATION
});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { babili_namespace as Babili };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9waXBlL3NvcnQtcm9vbS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9hdXRoZW50aWNhdGlvbi9ub3QtYXV0aG9yaXplZC1lcnJvci50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2F1dGhlbnRpY2F0aW9uL2h0dHAtYXV0aGVudGljYXRpb24taW50ZXJjZXB0b3IudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci91c2VyL3VzZXIudHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9tZXNzYWdlL21lc3NhZ2UudHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2FycmF5LnV0aWxzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvcm9vbS9yb29tLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvcm9vbS9yb29tLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9tZS9tZS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldC50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnNlcnZpY2UudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9iYWJpbGkubW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbkBQaXBlKHtcbiAgbmFtZTogXCJzb3J0Um9vbXNcIlxufSlcbmV4cG9ydCBjbGFzcyBTb3J0Um9vbVBpcGUgIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybShyb29tczogUm9vbVtdLCBmaWVsZDogc3RyaW5nKTogYW55W10ge1xuICAgIGlmIChyb29tcyAhPT0gdW5kZWZpbmVkICYmIHJvb21zICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcm9vbXMuc29ydCgocm9vbTogUm9vbSwgb3RoZXJSb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RBY3Rpdml0eUF0ICAgICAgPSByb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBjb25zdCBvdGhlckxhc3RBY3Rpdml0eUF0ID0gb3RoZXJSb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBpZiAobW9tZW50KGxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShvdGhlckxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKG1vbWVudChvdGhlckxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShsYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRva2VuQ29uZmlndXJhdGlvbiB7XG4gIHB1YmxpYyBhcGlUb2tlbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBpc0FwaVRva2VuU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFwaVRva2VuICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hcGlUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmFwaVRva2VuICE9PSBcIlwiO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5hcGlUb2tlbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmV4cG9ydCBjb25zdCBVUkxfQ09ORklHVVJBVElPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxVcmxDb25maWd1cmF0aW9uPihcIkJhYmlsaVVybENvbmZpZ3VyYXRpb25cIik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXJsQ29uZmlndXJhdGlvbiB7XG4gIGFwaVVybDogc3RyaW5nO1xuICBzb2NrZXRVcmw6IHN0cmluZztcbiAgYWxpdmVJbnRlcnZhbEluTXM/OiBudW1iZXI7XG59XG4iLCJleHBvcnQgY2xhc3MgTm90QXV0aG9yaXplZEVycm9yIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgZXJyb3I6IGFueSkge31cbn1cbiIsImltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBIYW5kbGVyLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBSZXF1ZXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGhyb3dFcnJvciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yIH0gZnJvbSBcIi4vbm90LWF1dGhvcml6ZWQtZXJyb3JcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIHVybHM6IFVybENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgaW50ZXJjZXB0KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLnNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUodGhpcy5hZGRIZWFkZXJUbyhyZXF1ZXN0LCB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbikpXG4gICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGVycm9yLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgTm90QXV0aG9yaXplZEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgdG9rZW46IHN0cmluZyk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIHJldHVybiByZXF1ZXN0LmNsb25lKHtcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycy5zZXQoXCJBdXRob3JpemF0aW9uXCIsIGBCZWFyZXIgJHt0b2tlbn1gKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJlcXVlc3QudXJsLnN0YXJ0c1dpdGgodGhpcy51cmxzLmFwaVVybCk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBVc2VyIHtcbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IFVzZXIge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4gbmV3IFVzZXIoanNvbi5pZCwganNvbi5hdHRyaWJ1dGVzID8ganNvbi5hdHRyaWJ1dGVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBVc2VyW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoVXNlci5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc3RhdHVzOiBzdHJpbmcpIHt9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgcmV0dXJuIG5ldyBNZXNzYWdlKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50KGF0dHJpYnV0ZXMuY3JlYXRlZEF0KS50b0RhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIuZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMucm9vbS5kYXRhLmlkKTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogTWVzc2FnZVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKE1lc3NhZ2UuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY3JlYXRlZEF0OiBEYXRlLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXI6IFVzZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21JZDogc3RyaW5nKSB7fVxuXG4gIGhhc1NlbmRlcklkKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZGVyICYmIHRoaXMuc2VuZGVyLmlkID09PSB1c2VySWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVVJMX0NPTkZJR1VSQVRJT04sIFVybENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBOZXdNZXNzYWdlIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZW50VHlwZTogc3RyaW5nO1xuICBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VSZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHJvb21Vcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IFVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnJvb21VcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cblxuICBjcmVhdGUocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5idWlsZChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZmluZEFsbChyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwgeyBwYXJhbXM6IGF0dHJpYnV0ZXMgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLm1hcChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZGVsZXRlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCl9LyR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocmVzcG9uc2UgPT4gbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBtZXNzYWdlVXJsKHJvb21JZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucm9vbVVybH0vJHtyb29tSWR9L21lc3NhZ2VzYDtcbiAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgQXJyYXlVdGlscyB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYXJyYXkgd2hlcmUgcHJlZGljYXRlIGlzIHRydWUsIGFuZCAtMVxuICAgKiBvdGhlcndpc2UuXG4gICAqIEBwYXJhbSBpdGVtcyBhcnJheSB0aGF0IHdpbGwgYmUgaW5zcGVjdGVkIHRvIGZpbmQgYW4gZWxlbWVudCBpbmRleFxuICAgKiBAcGFyYW0gcHJlZGljYXRlIGZpbmQgY2FsbHMgcHJlZGljYXRlIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXksIGluIGFzY2VuZGluZ1xuICAgKiBvcmRlciwgdW50aWwgaXQgZmluZHMgb25lIHdoZXJlIHByZWRpY2F0ZSByZXR1cm5zIHRydWUuIElmIHN1Y2ggYW4gZWxlbWVudCBpcyBmb3VuZCxcbiAgICogZmluZEluZGV4IGltbWVkaWF0ZWx5IHJldHVybnMgdGhhdCBlbGVtZW50IGluZGV4LiBPdGhlcndpc2UsIGZpbmRJbmRleCByZXR1cm5zIC0xLlxuICAgKi9cbiAgc3RhdGljIGZpbmRJbmRleDxUPihpdGVtczogVFtdLCBwcmVkaWNhdGU6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbik6IG51bWJlciB7XG4gICAgZm9yIChsZXQgY3VycmVudEluZGV4ID0gMDsgY3VycmVudEluZGV4IDwgaXRlbXMubGVuZ3RoOyArK2N1cnJlbnRJbmRleCkge1xuICAgICAgaWYgKHByZWRpY2F0ZS5hcHBseShpdGVtc1tjdXJyZW50SW5kZXhdLCBjdXJyZW50SW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SW5kZXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYXJyYXkgd2hlcmUgcHJlZGljYXRlIGlzIHRydWUsIGFuZCB1bmRlZmluZWRcbiAgICogb3RoZXJ3aXNlLlxuICAgKiBAcGFyYW0gaXRlbXMgYXJyYXkgdGhhdCB3aWxsIGJlIGluc3BlY3RlZCB0byBmaW5kIGFuIGVsZW1lbnRcbiAgICogQHBhcmFtIHByZWRpY2F0ZSBmaW5kIGNhbGxzIHByZWRpY2F0ZSBvbmNlIGZvciBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5LCBpbiBhc2NlbmRpbmdcbiAgICogb3JkZXIsIHVudGlsIGl0IGZpbmRzIG9uZSB3aGVyZSBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLiBJZiBzdWNoIGFuIGVsZW1lbnQgaXMgZm91bmQsIGZpbmRcbiAgICogaW1tZWRpYXRlbHkgcmV0dXJucyB0aGF0IGVsZW1lbnQgdmFsdWUuIE90aGVyd2lzZSwgZmluZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICovXG4gIHN0YXRpYyBmaW5kPFQ+KGl0ZW1zOiBUW10sIHByZWRpY2F0ZTogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuKTogVCB7XG4gICAgZm9yIChsZXQgY3VycmVudEluZGV4ID0gMDsgY3VycmVudEluZGV4IDwgaXRlbXMubGVuZ3RoOyArK2N1cnJlbnRJbmRleCkge1xuICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2N1cnJlbnRJbmRleF07XG4gICAgICBpZiAocHJlZGljYXRlLmFwcGx5KGl0ZW0sIGN1cnJlbnRJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBBcnJheVV0aWxzIH0gZnJvbSBcIi4uL2FycmF5LnV0aWxzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS5yZXBvc2l0b3J5XCI7XG5cbmV4cG9ydCBjbGFzcyBSb29tIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb20ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgY29uc3QgdXNlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzLmRhdGEpIDogW107XG4gICAgY29uc3Qgc2VuZGVycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzLmRhdGEpIDogW107XG4gICAgY29uc3QgbWVzc2FnZXMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzID8gTWVzc2FnZS5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzLmRhdGEpIDogW107XG4gICAgY29uc3QgaW5pdGlhdG9yID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IuZGF0YSkgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIG5ldyBSb29tKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCA/IG1vbWVudChhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0KS51dGMoKS50b0RhdGUoKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnVucmVhZE1lc3NhZ2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcnMsXG4gICAgICAgICAgICAgICAgICAgIHNlbmRlcnMsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHJvb21SZXBvc2l0b3J5KTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb21bXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChyb29tID0+IFJvb20uYnVpbGQocm9vbSwgcm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgbmV3TWVzc2FnZU5vdGlmaWVyOiAobWVzc2FnZTogTWVzc2FnZSkgPT4gYW55O1xuICBwcml2YXRlIGludGVybmFsT3BlbjogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbE5hbWU6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuICBwcml2YXRlIGludGVybmFsTGFzdEFjdGl2aXR5QXQ6IEJlaGF2aW9yU3ViamVjdDxEYXRlPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbEltYWdlVXJsOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIGxhc3RBY3Rpdml0eUF0OiBEYXRlLFxuICAgICAgICAgICAgICBvcGVuOiBib29sZWFuLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcmVhZG9ubHkgdXNlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc2VuZGVyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBtZXNzYWdlczogTWVzc2FnZVtdLFxuICAgICAgICAgICAgICByZWFkb25seSBpbml0aWF0b3I6IFVzZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG9wZW4pO1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdCA9IG5ldyBCZWhhdmlvclN1YmplY3QobGFzdEFjdGl2aXR5QXQpO1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lID0gbmV3IEJlaGF2aW9yU3ViamVjdChuYW1lKTtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQpO1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5kZWZpbmVkKTtcbiAgfVxuXG4gIGdldCB1bnJlYWRNZXNzYWdlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC52YWx1ZTtcbiAgfVxuXG4gIHNldCB1bnJlYWRNZXNzYWdlQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQubmV4dChjb3VudCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVVucmVhZE1lc3NhZ2VDb3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZS52YWx1ZTtcbiAgfVxuXG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lLm5leHQobmFtZSk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU5hbWUoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZTtcbiAgfVxuXG4gIGdldCBvcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3Blbi52YWx1ZTtcbiAgfVxuXG4gIHNldCBvcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICB0aGlzLmludGVybmFsT3Blbi5uZXh0KG9wZW4pO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVPcGVuKCk6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuO1xuICB9XG5cbiAgZ2V0IGxhc3RBY3Rpdml0eUF0KCk6IERhdGUge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQudmFsdWU7XG4gIH1cblxuICBzZXQgbGFzdEFjdGl2aXR5QXQobGFzdEFjdGl2aXR5QXQ6IERhdGUpIHtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQubmV4dChsYXN0QWN0aXZpdHlBdCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUxhc3RBY3Rpdml0eUF0KCk6IEJlaGF2aW9yU3ViamVjdDxEYXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDtcbiAgfVxuXG4gIGdldCBpbWFnZVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmwudmFsdWU7XG4gIH1cblxuICBzZXQgaW1hZ2VVcmwoaW1hZ2VVcmw6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybC5uZXh0KGltYWdlVXJsKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlSW1hZ2VVcmwoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmw7XG4gIH1cblxuXG4gIG9wZW5NZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgdHJ1ZSk7XG4gIH1cblxuICBjbG9zZU1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCBmYWxzZSk7XG4gIH1cblxuICBtYXJrQWxsTWVzc2FnZXNBc1JlYWQoKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZCh0aGlzKTtcbiAgfVxuXG4gIGFkZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eUF0ID0gbWVzc2FnZS5jcmVhdGVkQXQ7XG4gIH1cblxuICBub3RpZnlOZXdNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBpZiAodGhpcy5uZXdNZXNzYWdlTm90aWZpZXIpIHtcbiAgICAgIHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyLmFwcGx5KG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG5cbiAgaGFzVXNlcih1c2VySWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy51c2Vycy5tYXAodXNlciA9PiB1c2VyLmlkKSwgaWQgPT4gaWQgPT09IHVzZXJJZCkgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZldGNoTW9yZU1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBmaXJzdFNlZW5NZXNzYWdlSWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCA/IHRoaXMubWVzc2FnZXNbMF0uaWQgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZmluZE1lc3NhZ2VzKHRoaXMsIHBhcmFtcylcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgbWFwKG1lc3NhZ2VzID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0LmFwcGx5KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2VzKTtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VXaXRoSWQoaWQ6IHN0cmluZyk6IE1lc3NhZ2Uge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy5tZXNzYWdlcywgbWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBpZCk7XG4gIH1cblxuICB1cGRhdGUoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UobmV3TWVzc2FnZTogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuY3JlYXRlTWVzc2FnZSh0aGlzLCBuZXdNZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgIG1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICApO1xuICB9XG5cbiAgcmVtb3ZlTWVzc2FnZShtZXNzYWdlVG9EZWxldGU6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcbiAgICBjb25zdCBpbmRleCA9IEFycmF5VXRpbHMuZmluZEluZGV4KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gbWVzc2FnZVRvRGVsZXRlLmlkKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gbWVzc2FnZVRvRGVsZXRlO1xuICB9XG5cbiAgZGVsZXRlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmRlbGV0ZU1lc3NhZ2UodGhpcywgbWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKG1hcChkZWxldGVkTWVzc2FnZSA9PiB0aGlzLnJlbW92ZU1lc3NhZ2UoZGVsZXRlZE1lc3NhZ2UpKSk7XG4gIH1cblxuICByZXBsYWNlVXNlcnNXaXRoKHJvb206IFJvb20pOiBSb29tIHtcbiAgICB0aGlzLnVzZXJzLnNwbGljZSgwLCB0aGlzLnVzZXJzLmxlbmd0aCk7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy51c2Vycywgcm9vbS51c2Vycyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRVc2VyKHVzZXI6IFVzZXIpIHtcbiAgICBpZiAoIXRoaXMuaGFzVXNlcih1c2VyLmlkKSkge1xuICAgICAgdGhpcy51c2Vycy5wdXNoKHVzZXIpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVVJMX0NPTkZJR1VSQVRJT04sIFVybENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4vcm9vbS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vbVJlcG9zaXRvcnkge1xuXG4gIHByaXZhdGUgcm9vbVVybDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IFVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnJvb21VcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cblxuICBmaW5kKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldChgJHt0aGlzLnJvb21Vcmx9LyR7aWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20uYnVpbGQoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZEFsbChxdWVyeToge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy5yb29tVXJsLCB7IHBhcmFtczogcXVlcnkgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20ubWFwKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5T3BlbmVkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5Q2xvc2VkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0FmdGVyKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBmaXJzdFNlZW5Sb29tSWQ6IGlkIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQnlJZHMocm9vbUlkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgXCJyb29tSWRzW11cIjogcm9vbUlkcyB9KTtcbiAgfVxuXG4gIHVwZGF0ZU1lbWJlcnNoaXAocm9vbTogUm9vbSwgb3BlbjogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG9wZW46IG9wZW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgIHJvb20ub3BlbiA9IGRhdGEuZGF0YS5hdHRyaWJ1dGVzLm9wZW47XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICBpZiAocm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPiAwKSB7XG4gICAgICBjb25zdCBsYXN0UmVhZE1lc3NhZ2VJZCA9IHJvb20ubWVzc2FnZXMubGVuZ3RoID4gMCA/IHJvb20ubWVzc2FnZXNbcm9vbS5tZXNzYWdlcy5sZW5ndGggLSAxXS5pZCA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwL3VucmVhZC1tZXNzYWdlc2AsIHsgZGF0YTogeyBsYXN0UmVhZE1lc3NhZ2VJZDogbGFzdFJlYWRNZXNzYWdlSWQgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5tZXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKDApO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0/bm9EdXBsaWNhdGU9JHt3aXRob3V0RHVwbGljYXRlfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2Vyczoge1xuICAgICAgICAgICAgZGF0YTogdXNlcklkcy5tYXAodXNlcklkID0+ICh7IHR5cGU6IFwidXNlclwiLCBpZDogdXNlcklkIH0pIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgbm9EdXBsaWNhdGU6IGAke3dpdGhvdXREdXBsaWNhdGV9YFxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBSb29tLmJ1aWxkKHJlc3BvbnNlLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGUocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiByb29tLm5hbWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICByb29tLm5hbWUgPSByZXNwb25zZS5kYXRhLmF0dHJpYnV0ZXMubmFtZTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGFkZFVzZXIocm9vbTogUm9vbSwgdXNlcklkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBzYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogXCJ1c2VyXCIsXG4gICAgICAgICAgICAgIGlkOiB1c2VySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgY29uc3QgbmV3VXNlciA9IFVzZXIuYnVpbGQocmVzcG9uc2UuZGF0YS5yZWxhdGlvbnNoaXBzLnVzZXIuZGF0YSk7XG4gICAgICByb29tLmFkZFVzZXIobmV3VXNlcik7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBkZWxldGVNZXNzYWdlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5kZWxldGUocm9vbSwgbWVzc2FnZSk7XG4gIH1cblxuICBmaW5kTWVzc2FnZXMocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5maW5kQWxsKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgY3JlYXRlTWVzc2FnZShyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuY3JlYXRlKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZiB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBmbGF0TWFwLCBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEFycmF5VXRpbHMgfSBmcm9tIFwiLi4vYXJyYXkudXRpbHNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi8uLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5leHBvcnQgY2xhc3MgTWUge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSk6IE1lIHtcbiAgICBjb25zdCB1bnJlYWRNZXNzYWdlQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS51bnJlYWRNZXNzYWdlQ291bnQgOiAwO1xuICAgIGNvbnN0IHJvb21Db3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnJvb21Db3VudCA6IDA7XG4gICAgcmV0dXJuIG5ldyBNZShqc29uLmRhdGEuaWQsIFtdLCBbXSwgdW5yZWFkTWVzc2FnZUNvdW50LCByb29tQ291bnQsIHJvb21SZXBvc2l0b3J5KTtcbiAgfVxuXG4gIHB1YmxpYyBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxSb29tQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGZpcnN0U2VlblJvb206IFJvb207XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgb3BlbmVkUm9vbXM6IFJvb21bXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgcm9vbXM6IFJvb21bXSxcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJvb21Db3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVucmVhZE1lc3NhZ2VDb3VudCB8fCAwKTtcbiAgICB0aGlzLmludGVybmFsUm9vbUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdChyb29tQ291bnQgfHwgMCk7XG4gIH1cblxuXG4gIGdldCB1bnJlYWRNZXNzYWdlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC52YWx1ZTtcbiAgfVxuXG4gIHNldCB1bnJlYWRNZXNzYWdlQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQubmV4dChjb3VudCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVVucmVhZE1lc3NhZ2VDb3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ7XG4gIH1cblxuICBnZXQgcm9vbUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxSb29tQ291bnQudmFsdWU7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVJvb21Db3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxSb29tQ291bnQ7XG4gIH1cblxuICBmZXRjaE9wZW5lZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZE9wZW5lZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRDbG9zZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoTW9yZVJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgaWYgKHRoaXMuZmlyc3RTZWVuUm9vbSkge1xuICAgICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQWZ0ZXIodGhpcy5maXJzdFNlZW5Sb29tLmlkKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgICByZXR1cm4gcm9vbXM7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihbXSk7XG4gICAgfVxuICB9XG5cbiAgZmV0Y2hSb29tc0J5SWQocm9vbUlkczogc3RyaW5nW10pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0J5SWRzKHJvb21JZHMpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kKHJvb21JZCkucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBmaW5kT3JGZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbSA9IHRoaXMuZmluZFJvb21CeUlkKHJvb21JZCk7XG4gICAgaWYgKHJvb21JZCkge1xuICAgICAgcmV0dXJuIG9mKHJvb20pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaFJvb21CeUlkKHJvb21JZCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTmV3TWVzc2FnZShuZXdNZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgdGhpcy5maW5kT3JGZXRjaFJvb21CeUlkKG5ld01lc3NhZ2Uucm9vbUlkKVxuICAgICAgICAuc3Vic2NyaWJlKHJvb20gPT4ge1xuICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICByb29tLmFkZE1lc3NhZ2UobmV3TWVzc2FnZSk7XG4gICAgICAgICAgICByb29tLm5vdGlmeU5ld01lc3NhZ2UobmV3TWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoIW5ld01lc3NhZ2UuaGFzU2VuZGVySWQodGhpcy5pZCkpIHtcbiAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCArIDE7XG4gICAgICAgICAgICAgIGlmICghcm9vbS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPSByb29tLnVucmVhZE1lc3NhZ2VDb3VudCArIDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgYWRkUm9vbShuZXdSb29tOiBSb29tKSB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb20obmV3Um9vbSkpIHtcbiAgICAgIGlmICghdGhpcy5maXJzdFNlZW5Sb29tIHx8IG1vbWVudCh0aGlzLmZpcnN0U2VlblJvb20ubGFzdEFjdGl2aXR5QXQpLmlzQWZ0ZXIobmV3Um9vbS5sYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgdGhpcy5maXJzdFNlZW5Sb29tID0gbmV3Um9vbTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5yb29tcywgcm9vbSA9PiByb29tLmlkID09PSBuZXdSb29tLmlkKTtcbiAgICAgIGlmIChyb29tSW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLnJvb21zW3Jvb21JbmRleF0gPSBuZXdSb29tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb29tcy5wdXNoKG5ld1Jvb20pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbmRSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IFJvb20ge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy5yb29tcywgcm9vbSA9PiByb29tSWQgPT09IHJvb20uaWQpO1xuICB9XG5cbiAgb3BlblJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5vcGVuTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKGZsYXRNYXAoKG9wZW5lZFJvb206IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFRvT3BlbmVkUm9vbShvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5jbG9zZU1lbWJlcnNoaXAoKVxuICAgICAgICAgICAgICAgICAucGlwZShtYXAoY2xvc2VkUm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9zZWRSb29tO1xuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tcyhyb29tc1RvQ2xvc2U6IFJvb21bXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIG9mKHJvb21zVG9DbG9zZSkucGlwZShcbiAgICAgIG1hcChyb29tcyA9PiB7XG4gICAgICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB0aGlzLmNsb3NlUm9vbShyb29tKSk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIG9wZW5Sb29tQW5kQ2xvc2VPdGhlcnMocm9vbVRvT3BlbjogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb21zVG9CZUNsb3NlZCA9IHRoaXMub3BlbmVkUm9vbXMuZmlsdGVyKHJvb20gPT4gcm9vbS5pZCAhPT0gcm9vbVRvT3Blbi5pZCk7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VSb29tcyhyb29tc1RvQmVDbG9zZWQpLnBpcGUoZmxhdE1hcChyb29tcyA9PiB0aGlzLm9wZW5Sb29tKHJvb21Ub09wZW4pKSk7XG4gIH1cblxuICBoYXNPcGVuZWRSb29tcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcy5sZW5ndGggPiAwO1xuICB9XG5cbiAgY3JlYXRlUm9vbShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuY3JlYXRlKG5hbWUsIHVzZXJJZHMsIHdpdGhvdXREdXBsaWNhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBidWlsZFJvb20odXNlcklkczogc3RyaW5nW10pOiBSb29tIHtcbiAgICBjb25zdCB1c2VycyA9IHVzZXJJZHMubWFwKGlkID0+IG5ldyBVc2VyKGlkLCBcIlwiKSk7XG4gICAgY29uc3Qgbm9TZW5kZXJzID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlVW5yZWFkID0gMDtcbiAgICBjb25zdCBub0lkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IHRoaXMudG9Vc2VyKCk7XG4gICAgcmV0dXJuIG5ldyBSb29tKG5vSWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB0cnVlLFxuICAgICAgbm9NZXNzYWdlVW5yZWFkLFxuICAgICAgdXNlcnMsXG4gICAgICBub1NlbmRlcnMsXG4gICAgICBub01lc3NhZ2UsXG4gICAgICBpbml0aWF0b3IsXG4gICAgICB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShyb29tOiBSb29tLCBjb250ZW50OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gcm9vbS5zZW5kTWVzc2FnZSh7XG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgY29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgICAgZGV2aWNlU2Vzc2lvbklkOiB0aGlzLmRldmljZVNlc3Npb25JZFxuICAgIH0pO1xuICB9XG5cbiAgaXNTZW50QnlNZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2UgJiYgbWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQobWVzc2FnZS5yb29tSWQpO1xuICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgcmV0dXJuIHJvb20uZGVsZXRlKG1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFVzZXJUbyhyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmFkZFVzZXIocm9vbSwgdXNlcklkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm9vbXMocm9vbXM6IFJvb21bXSkge1xuICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICBpZiAocm9vbS5vcGVuICYmICF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbShyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbU9wZW5lZChyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbShyb29tOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb21CeUlkKHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbU9wZW5lZChyb29tVG9GaW5kOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLm9wZW5lZFJvb21zLCByb29tID0+IHJvb21Ub0ZpbmQuaWQgPT09IHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb09wZW5lZFJvb20ocm9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tOiBSb29tKSB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChjbG9zZWRSb29tKSkge1xuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5vcGVuZWRSb29tcywgcm9vbSA9PiByb29tLmlkID09PSBjbG9zZWRSb29tLmlkKTtcbiAgICAgIHRoaXMub3BlbmVkUm9vbXMuc3BsaWNlKHJvb21JbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHJvb20ubWFya0FsbE1lc3NhZ2VzQXNSZWFkKClcbiAgICAgICAgICAgICAgIC5waXBlKG1hcChyZWFkTWVzc2FnZUNvdW50ID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gTWF0aC5tYXgodGhpcy51bnJlYWRNZXNzYWdlQ291bnQgLSByZWFkTWVzc2FnZUNvdW50LCAwKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByb29tO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgdG9Vc2VyKCk6IFVzZXIge1xuICAgIHJldHVybiBuZXcgVXNlcih0aGlzLmlkLCBcIlwiKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGVtcHR5LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVVJMX0NPTkZJR1VSQVRJT04sIFVybENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi8uLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVSZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHVzZXJVcmw6IHN0cmluZztcbiAgcHJpdmF0ZSBhbGl2ZVVybDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IFVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnVzZXJVcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlcmA7XG4gICAgdGhpcy5hbGl2ZVVybCA9IGAke3RoaXMudXNlclVybH0vYWxpdmVgO1xuICB9XG5cbiAgZmluZE1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLnVzZXJVcmwpLnBpcGUobWFwKG1lID0+IE1lLmJ1aWxkKG1lLCB0aGlzLnJvb21SZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlQWxpdmVuZXNzKG1lOiBNZSk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuYWxpdmVVcmwsIHsgZGF0YTogeyB0eXBlOiBcImFsaXZlXCIgfX0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoKCkgPT4gZW1wdHkoKSksIG1hcCgoKSA9PiBudWxsKSk7XG4gIH1cbn1cblxuIiwiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0ICogYXMgaW8gZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuXG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcFNvY2tldCB7XG5cbiAgcHJpdmF0ZSBzb2NrZXQ6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIGNvbmZpZ3VyYXRpb246IFVybENvbmZpZ3VyYXRpb24pIHt9XG5cbiAgY29ubmVjdCh0b2tlbjogc3RyaW5nKTogU29ja2V0SU9DbGllbnQuU29ja2V0IHtcbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QodGhpcy5jb25maWd1cmF0aW9uLnNvY2tldFVybCwge1xuICAgICAgZm9yY2VOZXc6IHRydWUsXG4gICAgICBxdWVyeTogYHRva2VuPSR7dG9rZW59YFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnNvY2tldDtcbiAgfVxuXG4gIHNvY2tldEV4aXN0cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLnNvY2tldCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aW1lciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAsIHB1Ymxpc2hSZXBsYXksIHJlZkNvdW50LCBzaGFyZSwgdGFrZVdoaWxlIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuLy4uL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5pbXBvcnQgeyBNZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVNlcnZpY2Uge1xuXG4gIHByaXZhdGUgY2FjaGVkTWU6IE9ic2VydmFibGU8TWU+O1xuICBwcml2YXRlIGFsaXZlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVSZXBvc2l0b3J5OiBNZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgc29ja2V0Q2xpZW50OiBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIHByaXZhdGUgY29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgcHJpdmF0ZSB0b2tlbkNvbmZpZ3VyYXRpb246IFRva2VuQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHNldHVwKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudG9rZW5Db25maWd1cmF0aW9uLmlzQXBpVG9rZW5TZXQoKSkge1xuICAgICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4gPSB0b2tlbjtcbiAgICB9XG4gIH1cblxuICBtZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgaWYgKCF0aGlzLmhhc0NhY2hlZE1lKCkpIHtcbiAgICAgIHRoaXMuY2FjaGVkTWUgPSB0aGlzLm1lUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZE1lKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwKG1lID0+IHRoaXMuc2NoZWR1bGVBbGl2ZW5lc3MobWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoUmVwbGF5KDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZkNvdW50KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZS5waXBlKG1hcChtZSA9PiB0aGlzLmNvbm5lY3RTb2NrZXQobWUpKSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5jbGVhcigpO1xuICAgIHRoaXMuY2FjaGVkTWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZUFsaXZlbmVzcyhtZTogTWUpOiBNZSB7XG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG4gICAgdGltZXIoMCwgdGhpcy5jb25maWd1cmF0aW9uLmFsaXZlSW50ZXJ2YWxJbk1zKS5waXBlKFxuICAgICAgdGFrZVdoaWxlKCgpID0+IHRoaXMuYWxpdmUpXG4gICAgKVxuICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5tZVJlcG9zaXRvcnkudXBkYXRlQWxpdmVuZXNzKG1lKSk7XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNDYWNoZWRNZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25uZWN0U29ja2V0KG1lOiBNZSk6IE1lIHtcbiAgICBpZiAoIXRoaXMuc29ja2V0Q2xpZW50LnNvY2tldEV4aXN0cygpKSB7XG4gICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLnNvY2tldENsaWVudC5jb25uZWN0KHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuKTtcbiAgICAgIHNvY2tldC5vbihcIm5ldyBtZXNzYWdlXCIsIGRhdGEgPT4gdGhpcy5yZWNlaXZlTmV3TWVzc2FnZShkYXRhKSk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0ZWRcIiwgZGF0YSA9PiBtZS5kZXZpY2VTZXNzaW9uSWQgPSBkYXRhLmRldmljZVNlc3Npb25JZCk7XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVjZWl2ZU5ld01lc3NhZ2UoanNvbjogYW55KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IE1lc3NhZ2UuYnVpbGQoanNvbi5kYXRhKTtcbiAgICB0aGlzLm1lKCkuc3Vic2NyaWJlKG1lID0+IG1lLmhhbmRsZU5ld01lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IgfSBmcm9tIFwiLi9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUvbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWVTZXJ2aWNlIH0gZnJvbSBcIi4vbWUvbWUuc2VydmljZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgU29ydFJvb21QaXBlIH0gZnJvbSBcIi4vcGlwZS9zb3J0LXJvb21cIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBIdHRwQ2xpZW50TW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFNvcnRSb29tUGlwZVxuICBdXG4gfSlcbmV4cG9ydCBjbGFzcyBCYWJpbGlNb2R1bGUge1xuICBzdGF0aWMgZm9yUm9vdCh1cmxDb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCYWJpbGlNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFVSTF9DT05GSUdVUkFUSU9OLFxuICAgICAgICAgIHVzZVZhbHVlOiB1cmxDb25maWd1cmF0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIFNvcnRSb29tUGlwZSxcbiAgICAgICAgVG9rZW5Db25maWd1cmF0aW9uLFxuICAgICAgICBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgIFJvb21SZXBvc2l0b3J5LFxuICAgICAgICBNZVJlcG9zaXRvcnksXG4gICAgICAgIE1lU2VydmljZVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJtb21lbnQiLCJpby5jb25uZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLEFBR0EsdUJBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQztBQUs1Qjs7Ozs7O0lBQ0UsU0FBUyxDQUFDLEtBQWEsRUFBRSxLQUFhO1FBQ3BDLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3pDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQVUsRUFBRSxTQUFlO2dCQUM1Qyx1QkFBTSxjQUFjLEdBQVEsSUFBSSxDQUFDLGNBQWMsQ0FBQztnQkFDaEQsdUJBQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQztnQkFDckQsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEVBQUU7b0JBQ3hELE9BQU8sQ0FBQyxDQUFDO2lCQUNWO3FCQUFNLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO29CQUMvRCxPQUFPLENBQUMsQ0FBQyxDQUFDO2lCQUNYO3FCQUFNO29CQUNMLE9BQU8sQ0FBQyxDQUFDO2lCQUNWO2FBQ0YsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7S0FDRjs7O1lBcEJGLElBQUksU0FBQztnQkFDSixJQUFJLEVBQUUsV0FBVzthQUNsQjs7Ozs7OztBQ1BEO0lBTUUsaUJBQWdCOzs7O0lBRWhCLGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDO0tBQ3RGOzs7O0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0tBQzNCOzs7WUFaRixVQUFVOzs7Ozs7Ozs7QUNGWCxBQUVPLHVCQUFNLGlCQUFpQixHQUFHLElBQUksY0FBYyxDQUFtQix3QkFBd0IsQ0FBQyxDQUFDOzs7Ozs7QUNGaEc7Ozs7SUFDRSxZQUFxQixLQUFVO1FBQVYsVUFBSyxHQUFMLEtBQUssQ0FBSztLQUFJO0NBQ3BDOzs7Ozs7QUNGRDs7Ozs7SUFXRSxZQUErQyxJQUFzQixFQUNqRDtRQUQyQixTQUFJLEdBQUosSUFBSSxDQUFrQjtRQUNqRCx1QkFBa0IsR0FBbEIsa0JBQWtCO0tBQXdCOzs7Ozs7SUFFOUQsU0FBUyxDQUFDLE9BQXlCLEVBQUUsSUFBaUI7UUFDcEQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDbkMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLO2dCQUNwQixJQUFJLEtBQUssWUFBWSxpQkFBaUIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQkFDOUQsT0FBTyxVQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNsRDtxQkFBTTtvQkFDTCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDMUI7YUFDRixDQUFDLENBQUMsQ0FBQztTQUNoQjthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzdCO0tBQ0Y7Ozs7OztJQUVPLFdBQVcsQ0FBQyxPQUF5QixFQUFFLEtBQWE7UUFDMUQsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ25CLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBVSxLQUFLLEVBQUUsQ0FBQztTQUNqRSxDQUFDLENBQUM7Ozs7OztJQUdHLGlCQUFpQixDQUFDLE9BQXlCO1FBQ2pELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7OztZQTVCbkQsVUFBVTs7Ozs0Q0FHSSxNQUFNLFNBQUMsaUJBQWlCO1lBUDlCLGtCQUFrQjs7Ozs7OztBQ0ozQjs7Ozs7SUFpQkUsWUFBcUIsRUFBVSxFQUNWLE1BQWM7UUFEZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsV0FBTSxHQUFOLE1BQU0sQ0FBUTtLQUFJOzs7OztJQWpCdkMsT0FBTyxLQUFLLENBQUMsSUFBUztRQUNwQixJQUFJLElBQUksRUFBRTtZQUNSLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1NBQ2hGO2FBQU07WUFDTCxPQUFPLFNBQVMsQ0FBQztTQUNsQjtLQUNGOzs7OztJQUVELE9BQU8sR0FBRyxDQUFDLElBQVM7UUFDbEIsSUFBSSxJQUFJLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzdCO2FBQU07WUFDTCxPQUFPLFNBQVMsQ0FBQztTQUNsQjtLQUNGO0NBSUY7Ozs7OztBQ25CRCxBQUNBLHVCQUFNQSxRQUFNLEdBQUcsWUFBWSxDQUFDO0FBRTVCOzs7Ozs7Ozs7SUFzQkUsWUFBcUIsRUFBVSxFQUNWLE9BQWUsRUFDZixXQUFtQixFQUNuQixTQUFlLEVBQ2YsTUFBWSxFQUNaLE1BQWM7UUFMZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQU07UUFDZixXQUFNLEdBQU4sTUFBTSxDQUFNO1FBQ1osV0FBTSxHQUFOLE1BQU0sQ0FBUTtLQUFJOzs7OztJQXZCdkMsT0FBTyxLQUFLLENBQUMsSUFBUztRQUNwQix1QkFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ04sVUFBVSxDQUFDLE9BQU8sRUFDbEIsVUFBVSxDQUFDLFdBQVcsRUFDdEJBLFFBQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUNsRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDdEQ7Ozs7O0lBRUQsT0FBTyxHQUFHLENBQUMsSUFBUztRQUNsQixJQUFJLElBQUksRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7YUFBTTtZQUNMLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO0tBQ0Y7Ozs7O0lBU0QsV0FBVyxDQUFDLE1BQWM7UUFDeEIsT0FBTyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQztLQUNqRDtDQUNGOzs7Ozs7QUNuQ0Q7Ozs7O0lBbUJFLFlBQW9CLElBQWdCLEVBQ0csYUFBK0I7UUFEbEQsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUVsQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sYUFBYSxDQUFDO0tBQ3JEOzs7Ozs7SUFFRCxNQUFNLENBQUMsSUFBVSxFQUFFLFVBQXNCO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDOUMsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSxTQUFTO2dCQUNmLFVBQVUsRUFBRSxVQUFVO2FBQ3ZCO1NBQ0YsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFhLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9EOzs7Ozs7SUFFRCxPQUFPLENBQUMsSUFBVSxFQUFFLFVBQWdEO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUM7YUFDckQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQWEsS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDM0U7Ozs7OztJQUVELE1BQU0sQ0FBQyxJQUFVLEVBQUUsT0FBZ0I7UUFDakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQzthQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ2pEOzs7OztJQUVPLFVBQVUsQ0FBQyxNQUFjO1FBQy9CLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFDOzs7O1lBOUIvQyxVQUFVOzs7O1lBZEYsVUFBVTs0Q0FvQkosTUFBTSxTQUFDLGlCQUFpQjs7Ozs7OztBQ3BCdkM7Ozs7Ozs7Ozs7O0lBU0UsT0FBTyxTQUFTLENBQUksS0FBVSxFQUFFLFNBQStDO1FBQzdFLEtBQUsscUJBQUksWUFBWSxHQUFHLENBQUMsRUFBRSxZQUFZLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRTtZQUN0RSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUN0RCxPQUFPLFlBQVksQ0FBQzthQUNyQjtTQUNGO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUNYOzs7Ozs7Ozs7OztJQVVELE9BQU8sSUFBSSxDQUFJLEtBQVUsRUFBRSxTQUErQztRQUN4RSxLQUFLLHFCQUFJLFlBQVksR0FBRyxDQUFDLEVBQUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUU7WUFDdEUsdUJBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLFNBQVMsQ0FBQztLQUNsQjtDQUNGOzs7Ozs7QUNuQ0QsQUFDQSx1QkFBTUEsUUFBTSxHQUFHLFlBQVksQ0FBQztBQUM1Qjs7Ozs7Ozs7Ozs7OztJQTJDRSxZQUFxQixFQUFVLEVBQ25CLElBQVksRUFDWixjQUFvQixFQUNwQixJQUFhLEVBQ2Isa0JBQTBCLEVBQ2pCLEtBQWEsRUFDYixPQUFlLEVBQ2YsUUFBbUIsRUFDbkIsU0FBZSxFQUNoQjtRQVRDLE9BQUUsR0FBRixFQUFFLENBQVE7UUFLVixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDbkIsY0FBUyxHQUFULFNBQVMsQ0FBTTtRQUNoQixtQkFBYyxHQUFkLGNBQWM7UUFDaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDeEQ7Ozs7Ozs7SUFoREQsT0FBTyxLQUFLLENBQUMsSUFBUyxFQUFFLGNBQThCLEVBQUUsaUJBQW9DO1FBQzFGLHVCQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLHVCQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVHLHVCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2xILHVCQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hILHVCQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBQ2pJLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFDUCxVQUFVLENBQUMsSUFBSSxFQUNmLFVBQVUsQ0FBQyxjQUFjLEdBQUdBLFFBQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsU0FBUyxFQUN4RixVQUFVLENBQUMsSUFBSSxFQUNmLFVBQVUsQ0FBQyxrQkFBa0IsRUFDN0IsS0FBSyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsU0FBUyxFQUNULGNBQWMsQ0FBQyxDQUFDO0tBQ2pDOzs7Ozs7O0lBRUQsT0FBTyxHQUFHLENBQUMsSUFBUyxFQUFFLGNBQThCLEVBQUUsaUJBQW9DO1FBQ3hGLElBQUksSUFBSSxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1NBQzlFO2FBQU07WUFDTCxPQUFPLFNBQVMsQ0FBQztTQUNsQjtLQUNGOzs7O0lBMEJELElBQUksa0JBQWtCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztLQUM5Qzs7Ozs7SUFFRCxJQUFJLGtCQUFrQixDQUFDLEtBQWE7UUFDbEMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM3Qzs7OztJQUVELElBQUksNEJBQTRCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDO0tBQ3hDOzs7O0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztLQUNoQzs7Ozs7SUFFRCxJQUFJLElBQUksQ0FBQyxJQUFZO1FBQ25CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlCOzs7O0lBRUQsSUFBSSxjQUFjO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMxQjs7OztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7S0FDaEM7Ozs7O0lBRUQsSUFBSSxJQUFJLENBQUMsSUFBYTtRQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM5Qjs7OztJQUVELElBQUksY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUI7Ozs7SUFFRCxJQUFJLGNBQWM7UUFDaEIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO0tBQzFDOzs7OztJQUVELElBQUksY0FBYyxDQUFDLGNBQW9CO1FBQ3JDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDbEQ7Ozs7SUFFRCxJQUFJLHdCQUF3QjtRQUMxQixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztLQUNwQzs7OztJQUVELElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztLQUNwQzs7Ozs7SUFFRCxJQUFJLFFBQVEsQ0FBQyxRQUFnQjtRQUMzQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDOzs7O0lBRUQsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7Ozs7SUFHRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN6RDs7OztJQUVELGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzFEOzs7O0lBRUQscUJBQXFCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoRTs7Ozs7SUFFRCxVQUFVLENBQUMsT0FBZ0I7UUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0tBQ3pDOzs7OztJQUVELGdCQUFnQixDQUFDLE9BQWdCO1FBQy9CLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEM7S0FDRjs7Ozs7SUFHRCxPQUFPLENBQUMsTUFBYztRQUNwQixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLE1BQU0sQ0FBQyxLQUFLLFNBQVMsQ0FBQztLQUM1Rjs7OztJQUVELGdCQUFnQjtRQUNkLHVCQUFNLE1BQU0sR0FBRztZQUNiLGtCQUFrQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTO1NBQy9FLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxjQUFjO2FBQ2QsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7YUFDMUIsSUFBSSxDQUNkLEdBQUcsQ0FBQyxRQUFRO1lBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckQsT0FBTyxRQUFRLENBQUM7U0FDakIsQ0FBQyxDQUNILENBQUM7S0FDSDs7Ozs7SUFFRCxpQkFBaUIsQ0FBQyxFQUFVO1FBQzFCLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3JFOzs7O0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDekM7Ozs7O0lBRUQsV0FBVyxDQUFDLFVBQXNCO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLGNBQWM7YUFDZCxhQUFhLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQzthQUMvQixJQUFJLENBQ0gsR0FBRyxDQUFDLE9BQU87WUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sT0FBTyxDQUFDO1NBQ2hCLENBQUMsQ0FDSCxDQUFDO0tBQ2Q7Ozs7O0lBRUQsYUFBYSxDQUFDLGVBQXdCO1FBQ3BDLHVCQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hHLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO1FBQ0QsT0FBTyxlQUFlLENBQUM7S0FDeEI7Ozs7O0lBRUQsTUFBTSxDQUFDLE9BQWdCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGNBQWM7YUFDZCxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQzthQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3RTs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFVO1FBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQztLQUNiOzs7OztJQUVELE9BQU8sQ0FBQyxJQUFVO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtLQUNGO0NBQ0Y7Ozs7OztBQ2pORDs7Ozs7O0lBZUUsWUFBb0IsSUFBZ0IsRUFDaEIsbUJBQ21CLGFBQStCO1FBRmxELFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsc0JBQWlCLEdBQWpCLGlCQUFpQjtRQUVuQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sYUFBYSxDQUFDO0tBQ3JEOzs7OztJQUVELElBQUksQ0FBQyxFQUFVO1FBQ2IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxFQUFFLENBQUM7YUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoRzs7Ozs7SUFFRCxPQUFPLENBQUMsS0FBNEM7UUFDbEQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFTLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUY7Ozs7SUFFRCxlQUFlO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDN0M7Ozs7SUFFRCxlQUFlO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDN0M7Ozs7O0lBRUQsY0FBYyxDQUFDLEVBQVU7UUFDdkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDOUM7Ozs7O0lBRUQsY0FBYyxDQUFDLE9BQWlCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQy9DOzs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFVLEVBQUUsSUFBYTtRQUN4QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUU7WUFDNUQsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSxZQUFZO2dCQUNsQixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLElBQUk7aUJBQ1g7YUFDRjtTQUNGLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUztZQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQztTQUNiLENBQUMsQ0FBQyxDQUFDO0tBQ0w7Ozs7O0lBRUQsNkJBQTZCLENBQUMsSUFBVTtRQUN0QyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLEVBQUU7WUFDL0IsdUJBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUM1RyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSw2QkFBNkIsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLEVBQUUsQ0FBQztpQkFDaEgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVM7Z0JBQ2xCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7YUFDeEIsQ0FBQyxDQUFDLENBQUM7U0FDckI7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2Q7S0FDRjs7Ozs7OztJQUVELE1BQU0sQ0FBQyxJQUFZLEVBQUUsT0FBaUIsRUFBRSxnQkFBeUI7UUFDL0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGdCQUFnQixnQkFBZ0IsRUFBRSxFQUFFO1lBQ3ZFLElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsTUFBTTtnQkFDWixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLElBQUk7aUJBQ1g7Z0JBQ0QsYUFBYSxFQUFFO29CQUNiLEtBQUssRUFBRTt3QkFDTCxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFFO3FCQUM3RDtpQkFDRjthQUNGO1NBQ0YsRUFBRTtZQUNELE1BQU0sRUFBRTtnQkFDTixXQUFXLEVBQUUsR0FBRyxnQkFBZ0IsRUFBRTthQUNuQztTQUNGLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBYSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7OztJQUVELE1BQU0sQ0FBQyxJQUFVO1FBQ2YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFO1lBQ2pELElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsTUFBTTtnQkFDWixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2lCQUNoQjthQUNGO1NBQ0YsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFhO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQzFDLE9BQU8sSUFBSSxDQUFDO1NBQ2IsQ0FBQyxDQUFDLENBQUM7S0FDTDs7Ozs7O0lBRUQsT0FBTyxDQUFDLElBQVUsRUFBRSxNQUFjO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxFQUFFLGNBQWMsRUFBRTtZQUM5RCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLGFBQWEsRUFBRTtvQkFDYixJQUFJLEVBQUU7d0JBQ0osSUFBSSxFQUFFOzRCQUNKLElBQUksRUFBRSxNQUFNOzRCQUNaLEVBQUUsRUFBRSxNQUFNO3lCQUNYO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQWE7WUFDeEIsdUJBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUM7U0FDYixDQUFDLENBQUMsQ0FBQztLQUNMOzs7Ozs7SUFFRCxhQUFhLENBQUMsSUFBVSxFQUFFLE9BQWdCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckQ7Ozs7OztJQUVELFlBQVksQ0FBQyxJQUFVLEVBQUUsVUFBZ0Q7UUFDdkUsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztLQUN6RDs7Ozs7O0lBRUQsYUFBYSxDQUFDLElBQVUsRUFBRSxVQUFzQjtRQUM5QyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3hEOzs7WUFoSUYsVUFBVTs7OztZQVZGLFVBQVU7WUFLVixpQkFBaUI7NENBWVgsTUFBTSxTQUFDLGlCQUFpQjs7Ozs7OztBQ2pCdkMsQUFRQSx1QkFBTUEsUUFBTSxHQUFHLFlBQVksQ0FBQztBQUU1Qjs7Ozs7Ozs7O0lBYUUsWUFBcUIsRUFBVSxFQUNWLFdBQW1CLEVBQ25CLEtBQWEsRUFDdEIsa0JBQTBCLEVBQzFCLFNBQWlCLEVBQ1Q7UUFMQyxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFDbkIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUdkLG1CQUFjLEdBQWQsY0FBYztRQUNoQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxlQUFlLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0UsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksZUFBZSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUM5RDs7Ozs7O0lBbkJELE9BQU8sS0FBSyxDQUFDLElBQVMsRUFBRSxjQUE4QjtRQUNwRCx1QkFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUMvRix1QkFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDcEY7Ozs7SUFrQkQsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO0tBQzlDOzs7OztJQUVELElBQUksa0JBQWtCLENBQUMsS0FBYTtRQUNsQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzdDOzs7O0lBRUQsSUFBSSw0QkFBNEI7UUFDOUIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUM7S0FDeEM7Ozs7SUFFRCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7S0FDckM7Ozs7SUFFRCxJQUFJLG1CQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztLQUMvQjs7OztJQUVELGdCQUFnQjtRQUNkLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUs7WUFDekQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixPQUFPLEtBQUssQ0FBQztTQUNkLENBQUMsQ0FBQyxDQUFDO0tBQ0w7Ozs7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLO1lBQ3pELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckIsT0FBTyxLQUFLLENBQUM7U0FDZCxDQUFDLENBQUMsQ0FBQztLQUNMOzs7O0lBRUQsY0FBYztRQUNaLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLO2dCQUM3RSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixPQUFPLEtBQUssQ0FBQzthQUNkLENBQUMsQ0FBQyxDQUFDO1NBQ0w7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2Y7S0FDRjs7Ozs7SUFFRCxjQUFjLENBQUMsT0FBaUI7UUFDOUIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUs7WUFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixPQUFPLEtBQUssQ0FBQztTQUNkLENBQUMsQ0FBQyxDQUFDO0tBQ0w7Ozs7O0lBRUQsYUFBYSxDQUFDLE1BQWM7UUFDMUIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUk7WUFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiLENBQUMsQ0FBQyxDQUFDO0tBQ0w7Ozs7O0lBRUQsbUJBQW1CLENBQUMsTUFBYztRQUNoQyx1QkFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLE1BQU0sRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pCO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkM7S0FDRjs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxVQUFtQjtRQUNsQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQzthQUN0QyxTQUFTLENBQUMsSUFBSTtZQUNiLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUNwQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ2QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7cUJBQ3ZEO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7S0FDUjs7Ozs7SUFFRCxPQUFPLENBQUMsT0FBYTtRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSUEsUUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDcEcsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUM7YUFDOUI7WUFFRCx1QkFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuRixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7YUFDakM7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDMUI7U0FDRjtLQUNGOzs7OztJQUVELFlBQVksQ0FBQyxNQUFjO1FBQ3pCLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ2hFOzs7OztJQUVELFFBQVEsQ0FBQyxJQUFVO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzdCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRTtpQkFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQWdCO2dCQUM3QixJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2RCxDQUFDLENBQUMsQ0FBQztTQUNoQjthQUFNO1lBQ0wsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakI7S0FDRjs7Ozs7SUFFRCxTQUFTLENBQUMsSUFBVTtRQUNsQixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFO2lCQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVU7Z0JBQ2pCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxVQUFVLENBQUM7YUFDbkIsQ0FBQyxDQUFDLENBQUM7U0FDakI7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pCO0tBQ0Y7Ozs7O0lBRUQsVUFBVSxDQUFDLFlBQW9CO1FBQzdCLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FDMUIsR0FBRyxDQUFDLEtBQUs7WUFDUCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUMsT0FBTyxLQUFLLENBQUM7U0FDZCxDQUFDLENBQ0gsQ0FBQztLQUNIOzs7OztJQUVELHNCQUFzQixDQUFDLFVBQWdCO1FBQ3JDLHVCQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkYsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzNGOzs7O0lBRUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7O0lBRUQsVUFBVSxDQUFDLElBQVksRUFBRSxPQUFpQixFQUFFLGdCQUF5QjtRQUNuRSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLENBQUM7YUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJO1lBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiLENBQUMsQ0FBQyxDQUFDO0tBQy9COzs7OztJQUVELFNBQVMsQ0FBQyxPQUFpQjtRQUN6Qix1QkFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsdUJBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNyQix1QkFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLHVCQUFNLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDMUIsdUJBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUN2Qix1QkFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUNsQixTQUFTLEVBQ1QsU0FBUyxFQUNULElBQUksRUFDSixlQUFlLEVBQ2YsS0FBSyxFQUNMLFNBQVMsRUFDVCxTQUFTLEVBQ1QsU0FBUyxFQUNULElBQUksQ0FBQyxjQUFjLENBQ25CLENBQUM7S0FDSjs7Ozs7OztJQUVELFdBQVcsQ0FBQyxJQUFVLEVBQUUsT0FBZSxFQUFFLFdBQW1CO1FBQzFELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUN0QixPQUFPLEVBQUUsT0FBTztZQUNoQixXQUFXLEVBQUUsV0FBVztZQUN4QixlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7U0FDdEMsQ0FBQyxDQUFDO0tBQ0o7Ozs7O0lBRUQsVUFBVSxDQUFDLE9BQWdCO1FBQ3pCLE9BQU8sT0FBTyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ2hEOzs7OztJQUVELGFBQWEsQ0FBQyxPQUFnQjtRQUM1QixJQUFJLE9BQU8sRUFBRTtZQUNYLHVCQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQyxJQUFJLElBQUksRUFBRTtnQkFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7aUJBQU07Z0JBQ0wsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDdEI7U0FDRjthQUFNO1lBQ0wsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEI7S0FDRjs7Ozs7O0lBRUQsU0FBUyxDQUFDLElBQVUsRUFBRSxNQUFjO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ2xEOzs7OztJQUVPLFFBQVEsQ0FBQyxLQUFhO1FBQzVCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdCO1NBQ0YsQ0FBQyxDQUFDOzs7Ozs7SUFHRyxPQUFPLENBQUMsVUFBZ0I7UUFDOUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLFNBQVMsQ0FBQzs7Ozs7O0lBR3pDLGFBQWEsQ0FBQyxVQUFnQjtRQUNwQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxDQUFDOzs7Ozs7SUFHL0MsUUFBUSxDQUFDLElBQVU7UUFDekIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Ozs7O0lBRzVCLGNBQWMsQ0FBQyxVQUFnQjtRQUNyQyxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksVUFBVSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Ozs7OztJQUd0RSxlQUFlLENBQUMsSUFBVTtRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3Qjs7Ozs7O0lBR0ssb0JBQW9CLENBQUMsVUFBZ0I7UUFDM0MsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xDLHVCQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN2Qzs7Ozs7O0lBR0ssNkJBQTZCLENBQUMsSUFBVTtRQUM5QyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsRUFBRTthQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtZQUN2QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEYsT0FBTyxJQUFJLENBQUM7U0FDYixDQUFDLENBQUMsQ0FBQzs7Ozs7SUFHVixNQUFNO1FBQ1osT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztDQUVoQzs7Ozs7O0FDN1JEOzs7Ozs7SUFjRSxZQUFvQixJQUFnQixFQUNoQixnQkFDbUIsYUFBK0I7UUFGbEQsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixtQkFBYyxHQUFkLGNBQWM7UUFFaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLGFBQWEsQ0FBQyxNQUFNLE9BQU8sQ0FBQztRQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sUUFBUSxDQUFDO0tBQ3pDOzs7O0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkY7Ozs7O0lBRUQsZUFBZSxDQUFDLEVBQU07UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFDLENBQUM7YUFDOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNuRTs7O1lBcEJGLFVBQVU7Ozs7WUFSRixVQUFVO1lBS1YsY0FBYzs0Q0FXUixNQUFNLFNBQUMsaUJBQWlCOzs7Ozs7O0FDaEJ2Qzs7OztJQVlFLFlBQStDLGFBQStCO1FBQS9CLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtLQUFJOzs7OztJQUVsRixPQUFPLENBQUMsS0FBYTtRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHQyxPQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUU7WUFDckQsUUFBUSxFQUFFLElBQUk7WUFDZCxLQUFLLEVBQUUsU0FBUyxLQUFLLEVBQUU7U0FDeEIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7O0lBRUQsWUFBWTtRQUNWLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUM7S0FDbEM7Ozs7SUFFRCxVQUFVO1FBQ1IsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztTQUN6QjtLQUNGOzs7WUF4QkYsVUFBVTs7Ozs0Q0FLSSxNQUFNLFNBQUMsaUJBQWlCOzs7Ozs7O0FDWHZDOzs7Ozs7O0lBaUJFLFlBQW9CLFlBQTBCLEVBQzFCLGNBQzJCLGFBQStCLEVBQzFEO1FBSEEsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsaUJBQVksR0FBWixZQUFZO1FBQ2Usa0JBQWEsR0FBYixhQUFhLENBQWtCO1FBQzFELHVCQUFrQixHQUFsQixrQkFBa0I7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7Ozs7O0lBRUQsS0FBSyxDQUFDLEtBQWE7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUM1QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztTQUMxQztLQUNGOzs7O0lBRUQsRUFBRTtRQUNBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWTtpQkFDWixNQUFNLEVBQUU7aUJBQ1IsSUFBSSxDQUNILEdBQUcsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3JDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFDaEIsUUFBUSxFQUFFLEVBQ1YsS0FBSyxFQUFFLENBQ1IsQ0FBQztTQUN2QjtRQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM5RDs7OztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7Ozs7O0lBRU8saUJBQWlCLENBQUMsRUFBTTtRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQ2pELFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FDNUI7YUFDQSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sRUFBRSxDQUFDOzs7OztJQUdKLFdBQVc7UUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQzs7Ozs7O0lBRzdCLGFBQWEsQ0FBQyxFQUFNO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3JDLHVCQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMzRTtRQUNELE9BQU8sRUFBRSxDQUFDOzs7Ozs7SUFHSixpQkFBaUIsQ0FBQyxJQUFTO1FBQ2pDLHVCQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7OztZQS9EM0QsVUFBVTs7OztZQUhGLFlBQVk7WUFEWixlQUFlOzRDQVlULE1BQU0sU0FBQyxpQkFBaUI7WUFmOUIsa0JBQWtCOzs7Ozs7O0FDTDNCOzs7OztJQXFCRSxPQUFPLE9BQU8sQ0FBQyxnQkFBa0M7UUFDL0MsT0FBTztZQUNMLFFBQVEsRUFBRSxZQUFZO1lBQ3RCLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixRQUFRLEVBQUUsZ0JBQWdCO2lCQUMzQjtnQkFDRCxZQUFZO2dCQUNaLGtCQUFrQjtnQkFDbEIsZUFBZTtnQkFDZjtvQkFDRSxPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixRQUFRLEVBQUUsNkJBQTZCO29CQUN2QyxLQUFLLEVBQUUsSUFBSTtpQkFDWjtnQkFDRCxpQkFBaUI7Z0JBQ2pCLGNBQWM7Z0JBQ2QsWUFBWTtnQkFDWixTQUFTO2FBQ1Y7U0FDRixDQUFDO0tBQ0g7OztZQS9CRixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLGdCQUFnQjtpQkFDakI7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLFlBQVk7aUJBQ2I7YUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9