(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('moment'), require('@angular/common/http'), require('rxjs'), require('rxjs/operators'), require('socket.io-client')) :
    typeof define === 'function' && define.amd ? define('@babili.io/angular', ['exports', '@angular/core', 'moment', '@angular/common/http', 'rxjs', 'rxjs/operators', 'socket.io-client'], factory) :
    (factory((global.babili = global.babili || {}, global.babili.io = global.babili.io || {}, global.babili.io.angular = {}),global.ng.core,null,global.ng.common.http,null,global.Rx.Observable.prototype,null));
}(this, (function (exports,core,momentLoaded,http,rxjs,operators,io) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var /** @type {?} */ moment = momentLoaded;
    var SortRoomPipe = (function () {
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
            };
        SortRoomPipe.decorators = [
            { type: core.Pipe, args: [{
                        name: "sortRooms"
                    },] },
        ];
        return SortRoomPipe;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var TokenConfiguration = (function () {
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
            { type: core.Injectable },
        ];
        /** @nocollapse */
        TokenConfiguration.ctorParameters = function () { return []; };
        return TokenConfiguration;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var /** @type {?} */ URL_CONFIGURATION = new core.InjectionToken("BabiliUrlConfiguration");

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var NotAuthorizedError = (function () {
        function NotAuthorizedError(error) {
            this.error = error;
        }
        return NotAuthorizedError;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var HttpAuthenticationInterceptor = (function () {
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
                        .pipe(operators.catchError(function (error) {
                        if (error instanceof http.HttpErrorResponse && error.status === 401) {
                            return rxjs.throwError(new NotAuthorizedError(error));
                        }
                        else {
                            return rxjs.throwError(error);
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
            { type: core.Injectable },
        ];
        /** @nocollapse */
        HttpAuthenticationInterceptor.ctorParameters = function () {
            return [
                { type: undefined, decorators: [{ type: core.Inject, args: [URL_CONFIGURATION,] }] },
                { type: TokenConfiguration }
            ];
        };
        return HttpAuthenticationInterceptor;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var User = (function () {
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
    var /** @type {?} */ moment$1 = momentLoaded;
    var Message = (function () {
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
                return new Message(json.id, attributes.content, attributes.contentType, moment$1(attributes.createdAt).toDate(), json.relationships.sender ? User.build(json.relationships.sender.data) : undefined, json.relationships.room.data.id);
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
    var MessageRepository = (function () {
        function MessageRepository(http$$1, configuration) {
            this.http = http$$1;
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
                }).pipe(operators.map(function (response) { return Message.build(response.data); }));
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
                    .pipe(operators.map(function (response) { return Message.map(response.data); }));
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
                    .pipe(operators.map(function (response) { return message; }));
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
            { type: core.Injectable },
        ];
        /** @nocollapse */
        MessageRepository.ctorParameters = function () {
            return [
                { type: http.HttpClient },
                { type: undefined, decorators: [{ type: core.Inject, args: [URL_CONFIGURATION,] }] }
            ];
        };
        return MessageRepository;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var ArrayUtils = (function () {
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
    var /** @type {?} */ moment$2 = momentLoaded;
    var Room = (function () {
        function Room(id, name, lastActivityAt, open, unreadMessageCount, users, senders, messages, initiator, roomRepository) {
            this.id = id;
            this.users = users;
            this.senders = senders;
            this.messages = messages;
            this.initiator = initiator;
            this.roomRepository = roomRepository;
            this.internalOpen = new rxjs.BehaviorSubject(open);
            this.internalLastActivityAt = new rxjs.BehaviorSubject(lastActivityAt);
            this.internalName = new rxjs.BehaviorSubject(name);
            this.internalUnreadMessageCount = new rxjs.BehaviorSubject(unreadMessageCount);
            this.internalImageUrl = new rxjs.BehaviorSubject(undefined);
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
                return new Room(json.id, attributes.name, attributes.lastActivityAt ? moment$2(attributes.lastActivityAt).utc().toDate() : undefined, attributes.open, attributes.unreadMessageCount, users, senders, messages, initiator, roomRepository);
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
             */ function () {
                return this.internalUnreadMessageCount.value;
            },
            set: /**
             * @param {?} count
             * @return {?}
             */ function (count) {
                this.internalUnreadMessageCount.next(count);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "observableUnreadMessageCount", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalUnreadMessageCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "name", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalName.value;
            },
            set: /**
             * @param {?} name
             * @return {?}
             */ function (name) {
                this.internalName.next(name);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "observableName", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "open", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalOpen.value;
            },
            set: /**
             * @param {?} open
             * @return {?}
             */ function (open) {
                this.internalOpen.next(open);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "observableOpen", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalOpen;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "lastActivityAt", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalLastActivityAt.value;
            },
            set: /**
             * @param {?} lastActivityAt
             * @return {?}
             */ function (lastActivityAt) {
                this.internalLastActivityAt.next(lastActivityAt);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "observableLastActivityAt", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalLastActivityAt;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "imageUrl", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalImageUrl.value;
            },
            set: /**
             * @param {?} imageUrl
             * @return {?}
             */ function (imageUrl) {
                this.internalImageUrl.next(imageUrl);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Room.prototype, "observableImageUrl", {
            get: /**
             * @return {?}
             */ function () {
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
                    .pipe(operators.map(function (messages) {
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
                    .pipe(operators.map(function (message) {
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
                    .pipe(operators.map(function (deletedMessage) { return _this.removeMessage(deletedMessage); }));
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
    var RoomRepository = (function () {
        function RoomRepository(http$$1, messageRepository, configuration) {
            this.http = http$$1;
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
                    .pipe(operators.map(function (json) { return Room.build(json.data, _this, _this.messageRepository); }));
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
                    .pipe(operators.map(function (json) { return Room.map(json.data, _this, _this.messageRepository); }));
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
                }).pipe(operators.map(function (data) {
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
                        .pipe(operators.map(function (data) {
                        room.unreadMessageCount = 0;
                        return data.meta.count;
                    }));
                }
                else {
                    return rxjs.of(0);
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
                }).pipe(operators.map(function (response) { return Room.build(response.data, _this, _this.messageRepository); }));
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
                }).pipe(operators.map(function (response) {
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
                }).pipe(operators.map(function (response) {
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
            { type: core.Injectable },
        ];
        /** @nocollapse */
        RoomRepository.ctorParameters = function () {
            return [
                { type: http.HttpClient },
                { type: MessageRepository },
                { type: undefined, decorators: [{ type: core.Inject, args: [URL_CONFIGURATION,] }] }
            ];
        };
        return RoomRepository;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var /** @type {?} */ moment$3 = momentLoaded;
    var Me = (function () {
        function Me(id, openedRooms, rooms, unreadMessageCount, roomCount, roomRepository) {
            this.id = id;
            this.openedRooms = openedRooms;
            this.rooms = rooms;
            this.roomRepository = roomRepository;
            this.internalUnreadMessageCount = new rxjs.BehaviorSubject(unreadMessageCount || 0);
            this.internalRoomCount = new rxjs.BehaviorSubject(roomCount || 0);
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
             */ function () {
                return this.internalUnreadMessageCount.value;
            },
            set: /**
             * @param {?} count
             * @return {?}
             */ function (count) {
                this.internalUnreadMessageCount.next(count);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Me.prototype, "observableUnreadMessageCount", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalUnreadMessageCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Me.prototype, "roomCount", {
            get: /**
             * @return {?}
             */ function () {
                return this.internalRoomCount.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Me.prototype, "observableRoomCount", {
            get: /**
             * @return {?}
             */ function () {
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
                return this.roomRepository.findOpenedRooms().pipe(operators.map(function (rooms) {
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
                return this.roomRepository.findClosedRooms().pipe(operators.map(function (rooms) {
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
                    return this.roomRepository.findRoomsAfter(this.firstSeenRoom.id).pipe(operators.map(function (rooms) {
                        _this.addRooms(rooms);
                        return rooms;
                    }));
                }
                else {
                    return rxjs.of([]);
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
                return this.roomRepository.findRoomsByIds(roomIds).pipe(operators.map(function (rooms) {
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
                return this.roomRepository.find(roomId).pipe(operators.map(function (room) {
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
                    return rxjs.of(room);
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
                    if (!this.firstSeenRoom || moment$3(this.firstSeenRoom.lastActivityAt).isAfter(newRoom.lastActivityAt)) {
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
                        .pipe(operators.flatMap(function (openedRoom) {
                        _this.addToOpenedRoom(openedRoom);
                        return _this.markAllReceivedMessagesAsRead(openedRoom);
                    }));
                }
                else {
                    return rxjs.of(room);
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
                        .pipe(operators.map(function (closedRoom) {
                        _this.removeFromOpenedRoom(closedRoom);
                        return closedRoom;
                    }));
                }
                else {
                    return rxjs.of(room);
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
                return rxjs.of(roomsToClose).pipe(operators.map(function (rooms) {
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
                return this.closeRooms(roomsToBeClosed).pipe(operators.flatMap(function (rooms) { return _this.openRoom(roomToOpen); }));
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
                    .pipe(operators.map(function (room) {
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
                        return rxjs.of(undefined);
                    }
                }
                else {
                    return rxjs.of(undefined);
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
                    .pipe(operators.map(function (readMessageCount) {
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
    var MeRepository = (function () {
        function MeRepository(http$$1, roomRepository, configuration) {
            this.http = http$$1;
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
                return this.http.get(this.userUrl).pipe(operators.map(function (me) { return Me.build(me, _this.roomRepository); }));
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
                    .pipe(operators.catchError(function () { return rxjs.empty(); }), operators.map(function () { return null; }));
            };
        MeRepository.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        MeRepository.ctorParameters = function () {
            return [
                { type: http.HttpClient },
                { type: RoomRepository },
                { type: undefined, decorators: [{ type: core.Inject, args: [URL_CONFIGURATION,] }] }
            ];
        };
        return MeRepository;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var BootstrapSocket = (function () {
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
                this.socket = io.connect(this.configuration.socketUrl, {
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
            { type: core.Injectable },
        ];
        /** @nocollapse */
        BootstrapSocket.ctorParameters = function () {
            return [
                { type: undefined, decorators: [{ type: core.Inject, args: [URL_CONFIGURATION,] }] }
            ];
        };
        return BootstrapSocket;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var MeService = (function () {
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
                        .pipe(operators.map(function (me) { return _this.scheduleAliveness(me); }), operators.publishReplay(1), operators.refCount(), operators.share());
                }
                return this.cachedMe.pipe(operators.map(function (me) { return _this.connectSocket(me); }));
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
                rxjs.timer(0, this.configuration.aliveIntervalInMs).pipe(operators.takeWhile(function () { return _this.alive; }))
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
            { type: core.Injectable },
        ];
        /** @nocollapse */
        MeService.ctorParameters = function () {
            return [
                { type: MeRepository },
                { type: BootstrapSocket },
                { type: undefined, decorators: [{ type: core.Inject, args: [URL_CONFIGURATION,] }] },
                { type: TokenConfiguration }
            ];
        };
        return MeService;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var BabiliModule = (function () {
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
                            provide: http.HTTP_INTERCEPTORS,
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
            { type: core.NgModule, args: [{
                        imports: [
                            http.HttpClientModule
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

    exports.Babili = babili_namespace;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvcGlwZS9zb3J0LXJvb20udHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vbm90LWF1dGhvcml6ZWQtZXJyb3IudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvdXNlci91c2VyLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9hcnJheS51dGlscy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3Jvb20vcm9vbS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3Jvb20vcm9vbS5yZXBvc2l0b3J5LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUudHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9tZS9tZS5yZXBvc2l0b3J5LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXQudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9tZS9tZS5zZXJ2aWNlLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYmFiaWxpLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5AUGlwZSh7XG4gIG5hbWU6IFwic29ydFJvb21zXCJcbn0pXG5leHBvcnQgY2xhc3MgU29ydFJvb21QaXBlICBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0ocm9vbXM6IFJvb21bXSwgZmllbGQ6IHN0cmluZyk6IGFueVtdIHtcbiAgICBpZiAocm9vbXMgIT09IHVuZGVmaW5lZCAmJiByb29tcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJvb21zLnNvcnQoKHJvb206IFJvb20sIG90aGVyUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBjb25zdCBsYXN0QWN0aXZpdHlBdCAgICAgID0gcm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgY29uc3Qgb3RoZXJMYXN0QWN0aXZpdHlBdCA9IG90aGVyUm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgaWYgKG1vbWVudChsYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUob3RoZXJMYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmIChtb21lbnQob3RoZXJMYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUobGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUb2tlbkNvbmZpZ3VyYXRpb24ge1xuICBwdWJsaWMgYXBpVG9rZW46IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgaXNBcGlUb2tlblNldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hcGlUb2tlbiAhPT0gdW5kZWZpbmVkICYmIHRoaXMuYXBpVG9rZW4gIT09IG51bGwgJiYgdGhpcy5hcGlUb2tlbiAhPT0gXCJcIjtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuYXBpVG9rZW4gPSB1bmRlZmluZWQ7XG4gIH1cblxufVxuIiwiaW1wb3J0IHsgSW5qZWN0aW9uVG9rZW4gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5leHBvcnQgY29uc3QgVVJMX0NPTkZJR1VSQVRJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48VXJsQ29uZmlndXJhdGlvbj4oXCJCYWJpbGlVcmxDb25maWd1cmF0aW9uXCIpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFVybENvbmZpZ3VyYXRpb24ge1xuICBhcGlVcmw6IHN0cmluZztcbiAgc29ja2V0VXJsOiBzdHJpbmc7XG4gIGFsaXZlSW50ZXJ2YWxJbk1zPzogbnVtYmVyO1xufVxuIiwiZXhwb3J0IGNsYXNzIE5vdEF1dGhvcml6ZWRFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGVycm9yOiBhbnkpIHt9XG59XG4iLCJpbXBvcnQgeyBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwSGFuZGxlciwgSHR0cEludGVyY2VwdG9yLCBIdHRwUmVxdWVzdCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRocm93RXJyb3IgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE5vdEF1dGhvcml6ZWRFcnJvciB9IGZyb20gXCIuL25vdC1hdXRob3JpemVkLWVycm9yXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSB1cmxzOiBVcmxDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7fVxuXG4gIGludGVyY2VwdChyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAodGhpcy5zaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHRoaXMuYWRkSGVhZGVyVG8ocmVxdWVzdCwgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pKVxuICAgICAgICAgICAgICAgICAucGlwZShjYXRjaEVycm9yKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSAmJiBlcnJvci5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IE5vdEF1dGhvcml6ZWRFcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXF1ZXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZEhlYWRlclRvKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIHRva2VuOiBzdHJpbmcpOiBIdHRwUmVxdWVzdDxhbnk+IHtcbiAgICByZXR1cm4gcmVxdWVzdC5jbG9uZSh7XG4gICAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnMuc2V0KFwiQXV0aG9yaXphdGlvblwiLCBgQmVhcmVyICR7dG9rZW59YClcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvdWxkQWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IGJvb2xlYW4ge1xuICAgIHJldHVybiByZXF1ZXN0LnVybC5zdGFydHNXaXRoKHRoaXMudXJscy5hcGlVcmwpO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgVXNlciB7XG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnkpOiBVc2VyIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIG5ldyBVc2VyKGpzb24uaWQsIGpzb24uYXR0cmlidXRlcyA/IGpzb24uYXR0cmlidXRlcy5zdGF0dXMgOiB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogVXNlcltdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKFVzZXIuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHN0YXR1czogc3RyaW5nKSB7fVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2Uge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnkpOiBNZXNzYWdlIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIHJldHVybiBuZXcgTWVzc2FnZShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb250ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbWVudChhdHRyaWJ1dGVzLmNyZWF0ZWRBdCkudG9EYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVyID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVyLmRhdGEpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5yZWxhdGlvbnNoaXBzLnJvb20uZGF0YS5pZCk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSk6IE1lc3NhZ2VbXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChNZXNzYWdlLmJ1aWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjb250ZW50OiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnRUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNyZWF0ZWRBdDogRGF0ZSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc2VuZGVyOiBVc2VyLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tSWQ6IHN0cmluZykge31cblxuICBoYXNTZW5kZXJJZCh1c2VySWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLnNlbmRlciAmJiB0aGlzLnNlbmRlci5pZCA9PT0gdXNlcklkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnZS50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTmV3TWVzc2FnZSB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgY29udGVudFR5cGU6IHN0cmluZztcbiAgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZXNzYWdlUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSByb29tVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5yb29tVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG5cbiAgY3JlYXRlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QodGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IE1lc3NhZ2UuYnVpbGQocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHsgcGFyYW1zOiBhdHRyaWJ1dGVzIH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5tYXAocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGRlbGV0ZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUoYCR7dGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpfS8ke21lc3NhZ2UuaWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlc3BvbnNlID0+IG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgbWVzc2FnZVVybChyb29tSWQ6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbUlkfS9tZXNzYWdlc2A7XG4gIH1cblxufVxuIiwiZXhwb3J0IGNsYXNzIEFycmF5VXRpbHMge1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIGFycmF5IHdoZXJlIHByZWRpY2F0ZSBpcyB0cnVlLCBhbmQgLTFcbiAgICogb3RoZXJ3aXNlLlxuICAgKiBAcGFyYW0gaXRlbXMgYXJyYXkgdGhhdCB3aWxsIGJlIGluc3BlY3RlZCB0byBmaW5kIGFuIGVsZW1lbnQgaW5kZXhcbiAgICogQHBhcmFtIHByZWRpY2F0ZSBmaW5kIGNhbGxzIHByZWRpY2F0ZSBvbmNlIGZvciBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5LCBpbiBhc2NlbmRpbmdcbiAgICogb3JkZXIsIHVudGlsIGl0IGZpbmRzIG9uZSB3aGVyZSBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLiBJZiBzdWNoIGFuIGVsZW1lbnQgaXMgZm91bmQsXG4gICAqIGZpbmRJbmRleCBpbW1lZGlhdGVseSByZXR1cm5zIHRoYXQgZWxlbWVudCBpbmRleC4gT3RoZXJ3aXNlLCBmaW5kSW5kZXggcmV0dXJucyAtMS5cbiAgICovXG4gIHN0YXRpYyBmaW5kSW5kZXg8VD4oaXRlbXM6IFRbXSwgcHJlZGljYXRlOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW4pOiBudW1iZXIge1xuICAgIGZvciAobGV0IGN1cnJlbnRJbmRleCA9IDA7IGN1cnJlbnRJbmRleCA8IGl0ZW1zLmxlbmd0aDsgKytjdXJyZW50SW5kZXgpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUuYXBwbHkoaXRlbXNbY3VycmVudEluZGV4XSwgY3VycmVudEluZGV4KSkge1xuICAgICAgICByZXR1cm4gY3VycmVudEluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIGFycmF5IHdoZXJlIHByZWRpY2F0ZSBpcyB0cnVlLCBhbmQgdW5kZWZpbmVkXG4gICAqIG90aGVyd2lzZS5cbiAgICogQHBhcmFtIGl0ZW1zIGFycmF5IHRoYXQgd2lsbCBiZSBpbnNwZWN0ZWQgdG8gZmluZCBhbiBlbGVtZW50XG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgZmluZCBjYWxscyBwcmVkaWNhdGUgb25jZSBmb3IgZWFjaCBlbGVtZW50IG9mIHRoZSBhcnJheSwgaW4gYXNjZW5kaW5nXG4gICAqIG9yZGVyLCB1bnRpbCBpdCBmaW5kcyBvbmUgd2hlcmUgcHJlZGljYXRlIHJldHVybnMgdHJ1ZS4gSWYgc3VjaCBhbiBlbGVtZW50IGlzIGZvdW5kLCBmaW5kXG4gICAqIGltbWVkaWF0ZWx5IHJldHVybnMgdGhhdCBlbGVtZW50IHZhbHVlLiBPdGhlcndpc2UsIGZpbmQgcmV0dXJucyB1bmRlZmluZWQuXG4gICAqL1xuICBzdGF0aWMgZmluZDxUPihpdGVtczogVFtdLCBwcmVkaWNhdGU6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbik6IFQge1xuICAgIGZvciAobGV0IGN1cnJlbnRJbmRleCA9IDA7IGN1cnJlbnRJbmRleCA8IGl0ZW1zLmxlbmd0aDsgKytjdXJyZW50SW5kZXgpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tjdXJyZW50SW5kZXhdO1xuICAgICAgaWYgKHByZWRpY2F0ZS5hcHBseShpdGVtLCBjdXJyZW50SW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQXJyYXlVdGlscyB9IGZyb20gXCIuLi9hcnJheS51dGlsc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20ucmVwb3NpdG9yeVwiO1xuXG5leHBvcnQgY2xhc3MgUm9vbSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIGNvbnN0IHVzZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy51c2VycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy51c2Vycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IHNlbmRlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcyA/IE1lc3NhZ2UubWFwKGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yLmRhdGEpIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBuZXcgUm9vbShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQgPyBtb21lbnQoYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCkudXRjKCkudG9EYXRlKCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy51bnJlYWRNZXNzYWdlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJzLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXJzLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdG9yLFxuICAgICAgICAgICAgICAgICAgICByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAocm9vbSA9PiBSb29tLmJ1aWxkKHJvb20sIHJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIG5ld01lc3NhZ2VOb3RpZmllcjogKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGFueTtcbiAgcHJpdmF0ZSBpbnRlcm5hbE9wZW46IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxOYW1lOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbExhc3RBY3Rpdml0eUF0OiBCZWhhdmlvclN1YmplY3Q8RGF0ZT47XG4gIHByaXZhdGUgaW50ZXJuYWxJbWFnZVVybDogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBsYXN0QWN0aXZpdHlBdDogRGF0ZSxcbiAgICAgICAgICAgICAgb3BlbjogYm9vbGVhbixcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHVzZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgbWVzc2FnZXM6IE1lc3NhZ2VbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgaW5pdGlhdG9yOiBVc2VyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuID0gbmV3IEJlaGF2aW9yU3ViamVjdChvcGVuKTtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGxhc3RBY3Rpdml0eUF0KTtcbiAgICB0aGlzLmludGVybmFsTmFtZSA9IG5ldyBCZWhhdmlvclN1YmplY3QobmFtZSk7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50KTtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWUudmFsdWU7XG4gIH1cblxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsTmFtZS5uZXh0KG5hbWUpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVOYW1lKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWU7XG4gIH1cblxuICBnZXQgb3BlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW4udmFsdWU7XG4gIH1cblxuICBzZXQgb3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4ubmV4dChvcGVuKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlT3BlbigpOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3BlbjtcbiAgfVxuXG4gIGdldCBsYXN0QWN0aXZpdHlBdCgpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0LnZhbHVlO1xuICB9XG5cbiAgc2V0IGxhc3RBY3Rpdml0eUF0KGxhc3RBY3Rpdml0eUF0OiBEYXRlKSB7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0Lm5leHQobGFzdEFjdGl2aXR5QXQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVMYXN0QWN0aXZpdHlBdCgpOiBCZWhhdmlvclN1YmplY3Q8RGF0ZT4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQ7XG4gIH1cblxuICBnZXQgaW1hZ2VVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsLnZhbHVlO1xuICB9XG5cbiAgc2V0IGltYWdlVXJsKGltYWdlVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwubmV4dChpbWFnZVVybCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUltYWdlVXJsKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsO1xuICB9XG5cblxuICBvcGVuTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIHRydWUpO1xuICB9XG5cbiAgY2xvc2VNZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgZmFsc2UpO1xuICB9XG5cbiAgbWFya0FsbE1lc3NhZ2VzQXNSZWFkKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkubWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQodGhpcyk7XG4gIH1cblxuICBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHlBdCA9IG1lc3NhZ2UuY3JlYXRlZEF0O1xuICB9XG5cbiAgbm90aWZ5TmV3TWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyKSB7XG4gICAgICB0aGlzLm5ld01lc3NhZ2VOb3RpZmllci5hcHBseShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuXG4gIGhhc1VzZXIodXNlcklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gQXJyYXlVdGlscy5maW5kKHRoaXMudXNlcnMubWFwKHVzZXIgPT4gdXNlci5pZCksIGlkID0+IGlkID09PSB1c2VySWQpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBmZXRjaE1vcmVNZXNzYWdlKCk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgZmlyc3RTZWVuTWVzc2FnZUlkOiB0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDAgPyB0aGlzLm1lc3NhZ2VzWzBdLmlkIDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmZpbmRNZXNzYWdlcyh0aGlzLCBwYXJhbXMpXG4gICAgICAgICAgICAgICAucGlwZShcbiAgICAgIG1hcChtZXNzYWdlcyA9PiB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMudW5zaGlmdC5hcHBseSh0aGlzLm1lc3NhZ2VzLCBtZXNzYWdlcyk7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGZpbmRNZXNzYWdlV2l0aElkKGlkOiBzdHJpbmcpOiBNZXNzYWdlIHtcbiAgICByZXR1cm4gQXJyYXlVdGlscy5maW5kKHRoaXMubWVzc2FnZXMsIG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gaWQpO1xuICB9XG5cbiAgdXBkYXRlKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKG5ld01lc3NhZ2U6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmNyZWF0ZU1lc3NhZ2UodGhpcywgbmV3TWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICBtYXAobWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgKTtcbiAgfVxuXG4gIHJlbW92ZU1lc3NhZ2UobWVzc2FnZVRvRGVsZXRlOiBNZXNzYWdlKTogTWVzc2FnZSB7XG4gICAgY29uc3QgaW5kZXggPSBBcnJheVV0aWxzLmZpbmRJbmRleCh0aGlzLm1lc3NhZ2VzLCBtZXNzYWdlID0+IG1lc3NhZ2UuaWQgPT09IG1lc3NhZ2VUb0RlbGV0ZS5pZCk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VUb0RlbGV0ZTtcbiAgfVxuXG4gIGRlbGV0ZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5kZWxldGVNZXNzYWdlKHRoaXMsIG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShtYXAoZGVsZXRlZE1lc3NhZ2UgPT4gdGhpcy5yZW1vdmVNZXNzYWdlKGRlbGV0ZWRNZXNzYWdlKSkpO1xuICB9XG5cbiAgcmVwbGFjZVVzZXJzV2l0aChyb29tOiBSb29tKTogUm9vbSB7XG4gICAgdGhpcy51c2Vycy5zcGxpY2UoMCwgdGhpcy51c2Vycy5sZW5ndGgpO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMudXNlcnMsIHJvb20udXNlcnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkVXNlcih1c2VyOiBVc2VyKSB7XG4gICAgaWYgKCF0aGlzLmhhc1VzZXIodXNlci5pZCkpIHtcbiAgICAgIHRoaXMudXNlcnMucHVzaCh1c2VyKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuL3Jvb20udHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvb21SZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHJvb21Vcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5yb29tVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG5cbiAgZmluZChpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQoYCR7dGhpcy5yb29tVXJsfS8ke2lkfWApXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLmJ1aWxkKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocXVlcnk6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIH0pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMucm9vbVVybCwgeyBwYXJhbXM6IHF1ZXJ5IH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLm1hcChqc29uLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICBmaW5kT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seU9wZW5lZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seUNsb3NlZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kUm9vbXNBZnRlcihpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgZmlyc3RTZWVuUm9vbUlkOiBpZCB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0J5SWRzKHJvb21JZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IFwicm9vbUlkc1tdXCI6IHJvb21JZHMgfSk7XG4gIH1cblxuICB1cGRhdGVNZW1iZXJzaGlwKHJvb206IFJvb20sIG9wZW46IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcGAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBvcGVuOiBvcGVuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICByb29tLm9wZW4gPSBkYXRhLmRhdGEuYXR0cmlidXRlcy5vcGVuO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgaWYgKHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID4gMCkge1xuICAgICAgY29uc3QgbGFzdFJlYWRNZXNzYWdlSWQgPSByb29tLm1lc3NhZ2VzLmxlbmd0aCA+IDAgPyByb29tLm1lc3NhZ2VzW3Jvb20ubWVzc2FnZXMubGVuZ3RoIC0gMV0uaWQgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcC91bnJlYWQtbWVzc2FnZXNgLCB7IGRhdGE6IHsgbGFzdFJlYWRNZXNzYWdlSWQ6IGxhc3RSZWFkTWVzc2FnZUlkIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEubWV0YS5jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZigwKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGUobmFtZTogc3RyaW5nLCB1c2VySWRzOiBzdHJpbmdbXSwgd2l0aG91dER1cGxpY2F0ZTogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdChgJHt0aGlzLnJvb21Vcmx9P25vRHVwbGljYXRlPSR7d2l0aG91dER1cGxpY2F0ZX1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9LFxuICAgICAgICByZWxhdGlvbnNoaXBzOiB7XG4gICAgICAgICAgdXNlcnM6IHtcbiAgICAgICAgICAgIGRhdGE6IHVzZXJJZHMubWFwKHVzZXJJZCA9PiAoeyB0eXBlOiBcInVzZXJcIiwgaWQ6IHVzZXJJZCB9KSApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIG5vRHVwbGljYXRlOiBgJHt3aXRob3V0RHVwbGljYXRlfWBcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gUm9vbS5idWlsZChyZXNwb25zZS5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogcm9vbS5uYW1lXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgcm9vbS5uYW1lID0gcmVzcG9uc2UuZGF0YS5hdHRyaWJ1dGVzLm5hbWU7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBhZGRVc2VyKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwc2AsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwidXNlclwiLFxuICAgICAgICAgICAgICBpZDogdXNlcklkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IG5ld1VzZXIgPSBVc2VyLmJ1aWxkKHJlc3BvbnNlLmRhdGEucmVsYXRpb25zaGlwcy51c2VyLmRhdGEpO1xuICAgICAgcm9vbS5hZGRVc2VyKG5ld1VzZXIpO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZGVsZXRlKHJvb20sIG1lc3NhZ2UpO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VzKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZmluZEFsbChyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIGNyZWF0ZU1lc3NhZ2Uocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmNyZWF0ZShyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZmxhdE1hcCwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBBcnJheVV0aWxzIH0gZnJvbSBcIi4uL2FycmF5LnV0aWxzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuZXhwb3J0IGNsYXNzIE1lIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpOiBNZSB7XG4gICAgY29uc3QgdW5yZWFkTWVzc2FnZUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEudW5yZWFkTWVzc2FnZUNvdW50IDogMDtcbiAgICBjb25zdCByb29tQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS5yb29tQ291bnQgOiAwO1xuICAgIHJldHVybiBuZXcgTWUoanNvbi5kYXRhLmlkLCBbXSwgW10sIHVucmVhZE1lc3NhZ2VDb3VudCwgcm9vbUNvdW50LCByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBwdWJsaWMgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsUm9vbUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBmaXJzdFNlZW5Sb29tOiBSb29tO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG9wZW5lZFJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21zOiBSb29tW10sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByb29tQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQgfHwgMCk7XG4gICAgdGhpcy5pbnRlcm5hbFJvb21Db3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3Qocm9vbUNvdW50IHx8IDApO1xuICB9XG5cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IHJvb21Db3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50LnZhbHVlO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVSb29tQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsUm9vbUNvdW50O1xuICB9XG5cbiAgZmV0Y2hPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRPcGVuZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kQ2xvc2VkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaE1vcmVSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIGlmICh0aGlzLmZpcnN0U2VlblJvb20pIHtcbiAgICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0FmdGVyKHRoaXMuZmlyc3RTZWVuUm9vbS5pZCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoW10pO1xuICAgIH1cbiAgfVxuXG4gIGZldGNoUm9vbXNCeUlkKHJvb21JZHM6IHN0cmluZ1tdKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNCeUlkcyhyb29tSWRzKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZChyb29tSWQpLnBpcGUobWFwKHJvb20gPT4ge1xuICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZmluZE9yRmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb20gPSB0aGlzLmZpbmRSb29tQnlJZChyb29tSWQpO1xuICAgIGlmIChyb29tSWQpIHtcbiAgICAgIHJldHVybiBvZihyb29tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hSb29tQnlJZChyb29tSWQpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU5ld01lc3NhZ2UobmV3TWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMuZmluZE9yRmV0Y2hSb29tQnlJZChuZXdNZXNzYWdlLnJvb21JZClcbiAgICAgICAgLnN1YnNjcmliZShyb29tID0+IHtcbiAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgcm9vbS5hZGRNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgcm9vbS5ub3RpZnlOZXdNZXNzYWdlKG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKCFuZXdNZXNzYWdlLmhhc1NlbmRlcklkKHRoaXMuaWQpKSB7XG4gICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICBpZiAoIXJvb20ub3Blbikge1xuICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgKyAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGFkZFJvb20obmV3Um9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tKG5ld1Jvb20pKSB7XG4gICAgICBpZiAoIXRoaXMuZmlyc3RTZWVuUm9vbSB8fCBtb21lbnQodGhpcy5maXJzdFNlZW5Sb29tLmxhc3RBY3Rpdml0eUF0KS5pc0FmdGVyKG5ld1Jvb20ubGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RTZWVuUm9vbSA9IG5ld1Jvb207XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IEFycmF5VXRpbHMuZmluZEluZGV4KHRoaXMucm9vbXMsIHJvb20gPT4gcm9vbS5pZCA9PT0gbmV3Um9vbS5pZCk7XG4gICAgICBpZiAocm9vbUluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5yb29tc1tyb29tSW5kZXhdID0gbmV3Um9vbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm9vbXMucHVzaChuZXdSb29tKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBSb29tIHtcbiAgICByZXR1cm4gQXJyYXlVdGlscy5maW5kKHRoaXMucm9vbXMsIHJvb20gPT4gcm9vbUlkID09PSByb29tLmlkKTtcbiAgfVxuXG4gIG9wZW5Sb29tKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgcmV0dXJuIHJvb20ub3Blbk1lbWJlcnNoaXAoKVxuICAgICAgICAgICAgICAgICAucGlwZShmbGF0TWFwKChvcGVuZWRSb29tOiBSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5hZGRUb09wZW5lZFJvb20ob3BlbmVkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQob3BlbmVkUm9vbSk7XG4gICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHJvb20pO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlUm9vbShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgcmV0dXJuIHJvb20uY2xvc2VNZW1iZXJzaGlwKClcbiAgICAgICAgICAgICAgICAgLnBpcGUobWFwKGNsb3NlZFJvb20gPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUZyb21PcGVuZWRSb29tKGNsb3NlZFJvb20pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2xvc2VkUm9vbTtcbiAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHJvb20pO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlUm9vbXMocm9vbXNUb0Nsb3NlOiBSb29tW10pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiBvZihyb29tc1RvQ2xvc2UpLnBpcGUoXG4gICAgICBtYXAocm9vbXMgPT4ge1xuICAgICAgICByb29tcy5mb3JFYWNoKHJvb20gPT4gdGhpcy5jbG9zZVJvb20ocm9vbSkpO1xuICAgICAgICByZXR1cm4gcm9vbXM7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBvcGVuUm9vbUFuZENsb3NlT3RoZXJzKHJvb21Ub09wZW46IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBjb25zdCByb29tc1RvQmVDbG9zZWQgPSB0aGlzLm9wZW5lZFJvb21zLmZpbHRlcihyb29tID0+IHJvb20uaWQgIT09IHJvb21Ub09wZW4uaWQpO1xuICAgIHJldHVybiB0aGlzLmNsb3NlUm9vbXMocm9vbXNUb0JlQ2xvc2VkKS5waXBlKGZsYXRNYXAocm9vbXMgPT4gdGhpcy5vcGVuUm9vbShyb29tVG9PcGVuKSkpO1xuICB9XG5cbiAgaGFzT3BlbmVkUm9vbXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3BlbmVkUm9vbXMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGNyZWF0ZVJvb20obmFtZTogc3RyaW5nLCB1c2VySWRzOiBzdHJpbmdbXSwgd2l0aG91dER1cGxpY2F0ZTogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmNyZWF0ZShuYW1lLCB1c2VySWRzLCB3aXRob3V0RHVwbGljYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKHJvb20gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb29tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgYnVpbGRSb29tKHVzZXJJZHM6IHN0cmluZ1tdKTogUm9vbSB7XG4gICAgY29uc3QgdXNlcnMgPSB1c2VySWRzLm1hcChpZCA9PiBuZXcgVXNlcihpZCwgXCJcIikpO1xuICAgIGNvbnN0IG5vU2VuZGVycyA9IFtdO1xuICAgIGNvbnN0IG5vTWVzc2FnZSA9IFtdO1xuICAgIGNvbnN0IG5vTWVzc2FnZVVucmVhZCA9IDA7XG4gICAgY29uc3Qgbm9JZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBpbml0aWF0b3IgPSB0aGlzLnRvVXNlcigpO1xuICAgIHJldHVybiBuZXcgUm9vbShub0lkLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgdHJ1ZSxcbiAgICAgIG5vTWVzc2FnZVVucmVhZCxcbiAgICAgIHVzZXJzLFxuICAgICAgbm9TZW5kZXJzLFxuICAgICAgbm9NZXNzYWdlLFxuICAgICAgaW5pdGlhdG9yLFxuICAgICAgdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICApO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2Uocm9vbTogUm9vbSwgY29udGVudDogc3RyaW5nLCBjb250ZW50VHlwZTogc3RyaW5nKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHJvb20uc2VuZE1lc3NhZ2Uoe1xuICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgIGNvbnRlbnRUeXBlOiBjb250ZW50VHlwZSxcbiAgICAgIGRldmljZVNlc3Npb25JZDogdGhpcy5kZXZpY2VTZXNzaW9uSWRcbiAgICB9KTtcbiAgfVxuXG4gIGlzU2VudEJ5TWUobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHJldHVybiBtZXNzYWdlICYmIG1lc3NhZ2UuaGFzU2VuZGVySWQodGhpcy5pZCk7XG4gIH1cblxuICBkZWxldGVNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuZmluZFJvb21CeUlkKG1lc3NhZ2Uucm9vbUlkKTtcbiAgICAgIGlmIChyb29tKSB7XG4gICAgICAgIHJldHVybiByb29tLmRlbGV0ZShtZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBhZGRVc2VyVG8ocm9vbTogUm9vbSwgdXNlcklkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5hZGRVc2VyKHJvb20sIHVzZXJJZCk7XG4gIH1cblxuICBwcml2YXRlIGFkZFJvb21zKHJvb21zOiBSb29tW10pIHtcbiAgICByb29tcy5mb3JFYWNoKHJvb20gPT4ge1xuICAgICAgdGhpcy5hZGRSb29tKHJvb20pO1xuICAgICAgaWYgKHJvb20ub3BlbiAmJiAhdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICAgIHRoaXMub3BlbmVkUm9vbXMucHVzaChyb29tKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaGFzUm9vbShyb29tVG9GaW5kOiBSb29tKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb20ocm9vbVRvRmluZCkgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgaGFzUm9vbU9wZW5lZChyb29tVG9GaW5kOiBSb29tKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb21PcGVuZWQocm9vbVRvRmluZCkgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgZmluZFJvb20ocm9vbTogUm9vbSk6IFJvb20ge1xuICAgIHJldHVybiB0aGlzLmZpbmRSb29tQnlJZChyb29tLmlkKTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZFJvb21PcGVuZWQocm9vbVRvRmluZDogUm9vbSk6IFJvb20ge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy5vcGVuZWRSb29tcywgcm9vbSA9PiByb29tVG9GaW5kLmlkID09PSByb29tLmlkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9PcGVuZWRSb29tKHJvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbTogUm9vbSkge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQoY2xvc2VkUm9vbSkpIHtcbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IEFycmF5VXRpbHMuZmluZEluZGV4KHRoaXMub3BlbmVkUm9vbXMsIHJvb20gPT4gcm9vbS5pZCA9PT0gY2xvc2VkUm9vbS5pZCk7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnNwbGljZShyb29tSW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiByb29tLm1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpXG4gICAgICAgICAgICAgICAucGlwZShtYXAocmVhZE1lc3NhZ2VDb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IE1hdGgubWF4KHRoaXMudW5yZWFkTWVzc2FnZUNvdW50IC0gcmVhZE1lc3NhZ2VDb3VudCwgMCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcm9vbTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIHRvVXNlcigpOiBVc2VyIHtcbiAgICByZXR1cm4gbmV3IFVzZXIodGhpcy5pZCwgXCJcIik7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBlbXB0eSwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFVSTF9DT05GSUdVUkFUSU9OLCBVcmxDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSB1c2VyVXJsOiBzdHJpbmc7XG4gIHByaXZhdGUgYWxpdmVVcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy51c2VyVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXJgO1xuICAgIHRoaXMuYWxpdmVVcmwgPSBgJHt0aGlzLnVzZXJVcmx9L2FsaXZlYDtcbiAgfVxuXG4gIGZpbmRNZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy51c2VyVXJsKS5waXBlKG1hcChtZSA9PiBNZS5idWlsZChtZSwgdGhpcy5yb29tUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIHVwZGF0ZUFsaXZlbmVzcyhtZTogTWUpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dCh0aGlzLmFsaXZlVXJsLCB7IGRhdGE6IHsgdHlwZTogXCJhbGl2ZVwiIH19KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShjYXRjaEVycm9yKCgpID0+IGVtcHR5KCkpLCBtYXAoKCkgPT4gbnVsbCkpO1xuICB9XG59XG5cbiIsImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCAqIGFzIGlvIGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcblxuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCb290c3RyYXBTb2NrZXQge1xuXG4gIHByaXZhdGUgc29ja2V0OiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBVcmxDb25maWd1cmF0aW9uKSB7fVxuXG4gIGNvbm5lY3QodG9rZW46IHN0cmluZyk6IFNvY2tldElPQ2xpZW50LlNvY2tldCB7XG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHRoaXMuY29uZmlndXJhdGlvbi5zb2NrZXRVcmwsIHtcbiAgICAgIGZvcmNlTmV3OiB0cnVlLFxuICAgICAgcXVlcnk6IGB0b2tlbj0ke3Rva2VufWBcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQ7XG4gIH1cblxuICBzb2NrZXRFeGlzdHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0ICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLnNvY2tldEV4aXN0cygpKSB7XG4gICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGltZXIgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwLCBwdWJsaXNoUmVwbGF5LCByZWZDb3VudCwgc2hhcmUsIHRha2VXaGlsZSB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgVVJMX0NPTkZJR1VSQVRJT04sIFVybENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi8uLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVTZXJ2aWNlIHtcblxuICBwcml2YXRlIGNhY2hlZE1lOiBPYnNlcnZhYmxlPE1lPjtcbiAgcHJpdmF0ZSBhbGl2ZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1lUmVwb3NpdG9yeTogTWVSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIHNvY2tldENsaWVudDogQm9vdHN0cmFwU29ja2V0LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIGNvbmZpZ3VyYXRpb246IFVybENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBzZXR1cCh0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5pc0FwaVRva2VuU2V0KCkpIHtcbiAgICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuID0gdG9rZW47XG4gICAgfVxuICB9XG5cbiAgbWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIGlmICghdGhpcy5oYXNDYWNoZWRNZSgpKSB7XG4gICAgICB0aGlzLmNhY2hlZE1lID0gdGhpcy5tZVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmRNZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcChtZSA9PiB0aGlzLnNjaGVkdWxlQWxpdmVuZXNzKG1lKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaFJlcGxheSgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZDb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXJlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUucGlwZShtYXAobWUgPT4gdGhpcy5jb25uZWN0U29ja2V0KG1lKSkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uY2xlYXIoKTtcbiAgICB0aGlzLmNhY2hlZE1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVBbGl2ZW5lc3MobWU6IE1lKTogTWUge1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuICAgIHRpbWVyKDAsIHRoaXMuY29uZmlndXJhdGlvbi5hbGl2ZUludGVydmFsSW5NcykucGlwZShcbiAgICAgIHRha2VXaGlsZSgoKSA9PiB0aGlzLmFsaXZlKVxuICAgIClcbiAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMubWVSZXBvc2l0b3J5LnVwZGF0ZUFsaXZlbmVzcyhtZSkpO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgaGFzQ2FjaGVkTWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgY29ubmVjdFNvY2tldChtZTogTWUpOiBNZSB7XG4gICAgaWYgKCF0aGlzLnNvY2tldENsaWVudC5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5zb2NrZXRDbGllbnQuY29ubmVjdCh0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbik7XG4gICAgICBzb2NrZXQub24oXCJuZXcgbWVzc2FnZVwiLCBkYXRhID0+IHRoaXMucmVjZWl2ZU5ld01lc3NhZ2UoZGF0YSkpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdGVkXCIsIGRhdGEgPT4gbWUuZGV2aWNlU2Vzc2lvbklkID0gZGF0YS5kZXZpY2VTZXNzaW9uSWQpO1xuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIHJlY2VpdmVOZXdNZXNzYWdlKGpzb246IGFueSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBNZXNzYWdlLmJ1aWxkKGpzb24uZGF0YSk7XG4gICAgdGhpcy5tZSgpLnN1YnNjcmliZShtZSA9PiBtZS5oYW5kbGVOZXdNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMsIEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIH0gZnJvbSBcIi4vYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvclwiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lU2VydmljZSB9IGZyb20gXCIuL21lL21lLnNlcnZpY2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFNvcnRSb29tUGlwZSB9IGZyb20gXCIuL3BpcGUvc29ydC1yb29tXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudE1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBTb3J0Um9vbVBpcGVcbiAgXVxuIH0pXG5leHBvcnQgY2xhc3MgQmFiaWxpTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QodXJsQ29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbik6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQmFiaWxpTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBVUkxfQ09ORklHVVJBVElPTixcbiAgICAgICAgICB1c2VWYWx1ZTogdXJsQ29uZmlndXJhdGlvblxuICAgICAgICB9LFxuICAgICAgICBTb3J0Um9vbVBpcGUsXG4gICAgICAgIFRva2VuQ29uZmlndXJhdGlvbixcbiAgICAgICAgQm9vdHN0cmFwU29ja2V0LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsXG4gICAgICAgICAgdXNlQ2xhc3M6IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yLFxuICAgICAgICAgIG11bHRpOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIE1lc3NhZ2VSZXBvc2l0b3J5LFxuICAgICAgICBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgTWVSZXBvc2l0b3J5LFxuICAgICAgICBNZVNlcnZpY2VcbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXSwibmFtZXMiOlsiUGlwZSIsIkluamVjdGFibGUiLCJJbmplY3Rpb25Ub2tlbiIsImNhdGNoRXJyb3IiLCJIdHRwRXJyb3JSZXNwb25zZSIsInRocm93RXJyb3IiLCJJbmplY3QiLCJtb21lbnQiLCJodHRwIiwibWFwIiwiSHR0cENsaWVudCIsIkJlaGF2aW9yU3ViamVjdCIsIm9mIiwiZmxhdE1hcCIsImVtcHR5IiwiaW8uY29ubmVjdCIsInB1Ymxpc2hSZXBsYXkiLCJyZWZDb3VudCIsInNoYXJlIiwidGltZXIiLCJ0YWtlV2hpbGUiLCJIVFRQX0lOVEVSQ0VQVE9SUyIsIk5nTW9kdWxlIiwiSHR0cENsaWVudE1vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBR0EscUJBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQzs7Ozs7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