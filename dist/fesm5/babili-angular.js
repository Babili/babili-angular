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
var ArrayUtils = /** @class */ (function () {
    function ArrayUtils() {
    }
    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param items array that will be inspected to find an element index
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     */
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
    ArrayUtils.findIndex = /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element index
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @return {?}
     */
    function (items, predicate) {
        for (var /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            if (predicate.apply(items[currentIndex], currentIndex)) {
                return currentIndex;
            }
        }
        return -1;
    };
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param items array that will be inspected to find an element
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     */
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
    ArrayUtils.find = /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @template T
     * @param {?} items array that will be inspected to find an element
     * @param {?} predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @return {?}
     */
    function (items, predicate) {
        for (var /** @type {?} */ currentIndex = 0; currentIndex < items.length; ++currentIndex) {
            var /** @type {?} */ item = items[currentIndex];
            if (predicate.apply(item, currentIndex)) {
                return item;
            }
        }
        return undefined;
    };
    return ArrayUtils;
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
        return ArrayUtils.find(this.users.map(function (user) { return user.id; }), function (id) { return id === userId; }) !== undefined;
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
        return ArrayUtils.find(this.messages, function (message) { return message.id === id; });
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
        var /** @type {?} */ index = ArrayUtils.findIndex(this.messages, function (message) { return message.id === messageToDelete.id; });
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
                    ]
                },] },
    ];
    return BabiliModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

var babili_namespace = /*#__PURE__*/Object.freeze({
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLWFuZ3VsYXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL0BiYWJpbGkvYW5ndWxhci9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXMudHMiLCJuZzovL0BiYWJpbGkvYW5ndWxhci9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vbm90LWF1dGhvcml6ZWQtZXJyb3IudHMiLCJuZzovL0BiYWJpbGkvYW5ndWxhci9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yLnRzIiwibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvdXNlci91c2VyLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkvYW5ndWxhci9hcnJheS51dGlscy50cyIsIm5nOi8vQGJhYmlsaS9hbmd1bGFyL3Jvb20vcm9vbS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS9hbmd1bGFyL3Jvb20vcm9vbS5yZXBvc2l0b3J5LnRzIiwibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvbWUvbWUudHlwZXMudHMiLCJuZzovL0BiYWJpbGkvYW5ndWxhci9tZS9tZS5yZXBvc2l0b3J5LnRzIiwibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXQudHMiLCJuZzovL0BiYWJpbGkvYW5ndWxhci9tZS9tZS5zZXJ2aWNlLnRzIiwibmc6Ly9AYmFiaWxpL2FuZ3VsYXIvcGlwZS9zb3J0LXJvb20udHMiLCJuZzovL0BiYWJpbGkvYW5ndWxhci9iYWJpbGkubW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVG9rZW5Db25maWd1cmF0aW9uIHtcbiAgcHVibGljIGFwaVRva2VuOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGlzQXBpVG9rZW5TZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXBpVG9rZW4gIT09IHVuZGVmaW5lZCAmJiB0aGlzLmFwaVRva2VuICE9PSBudWxsICYmIHRoaXMuYXBpVG9rZW4gIT09IFwiXCI7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmFwaVRva2VuID0gdW5kZWZpbmVkO1xuICB9XG5cbn1cbiIsImltcG9ydCB7IEluamVjdGlvblRva2VuIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuZXhwb3J0IGNvbnN0IFVSTF9DT05GSUdVUkFUSU9OID0gbmV3IEluamVjdGlvblRva2VuPFVybENvbmZpZ3VyYXRpb24+KFwiQmFiaWxpVXJsQ29uZmlndXJhdGlvblwiKTtcblxuZXhwb3J0IGludGVyZmFjZSBVcmxDb25maWd1cmF0aW9uIHtcbiAgYXBpVXJsOiBzdHJpbmc7XG4gIHNvY2tldFVybDogc3RyaW5nO1xuICBhbGl2ZUludGVydmFsSW5Ncz86IG51bWJlcjtcbn1cbiIsImV4cG9ydCBjbGFzcyBOb3RBdXRob3JpemVkRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBlcnJvcjogYW55KSB7fVxufVxuIiwiaW1wb3J0IHsgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEhhbmRsZXIsIEh0dHBJbnRlcmNlcHRvciwgSHR0cFJlcXVlc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aHJvd0Vycm9yIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGNhdGNoRXJyb3IgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgVVJMX0NPTkZJR1VSQVRJT04sIFVybENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBOb3RBdXRob3JpemVkRXJyb3IgfSBmcm9tIFwiLi9ub3QtYXV0aG9yaXplZC1lcnJvclwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIHByaXZhdGUgdXJsczogVXJsQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgcHJpdmF0ZSB0b2tlbkNvbmZpZ3VyYXRpb246IFRva2VuQ29uZmlndXJhdGlvbikge31cblxuICBpbnRlcmNlcHQocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuc2hvdWxkQWRkSGVhZGVyVG8ocmVxdWVzdCkpIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZSh0aGlzLmFkZEhlYWRlclRvKHJlcXVlc3QsIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuKSlcbiAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcihlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSHR0cEVycm9yUmVzcG9uc2UgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBOb3RBdXRob3JpemVkRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxdWVzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCB0b2tlbjogc3RyaW5nKTogSHR0cFJlcXVlc3Q8YW55PiB7XG4gICAgcmV0dXJuIHJlcXVlc3QuY2xvbmUoe1xuICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzLnNldChcIkF1dGhvcml6YXRpb25cIiwgYEJlYXJlciAke3Rva2VufWApXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gcmVxdWVzdC51cmwuc3RhcnRzV2l0aCh0aGlzLnVybHMuYXBpVXJsKTtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFVzZXIge1xuICBzdGF0aWMgYnVpbGQoanNvbjogYW55KTogVXNlciB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBuZXcgVXNlcihqc29uLmlkLCBqc29uLmF0dHJpYnV0ZXMgPyBqc29uLmF0dHJpYnV0ZXMuc3RhdHVzIDogdW5kZWZpbmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSk6IFVzZXJbXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChVc2VyLmJ1aWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBzdGF0dXM6IHN0cmluZykge31cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55KTogTWVzc2FnZSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGpzb24uYXR0cmlidXRlcztcbiAgICByZXR1cm4gbmV3IE1lc3NhZ2UoanNvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29udGVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb21lbnQoYXR0cmlidXRlcy5jcmVhdGVkQXQpLnRvRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlciA/IFVzZXIuYnVpbGQoanNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlci5kYXRhKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5yb29tLmRhdGEuaWQpO1xuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBNZXNzYWdlW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoTWVzc2FnZS5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjb250ZW50VHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjcmVhdGVkQXQ6IERhdGUsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcjogVXNlcixcbiAgICAgICAgICAgICAgcmVhZG9ubHkgcm9vbUlkOiBzdHJpbmcpIHt9XG5cbiAgaGFzU2VuZGVySWQodXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5zZW5kZXIgJiYgdGhpcy5zZW5kZXIuaWQgPT09IHVzZXJJZDtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuL21lc3NhZ2UudHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIE5ld01lc3NhZ2Uge1xuICBjb250ZW50OiBzdHJpbmc7XG4gIGNvbnRlbnRUeXBlOiBzdHJpbmc7XG4gIGRldmljZVNlc3Npb25JZDogc3RyaW5nO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVzc2FnZVJlcG9zaXRvcnkge1xuXG4gIHByaXZhdGUgcm9vbVVybDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMucm9vbVVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyL3Jvb21zYDtcbiAgfVxuXG4gIGNyZWF0ZShyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgYXR0cmlidXRlczogYXR0cmlidXRlc1xuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLmJ1aWxkKHJlc3BvbnNlLmRhdGEpKSk7XG4gIH1cblxuICBmaW5kQWxsKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpLCB7IHBhcmFtczogYXR0cmlidXRlcyB9KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IE1lc3NhZ2UubWFwKHJlc3BvbnNlLmRhdGEpKSk7XG4gIH1cblxuICBkZWxldGUocm9vbTogUm9vbSwgbWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZGVsZXRlKGAke3RoaXMubWVzc2FnZVVybChyb29tLmlkKX0vJHttZXNzYWdlLmlkfWApXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcChyZXNwb25zZSA9PiBtZXNzYWdlKSk7XG4gIH1cblxuICBwcml2YXRlIG1lc3NhZ2VVcmwocm9vbUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5yb29tVXJsfS8ke3Jvb21JZH0vbWVzc2FnZXNgO1xuICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBBcnJheVV0aWxzIHtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBhcnJheSB3aGVyZSBwcmVkaWNhdGUgaXMgdHJ1ZSwgYW5kIC0xXG4gICAqIG90aGVyd2lzZS5cbiAgICogQHBhcmFtIGl0ZW1zIGFycmF5IHRoYXQgd2lsbCBiZSBpbnNwZWN0ZWQgdG8gZmluZCBhbiBlbGVtZW50IGluZGV4XG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgZmluZCBjYWxscyBwcmVkaWNhdGUgb25jZSBmb3IgZWFjaCBlbGVtZW50IG9mIHRoZSBhcnJheSwgaW4gYXNjZW5kaW5nXG4gICAqIG9yZGVyLCB1bnRpbCBpdCBmaW5kcyBvbmUgd2hlcmUgcHJlZGljYXRlIHJldHVybnMgdHJ1ZS4gSWYgc3VjaCBhbiBlbGVtZW50IGlzIGZvdW5kLFxuICAgKiBmaW5kSW5kZXggaW1tZWRpYXRlbHkgcmV0dXJucyB0aGF0IGVsZW1lbnQgaW5kZXguIE90aGVyd2lzZSwgZmluZEluZGV4IHJldHVybnMgLTEuXG4gICAqL1xuICBzdGF0aWMgZmluZEluZGV4PFQ+KGl0ZW1zOiBUW10sIHByZWRpY2F0ZTogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuKTogbnVtYmVyIHtcbiAgICBmb3IgKGxldCBjdXJyZW50SW5kZXggPSAwOyBjdXJyZW50SW5kZXggPCBpdGVtcy5sZW5ndGg7ICsrY3VycmVudEluZGV4KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmFwcGx5KGl0ZW1zW2N1cnJlbnRJbmRleF0sIGN1cnJlbnRJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBhcnJheSB3aGVyZSBwcmVkaWNhdGUgaXMgdHJ1ZSwgYW5kIHVuZGVmaW5lZFxuICAgKiBvdGhlcndpc2UuXG4gICAqIEBwYXJhbSBpdGVtcyBhcnJheSB0aGF0IHdpbGwgYmUgaW5zcGVjdGVkIHRvIGZpbmQgYW4gZWxlbWVudFxuICAgKiBAcGFyYW0gcHJlZGljYXRlIGZpbmQgY2FsbHMgcHJlZGljYXRlIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXksIGluIGFzY2VuZGluZ1xuICAgKiBvcmRlciwgdW50aWwgaXQgZmluZHMgb25lIHdoZXJlIHByZWRpY2F0ZSByZXR1cm5zIHRydWUuIElmIHN1Y2ggYW4gZWxlbWVudCBpcyBmb3VuZCwgZmluZFxuICAgKiBpbW1lZGlhdGVseSByZXR1cm5zIHRoYXQgZWxlbWVudCB2YWx1ZS4gT3RoZXJ3aXNlLCBmaW5kIHJldHVybnMgdW5kZWZpbmVkLlxuICAgKi9cbiAgc3RhdGljIGZpbmQ8VD4oaXRlbXM6IFRbXSwgcHJlZGljYXRlOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW4pOiBUIHtcbiAgICBmb3IgKGxldCBjdXJyZW50SW5kZXggPSAwOyBjdXJyZW50SW5kZXggPCBpdGVtcy5sZW5ndGg7ICsrY3VycmVudEluZGV4KSB7XG4gICAgICBjb25zdCBpdGVtID0gaXRlbXNbY3VycmVudEluZGV4XTtcbiAgICAgIGlmIChwcmVkaWNhdGUuYXBwbHkoaXRlbSwgY3VycmVudEluZGV4KSkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEFycmF5VXRpbHMgfSBmcm9tIFwiLi4vYXJyYXkudXRpbHNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9yb29tLnJlcG9zaXRvcnlcIjtcblxuZXhwb3J0IGNsYXNzIFJvb20ge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGpzb24uYXR0cmlidXRlcztcbiAgICBjb25zdCB1c2VycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBzZW5kZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBtZXNzYWdlcyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMgPyBNZXNzYWdlLm1hcChqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBpbml0aWF0b3IgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvciA/IFVzZXIuYnVpbGQoanNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvci5kYXRhKSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gbmV3IFJvb20oanNvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0ID8gbW9tZW50KGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQpLnV0YygpLnRvRGF0ZSgpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm9wZW4sXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudW5yZWFkTWVzc2FnZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICB1c2VycyxcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVycyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRvcixcbiAgICAgICAgICAgICAgICAgICAgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKHJvb20gPT4gUm9vbS5idWlsZChyb29tLCByb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBuZXdNZXNzYWdlTm90aWZpZXI6IChtZXNzYWdlOiBNZXNzYWdlKSA9PiBhbnk7XG4gIHByaXZhdGUgaW50ZXJuYWxPcGVuOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsTmFtZTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG4gIHByaXZhdGUgaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDogQmVoYXZpb3JTdWJqZWN0PERhdGU+O1xuICBwcml2YXRlIGludGVybmFsSW1hZ2VVcmw6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgbGFzdEFjdGl2aXR5QXQ6IERhdGUsXG4gICAgICAgICAgICAgIG9wZW46IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByZWFkb25seSB1c2VyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG1lc3NhZ2VzOiBNZXNzYWdlW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGluaXRpYXRvcjogVXNlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsT3BlbiA9IG5ldyBCZWhhdmlvclN1YmplY3Qob3Blbik7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0ID0gbmV3IEJlaGF2aW9yU3ViamVjdChsYXN0QWN0aXZpdHlBdCk7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG5hbWUpO1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVucmVhZE1lc3NhZ2VDb3VudCk7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bmRlZmluZWQpO1xuICB9XG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lLnZhbHVlO1xuICB9XG5cbiAgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUubmV4dChuYW1lKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTmFtZSgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lO1xuICB9XG5cbiAgZ2V0IG9wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuLnZhbHVlO1xuICB9XG5cbiAgc2V0IG9wZW4ob3BlbjogYm9vbGVhbikge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuLm5leHQob3Blbik7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU9wZW4oKTogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW47XG4gIH1cblxuICBnZXQgbGFzdEFjdGl2aXR5QXQoKTogRGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC52YWx1ZTtcbiAgfVxuXG4gIHNldCBsYXN0QWN0aXZpdHlBdChsYXN0QWN0aXZpdHlBdDogRGF0ZSkge1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC5uZXh0KGxhc3RBY3Rpdml0eUF0KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTGFzdEFjdGl2aXR5QXQoKTogQmVoYXZpb3JTdWJqZWN0PERhdGU+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0O1xuICB9XG5cbiAgZ2V0IGltYWdlVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybC52YWx1ZTtcbiAgfVxuXG4gIHNldCBpbWFnZVVybChpbWFnZVVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsLm5leHQoaW1hZ2VVcmwpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVJbWFnZVVybCgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybDtcbiAgfVxuXG5cbiAgb3Blbk1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCB0cnVlKTtcbiAgfVxuXG4gIGNsb3NlTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIGZhbHNlKTtcbiAgfVxuXG4gIG1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5Lm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHRoaXMpO1xuICB9XG5cbiAgYWRkTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgIHRoaXMubGFzdEFjdGl2aXR5QXQgPSBtZXNzYWdlLmNyZWF0ZWRBdDtcbiAgfVxuXG4gIG5vdGlmeU5ld01lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGlmICh0aGlzLm5ld01lc3NhZ2VOb3RpZmllcikge1xuICAgICAgdGhpcy5uZXdNZXNzYWdlTm90aWZpZXIuYXBwbHkobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cblxuICBoYXNVc2VyKHVzZXJJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLnVzZXJzLm1hcCh1c2VyID0+IHVzZXIuaWQpLCBpZCA9PiBpZCA9PT0gdXNlcklkKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZmV0Y2hNb3JlTWVzc2FnZSgpOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGZpcnN0U2Vlbk1lc3NhZ2VJZDogdGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwID8gdGhpcy5tZXNzYWdlc1swXS5pZCA6IHVuZGVmaW5lZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5maW5kTWVzc2FnZXModGhpcywgcGFyYW1zKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICBtYXAobWVzc2FnZXMgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQuYXBwbHkodGhpcy5tZXNzYWdlcywgbWVzc2FnZXMpO1xuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBmaW5kTWVzc2FnZVdpdGhJZChpZDogc3RyaW5nKTogTWVzc2FnZSB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLm1lc3NhZ2VzLCBtZXNzYWdlID0+IG1lc3NhZ2UuaWQgPT09IGlkKTtcbiAgfVxuXG4gIHVwZGF0ZSgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGUodGhpcyk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShuZXdNZXNzYWdlOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5jcmVhdGVNZXNzYWdlKHRoaXMsIG5ld01lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgbWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICk7XG4gIH1cblxuICByZW1vdmVNZXNzYWdlKG1lc3NhZ2VUb0RlbGV0ZTogTWVzc2FnZSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5tZXNzYWdlcywgbWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBtZXNzYWdlVG9EZWxldGUuaWQpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlVG9EZWxldGU7XG4gIH1cblxuICBkZWxldGUobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZGVsZXRlTWVzc2FnZSh0aGlzLCBtZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKGRlbGV0ZWRNZXNzYWdlID0+IHRoaXMucmVtb3ZlTWVzc2FnZShkZWxldGVkTWVzc2FnZSkpKTtcbiAgfVxuXG4gIHJlcGxhY2VVc2Vyc1dpdGgocm9vbTogUm9vbSk6IFJvb20ge1xuICAgIHRoaXMudXNlcnMuc3BsaWNlKDAsIHRoaXMudXNlcnMubGVuZ3RoKTtcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLnVzZXJzLCByb29tLnVzZXJzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZFVzZXIodXNlcjogVXNlcikge1xuICAgIGlmICghdGhpcy5oYXNVc2VyKHVzZXIuaWQpKSB7XG4gICAgICB0aGlzLnVzZXJzLnB1c2godXNlcik7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi9yb29tLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb29tUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSByb29tVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMucm9vbVVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyL3Jvb21zYDtcbiAgfVxuXG4gIGZpbmQoaWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KGAke3RoaXMucm9vbVVybH0vJHtpZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGpzb246IGFueSkgPT4gUm9vbS5idWlsZChqc29uLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICBmaW5kQWxsKHF1ZXJ5OiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXSB9KTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLnJvb21VcmwsIHsgcGFyYW1zOiBxdWVyeSB9KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGpzb246IGFueSkgPT4gUm9vbS5tYXAoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZE9wZW5lZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IG9ubHlPcGVuZWQ6IFwidHJ1ZVwiIH0pO1xuICB9XG5cbiAgZmluZENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IG9ubHlDbG9zZWQ6IFwidHJ1ZVwiIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQWZ0ZXIoaWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IGZpcnN0U2VlblJvb21JZDogaWQgfSk7XG4gIH1cblxuICBmaW5kUm9vbXNCeUlkcyhyb29tSWRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBcInJvb21JZHNbXVwiOiByb29tSWRzIH0pO1xuICB9XG5cbiAgdXBkYXRlTWVtYmVyc2hpcChyb29tOiBSb29tLCBvcGVuOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBgLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVtYmVyc2hpcFwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgb3Blbjogb3BlblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgcm9vbS5vcGVuID0gZGF0YS5kYXRhLmF0dHJpYnV0ZXMub3BlbjtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIGlmIChyb29tLnVucmVhZE1lc3NhZ2VDb3VudCA+IDApIHtcbiAgICAgIGNvbnN0IGxhc3RSZWFkTWVzc2FnZUlkID0gcm9vbS5tZXNzYWdlcy5sZW5ndGggPiAwID8gcm9vbS5tZXNzYWdlc1tyb29tLm1lc3NhZ2VzLmxlbmd0aCAtIDFdLmlkIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXAvdW5yZWFkLW1lc3NhZ2VzYCwgeyBkYXRhOiB7IGxhc3RSZWFkTWVzc2FnZUlkOiBsYXN0UmVhZE1lc3NhZ2VJZCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLm1ldGEuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoMCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfT9ub0R1cGxpY2F0ZT0ke3dpdGhvdXREdXBsaWNhdGV9YCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcInJvb21cIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXJzOiB7XG4gICAgICAgICAgICBkYXRhOiB1c2VySWRzLm1hcCh1c2VySWQgPT4gKHsgdHlwZTogXCJ1c2VyXCIsIGlkOiB1c2VySWQgfSkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBub0R1cGxpY2F0ZTogYCR7d2l0aG91dER1cGxpY2F0ZX1gXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IFJvb20uYnVpbGQocmVzcG9uc2UuZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIHVwZGF0ZShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9YCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcInJvb21cIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG5hbWU6IHJvb20ubmFtZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIHJvb20ubmFtZSA9IHJlc3BvbnNlLmRhdGEuYXR0cmlidXRlcy5uYW1lO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgYWRkVXNlcihyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcHNgLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVtYmVyc2hpcFwiLFxuICAgICAgICByZWxhdGlvbnNoaXBzOiB7XG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICB0eXBlOiBcInVzZXJcIixcbiAgICAgICAgICAgICAgaWQ6IHVzZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICBjb25zdCBuZXdVc2VyID0gVXNlci5idWlsZChyZXNwb25zZS5kYXRhLnJlbGF0aW9uc2hpcHMudXNlci5kYXRhKTtcbiAgICAgIHJvb20uYWRkVXNlcihuZXdVc2VyKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2Uocm9vbTogUm9vbSwgbWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmRlbGV0ZShyb29tLCBtZXNzYWdlKTtcbiAgfVxuXG4gIGZpbmRNZXNzYWdlcyhyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmZpbmRBbGwocm9vbSwgYXR0cmlidXRlcyk7XG4gIH1cblxuICBjcmVhdGVNZXNzYWdlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5jcmVhdGUocm9vbSwgYXR0cmlidXRlcyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGZsYXRNYXAsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQXJyYXlVdGlscyB9IGZyb20gXCIuLi9hcnJheS51dGlsc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmV4cG9ydCBjbGFzcyBNZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KTogTWUge1xuICAgIGNvbnN0IHVucmVhZE1lc3NhZ2VDb3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnVucmVhZE1lc3NhZ2VDb3VudCA6IDA7XG4gICAgY29uc3Qgcm9vbUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEucm9vbUNvdW50IDogMDtcbiAgICByZXR1cm4gbmV3IE1lKGpzb24uZGF0YS5pZCwgW10sIFtdLCB1bnJlYWRNZXNzYWdlQ291bnQsIHJvb21Db3VudCwgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgcHVibGljIGRldmljZVNlc3Npb25JZDogc3RyaW5nO1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFJvb21Db3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgZmlyc3RTZWVuUm9vbTogUm9vbTtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBvcGVuZWRSb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcm9vbUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50IHx8IDApO1xuICAgIHRoaXMuaW50ZXJuYWxSb29tQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHJvb21Db3VudCB8fCAwKTtcbiAgfVxuXG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCByb29tQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudC52YWx1ZTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlUm9vbUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudDtcbiAgfVxuXG4gIGZldGNoT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kT3BlbmVkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZENsb3NlZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hNb3JlUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICBpZiAodGhpcy5maXJzdFNlZW5Sb29tKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNBZnRlcih0aGlzLmZpcnN0U2VlblJvb20uaWQpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKFtdKTtcbiAgICB9XG4gIH1cblxuICBmZXRjaFJvb21zQnlJZChyb29tSWRzOiBzdHJpbmdbXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQnlJZHMocm9vbUlkcykucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmQocm9vbUlkKS5waXBlKG1hcChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZpbmRPckZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQocm9vbUlkKTtcbiAgICBpZiAocm9vbUlkKSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZldGNoUm9vbUJ5SWQocm9vbUlkKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVOZXdNZXNzYWdlKG5ld01lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLmZpbmRPckZldGNoUm9vbUJ5SWQobmV3TWVzc2FnZS5yb29tSWQpXG4gICAgICAgIC5zdWJzY3JpYmUocm9vbSA9PiB7XG4gICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIHJvb20uYWRkTWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIHJvb20ubm90aWZ5TmV3TWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIGlmICghbmV3TWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgaWYgKCFyb29tLm9wZW4pIHtcbiAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IHJvb20udW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBhZGRSb29tKG5ld1Jvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbShuZXdSb29tKSkge1xuICAgICAgaWYgKCF0aGlzLmZpcnN0U2VlblJvb20gfHwgbW9tZW50KHRoaXMuZmlyc3RTZWVuUm9vbS5sYXN0QWN0aXZpdHlBdCkuaXNBZnRlcihuZXdSb29tLmxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICB0aGlzLmZpcnN0U2VlblJvb20gPSBuZXdSb29tO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByb29tSW5kZXggPSBBcnJheVV0aWxzLmZpbmRJbmRleCh0aGlzLnJvb21zLCByb29tID0+IHJvb20uaWQgPT09IG5ld1Jvb20uaWQpO1xuICAgICAgaWYgKHJvb21JbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMucm9vbXNbcm9vbUluZGV4XSA9IG5ld1Jvb207XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb21zLnB1c2gobmV3Um9vbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmluZFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogUm9vbSB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLnJvb21zLCByb29tID0+IHJvb21JZCA9PT0gcm9vbS5pZCk7XG4gIH1cblxuICBvcGVuUm9vbShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLm9wZW5NZW1iZXJzaGlwKClcbiAgICAgICAgICAgICAgICAgLnBpcGUoZmxhdE1hcCgob3BlbmVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkVG9PcGVuZWRSb29tKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKG9wZW5lZFJvb20pO1xuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHJldHVybiByb29tLmNsb3NlTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKG1hcChjbG9zZWRSb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsb3NlZFJvb207XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVJvb21zKHJvb21zVG9DbG9zZTogUm9vbVtdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gb2Yocm9vbXNUb0Nsb3NlKS5waXBlKFxuICAgICAgbWFwKHJvb21zID0+IHtcbiAgICAgICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHRoaXMuY2xvc2VSb29tKHJvb20pKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgb3BlblJvb21BbmRDbG9zZU90aGVycyhyb29tVG9PcGVuOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbXNUb0JlQ2xvc2VkID0gdGhpcy5vcGVuZWRSb29tcy5maWx0ZXIocm9vbSA9PiByb29tLmlkICE9PSByb29tVG9PcGVuLmlkKTtcbiAgICByZXR1cm4gdGhpcy5jbG9zZVJvb21zKHJvb21zVG9CZUNsb3NlZCkucGlwZShmbGF0TWFwKHJvb21zID0+IHRoaXMub3BlblJvb20ocm9vbVRvT3BlbikpKTtcbiAgfVxuXG4gIGhhc09wZW5lZFJvb21zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wZW5lZFJvb21zLmxlbmd0aCA+IDA7XG4gIH1cblxuICBjcmVhdGVSb29tKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5jcmVhdGUobmFtZSwgdXNlcklkcywgd2l0aG91dER1cGxpY2F0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIGJ1aWxkUm9vbSh1c2VySWRzOiBzdHJpbmdbXSk6IFJvb20ge1xuICAgIGNvbnN0IHVzZXJzID0gdXNlcklkcy5tYXAoaWQgPT4gbmV3IFVzZXIoaWQsIFwiXCIpKTtcbiAgICBjb25zdCBub1NlbmRlcnMgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2UgPSBbXTtcbiAgICBjb25zdCBub01lc3NhZ2VVbnJlYWQgPSAwO1xuICAgIGNvbnN0IG5vSWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgaW5pdGlhdG9yID0gdGhpcy50b1VzZXIoKTtcbiAgICByZXR1cm4gbmV3IFJvb20obm9JZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHRydWUsXG4gICAgICBub01lc3NhZ2VVbnJlYWQsXG4gICAgICB1c2VycyxcbiAgICAgIG5vU2VuZGVycyxcbiAgICAgIG5vTWVzc2FnZSxcbiAgICAgIGluaXRpYXRvcixcbiAgICAgIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKHJvb206IFJvb20sIGNvbnRlbnQ6IHN0cmluZywgY29udGVudFR5cGU6IHN0cmluZyk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiByb29tLnNlbmRNZXNzYWdlKHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBjb250ZW50VHlwZTogY29udGVudFR5cGUsXG4gICAgICBkZXZpY2VTZXNzaW9uSWQ6IHRoaXMuZGV2aWNlU2Vzc2lvbklkXG4gICAgfSk7XG4gIH1cblxuICBpc1NlbnRCeU1lKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbWVzc2FnZSAmJiBtZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChtZXNzYWdlLnJvb21JZCk7XG4gICAgICBpZiAocm9vbSkge1xuICAgICAgICByZXR1cm4gcm9vbS5kZWxldGUobWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgYWRkVXNlclRvKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuYWRkVXNlcihyb29tLCB1c2VySWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRSb29tcyhyb29tczogUm9vbVtdKSB7XG4gICAgcm9vbXMuZm9yRWFjaChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIGlmIChyb29tLm9wZW4gJiYgIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb20ocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGhhc1Jvb21PcGVuZWQocm9vbVRvRmluZDogUm9vbSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tKHJvb206IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbUJ5SWQocm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmRSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBSb29tIHtcbiAgICByZXR1cm4gQXJyYXlVdGlscy5maW5kKHRoaXMub3BlbmVkUm9vbXMsIHJvb20gPT4gcm9vbVRvRmluZC5pZCA9PT0gcm9vbS5pZCk7XG4gIH1cblxuICBwcml2YXRlIGFkZFRvT3BlbmVkUm9vbShyb29tOiBSb29tKSB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgIHRoaXMub3BlbmVkUm9vbXMucHVzaChyb29tKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbW92ZUZyb21PcGVuZWRSb29tKGNsb3NlZFJvb206IFJvb20pIHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKGNsb3NlZFJvb20pKSB7XG4gICAgICBjb25zdCByb29tSW5kZXggPSBBcnJheVV0aWxzLmZpbmRJbmRleCh0aGlzLm9wZW5lZFJvb21zLCByb29tID0+IHJvb20uaWQgPT09IGNsb3NlZFJvb20uaWQpO1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5zcGxpY2Uocm9vbUluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gcm9vbS5tYXJrQWxsTWVzc2FnZXNBc1JlYWQoKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlYWRNZXNzYWdlQ291bnQgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSBNYXRoLm1heCh0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCAtIHJlYWRNZXNzYWdlQ291bnQsIDApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1VzZXIoKTogVXNlciB7XG4gICAgcmV0dXJuIG5ldyBVc2VyKHRoaXMuaWQsIFwiXCIpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgZW1wdHksIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVJlcG9zaXRvcnkge1xuXG4gIHByaXZhdGUgdXNlclVybDogc3RyaW5nO1xuICBwcml2YXRlIGFsaXZlVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMudXNlclVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyYDtcbiAgICB0aGlzLmFsaXZlVXJsID0gYCR7dGhpcy51c2VyVXJsfS9hbGl2ZWA7XG4gIH1cblxuICBmaW5kTWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMudXNlclVybCkucGlwZShtYXAobWUgPT4gTWUuYnVpbGQobWUsIHRoaXMucm9vbVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGVBbGl2ZW5lc3MobWU6IE1lKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodGhpcy5hbGl2ZVVybCwgeyBkYXRhOiB7IHR5cGU6IFwiYWxpdmVcIiB9fSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcigoKSA9PiBlbXB0eSgpKSwgbWFwKCgpID0+IG51bGwpKTtcbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgKiBhcyBpbyBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IHsgVVJMX0NPTkZJR1VSQVRJT04sIFVybENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5cblxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwU29ja2V0IHtcblxuICBwcml2YXRlIHNvY2tldDogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIHByaXZhdGUgY29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbikge31cblxuICBjb25uZWN0KHRva2VuOiBzdHJpbmcpOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCh0aGlzLmNvbmZpZ3VyYXRpb24uc29ja2V0VXJsLCB7XG4gICAgICBmb3JjZU5ldzogdHJ1ZSxcbiAgICAgIHF1ZXJ5OiBgdG9rZW49JHt0b2tlbn1gXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0O1xuICB9XG5cbiAgc29ja2V0RXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNvY2tldCAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBpZiAodGhpcy5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRpbWVyIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCwgcHVibGlzaFJlcGxheSwgcmVmQ291bnQsIHNoYXJlLCB0YWtlV2hpbGUgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vLi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lU2VydmljZSB7XG5cbiAgcHJpdmF0ZSBjYWNoZWRNZTogT2JzZXJ2YWJsZTxNZT47XG4gIHByaXZhdGUgYWxpdmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtZVJlcG9zaXRvcnk6IE1lUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBzb2NrZXRDbGllbnQ6IEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0dXAodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uaXNBcGlUb2tlblNldCgpKSB7XG4gICAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbiA9IHRva2VuO1xuICAgIH1cbiAgfVxuXG4gIG1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICBpZiAoIXRoaXMuaGFzQ2FjaGVkTWUoKSkge1xuICAgICAgdGhpcy5jYWNoZWRNZSA9IHRoaXMubWVSZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kTWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAobWUgPT4gdGhpcy5zY2hlZHVsZUFsaXZlbmVzcyhtZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2hSZXBsYXkoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmQ291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFyZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lLnBpcGUobWFwKG1lID0+IHRoaXMuY29ubmVjdFNvY2tldChtZSkpKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmNsZWFyKCk7XG4gICAgdGhpcy5jYWNoZWRNZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQWxpdmVuZXNzKG1lOiBNZSk6IE1lIHtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICB0aW1lcigwLCB0aGlzLmNvbmZpZ3VyYXRpb24uYWxpdmVJbnRlcnZhbEluTXMpLnBpcGUoXG4gICAgICB0YWtlV2hpbGUoKCkgPT4gdGhpcy5hbGl2ZSlcbiAgICApXG4gICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLm1lUmVwb3NpdG9yeS51cGRhdGVBbGl2ZW5lc3MobWUpKTtcbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIGhhc0NhY2hlZE1lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGNvbm5lY3RTb2NrZXQobWU6IE1lKTogTWUge1xuICAgIGlmICghdGhpcy5zb2NrZXRDbGllbnQuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuc29ja2V0Q2xpZW50LmNvbm5lY3QodGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pO1xuICAgICAgc29ja2V0Lm9uKFwibmV3IG1lc3NhZ2VcIiwgZGF0YSA9PiB0aGlzLnJlY2VpdmVOZXdNZXNzYWdlKGRhdGEpKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RlZFwiLCBkYXRhID0+IG1lLmRldmljZVNlc3Npb25JZCA9IGRhdGEuZGV2aWNlU2Vzc2lvbklkKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSByZWNlaXZlTmV3TWVzc2FnZShqc29uOiBhbnkpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gTWVzc2FnZS5idWlsZChqc29uLmRhdGEpO1xuICAgIHRoaXMubWUoKS5zdWJzY3JpYmUobWUgPT4gbWUuaGFuZGxlTmV3TWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbkBQaXBlKHtcbiAgbmFtZTogXCJzb3J0Um9vbXNcIlxufSlcbmV4cG9ydCBjbGFzcyBTb3J0Um9vbVBpcGUgIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybShyb29tczogUm9vbVtdLCBmaWVsZDogc3RyaW5nKTogYW55W10ge1xuICAgIGlmIChyb29tcyAhPT0gdW5kZWZpbmVkICYmIHJvb21zICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcm9vbXMuc29ydCgocm9vbTogUm9vbSwgb3RoZXJSb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RBY3Rpdml0eUF0ICAgICAgPSByb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBjb25zdCBvdGhlckxhc3RBY3Rpdml0eUF0ID0gb3RoZXJSb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBpZiAobW9tZW50KGxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShvdGhlckxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKG1vbWVudChvdGhlckxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShsYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IgfSBmcm9tIFwiLi9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUvbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWVTZXJ2aWNlIH0gZnJvbSBcIi4vbWUvbWUuc2VydmljZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgU29ydFJvb21QaXBlIH0gZnJvbSBcIi4vcGlwZS9zb3J0LXJvb21cIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBIdHRwQ2xpZW50TW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFNvcnRSb29tUGlwZVxuICBdXG4gfSlcbmV4cG9ydCBjbGFzcyBCYWJpbGlNb2R1bGUge1xuICBzdGF0aWMgZm9yUm9vdCh1cmxDb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBCYWJpbGlNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFVSTF9DT05GSUdVUkFUSU9OLFxuICAgICAgICAgIHVzZVZhbHVlOiB1cmxDb25maWd1cmF0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIFNvcnRSb29tUGlwZSxcbiAgICAgICAgVG9rZW5Db25maWd1cmF0aW9uLFxuICAgICAgICBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgIFJvb21SZXBvc2l0b3J5LFxuICAgICAgICBNZVJlcG9zaXRvcnksXG4gICAgICAgIE1lU2VydmljZVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJtb21lbnQiLCJpby5jb25uZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0lBTUU7S0FBZ0I7Ozs7SUFFaEIsMENBQWE7OztJQUFiO1FBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQztLQUN0Rjs7OztJQUVELGtDQUFLOzs7SUFBTDtRQUNFLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0tBQzNCOztnQkFaRixVQUFVOzs7OzZCQUZYOzs7Ozs7O0FDQUEsQUFFTyxxQkFBTSxpQkFBaUIsR0FBRyxJQUFJLGNBQWMsQ0FBbUIsd0JBQXdCLENBQUMsQ0FBQzs7Ozs7O0FDRmhHLElBQUE7SUFDRSw0QkFBcUIsS0FBVTtRQUFWLFVBQUssR0FBTCxLQUFLLENBQUs7S0FBSTs2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