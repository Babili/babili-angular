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
var BabiliConfiguration = /** @class */ (function () {
    function BabiliConfiguration() {
    }
    /**
     * @param {?} apiUrl
     * @param {?} socketUrl
     * @param {?=} aliveIntervalInMs
     * @return {?}
     */
    BabiliConfiguration.prototype.init = /**
     * @param {?} apiUrl
     * @param {?} socketUrl
     * @param {?=} aliveIntervalInMs
     * @return {?}
     */
    function (apiUrl, socketUrl, aliveIntervalInMs) {
        this.url = {
            apiUrl: apiUrl,
            socketUrl: socketUrl,
            aliveIntervalInMs: aliveIntervalInMs
        };
    };
    Object.defineProperty(BabiliConfiguration.prototype, "apiUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.url ? this.url.apiUrl : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BabiliConfiguration.prototype, "socketUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.url ? this.url.socketUrl : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BabiliConfiguration.prototype, "aliveIntervalInMs", {
        get: /**
         * @return {?}
         */
        function () {
            return this.url ? this.url.aliveIntervalInMs : 30000;
        },
        enumerable: true,
        configurable: true
    });
    BabiliConfiguration.decorators = [
        { type: Injectable },
    ];
    return BabiliConfiguration;
}());

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
    function HttpAuthenticationInterceptor(configuration, tokenConfiguration) {
        this.configuration = configuration;
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
        return request.url.startsWith(this.configuration.apiUrl);
    };
    HttpAuthenticationInterceptor.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    HttpAuthenticationInterceptor.ctorParameters = function () { return [
        { type: BabiliConfiguration },
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
        this.configuration = configuration;
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
    Object.defineProperty(MessageRepository.prototype, "roomUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.configuration.apiUrl + "/user/rooms";
        },
        enumerable: true,
        configurable: true
    });
    MessageRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MessageRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: BabiliConfiguration }
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
        this.configuration = configuration;
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
    Object.defineProperty(RoomRepository.prototype, "roomUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.configuration.apiUrl + "/user/rooms";
        },
        enumerable: true,
        configurable: true
    });
    RoomRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    RoomRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: MessageRepository },
        { type: BabiliConfiguration }
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
        this.configuration = configuration;
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
    Object.defineProperty(MeRepository.prototype, "userUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.configuration.apiUrl + "/user";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MeRepository.prototype, "aliveUrl", {
        get: /**
         * @return {?}
         */
        function () {
            return this.userUrl + "/alive";
        },
        enumerable: true,
        configurable: true
    });
    MeRepository.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MeRepository.ctorParameters = function () { return [
        { type: HttpClient },
        { type: RoomRepository },
        { type: BabiliConfiguration }
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
        { type: BabiliConfiguration }
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
        { type: BabiliConfiguration },
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
     * @return {?}
     */
    BabiliModule.forRoot = /**
     * @return {?}
     */
    function () {
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

export { HttpAuthenticationInterceptor, NotAuthorizedError, BabiliModule, TokenConfiguration, MeRepository, MeService, Me, MessageRepository, Message, SortRoomPipe, RoomRepository, Room, BootstrapSocket, User, BabiliConfiguration };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vbm90LWF1dGhvcml6ZWQtZXJyb3IudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvdXNlci91c2VyLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20ucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3NvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUuc2VydmljZS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3BpcGUvc29ydC1yb29tLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYmFiaWxpLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3RvciB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhYmlsaUNvbmZpZ3VyYXRpb24ge1xuXG4gIHByaXZhdGUgdXJsOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uO1xuXG4gIGluaXQoYXBpVXJsOiBzdHJpbmcsIHNvY2tldFVybDogc3RyaW5nLCBhbGl2ZUludGVydmFsSW5Ncz86IG51bWJlcikge1xuICAgIHRoaXMudXJsID0ge1xuICAgICAgYXBpVXJsOiBhcGlVcmwsXG4gICAgICBzb2NrZXRVcmw6IHNvY2tldFVybCxcbiAgICAgIGFsaXZlSW50ZXJ2YWxJbk1zOiBhbGl2ZUludGVydmFsSW5Nc1xuICAgIH07XG4gIH1cblxuICBnZXQgYXBpVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsID8gdGhpcy51cmwuYXBpVXJsIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0IHNvY2tldFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybCA/IHRoaXMudXJsLnNvY2tldFVybCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBhbGl2ZUludGVydmFsSW5NcygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVybCA/IHRoaXMudXJsLmFsaXZlSW50ZXJ2YWxJbk1zIDogMzAwMDA7XG4gIH1cbn1cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVG9rZW5Db25maWd1cmF0aW9uIHtcbiAgcHVibGljIGFwaVRva2VuOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGlzQXBpVG9rZW5TZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXBpVG9rZW4gIT09IHVuZGVmaW5lZCAmJiB0aGlzLmFwaVRva2VuICE9PSBudWxsICYmIHRoaXMuYXBpVG9rZW4gIT09IFwiXCI7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmFwaVRva2VuID0gdW5kZWZpbmVkO1xuICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBOb3RBdXRob3JpemVkRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBlcnJvcjogYW55KSB7fVxufVxuIiwiaW1wb3J0IHsgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEhhbmRsZXIsIEh0dHBJbnRlcmNlcHRvciwgSHR0cFJlcXVlc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aHJvd0Vycm9yIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGNhdGNoRXJyb3IgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yIH0gZnJvbSBcIi4vbm90LWF1dGhvcml6ZWQtZXJyb3JcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgaW50ZXJjZXB0KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLnNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUodGhpcy5hZGRIZWFkZXJUbyhyZXF1ZXN0LCB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbikpXG4gICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGVycm9yLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgTm90QXV0aG9yaXplZEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgdG9rZW46IHN0cmluZyk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIHJldHVybiByZXF1ZXN0LmNsb25lKHtcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycy5zZXQoXCJBdXRob3JpemF0aW9uXCIsIGBCZWFyZXIgJHt0b2tlbn1gKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJlcXVlc3QudXJsLnN0YXJ0c1dpdGgodGhpcy5jb25maWd1cmF0aW9uLmFwaVVybCk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBVc2VyIHtcbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IFVzZXIge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4gbmV3IFVzZXIoanNvbi5pZCwganNvbi5hdHRyaWJ1dGVzID8ganNvbi5hdHRyaWJ1dGVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBVc2VyW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoVXNlci5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc3RhdHVzOiBzdHJpbmcpIHt9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgcmV0dXJuIG5ldyBNZXNzYWdlKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50KGF0dHJpYnV0ZXMuY3JlYXRlZEF0KS50b0RhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIuZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMucm9vbS5kYXRhLmlkKTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogTWVzc2FnZVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKE1lc3NhZ2UuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY3JlYXRlZEF0OiBEYXRlLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXI6IFVzZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21JZDogc3RyaW5nKSB7fVxuXG4gIGhhc1NlbmRlcklkKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZGVyICYmIHRoaXMuc2VuZGVyLmlkID09PSB1c2VySWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBOZXdNZXNzYWdlIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZW50VHlwZTogc3RyaW5nO1xuICBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VSZXBvc2l0b3J5IHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBjcmVhdGUocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5idWlsZChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZmluZEFsbChyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwgeyBwYXJhbXM6IGF0dHJpYnV0ZXMgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLm1hcChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZGVsZXRlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCl9LyR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocmVzcG9uc2UgPT4gbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBtZXNzYWdlVXJsKHJvb21JZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucm9vbVVybH0vJHtyb29tSWR9L21lc3NhZ2VzYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJvb21VcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS5yZXBvc2l0b3J5XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmV4cG9ydCBjbGFzcyBSb29tIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb20ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgY29uc3QgdXNlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzLmRhdGEpIDogW107XG4gICAgY29uc3Qgc2VuZGVycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzLmRhdGEpIDogW107XG4gICAgY29uc3QgbWVzc2FnZXMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzID8gTWVzc2FnZS5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzLmRhdGEpIDogW107XG4gICAgY29uc3QgaW5pdGlhdG9yID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IuZGF0YSkgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIG5ldyBSb29tKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCA/IG1vbWVudChhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0KS51dGMoKS50b0RhdGUoKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnVucmVhZE1lc3NhZ2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcnMsXG4gICAgICAgICAgICAgICAgICAgIHNlbmRlcnMsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHJvb21SZXBvc2l0b3J5KTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb21bXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChyb29tID0+IFJvb20uYnVpbGQocm9vbSwgcm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgbmV3TWVzc2FnZU5vdGlmaWVyOiAobWVzc2FnZTogTWVzc2FnZSkgPT4gYW55O1xuICBwcml2YXRlIGludGVybmFsT3BlbjogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbE5hbWU6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuICBwcml2YXRlIGludGVybmFsTGFzdEFjdGl2aXR5QXQ6IEJlaGF2aW9yU3ViamVjdDxEYXRlPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbEltYWdlVXJsOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIGxhc3RBY3Rpdml0eUF0OiBEYXRlLFxuICAgICAgICAgICAgICBvcGVuOiBib29sZWFuLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcmVhZG9ubHkgdXNlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc2VuZGVyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBtZXNzYWdlczogTWVzc2FnZVtdLFxuICAgICAgICAgICAgICByZWFkb25seSBpbml0aWF0b3I6IFVzZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG9wZW4pO1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdCA9IG5ldyBCZWhhdmlvclN1YmplY3QobGFzdEFjdGl2aXR5QXQpO1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lID0gbmV3IEJlaGF2aW9yU3ViamVjdChuYW1lKTtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQpO1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5kZWZpbmVkKTtcbiAgfVxuXG4gIGdldCB1bnJlYWRNZXNzYWdlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC52YWx1ZTtcbiAgfVxuXG4gIHNldCB1bnJlYWRNZXNzYWdlQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQubmV4dChjb3VudCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVVucmVhZE1lc3NhZ2VDb3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZS52YWx1ZTtcbiAgfVxuXG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lLm5leHQobmFtZSk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU5hbWUoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZTtcbiAgfVxuXG4gIGdldCBvcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3Blbi52YWx1ZTtcbiAgfVxuXG4gIHNldCBvcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICB0aGlzLmludGVybmFsT3Blbi5uZXh0KG9wZW4pO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVPcGVuKCk6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuO1xuICB9XG5cbiAgZ2V0IGxhc3RBY3Rpdml0eUF0KCk6IERhdGUge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQudmFsdWU7XG4gIH1cblxuICBzZXQgbGFzdEFjdGl2aXR5QXQobGFzdEFjdGl2aXR5QXQ6IERhdGUpIHtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQubmV4dChsYXN0QWN0aXZpdHlBdCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUxhc3RBY3Rpdml0eUF0KCk6IEJlaGF2aW9yU3ViamVjdDxEYXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDtcbiAgfVxuXG4gIGdldCBpbWFnZVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmwudmFsdWU7XG4gIH1cblxuICBzZXQgaW1hZ2VVcmwoaW1hZ2VVcmw6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybC5uZXh0KGltYWdlVXJsKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlSW1hZ2VVcmwoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmw7XG4gIH1cblxuXG4gIG9wZW5NZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgdHJ1ZSk7XG4gIH1cblxuICBjbG9zZU1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCBmYWxzZSk7XG4gIH1cblxuICBtYXJrQWxsTWVzc2FnZXNBc1JlYWQoKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZCh0aGlzKTtcbiAgfVxuXG4gIGFkZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eUF0ID0gbWVzc2FnZS5jcmVhdGVkQXQ7XG4gIH1cblxuICBub3RpZnlOZXdNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBpZiAodGhpcy5uZXdNZXNzYWdlTm90aWZpZXIpIHtcbiAgICAgIHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyLmFwcGx5KG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG5cbiAgaGFzVXNlcih1c2VySWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnVzZXJzICYmIHRoaXMudXNlcnMuc29tZSh1c2VyID0+IHVzZXIuaWQgID09PSB1c2VySWQpO1xuICB9XG5cbiAgZmV0Y2hNb3JlTWVzc2FnZSgpOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGZpcnN0U2Vlbk1lc3NhZ2VJZDogdGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwID8gdGhpcy5tZXNzYWdlc1swXS5pZCA6IHVuZGVmaW5lZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5maW5kTWVzc2FnZXModGhpcywgcGFyYW1zKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICBtYXAobWVzc2FnZXMgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQuYXBwbHkodGhpcy5tZXNzYWdlcywgbWVzc2FnZXMpO1xuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBmaW5kTWVzc2FnZVdpdGhJZChpZDogc3RyaW5nKTogTWVzc2FnZSB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZXMgPyB0aGlzLm1lc3NhZ2VzLmZpbmQobWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBpZCkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICB1cGRhdGUoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UobmV3TWVzc2FnZTogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuY3JlYXRlTWVzc2FnZSh0aGlzLCBuZXdNZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgIG1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICApO1xuICB9XG5cbiAgcmVtb3ZlTWVzc2FnZShtZXNzYWdlVG9EZWxldGU6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMubWVzc2FnZXMgPyB0aGlzLm1lc3NhZ2VzLmZpbmRJbmRleChtZXNzYWdlID0+IG1lc3NhZ2UuaWQgPT09IG1lc3NhZ2VUb0RlbGV0ZS5pZCkgOiAtMTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gbWVzc2FnZVRvRGVsZXRlO1xuICB9XG5cbiAgZGVsZXRlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmRlbGV0ZU1lc3NhZ2UodGhpcywgbWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKG1hcChkZWxldGVkTWVzc2FnZSA9PiB0aGlzLnJlbW92ZU1lc3NhZ2UoZGVsZXRlZE1lc3NhZ2UpKSk7XG4gIH1cblxuICByZXBsYWNlVXNlcnNXaXRoKHJvb206IFJvb20pOiBSb29tIHtcbiAgICB0aGlzLnVzZXJzLnNwbGljZSgwLCB0aGlzLnVzZXJzLmxlbmd0aCk7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy51c2Vycywgcm9vbS51c2Vycyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRVc2VyKHVzZXI6IFVzZXIpIHtcbiAgICBpZiAoIXRoaXMuaGFzVXNlcih1c2VyLmlkKSkge1xuICAgICAgdGhpcy51c2Vycy5wdXNoKHVzZXIpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4vcm9vbS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vbVJlcG9zaXRvcnkge1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBmaW5kKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldChgJHt0aGlzLnJvb21Vcmx9LyR7aWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20uYnVpbGQoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZEFsbChxdWVyeToge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy5yb29tVXJsLCB7IHBhcmFtczogcXVlcnkgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20ubWFwKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5T3BlbmVkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5Q2xvc2VkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0FmdGVyKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBmaXJzdFNlZW5Sb29tSWQ6IGlkIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQnlJZHMocm9vbUlkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgXCJyb29tSWRzW11cIjogcm9vbUlkcyB9KTtcbiAgfVxuXG4gIHVwZGF0ZU1lbWJlcnNoaXAocm9vbTogUm9vbSwgb3BlbjogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG9wZW46IG9wZW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgIHJvb20ub3BlbiA9IGRhdGEuZGF0YS5hdHRyaWJ1dGVzLm9wZW47XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICBpZiAocm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPiAwKSB7XG4gICAgICBjb25zdCBsYXN0UmVhZE1lc3NhZ2VJZCA9IHJvb20ubWVzc2FnZXMubGVuZ3RoID4gMCA/IHJvb20ubWVzc2FnZXNbcm9vbS5tZXNzYWdlcy5sZW5ndGggLSAxXS5pZCA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwL3VucmVhZC1tZXNzYWdlc2AsIHsgZGF0YTogeyBsYXN0UmVhZE1lc3NhZ2VJZDogbGFzdFJlYWRNZXNzYWdlSWQgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5tZXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKDApO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0/bm9EdXBsaWNhdGU9JHt3aXRob3V0RHVwbGljYXRlfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2Vyczoge1xuICAgICAgICAgICAgZGF0YTogdXNlcklkcy5tYXAodXNlcklkID0+ICh7IHR5cGU6IFwidXNlclwiLCBpZDogdXNlcklkIH0pIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgbm9EdXBsaWNhdGU6IGAke3dpdGhvdXREdXBsaWNhdGV9YFxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBSb29tLmJ1aWxkKHJlc3BvbnNlLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGUocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiByb29tLm5hbWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICByb29tLm5hbWUgPSByZXNwb25zZS5kYXRhLmF0dHJpYnV0ZXMubmFtZTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGFkZFVzZXIocm9vbTogUm9vbSwgdXNlcklkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBzYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogXCJ1c2VyXCIsXG4gICAgICAgICAgICAgIGlkOiB1c2VySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgY29uc3QgbmV3VXNlciA9IFVzZXIuYnVpbGQocmVzcG9uc2UuZGF0YS5yZWxhdGlvbnNoaXBzLnVzZXIuZGF0YSk7XG4gICAgICByb29tLmFkZFVzZXIobmV3VXNlcik7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBkZWxldGVNZXNzYWdlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5kZWxldGUocm9vbSwgbWVzc2FnZSk7XG4gIH1cblxuICBmaW5kTWVzc2FnZXMocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5maW5kQWxsKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgY3JlYXRlTWVzc2FnZShyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuY3JlYXRlKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcm9vbVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyL3Jvb21zYDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZmxhdE1hcCwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuZXhwb3J0IGNsYXNzIE1lIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpOiBNZSB7XG4gICAgY29uc3QgdW5yZWFkTWVzc2FnZUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEudW5yZWFkTWVzc2FnZUNvdW50IDogMDtcbiAgICBjb25zdCByb29tQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS5yb29tQ291bnQgOiAwO1xuICAgIHJldHVybiBuZXcgTWUoanNvbi5kYXRhLmlkLCBbXSwgW10sIHVucmVhZE1lc3NhZ2VDb3VudCwgcm9vbUNvdW50LCByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBwdWJsaWMgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsUm9vbUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBmaXJzdFNlZW5Sb29tOiBSb29tO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG9wZW5lZFJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByb29tQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQgfHwgMCk7XG4gICAgdGhpcy5pbnRlcm5hbFJvb21Db3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3Qocm9vbUNvdW50IHx8IDApO1xuICB9XG5cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IHJvb21Db3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50LnZhbHVlO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVSb29tQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50O1xuICB9XG5cbiAgZmV0Y2hPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRPcGVuZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kQ2xvc2VkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaE1vcmVSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIGlmICh0aGlzLmZpcnN0U2VlblJvb20pIHtcbiAgICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0FmdGVyKHRoaXMuZmlyc3RTZWVuUm9vbS5pZCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoW10pO1xuICAgIH1cbiAgfVxuXG4gIGZldGNoUm9vbXNCeUlkKHJvb21JZHM6IHN0cmluZ1tdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNCeUlkcyhyb29tSWRzKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZChyb29tSWQpLnBpcGUobWFwKHJvb20gPT4ge1xuICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZmluZE9yRmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChyb29tSWQpO1xuICAgIGlmIChyb29tSWQpIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hSb29tQnlJZChyb29tSWQpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU5ld01lc3NhZ2UobmV3TWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMuZmluZE9yRmV0Y2hSb29tQnlJZChuZXdNZXNzYWdlLnJvb21JZClcbiAgICAgICAgLnN1YnNjcmliZShyb29tID0+IHtcbiAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgcm9vbS5hZGRNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgcm9vbS5ub3RpZnlOZXdNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKCFuZXdNZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICBpZiAoIXJvb20ub3Blbikge1xuICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGFkZFJvb20obmV3Um9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tKG5ld1Jvb20pKSB7XG4gICAgICBpZiAoIXRoaXMuZmlyc3RTZWVuUm9vbSB8fCBtb21lbnQodGhpcy5maXJzdFNlZW5Sb29tLmxhc3RBY3Rpdml0eUF0KS5pc0FmdGVyKG5ld1Jvb20ubGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RTZWVuUm9vbSA9IG5ld1Jvb207XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMucm9vbXMgPyB0aGlzLnJvb21zLmZpbmRJbmRleChyb29tID0+IHJvb20uaWQgPT09IG5ld1Jvb20uaWQpIDogLTE7XG4gICAgICBpZiAocm9vbUluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5yb29tc1tyb29tSW5kZXhdID0gbmV3Um9vbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm9vbXMucHVzaChuZXdSb29tKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5yb29tcyA/IHRoaXMucm9vbXMuZmluZChyb29tID0+IHJvb21JZCA9PT0gcm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBvcGVuUm9vbShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLm9wZW5NZW1iZXJzaGlwKClcbiAgICAgICAgICAgICAgICAgLnBpcGUoZmxhdE1hcCgob3BlbmVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkVG9PcGVuZWRSb29tKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLmNsb3NlTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKG1hcChjbG9zZWRSb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb3NlZFJvb207XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb21zKHJvb21zVG9DbG9zZTogUm9vbVtdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gb2Yocm9vbXNUb0Nsb3NlKS5waXBlKFxuICAgICAgbWFwKHJvb21zID0+IHtcbiAgICAgICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHRoaXMuY2xvc2VSb29tKHJvb20pKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgb3BlblJvb21BbmRDbG9zZU90aGVycyhyb29tVG9PcGVuOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbXNUb0JlQ2xvc2VkID0gdGhpcy5vcGVuZWRSb29tcy5maWx0ZXIocm9vbSA9PiByb29tLmlkICE9PSByb29tVG9PcGVuLmlkKTtcbiAgICByZXR1cm4gdGhpcy5jbG9zZVJvb21zKHJvb21zVG9CZUNsb3NlZCkucGlwZShmbGF0TWFwKHJvb21zID0+IHRoaXMub3BlblJvb20ocm9vbVRvT3BlbikpKTtcbiAgfVxuXG4gIGhhc09wZW5lZFJvb21zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wZW5lZFJvb21zLmxlbmd0aCA+IDA7XG4gIH1cblxuICBjcmVhdGVSb29tKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5jcmVhdGUobmFtZSwgdXNlcklkcywgd2l0aG91dER1cGxpY2F0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIGJ1aWxkUm9vbSh1c2VySWRzOiBzdHJpbmdbXSk6IFJvb20ge1xuICAgIGNvbnN0IHVzZXJzID0gdXNlcklkcy5tYXAoaWQgPT4gbmV3IFVzZXIoaWQsIFwiXCIpKTtcbiAgICBjb25zdCBub1NlbmRlcnMgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2UgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2VVbnJlYWQgPSAwO1xuICAgIGNvbnN0IG5vSWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaW5pdGlhdG9yID0gdGhpcy50b1VzZXIoKTtcbiAgICByZXR1cm4gbmV3IFJvb20obm9JZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHRydWUsXG4gICAgICBub01lc3NhZ2VVbnJlYWQsXG4gICAgICB1c2VycyxcbiAgICAgIG5vU2VuZGVycyxcbiAgICAgIG5vTWVzc2FnZSxcbiAgICAgIGluaXRpYXRvcixcbiAgICAgIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKHJvb206IFJvb20sIGNvbnRlbnQ6IHN0cmluZywgY29udGVudFR5cGU6IHN0cmluZyk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiByb29tLnNlbmRNZXNzYWdlKHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBjb250ZW50VHlwZTogY29udGVudFR5cGUsXG4gICAgICBkZXZpY2VTZXNzaW9uSWQ6IHRoaXMuZGV2aWNlU2Vzc2lvbklkXG4gICAgfSk7XG4gIH1cblxuICBpc1NlbnRCeU1lKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbWVzc2FnZSAmJiBtZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChtZXNzYWdlLnJvb21JZCk7XG4gICAgICBpZiAocm9vbSkge1xuICAgICAgICByZXR1cm4gcm9vbS5kZWxldGUobWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgYWRkVXNlclRvKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuYWRkVXNlcihyb29tLCB1c2VySWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRSb29tcyhyb29tczogUm9vbVtdKSB7XG4gICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIGlmIChyb29tLm9wZW4gJiYgIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb20ocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb21PcGVuZWQocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tKHJvb206IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbUJ5SWQocm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZChyb29tID0+IHJvb21Ub0ZpbmQuaWQgPT09IHJvb20uaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb09wZW5lZFJvb20ocm9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tOiBSb29tKSB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChjbG9zZWRSb29tKSkge1xuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gdGhpcy5vcGVuZWRSb29tcyA/IHRoaXMub3BlbmVkUm9vbXMuZmluZEluZGV4KHJvb20gPT4gcm9vbS5pZCA9PT0gY2xvc2VkUm9vbS5pZCkgOiB1bmRlZmluZWQ7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnNwbGljZShyb29tSW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiByb29tLm1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpXG4gICAgICAgICAgICAgICAucGlwZShtYXAocmVhZE1lc3NhZ2VDb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IE1hdGgubWF4KHRoaXMudW5yZWFkTWVzc2FnZUNvdW50IC0gcmVhZE1lc3NhZ2VDb3VudCwgMCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIHRvVXNlcigpOiBVc2VyIHtcbiAgICByZXR1cm4gbmV3IFVzZXIodGhpcy5pZCwgXCJcIik7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBlbXB0eSwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lUmVwb3NpdG9yeSB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlDb25maWd1cmF0aW9uKSB7fVxuXG4gIGZpbmRNZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy51c2VyVXJsKS5waXBlKG1hcChtZSA9PiBNZS5idWlsZChtZSwgdGhpcy5yb29tUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIHVwZGF0ZUFsaXZlbmVzcyhtZTogTWUpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dCh0aGlzLmFsaXZlVXJsLCB7IGRhdGE6IHsgdHlwZTogXCJhbGl2ZVwiIH19KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShjYXRjaEVycm9yKCgpID0+IGVtcHR5KCkpLCBtYXAoKCkgPT4gbnVsbCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgdXNlclVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGFsaXZlVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMudXNlclVybH0vYWxpdmVgO1xuICB9XG59XG5cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgKiBhcyBpbyBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwU29ja2V0IHtcblxuICBwcml2YXRlIHNvY2tldDogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBjb25uZWN0KHRva2VuOiBzdHJpbmcpOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCh0aGlzLmNvbmZpZ3VyYXRpb24uc29ja2V0VXJsLCB7XG4gICAgICBmb3JjZU5ldzogdHJ1ZSxcbiAgICAgIHF1ZXJ5OiBgdG9rZW49JHt0b2tlbn1gXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0O1xuICB9XG5cbiAgc29ja2V0RXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNvY2tldCAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBpZiAodGhpcy5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRpbWVyIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCwgcHVibGlzaFJlcGxheSwgcmVmQ291bnQsIHNoYXJlLCB0YWtlV2hpbGUgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vLi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lU2VydmljZSB7XG5cbiAgcHJpdmF0ZSBjYWNoZWRNZTogT2JzZXJ2YWJsZTxNZT47XG4gIHByaXZhdGUgYWxpdmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtZVJlcG9zaXRvcnk6IE1lUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBzb2NrZXRDbGllbnQ6IEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0dXAodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uaXNBcGlUb2tlblNldCgpKSB7XG4gICAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbiA9IHRva2VuO1xuICAgIH1cbiAgfVxuXG4gIG1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICBpZiAoIXRoaXMuaGFzQ2FjaGVkTWUoKSkge1xuICAgICAgdGhpcy5jYWNoZWRNZSA9IHRoaXMubWVSZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kTWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAobWUgPT4gdGhpcy5zY2hlZHVsZUFsaXZlbmVzcyhtZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2hSZXBsYXkoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmQ291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFyZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lLnBpcGUobWFwKG1lID0+IHRoaXMuY29ubmVjdFNvY2tldChtZSkpKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmNsZWFyKCk7XG4gICAgdGhpcy5jYWNoZWRNZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQWxpdmVuZXNzKG1lOiBNZSk6IE1lIHtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICB0aW1lcigwLCB0aGlzLmNvbmZpZ3VyYXRpb24uYWxpdmVJbnRlcnZhbEluTXMpLnBpcGUoXG4gICAgICB0YWtlV2hpbGUoKCkgPT4gdGhpcy5hbGl2ZSlcbiAgICApXG4gICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLm1lUmVwb3NpdG9yeS51cGRhdGVBbGl2ZW5lc3MobWUpKTtcbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIGhhc0NhY2hlZE1lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGNvbm5lY3RTb2NrZXQobWU6IE1lKTogTWUge1xuICAgIGlmICghdGhpcy5zb2NrZXRDbGllbnQuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuc29ja2V0Q2xpZW50LmNvbm5lY3QodGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pO1xuICAgICAgc29ja2V0Lm9uKFwibmV3IG1lc3NhZ2VcIiwgZGF0YSA9PiB0aGlzLnJlY2VpdmVOZXdNZXNzYWdlKGRhdGEpKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RlZFwiLCBkYXRhID0+IG1lLmRldmljZVNlc3Npb25JZCA9IGRhdGEuZGV2aWNlU2Vzc2lvbklkKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSByZWNlaXZlTmV3TWVzc2FnZShqc29uOiBhbnkpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gTWVzc2FnZS5idWlsZChqc29uLmRhdGEpO1xuICAgIHRoaXMubWUoKS5zdWJzY3JpYmUobWUgPT4gbWUuaGFuZGxlTmV3TWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbkBQaXBlKHtcbiAgbmFtZTogXCJzb3J0Um9vbXNcIlxufSlcbmV4cG9ydCBjbGFzcyBTb3J0Um9vbVBpcGUgIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybShyb29tczogUm9vbVtdLCBmaWVsZDogc3RyaW5nKTogYW55W10ge1xuICAgIGlmIChyb29tcyAhPT0gdW5kZWZpbmVkICYmIHJvb21zICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcm9vbXMuc29ydCgocm9vbTogUm9vbSwgb3RoZXJSb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RBY3Rpdml0eUF0ICAgICAgPSByb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBjb25zdCBvdGhlckxhc3RBY3Rpdml0eUF0ID0gb3RoZXJSb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBpZiAobW9tZW50KGxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShvdGhlckxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKG1vbWVudChvdGhlckxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShsYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50TW9kdWxlLCBIVFRQX0lOVEVSQ0VQVE9SUyB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIH0gZnJvbSBcIi4vYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvclwiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZS9tZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZVNlcnZpY2UgfSBmcm9tIFwiLi9tZS9tZS5zZXJ2aWNlXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBTb3J0Um9vbVBpcGUgfSBmcm9tIFwiLi9waXBlL3NvcnQtcm9vbVwiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgU29ydFJvb21QaXBlXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBTb3J0Um9vbVBpcGVcbiAgXVxuIH0pXG5leHBvcnQgY2xhc3MgQmFiaWxpTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCYWJpbGlNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgQmFiaWxpQ29uZmlndXJhdGlvbixcbiAgICAgICAgU29ydFJvb21QaXBlLFxuICAgICAgICBUb2tlbkNvbmZpZ3VyYXRpb24sXG4gICAgICAgIEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLFxuICAgICAgICAgIHVzZUNsYXNzOiBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvcixcbiAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBNZXNzYWdlUmVwb3NpdG9yeSxcbiAgICAgICAgUm9vbVJlcG9zaXRvcnksXG4gICAgICAgIE1lUmVwb3NpdG9yeSxcbiAgICAgICAgTWVTZXJ2aWNlXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIm1vbWVudCIsImlvLmNvbm5lY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7OztJQVFFLGtDQUFJOzs7Ozs7SUFBSixVQUFLLE1BQWMsRUFBRSxTQUFpQixFQUFFLGlCQUEwQjtRQUNoRSxJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1QsTUFBTSxFQUFFLE1BQU07WUFDZCxTQUFTLEVBQUUsU0FBUztZQUNwQixpQkFBaUIsRUFBRSxpQkFBaUI7U0FDckMsQ0FBQztLQUNIO0lBRUQsc0JBQUksdUNBQU07Ozs7UUFBVjtZQUNFLE9BQU8sSUFBSSxDQUFDLEdB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