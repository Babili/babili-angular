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
var TokenConfiguration = /** @class */ (function () {
    function TokenConfiguration() {
    }
    /**
     * @return {?}
     */
    TokenConfiguration.prototype.isApiTokenSet = /**
     * @return {?}
     */
    function () {
        return this.apiToken !== undefined && this.apiToken !== null && this.apiToken !== "";
    };
    /**
     * @return {?}
     */
    TokenConfiguration.prototype.clear = /**
     * @return {?}
     */
    function () {
        this.apiToken = undefined;
    };
    TokenConfiguration.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    TokenConfiguration.ctorParameters = function () { return []; };
    return TokenConfiguration;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var /** @type {?} */ URL_CONFIGURATION = new InjectionToken("BabiliUrlConfiguration");

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var NotAuthorizedError = /** @class */ (function () {
    function NotAuthorizedError(error) {
        this.error = error;
    }
    return NotAuthorizedError;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var HttpAuthenticationInterceptor = /** @class */ (function () {
    function HttpAuthenticationInterceptor(urls, tokenConfiguration) {
        this.urls = urls;
        this.tokenConfiguration = tokenConfiguration;
    }
    /**
     * @param {?} request
     * @param {?} next
     * @return {?}
     */
    HttpAuthenticationInterceptor.prototype.intercept = /**
     * @param {?} request
     * @param {?} next
     * @return {?}
     */
    function (request, next) {
        if (this.shouldAddHeaderTo(request)) {
            return next.handle(this.addHeaderTo(request, this.tokenConfiguration.apiToken))
                .pipe(catchError(function (error) {
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
    };
    /**
     * @param {?} request
     * @param {?} token
     * @return {?}
     */
    HttpAuthenticationInterceptor.prototype.addHeaderTo = /**
     * @param {?} request
     * @param {?} token
     * @return {?}
     */
    function (request, token) {
        return request.clone({
            headers: request.headers.set("Authorization", "Bearer " + token)
        });
    };
    /**
     * @param {?} request
     * @return {?}
     */
    HttpAuthenticationInterceptor.prototype.shouldAddHeaderTo = /**
     * @param {?} request
     * @return {?}
     */
    function (request) {
        return request.url.startsWith(this.urls.apiUrl);
    };
    HttpAuthenticationInterceptor.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    HttpAuthenticationInterceptor.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] },
        { type: TokenConfiguration }
    ]; };
    return HttpAuthenticationInterceptor;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var User = /** @class */ (function () {
    function User(id, status) {
        this.id = id;
        this.status = status;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    User.build = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        if (json) {
            return new User(json.id, json.attributes ? json.attributes.status : undefined);
        }
        else {
            return undefined;
        }
    };
    /**
     * @param {?} json
     * @return {?}
     */
    User.map = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        if (json) {
            return json.map(User.build);
        }
        else {
            return undefined;
        }
    };
    return User;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var /** @type {?} */ moment = momentLoaded;
var Message = /** @class */ (function () {
    function Message(id, content, contentType, createdAt, sender, roomId) {
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
    Message.build = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        var /** @type {?} */ attributes = json.attributes;
        return new Message(json.id, attributes.content, attributes.contentType, moment(attributes.createdAt).toDate(), json.relationships.sender ? User.build(json.relationships.sender.data) : undefined, json.relationships.room.data.id);
    };
    /**
     * @param {?} json
     * @return {?}
     */
    Message.map = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        if (json) {
            return json.map(Message.build);
        }
        else {
            return undefined;
        }
    };
    /**
     * @param {?} userId
     * @return {?}
     */
    Message.prototype.hasSenderId = /**
     * @param {?} userId
     * @return {?}
     */
    function (userId) {
        return this.sender && this.sender.id === userId;
    };
    return Message;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var MessageRepository = /** @class */ (function () {
    function MessageRepository(http, configuration) {
        this.http = http;
        this.roomUrl = configuration.apiUrl + "/user/rooms";
    }
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    MessageRepository.prototype.create = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.http.post(this.messageUrl(room.id), {
            data: {
                type: "message",
                attributes: attributes
            }
        }).pipe(map(function (response) { return Message.build(response.data); }));
    };
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    MessageRepository.prototype.findAll = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.http.get(this.messageUrl(room.id), { params: attributes })
            .pipe(map(function (response) { return Message.map(response.data); }));
    };
    /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    MessageRepository.prototype.delete = /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    function (room, message) {
        return this.http.delete(this.messageUrl(room.id) + "/" + message.id)
            .pipe(map(function (response) { return message; }));
    };
    /**
     * @param {?} roomId
     * @return {?}
     */
    MessageRepository.prototype.messageUrl = /**
     * @param {?} roomId
     * @return {?}
     */
    function (roomId) {
        return this.roomUrl + "/" + roomId + "/messages";
    };
    MessageRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MessageRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
    ]; };
    return MessageRepository;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var /** @type {?} */ moment$1 = momentLoaded;
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
        return new Room(json.id, attributes.name, attributes.lastActivityAt ? moment$1(attributes.lastActivityAt).utc().toDate() : undefined, attributes.open, attributes.unreadMessageCount, users, senders, messages, initiator, roomRepository);
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var RoomRepository = /** @class */ (function () {
    function RoomRepository(http, messageRepository, configuration) {
        this.http = http;
        this.messageRepository = messageRepository;
        this.roomUrl = configuration.apiUrl + "/user/rooms";
    }
    /**
     * @param {?} id
     * @return {?}
     */
    RoomRepository.prototype.find = /**
     * @param {?} id
     * @return {?}
     */
    function (id) {
        var _this = this;
        return this.http.get(this.roomUrl + "/" + id)
            .pipe(map(function (json) { return Room.build(json.data, _this, _this.messageRepository); }));
    };
    /**
     * @param {?} query
     * @return {?}
     */
    RoomRepository.prototype.findAll = /**
     * @param {?} query
     * @return {?}
     */
    function (query) {
        var _this = this;
        return this.http.get(this.roomUrl, { params: query })
            .pipe(map(function (json) { return Room.map(json.data, _this, _this.messageRepository); }));
    };
    /**
     * @return {?}
     */
    RoomRepository.prototype.findOpenedRooms = /**
     * @return {?}
     */
    function () {
        return this.findAll({ onlyOpened: "true" });
    };
    /**
     * @return {?}
     */
    RoomRepository.prototype.findClosedRooms = /**
     * @return {?}
     */
    function () {
        return this.findAll({ onlyClosed: "true" });
    };
    /**
     * @param {?} id
     * @return {?}
     */
    RoomRepository.prototype.findRoomsAfter = /**
     * @param {?} id
     * @return {?}
     */
    function (id) {
        return this.findAll({ firstSeenRoomId: id });
    };
    /**
     * @param {?} roomIds
     * @return {?}
     */
    RoomRepository.prototype.findRoomsByIds = /**
     * @param {?} roomIds
     * @return {?}
     */
    function (roomIds) {
        return this.findAll({ "roomIds[]": roomIds });
    };
    /**
     * @param {?} room
     * @param {?} open
     * @return {?}
     */
    RoomRepository.prototype.updateMembership = /**
     * @param {?} room
     * @param {?} open
     * @return {?}
     */
    function (room, open) {
        return this.http.put(this.roomUrl + "/" + room.id + "/membership", {
            data: {
                type: "membership",
                attributes: {
                    open: open
                }
            }
        }).pipe(map(function (data) {
            room.open = data.data.attributes.open;
            return room;
        }));
    };
    /**
     * @param {?} room
     * @return {?}
     */
    RoomRepository.prototype.markAllReceivedMessagesAsRead = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        if (room.unreadMessageCount > 0) {
            var /** @type {?} */ lastReadMessageId = room.messages.length > 0 ? room.messages[room.messages.length - 1].id : undefined;
            return this.http.put(this.roomUrl + "/" + room.id + "/membership/unread-messages", { data: { lastReadMessageId: lastReadMessageId } })
                .pipe(map(function (data) {
                room.unreadMessageCount = 0;
                return data.meta.count;
            }));
        }
        else {
            return of(0);
        }
    };
    /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    RoomRepository.prototype.create = /**
     * @param {?} name
     * @param {?} userIds
     * @param {?} withoutDuplicate
     * @return {?}
     */
    function (name, userIds, withoutDuplicate) {
        var _this = this;
        return this.http.post(this.roomUrl + "?noDuplicate=" + withoutDuplicate, {
            data: {
                type: "room",
                attributes: {
                    name: name
                },
                relationships: {
                    users: {
                        data: userIds.map(function (userId) { return ({ type: "user", id: userId }); })
                    }
                }
            }
        }, {
            params: {
                noDuplicate: "" + withoutDuplicate
            }
        }).pipe(map(function (response) { return Room.build(response.data, _this, _this.messageRepository); }));
    };
    /**
     * @param {?} room
     * @return {?}
     */
    RoomRepository.prototype.update = /**
     * @param {?} room
     * @return {?}
     */
    function (room) {
        return this.http.put(this.roomUrl + "/" + room.id, {
            data: {
                type: "room",
                attributes: {
                    name: room.name
                }
            }
        }).pipe(map(function (response) {
            room.name = response.data.attributes.name;
            return room;
        }));
    };
    /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    RoomRepository.prototype.addUser = /**
     * @param {?} room
     * @param {?} userId
     * @return {?}
     */
    function (room, userId) {
        return this.http.post(this.roomUrl + "/" + room.id + "/memberships", {
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
        }).pipe(map(function (response) {
            var /** @type {?} */ newUser = User.build(response.data.relationships.user.data);
            room.addUser(newUser);
            return room;
        }));
    };
    /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    RoomRepository.prototype.deleteMessage = /**
     * @param {?} room
     * @param {?} message
     * @return {?}
     */
    function (room, message) {
        return this.messageRepository.delete(room, message);
    };
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    RoomRepository.prototype.findMessages = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.messageRepository.findAll(room, attributes);
    };
    /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    RoomRepository.prototype.createMessage = /**
     * @param {?} room
     * @param {?} attributes
     * @return {?}
     */
    function (room, attributes) {
        return this.messageRepository.create(room, attributes);
    };
    RoomRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    RoomRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: MessageRepository },
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
    ]; };
    return RoomRepository;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var /** @type {?} */ moment$2 = momentLoaded;
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
            if (!this.firstSeenRoom || moment$2(this.firstSeenRoom.lastActivityAt).isAfter(newRoom.lastActivityAt)) {
                this.firstSeenRoom = newRoom;
            }
            var /** @type {?} */ roomIndex = this.rooms ? this.rooms.findIndex(function (room) { return room.id === newRoom.id; }) : -1;
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
        return this.rooms ? this.rooms.find(function (room) { return roomId === room.id; }) : undefined;
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
        return this.openedRooms ? this.openedRooms.find(function (room) { return roomToFind.id === room.id; }) : undefined;
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
            var /** @type {?} */ roomIndex = this.openedRooms ? this.openedRooms.findIndex(function (room) { return room.id === closedRoom.id; }) : undefined;
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var MeRepository = /** @class */ (function () {
    function MeRepository(http, roomRepository, configuration) {
        this.http = http;
        this.roomRepository = roomRepository;
        this.userUrl = configuration.apiUrl + "/user";
        this.aliveUrl = this.userUrl + "/alive";
    }
    /**
     * @return {?}
     */
    MeRepository.prototype.findMe = /**
     * @return {?}
     */
    function () {
        var _this = this;
        return this.http.get(this.userUrl).pipe(map(function (me) { return Me.build(me, _this.roomRepository); }));
    };
    /**
     * @param {?} me
     * @return {?}
     */
    MeRepository.prototype.updateAliveness = /**
     * @param {?} me
     * @return {?}
     */
    function (me) {
        return this.http.put(this.aliveUrl, { data: { type: "alive" } })
            .pipe(catchError(function () { return empty(); }), map(function () { return null; }));
    };
    MeRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MeRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: RoomRepository },
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
    ]; };
    return MeRepository;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var BootstrapSocket = /** @class */ (function () {
    function BootstrapSocket(configuration) {
        this.configuration = configuration;
    }
    /**
     * @param {?} token
     * @return {?}
     */
    BootstrapSocket.prototype.connect = /**
     * @param {?} token
     * @return {?}
     */
    function (token) {
        this.socket = connect(this.configuration.socketUrl, {
            forceNew: true,
            query: "token=" + token
        });
        return this.socket;
    };
    /**
     * @return {?}
     */
    BootstrapSocket.prototype.socketExists = /**
     * @return {?}
     */
    function () {
        return this.socket !== undefined;
    };
    /**
     * @return {?}
     */
    BootstrapSocket.prototype.disconnect = /**
     * @return {?}
     */
    function () {
        if (this.socketExists()) {
            this.socket.close();
            this.socket = undefined;
        }
    };
    BootstrapSocket.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    BootstrapSocket.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] }
    ]; };
    return BootstrapSocket;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var MeService = /** @class */ (function () {
    function MeService(meRepository, socketClient, configuration, tokenConfiguration) {
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
    MeService.prototype.setup = /**
     * @param {?} token
     * @return {?}
     */
    function (token) {
        if (!this.tokenConfiguration.isApiTokenSet()) {
            this.tokenConfiguration.apiToken = token;
        }
    };
    /**
     * @return {?}
     */
    MeService.prototype.me = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this.hasCachedMe()) {
            this.cachedMe = this.meRepository
                .findMe()
                .pipe(map(function (me) { return _this.scheduleAliveness(me); }), publishReplay(1), refCount(), share());
        }
        return this.cachedMe.pipe(map(function (me) { return _this.connectSocket(me); }));
    };
    /**
     * @return {?}
     */
    MeService.prototype.clear = /**
     * @return {?}
     */
    function () {
        this.tokenConfiguration.clear();
        this.cachedMe = undefined;
        this.alive = false;
    };
    /**
     * @param {?} me
     * @return {?}
     */
    MeService.prototype.scheduleAliveness = /**
     * @param {?} me
     * @return {?}
     */
    function (me) {
        var _this = this;
        this.alive = true;
        timer(0, this.configuration.aliveIntervalInMs).pipe(takeWhile(function () { return _this.alive; }))
            .subscribe(function () { return _this.meRepository.updateAliveness(me); });
        return me;
    };
    /**
     * @return {?}
     */
    MeService.prototype.hasCachedMe = /**
     * @return {?}
     */
    function () {
        return this.cachedMe !== undefined;
    };
    /**
     * @param {?} me
     * @return {?}
     */
    MeService.prototype.connectSocket = /**
     * @param {?} me
     * @return {?}
     */
    function (me) {
        var _this = this;
        if (!this.socketClient.socketExists()) {
            var /** @type {?} */ socket = this.socketClient.connect(this.tokenConfiguration.apiToken);
            socket.on("new message", function (data) { return _this.receiveNewMessage(data); });
            socket.on("connected", function (data) { return me.deviceSessionId = data.deviceSessionId; });
        }
        return me;
    };
    /**
     * @param {?} json
     * @return {?}
     */
    MeService.prototype.receiveNewMessage = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        var /** @type {?} */ message = Message.build(json.data);
        this.me().subscribe(function (me) { return me.handleNewMessage(message); });
    };
    MeService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MeService.ctorParameters = function () { return [
        { type: MeRepository },
        { type: BootstrapSocket },
        { type: undefined, decorators: [{ type: Inject, args: [URL_CONFIGURATION,] }] },
        { type: TokenConfiguration }
    ]; };
    return MeService;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var /** @type {?} */ moment$3 = momentLoaded;
var SortRoomPipe = /** @class */ (function () {
    function SortRoomPipe() {
    }
    /**
     * @param {?} rooms
     * @param {?} field
     * @return {?}
     */
    SortRoomPipe.prototype.transform = /**
     * @param {?} rooms
     * @param {?} field
     * @return {?}
     */
    function (rooms, field) {
        if (rooms !== undefined && rooms !== null) {
            return rooms.sort(function (room, otherRoom) {
                var /** @type {?} */ lastActivityAt = room.lastActivityAt;
                var /** @type {?} */ otherLastActivityAt = otherRoom.lastActivityAt;
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
    };
    SortRoomPipe.decorators = [
        { type: Pipe, args: [{
                    name: "sortRooms"
                },] },
    ];
    return SortRoomPipe;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var BabiliModule = /** @class */ (function () {
    function BabiliModule() {
    }
    /**
     * @param {?} urlConfiguration
     * @return {?}
     */
    BabiliModule.forRoot = /**
     * @param {?} urlConfiguration
     * @return {?}
     */
    function (urlConfiguration) {
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
    };
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
    return BabiliModule;
}());

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vbm90LWF1dGhvcml6ZWQtZXJyb3IudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvdXNlci91c2VyLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20ucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3NvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUuc2VydmljZS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3BpcGUvc29ydC1yb29tLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYmFiaWxpLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRva2VuQ29uZmlndXJhdGlvbiB7XG4gIHB1YmxpYyBhcGlUb2tlbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBpc0FwaVRva2VuU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFwaVRva2VuICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hcGlUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmFwaVRva2VuICE9PSBcIlwiO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5hcGlUb2tlbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmV4cG9ydCBjb25zdCBVUkxfQ09ORklHVVJBVElPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxCYWJpbGlVcmxDb25maWd1cmF0aW9uPihcIkJhYmlsaVVybENvbmZpZ3VyYXRpb25cIik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiB7XG4gIGFwaVVybDogc3RyaW5nO1xuICBzb2NrZXRVcmw6IHN0cmluZztcbiAgYWxpdmVJbnRlcnZhbEluTXM/OiBudW1iZXI7XG59XG4iLCJleHBvcnQgY2xhc3MgTm90QXV0aG9yaXplZEVycm9yIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgZXJyb3I6IGFueSkge31cbn1cbiIsImltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBIYW5kbGVyLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBSZXF1ZXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGhyb3dFcnJvciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yIH0gZnJvbSBcIi4vbm90LWF1dGhvcml6ZWQtZXJyb3JcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIHVybHM6IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgaW50ZXJjZXB0KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLnNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUodGhpcy5hZGRIZWFkZXJUbyhyZXF1ZXN0LCB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbikpXG4gICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGVycm9yLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgTm90QXV0aG9yaXplZEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgdG9rZW46IHN0cmluZyk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIHJldHVybiByZXF1ZXN0LmNsb25lKHtcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycy5zZXQoXCJBdXRob3JpemF0aW9uXCIsIGBCZWFyZXIgJHt0b2tlbn1gKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJlcXVlc3QudXJsLnN0YXJ0c1dpdGgodGhpcy51cmxzLmFwaVVybCk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBVc2VyIHtcbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IFVzZXIge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4gbmV3IFVzZXIoanNvbi5pZCwganNvbi5hdHRyaWJ1dGVzID8ganNvbi5hdHRyaWJ1dGVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBVc2VyW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoVXNlci5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc3RhdHVzOiBzdHJpbmcpIHt9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgcmV0dXJuIG5ldyBNZXNzYWdlKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50KGF0dHJpYnV0ZXMuY3JlYXRlZEF0KS50b0RhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIuZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMucm9vbS5kYXRhLmlkKTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogTWVzc2FnZVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKE1lc3NhZ2UuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY3JlYXRlZEF0OiBEYXRlLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXI6IFVzZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21JZDogc3RyaW5nKSB7fVxuXG4gIGhhc1NlbmRlcklkKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZGVyICYmIHRoaXMuc2VuZGVyLmlkID09PSB1c2VySWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBOZXdNZXNzYWdlIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZW50VHlwZTogc3RyaW5nO1xuICBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VSZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHJvb21Vcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnJvb21VcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cblxuICBjcmVhdGUocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5idWlsZChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZmluZEFsbChyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwgeyBwYXJhbXM6IGF0dHJpYnV0ZXMgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLm1hcChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZGVsZXRlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCl9LyR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocmVzcG9uc2UgPT4gbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBtZXNzYWdlVXJsKHJvb21JZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucm9vbVVybH0vJHtyb29tSWR9L21lc3NhZ2VzYDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20ucmVwb3NpdG9yeVwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5leHBvcnQgY2xhc3MgUm9vbSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIGNvbnN0IHVzZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy51c2VycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy51c2Vycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IHNlbmRlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcyA/IE1lc3NhZ2UubWFwKGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yLmRhdGEpIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBuZXcgUm9vbShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQgPyBtb21lbnQoYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCkudXRjKCkudG9EYXRlKCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy51bnJlYWRNZXNzYWdlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJzLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXJzLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdG9yLFxuICAgICAgICAgICAgICAgICAgICByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAocm9vbSA9PiBSb29tLmJ1aWxkKHJvb20sIHJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIG5ld01lc3NhZ2VOb3RpZmllcjogKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGFueTtcbiAgcHJpdmF0ZSBpbnRlcm5hbE9wZW46IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxOYW1lOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbExhc3RBY3Rpdml0eUF0OiBCZWhhdmlvclN1YmplY3Q8RGF0ZT47XG4gIHByaXZhdGUgaW50ZXJuYWxJbWFnZVVybDogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBsYXN0QWN0aXZpdHlBdDogRGF0ZSxcbiAgICAgICAgICAgICAgb3BlbjogYm9vbGVhbixcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHVzZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgbWVzc2FnZXM6IE1lc3NhZ2VbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgaW5pdGlhdG9yOiBVc2VyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuID0gbmV3IEJlaGF2aW9yU3ViamVjdChvcGVuKTtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGxhc3RBY3Rpdml0eUF0KTtcbiAgICB0aGlzLmludGVybmFsTmFtZSA9IG5ldyBCZWhhdmlvclN1YmplY3QobmFtZSk7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50KTtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWUudmFsdWU7XG4gIH1cblxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsTmFtZS5uZXh0KG5hbWUpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVOYW1lKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWU7XG4gIH1cblxuICBnZXQgb3BlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW4udmFsdWU7XG4gIH1cblxuICBzZXQgb3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4ubmV4dChvcGVuKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlT3BlbigpOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3BlbjtcbiAgfVxuXG4gIGdldCBsYXN0QWN0aXZpdHlBdCgpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0LnZhbHVlO1xuICB9XG5cbiAgc2V0IGxhc3RBY3Rpdml0eUF0KGxhc3RBY3Rpdml0eUF0OiBEYXRlKSB7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0Lm5leHQobGFzdEFjdGl2aXR5QXQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVMYXN0QWN0aXZpdHlBdCgpOiBCZWhhdmlvclN1YmplY3Q8RGF0ZT4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQ7XG4gIH1cblxuICBnZXQgaW1hZ2VVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsLnZhbHVlO1xuICB9XG5cbiAgc2V0IGltYWdlVXJsKGltYWdlVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwubmV4dChpbWFnZVVybCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUltYWdlVXJsKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsO1xuICB9XG5cblxuICBvcGVuTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIHRydWUpO1xuICB9XG5cbiAgY2xvc2VNZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgZmFsc2UpO1xuICB9XG5cbiAgbWFya0FsbE1lc3NhZ2VzQXNSZWFkKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkubWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQodGhpcyk7XG4gIH1cblxuICBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHlBdCA9IG1lc3NhZ2UuY3JlYXRlZEF0O1xuICB9XG5cbiAgbm90aWZ5TmV3TWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyKSB7XG4gICAgICB0aGlzLm5ld01lc3NhZ2VOb3RpZmllci5hcHBseShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuXG4gIGhhc1VzZXIodXNlcklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy51c2VycyAmJiB0aGlzLnVzZXJzLnNvbWUodXNlciA9PiB1c2VyLmlkICA9PT0gdXNlcklkKTtcbiAgfVxuXG4gIGZldGNoTW9yZU1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBmaXJzdFNlZW5NZXNzYWdlSWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCA/IHRoaXMubWVzc2FnZXNbMF0uaWQgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZmluZE1lc3NhZ2VzKHRoaXMsIHBhcmFtcylcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgbWFwKG1lc3NhZ2VzID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0LmFwcGx5KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2VzKTtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VXaXRoSWQoaWQ6IHN0cmluZyk6IE1lc3NhZ2Uge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kKG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgdXBkYXRlKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKG5ld01lc3NhZ2U6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmNyZWF0ZU1lc3NhZ2UodGhpcywgbmV3TWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICBtYXAobWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgKTtcbiAgfVxuXG4gIHJlbW92ZU1lc3NhZ2UobWVzc2FnZVRvRGVsZXRlOiBNZXNzYWdlKTogTWVzc2FnZSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kSW5kZXgobWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBtZXNzYWdlVG9EZWxldGUuaWQpIDogLTE7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VUb0RlbGV0ZTtcbiAgfVxuXG4gIGRlbGV0ZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5kZWxldGVNZXNzYWdlKHRoaXMsIG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShtYXAoZGVsZXRlZE1lc3NhZ2UgPT4gdGhpcy5yZW1vdmVNZXNzYWdlKGRlbGV0ZWRNZXNzYWdlKSkpO1xuICB9XG5cbiAgcmVwbGFjZVVzZXJzV2l0aChyb29tOiBSb29tKTogUm9vbSB7XG4gICAgdGhpcy51c2Vycy5zcGxpY2UoMCwgdGhpcy51c2Vycy5sZW5ndGgpO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMudXNlcnMsIHJvb20udXNlcnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkVXNlcih1c2VyOiBVc2VyKSB7XG4gICAgaWYgKCF0aGlzLmhhc1VzZXIodXNlci5pZCkpIHtcbiAgICAgIHRoaXMudXNlcnMucHVzaCh1c2VyKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuL3Jvb20udHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvb21SZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHJvb21Vcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5yb29tVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG5cbiAgZmluZChpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQoYCR7dGhpcy5yb29tVXJsfS8ke2lkfWApXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLmJ1aWxkKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocXVlcnk6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIH0pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMucm9vbVVybCwgeyBwYXJhbXM6IHF1ZXJ5IH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLm1hcChqc29uLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICBmaW5kT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seU9wZW5lZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seUNsb3NlZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kUm9vbXNBZnRlcihpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgZmlyc3RTZWVuUm9vbUlkOiBpZCB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0J5SWRzKHJvb21JZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IFwicm9vbUlkc1tdXCI6IHJvb21JZHMgfSk7XG4gIH1cblxuICB1cGRhdGVNZW1iZXJzaGlwKHJvb206IFJvb20sIG9wZW46IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcGAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBvcGVuOiBvcGVuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICByb29tLm9wZW4gPSBkYXRhLmRhdGEuYXR0cmlidXRlcy5vcGVuO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgaWYgKHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID4gMCkge1xuICAgICAgY29uc3QgbGFzdFJlYWRNZXNzYWdlSWQgPSByb29tLm1lc3NhZ2VzLmxlbmd0aCA+IDAgPyByb29tLm1lc3NhZ2VzW3Jvb20ubWVzc2FnZXMubGVuZ3RoIC0gMV0uaWQgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcC91bnJlYWQtbWVzc2FnZXNgLCB7IGRhdGE6IHsgbGFzdFJlYWRNZXNzYWdlSWQ6IGxhc3RSZWFkTWVzc2FnZUlkIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEubWV0YS5jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZigwKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGUobmFtZTogc3RyaW5nLCB1c2VySWRzOiBzdHJpbmdbXSwgd2l0aG91dER1cGxpY2F0ZTogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdChgJHt0aGlzLnJvb21Vcmx9P25vRHVwbGljYXRlPSR7d2l0aG91dER1cGxpY2F0ZX1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9LFxuICAgICAgICByZWxhdGlvbnNoaXBzOiB7XG4gICAgICAgICAgdXNlcnM6IHtcbiAgICAgICAgICAgIGRhdGE6IHVzZXJJZHMubWFwKHVzZXJJZCA9PiAoeyB0eXBlOiBcInVzZXJcIiwgaWQ6IHVzZXJJZCB9KSApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIG5vRHVwbGljYXRlOiBgJHt3aXRob3V0RHVwbGljYXRlfWBcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gUm9vbS5idWlsZChyZXNwb25zZS5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogcm9vbS5uYW1lXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgcm9vbS5uYW1lID0gcmVzcG9uc2UuZGF0YS5hdHRyaWJ1dGVzLm5hbWU7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBhZGRVc2VyKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwc2AsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwidXNlclwiLFxuICAgICAgICAgICAgICBpZDogdXNlcklkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IG5ld1VzZXIgPSBVc2VyLmJ1aWxkKHJlc3BvbnNlLmRhdGEucmVsYXRpb25zaGlwcy51c2VyLmRhdGEpO1xuICAgICAgcm9vbS5hZGRVc2VyKG5ld1VzZXIpO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZGVsZXRlKHJvb20sIG1lc3NhZ2UpO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VzKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZmluZEFsbChyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIGNyZWF0ZU1lc3NhZ2Uocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmNyZWF0ZShyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZmxhdE1hcCwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuZXhwb3J0IGNsYXNzIE1lIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpOiBNZSB7XG4gICAgY29uc3QgdW5yZWFkTWVzc2FnZUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEudW5yZWFkTWVzc2FnZUNvdW50IDogMDtcbiAgICBjb25zdCByb29tQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS5yb29tQ291bnQgOiAwO1xuICAgIHJldHVybiBuZXcgTWUoanNvbi5kYXRhLmlkLCBbXSwgW10sIHVucmVhZE1lc3NhZ2VDb3VudCwgcm9vbUNvdW50LCByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBwdWJsaWMgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsUm9vbUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBmaXJzdFNlZW5Sb29tOiBSb29tO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG9wZW5lZFJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByb29tQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQgfHwgMCk7XG4gICAgdGhpcy5pbnRlcm5hbFJvb21Db3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3Qocm9vbUNvdW50IHx8IDApO1xuICB9XG5cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IHJvb21Db3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50LnZhbHVlO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVSb29tQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50O1xuICB9XG5cbiAgZmV0Y2hPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRPcGVuZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kQ2xvc2VkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaE1vcmVSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIGlmICh0aGlzLmZpcnN0U2VlblJvb20pIHtcbiAgICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0FmdGVyKHRoaXMuZmlyc3RTZWVuUm9vbS5pZCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoW10pO1xuICAgIH1cbiAgfVxuXG4gIGZldGNoUm9vbXNCeUlkKHJvb21JZHM6IHN0cmluZ1tdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNCeUlkcyhyb29tSWRzKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZChyb29tSWQpLnBpcGUobWFwKHJvb20gPT4ge1xuICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZmluZE9yRmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChyb29tSWQpO1xuICAgIGlmIChyb29tSWQpIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hSb29tQnlJZChyb29tSWQpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU5ld01lc3NhZ2UobmV3TWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMuZmluZE9yRmV0Y2hSb29tQnlJZChuZXdNZXNzYWdlLnJvb21JZClcbiAgICAgICAgLnN1YnNjcmliZShyb29tID0+IHtcbiAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgcm9vbS5hZGRNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgcm9vbS5ub3RpZnlOZXdNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKCFuZXdNZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICBpZiAoIXJvb20ub3Blbikge1xuICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGFkZFJvb20obmV3Um9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tKG5ld1Jvb20pKSB7XG4gICAgICBpZiAoIXRoaXMuZmlyc3RTZWVuUm9vbSB8fCBtb21lbnQodGhpcy5maXJzdFNlZW5Sb29tLmxhc3RBY3Rpdml0eUF0KS5pc0FmdGVyKG5ld1Jvb20ubGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RTZWVuUm9vbSA9IG5ld1Jvb207XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMucm9vbXMgPyB0aGlzLnJvb21zLmZpbmRJbmRleChyb29tID0+IHJvb20uaWQgPT09IG5ld1Jvb20uaWQpIDogLTE7XG4gICAgICBpZiAocm9vbUluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5yb29tc1tyb29tSW5kZXhdID0gbmV3Um9vbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm9vbXMucHVzaChuZXdSb29tKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5yb29tcyA/IHRoaXMucm9vbXMuZmluZChyb29tID0+IHJvb21JZCA9PT0gcm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBvcGVuUm9vbShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLm9wZW5NZW1iZXJzaGlwKClcbiAgICAgICAgICAgICAgICAgLnBpcGUoZmxhdE1hcCgob3BlbmVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkVG9PcGVuZWRSb29tKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLmNsb3NlTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKG1hcChjbG9zZWRSb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb3NlZFJvb207XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb21zKHJvb21zVG9DbG9zZTogUm9vbVtdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gb2Yocm9vbXNUb0Nsb3NlKS5waXBlKFxuICAgICAgbWFwKHJvb21zID0+IHtcbiAgICAgICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHRoaXMuY2xvc2VSb29tKHJvb20pKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgb3BlblJvb21BbmRDbG9zZU90aGVycyhyb29tVG9PcGVuOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbXNUb0JlQ2xvc2VkID0gdGhpcy5vcGVuZWRSb29tcy5maWx0ZXIocm9vbSA9PiByb29tLmlkICE9PSByb29tVG9PcGVuLmlkKTtcbiAgICByZXR1cm4gdGhpcy5jbG9zZVJvb21zKHJvb21zVG9CZUNsb3NlZCkucGlwZShmbGF0TWFwKHJvb21zID0+IHRoaXMub3BlblJvb20ocm9vbVRvT3BlbikpKTtcbiAgfVxuXG4gIGhhc09wZW5lZFJvb21zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wZW5lZFJvb21zLmxlbmd0aCA+IDA7XG4gIH1cblxuICBjcmVhdGVSb29tKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5jcmVhdGUobmFtZSwgdXNlcklkcywgd2l0aG91dER1cGxpY2F0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIGJ1aWxkUm9vbSh1c2VySWRzOiBzdHJpbmdbXSk6IFJvb20ge1xuICAgIGNvbnN0IHVzZXJzID0gdXNlcklkcy5tYXAoaWQgPT4gbmV3IFVzZXIoaWQsIFwiXCIpKTtcbiAgICBjb25zdCBub1NlbmRlcnMgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2UgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2VVbnJlYWQgPSAwO1xuICAgIGNvbnN0IG5vSWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaW5pdGlhdG9yID0gdGhpcy50b1VzZXIoKTtcbiAgICByZXR1cm4gbmV3IFJvb20obm9JZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHRydWUsXG4gICAgICBub01lc3NhZ2VVbnJlYWQsXG4gICAgICB1c2VycyxcbiAgICAgIG5vU2VuZGVycyxcbiAgICAgIG5vTWVzc2FnZSxcbiAgICAgIGluaXRpYXRvcixcbiAgICAgIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKHJvb206IFJvb20sIGNvbnRlbnQ6IHN0cmluZywgY29udGVudFR5cGU6IHN0cmluZyk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiByb29tLnNlbmRNZXNzYWdlKHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBjb250ZW50VHlwZTogY29udGVudFR5cGUsXG4gICAgICBkZXZpY2VTZXNzaW9uSWQ6IHRoaXMuZGV2aWNlU2Vzc2lvbklkXG4gICAgfSk7XG4gIH1cblxuICBpc1NlbnRCeU1lKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbWVzc2FnZSAmJiBtZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChtZXNzYWdlLnJvb21JZCk7XG4gICAgICBpZiAocm9vbSkge1xuICAgICAgICByZXR1cm4gcm9vbS5kZWxldGUobWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgYWRkVXNlclRvKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuYWRkVXNlcihyb29tLCB1c2VySWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRSb29tcyhyb29tczogUm9vbVtdKSB7XG4gICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIGlmIChyb29tLm9wZW4gJiYgIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb20ocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb21PcGVuZWQocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tKHJvb206IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbUJ5SWQocm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZChyb29tID0+IHJvb21Ub0ZpbmQuaWQgPT09IHJvb20uaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb09wZW5lZFJvb20ocm9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tOiBSb29tKSB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChjbG9zZWRSb29tKSkge1xuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZEluZGV4KHJvb20gPT4gcm9vbS5pZCA9PT0gY2xvc2VkUm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnNwbGljZShyb29tSW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiByb29tLm1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpXG4gICAgICAgICAgICAgICAucGlwZShtYXAocmVhZE1lc3NhZ2VDb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IE1hdGgubWF4KHRoaXMudW5yZWFkTWVzc2FnZUNvdW50IC0gcmVhZE1lc3NhZ2VDb3VudCwgMCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIHRvVXNlcigpOiBVc2VyIHtcbiAgICByZXR1cm4gbmV3IFVzZXIodGhpcy5pZCwgXCJcIik7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGVtcHR5IH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi8uLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVSZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHVzZXJVcmw6IHN0cmluZztcbiAgcHJpdmF0ZSBhbGl2ZVVybDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnVzZXJVcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlcmA7XG4gICAgdGhpcy5hbGl2ZVVybCA9IGAke3RoaXMudXNlclVybH0vYWxpdmVgO1xuICB9XG5cbiAgZmluZE1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLnVzZXJVcmwpLnBpcGUobWFwKG1lID0+IE1lLmJ1aWxkKG1lLCB0aGlzLnJvb21SZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlQWxpdmVuZXNzKG1lOiBNZSk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHRoaXMuYWxpdmVVcmwsIHsgZGF0YTogeyB0eXBlOiBcImFsaXZlXCIgfX0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoKCkgPT4gZW1wdHkoKSksIG1hcCgoKSA9PiBudWxsKSk7XG4gIH1cbn1cblxuIiwiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIGlvIGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcblxuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCb290c3RyYXBTb2NrZXQge1xuXG4gIHByaXZhdGUgc29ja2V0OiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKSB7fVxuXG4gIGNvbm5lY3QodG9rZW46IHN0cmluZyk6IFNvY2tldElPQ2xpZW50LlNvY2tldCB7XG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHRoaXMuY29uZmlndXJhdGlvbi5zb2NrZXRVcmwsIHtcbiAgICAgIGZvcmNlTmV3OiB0cnVlLFxuICAgICAgcXVlcnk6IGB0b2tlbj0ke3Rva2VufWBcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQ7XG4gIH1cblxuICBzb2NrZXRFeGlzdHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0ICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLnNvY2tldEV4aXN0cygpKSB7XG4gICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGltZXIgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwLCBwdWJsaXNoUmVwbGF5LCByZWZDb3VudCwgc2hhcmUsIHRha2VXaGlsZSB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuLy4uL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5pbXBvcnQgeyBNZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVNlcnZpY2Uge1xuXG4gIHByaXZhdGUgY2FjaGVkTWU6IE9ic2VydmFibGU8TWU+O1xuICBwcml2YXRlIGFsaXZlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVSZXBvc2l0b3J5OiBNZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgc29ja2V0Q2xpZW50OiBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgcHJpdmF0ZSB0b2tlbkNvbmZpZ3VyYXRpb246IFRva2VuQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHNldHVwKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudG9rZW5Db25maWd1cmF0aW9uLmlzQXBpVG9rZW5TZXQoKSkge1xuICAgICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4gPSB0b2tlbjtcbiAgICB9XG4gIH1cblxuICBtZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgaWYgKCF0aGlzLmhhc0NhY2hlZE1lKCkpIHtcbiAgICAgIHRoaXMuY2FjaGVkTWUgPSB0aGlzLm1lUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZE1lKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwKG1lID0+IHRoaXMuc2NoZWR1bGVBbGl2ZW5lc3MobWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoUmVwbGF5KDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZkNvdW50KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZS5waXBlKG1hcChtZSA9PiB0aGlzLmNvbm5lY3RTb2NrZXQobWUpKSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5jbGVhcigpO1xuICAgIHRoaXMuY2FjaGVkTWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZUFsaXZlbmVzcyhtZTogTWUpOiBNZSB7XG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG4gICAgdGltZXIoMCwgdGhpcy5jb25maWd1cmF0aW9uLmFsaXZlSW50ZXJ2YWxJbk1zKS5waXBlKFxuICAgICAgdGFrZVdoaWxlKCgpID0+IHRoaXMuYWxpdmUpXG4gICAgKVxuICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5tZVJlcG9zaXRvcnkudXBkYXRlQWxpdmVuZXNzKG1lKSk7XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNDYWNoZWRNZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25uZWN0U29ja2V0KG1lOiBNZSk6IE1lIHtcbiAgICBpZiAoIXRoaXMuc29ja2V0Q2xpZW50LnNvY2tldEV4aXN0cygpKSB7XG4gICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLnNvY2tldENsaWVudC5jb25uZWN0KHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuKTtcbiAgICAgIHNvY2tldC5vbihcIm5ldyBtZXNzYWdlXCIsIGRhdGEgPT4gdGhpcy5yZWNlaXZlTmV3TWVzc2FnZShkYXRhKSk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0ZWRcIiwgZGF0YSA9PiBtZS5kZXZpY2VTZXNzaW9uSWQgPSBkYXRhLmRldmljZVNlc3Npb25JZCk7XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVjZWl2ZU5ld01lc3NhZ2UoanNvbjogYW55KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IE1lc3NhZ2UuYnVpbGQoanNvbi5kYXRhKTtcbiAgICB0aGlzLm1lKCkuc3Vic2NyaWJlKG1lID0+IG1lLmhhbmRsZU5ld01lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5AUGlwZSh7XG4gIG5hbWU6IFwic29ydFJvb21zXCJcbn0pXG5leHBvcnQgY2xhc3MgU29ydFJvb21QaXBlICBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0ocm9vbXM6IFJvb21bXSwgZmllbGQ6IHN0cmluZyk6IGFueVtdIHtcbiAgICBpZiAocm9vbXMgIT09IHVuZGVmaW5lZCAmJiByb29tcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJvb21zLnNvcnQoKHJvb206IFJvb20sIG90aGVyUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBjb25zdCBsYXN0QWN0aXZpdHlBdCAgICAgID0gcm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgY29uc3Qgb3RoZXJMYXN0QWN0aXZpdHlBdCA9IG90aGVyUm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgaWYgKG1vbWVudChsYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUob3RoZXJMYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmIChtb21lbnQob3RoZXJMYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUobGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMsIEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIH0gZnJvbSBcIi4vYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvclwiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lU2VydmljZSB9IGZyb20gXCIuL21lL21lLnNlcnZpY2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFNvcnRSb29tUGlwZSB9IGZyb20gXCIuL3BpcGUvc29ydC1yb29tXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudE1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBTb3J0Um9vbVBpcGVcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFNvcnRSb29tUGlwZVxuICBdXG4gfSlcbmV4cG9ydCBjbGFzcyBCYWJpbGlNb2R1bGUge1xuICBzdGF0aWMgZm9yUm9vdCh1cmxDb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCYWJpbGlNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFVSTF9DT05GSUdVUkFUSU9OLFxuICAgICAgICAgIHVzZVZhbHVlOiB1cmxDb25maWd1cmF0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIFNvcnRSb29tUGlwZSxcbiAgICAgICAgVG9rZW5Db25maWd1cmF0aW9uLFxuICAgICAgICBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgIFJvb21SZXBvc2l0b3J5LFxuICAgICAgICBNZVJlcG9zaXRvcnksXG4gICAgICAgIE1lU2VydmljZVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJtb21lbnQiLCJpby5jb25uZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0lBTUU7S0FBZ0I7Ozs7SUFFaEIsMENBQWE7OztJQUFiO1FBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQztLQUN0Rjs7OztJQUVELGtDQUFL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