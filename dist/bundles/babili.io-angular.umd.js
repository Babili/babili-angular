(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common/http'), require('rxjs'), require('rxjs/operators'), require('moment'), require('socket.io-client')) :
    typeof define === 'function' && define.amd ? define('@babili.io/angular', ['exports', '@angular/core', '@angular/common/http', 'rxjs', 'rxjs/operators', 'moment', 'socket.io-client'], factory) :
    (factory((global.babili = global.babili || {}, global.babili.io = global.babili.io || {}, global.babili.io.angular = {}),global.ng.core,global.ng.common.http,null,global.Rx.Observable.prototype,null,null));
}(this, (function (exports,core,http,rxjs,operators,momentLoaded,io) { 'use strict';

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
    var /** @type {?} */ moment = momentLoaded;
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
    var /** @type {?} */ moment$1 = momentLoaded;
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
    var /** @type {?} */ moment$2 = momentLoaded;
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
    var /** @type {?} */ moment$3 = momentLoaded;
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

    exports.BabiliModule = BabiliModule;
    exports.SortRoomPipe = SortRoomPipe;
    exports.User = User;
    exports.Message = Message;
    exports.Me = Me;
    exports.MeService = MeService;
    exports.HttpAuthenticationInterceptor = HttpAuthenticationInterceptor;
    exports.NotAuthorizedError = NotAuthorizedError;
    exports.Room = Room;
    exports.URL_CONFIGURATION = URL_CONFIGURATION;
    exports.TokenConfiguration = TokenConfiguration;
    exports.MeRepository = MeRepository;
    exports.MessageRepository = MessageRepository;
    exports.RoomRepository = RoomRepository;
    exports.BootstrapSocket = BootstrapSocket;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2F1dGhlbnRpY2F0aW9uL25vdC1hdXRob3JpemVkLWVycm9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvci50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3VzZXIvdXNlci50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lc3NhZ2UvbWVzc2FnZS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXJyYXkudXRpbHMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20udHlwZXMudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9yb29tL3Jvb20ucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUucmVwb3NpdG9yeS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3NvY2tldC9ib290c3RyYXAuc29ja2V0LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvbWUvbWUuc2VydmljZS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3BpcGUvc29ydC1yb29tLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYmFiaWxpLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRva2VuQ29uZmlndXJhdGlvbiB7XG4gIHB1YmxpYyBhcGlUb2tlbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBpc0FwaVRva2VuU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFwaVRva2VuICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hcGlUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmFwaVRva2VuICE9PSBcIlwiO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5hcGlUb2tlbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmV4cG9ydCBjb25zdCBVUkxfQ09ORklHVVJBVElPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxCYWJpbGlVcmxDb25maWd1cmF0aW9uPihcIkJhYmlsaVVybENvbmZpZ3VyYXRpb25cIik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiB7XG4gIGFwaVVybDogc3RyaW5nO1xuICBzb2NrZXRVcmw6IHN0cmluZztcbiAgYWxpdmVJbnRlcnZhbEluTXM/OiBudW1iZXI7XG59XG4iLCJleHBvcnQgY2xhc3MgTm90QXV0aG9yaXplZEVycm9yIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgZXJyb3I6IGFueSkge31cbn1cbiIsImltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBIYW5kbGVyLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBSZXF1ZXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGhyb3dFcnJvciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yIH0gZnJvbSBcIi4vbm90LWF1dGhvcml6ZWQtZXJyb3JcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIHVybHM6IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgaW50ZXJjZXB0KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLnNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUodGhpcy5hZGRIZWFkZXJUbyhyZXF1ZXN0LCB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbikpXG4gICAgICAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGVycm9yLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgTm90QXV0aG9yaXplZEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgdG9rZW46IHN0cmluZyk6IEh0dHBSZXF1ZXN0PGFueT4ge1xuICAgIHJldHVybiByZXF1ZXN0LmNsb25lKHtcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycy5zZXQoXCJBdXRob3JpemF0aW9uXCIsIGBCZWFyZXIgJHt0b2tlbn1gKVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJlcXVlc3QudXJsLnN0YXJ0c1dpdGgodGhpcy51cmxzLmFwaVVybCk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBVc2VyIHtcbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IFVzZXIge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4gbmV3IFVzZXIoanNvbi5pZCwganNvbi5hdHRyaWJ1dGVzID8ganNvbi5hdHRyaWJ1dGVzLnN0YXR1cyA6IHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBVc2VyW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoVXNlci5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc3RhdHVzOiBzdHJpbmcpIHt9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgcmV0dXJuIG5ldyBNZXNzYWdlKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50KGF0dHJpYnV0ZXMuY3JlYXRlZEF0KS50b0RhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXIuZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMucm9vbS5kYXRhLmlkKTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogTWVzc2FnZVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKE1lc3NhZ2UuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY3JlYXRlZEF0OiBEYXRlLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXI6IFVzZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHJvb21JZDogc3RyaW5nKSB7fVxuXG4gIGhhc1NlbmRlcklkKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZGVyICYmIHRoaXMuc2VuZGVyLmlkID09PSB1c2VySWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBOZXdNZXNzYWdlIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBjb250ZW50VHlwZTogc3RyaW5nO1xuICBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VSZXBvc2l0b3J5IHtcblxuICBwcml2YXRlIHJvb21Vcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnJvb21VcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cblxuICBjcmVhdGUocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5idWlsZChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZmluZEFsbChyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMubWVzc2FnZVVybChyb29tLmlkKSwgeyBwYXJhbXM6IGF0dHJpYnV0ZXMgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBNZXNzYWdlLm1hcChyZXNwb25zZS5kYXRhKSkpO1xuICB9XG5cbiAgZGVsZXRlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCl9LyR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocmVzcG9uc2UgPT4gbWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBtZXNzYWdlVXJsKHJvb21JZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucm9vbVVybH0vJHtyb29tSWR9L21lc3NhZ2VzYDtcbiAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgQXJyYXlVdGlscyB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYXJyYXkgd2hlcmUgcHJlZGljYXRlIGlzIHRydWUsIGFuZCAtMVxuICAgKiBvdGhlcndpc2UuXG4gICAqIEBwYXJhbSBpdGVtcyBhcnJheSB0aGF0IHdpbGwgYmUgaW5zcGVjdGVkIHRvIGZpbmQgYW4gZWxlbWVudCBpbmRleFxuICAgKiBAcGFyYW0gcHJlZGljYXRlIGZpbmQgY2FsbHMgcHJlZGljYXRlIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXksIGluIGFzY2VuZGluZ1xuICAgKiBvcmRlciwgdW50aWwgaXQgZmluZHMgb25lIHdoZXJlIHByZWRpY2F0ZSByZXR1cm5zIHRydWUuIElmIHN1Y2ggYW4gZWxlbWVudCBpcyBmb3VuZCxcbiAgICogZmluZEluZGV4IGltbWVkaWF0ZWx5IHJldHVybnMgdGhhdCBlbGVtZW50IGluZGV4LiBPdGhlcndpc2UsIGZpbmRJbmRleCByZXR1cm5zIC0xLlxuICAgKi9cbiAgc3RhdGljIGZpbmRJbmRleDxUPihpdGVtczogVFtdLCBwcmVkaWNhdGU6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbik6IG51bWJlciB7XG4gICAgZm9yIChsZXQgY3VycmVudEluZGV4ID0gMDsgY3VycmVudEluZGV4IDwgaXRlbXMubGVuZ3RoOyArK2N1cnJlbnRJbmRleCkge1xuICAgICAgaWYgKHByZWRpY2F0ZS5hcHBseShpdGVtc1tjdXJyZW50SW5kZXhdLCBjdXJyZW50SW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SW5kZXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYXJyYXkgd2hlcmUgcHJlZGljYXRlIGlzIHRydWUsIGFuZCB1bmRlZmluZWRcbiAgICogb3RoZXJ3aXNlLlxuICAgKiBAcGFyYW0gaXRlbXMgYXJyYXkgdGhhdCB3aWxsIGJlIGluc3BlY3RlZCB0byBmaW5kIGFuIGVsZW1lbnRcbiAgICogQHBhcmFtIHByZWRpY2F0ZSBmaW5kIGNhbGxzIHByZWRpY2F0ZSBvbmNlIGZvciBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5LCBpbiBhc2NlbmRpbmdcbiAgICogb3JkZXIsIHVudGlsIGl0IGZpbmRzIG9uZSB3aGVyZSBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLiBJZiBzdWNoIGFuIGVsZW1lbnQgaXMgZm91bmQsIGZpbmRcbiAgICogaW1tZWRpYXRlbHkgcmV0dXJucyB0aGF0IGVsZW1lbnQgdmFsdWUuIE90aGVyd2lzZSwgZmluZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICovXG4gIHN0YXRpYyBmaW5kPFQ+KGl0ZW1zOiBUW10sIHByZWRpY2F0ZTogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuKTogVCB7XG4gICAgZm9yIChsZXQgY3VycmVudEluZGV4ID0gMDsgY3VycmVudEluZGV4IDwgaXRlbXMubGVuZ3RoOyArK2N1cnJlbnRJbmRleCkge1xuICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2N1cnJlbnRJbmRleF07XG4gICAgICBpZiAocHJlZGljYXRlLmFwcGx5KGl0ZW0sIGN1cnJlbnRJbmRleCkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBBcnJheVV0aWxzIH0gZnJvbSBcIi4uL2FycmF5LnV0aWxzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS5yZXBvc2l0b3J5XCI7XG5cbmV4cG9ydCBjbGFzcyBSb29tIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb20ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBqc29uLmF0dHJpYnV0ZXM7XG4gICAgY29uc3QgdXNlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnVzZXJzLmRhdGEpIDogW107XG4gICAgY29uc3Qgc2VuZGVycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzLmRhdGEpIDogW107XG4gICAgY29uc3QgbWVzc2FnZXMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzID8gTWVzc2FnZS5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLm1lc3NhZ2VzLmRhdGEpIDogW107XG4gICAgY29uc3QgaW5pdGlhdG9yID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IgPyBVc2VyLmJ1aWxkKGpzb24ucmVsYXRpb25zaGlwcy5pbml0aWF0b3IuZGF0YSkgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIG5ldyBSb29tKGpzb24uaWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCA/IG1vbWVudChhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0KS51dGMoKS50b0RhdGUoKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnVucmVhZE1lc3NhZ2VDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcnMsXG4gICAgICAgICAgICAgICAgICAgIHNlbmRlcnMsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHJvb21SZXBvc2l0b3J5KTtcbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55LCByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSk6IFJvb21bXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChyb29tID0+IFJvb20uYnVpbGQocm9vbSwgcm9vbVJlcG9zaXRvcnksIG1lc3NhZ2VSZXBvc2l0b3J5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgbmV3TWVzc2FnZU5vdGlmaWVyOiAobWVzc2FnZTogTWVzc2FnZSkgPT4gYW55O1xuICBwcml2YXRlIGludGVybmFsT3BlbjogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+O1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbE5hbWU6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuICBwcml2YXRlIGludGVybmFsTGFzdEFjdGl2aXR5QXQ6IEJlaGF2aW9yU3ViamVjdDxEYXRlPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbEltYWdlVXJsOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIGxhc3RBY3Rpdml0eUF0OiBEYXRlLFxuICAgICAgICAgICAgICBvcGVuOiBib29sZWFuLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcmVhZG9ubHkgdXNlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc2VuZGVyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBtZXNzYWdlczogTWVzc2FnZVtdLFxuICAgICAgICAgICAgICByZWFkb25seSBpbml0aWF0b3I6IFVzZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG9wZW4pO1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdCA9IG5ldyBCZWhhdmlvclN1YmplY3QobGFzdEFjdGl2aXR5QXQpO1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lID0gbmV3IEJlaGF2aW9yU3ViamVjdChuYW1lKTtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bnJlYWRNZXNzYWdlQ291bnQpO1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5kZWZpbmVkKTtcbiAgfVxuXG4gIGdldCB1bnJlYWRNZXNzYWdlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC52YWx1ZTtcbiAgfVxuXG4gIHNldCB1bnJlYWRNZXNzYWdlQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQubmV4dChjb3VudCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVVucmVhZE1lc3NhZ2VDb3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZS52YWx1ZTtcbiAgfVxuXG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxOYW1lLm5leHQobmFtZSk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU5hbWUoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTmFtZTtcbiAgfVxuXG4gIGdldCBvcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3Blbi52YWx1ZTtcbiAgfVxuXG4gIHNldCBvcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICB0aGlzLmludGVybmFsT3Blbi5uZXh0KG9wZW4pO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVPcGVuKCk6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuO1xuICB9XG5cbiAgZ2V0IGxhc3RBY3Rpdml0eUF0KCk6IERhdGUge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQudmFsdWU7XG4gIH1cblxuICBzZXQgbGFzdEFjdGl2aXR5QXQobGFzdEFjdGl2aXR5QXQ6IERhdGUpIHtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQubmV4dChsYXN0QWN0aXZpdHlBdCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUxhc3RBY3Rpdml0eUF0KCk6IEJlaGF2aW9yU3ViamVjdDxEYXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDtcbiAgfVxuXG4gIGdldCBpbWFnZVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmwudmFsdWU7XG4gIH1cblxuICBzZXQgaW1hZ2VVcmwoaW1hZ2VVcmw6IHN0cmluZykge1xuICAgIHRoaXMuaW50ZXJuYWxJbWFnZVVybC5uZXh0KGltYWdlVXJsKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlSW1hZ2VVcmwoKTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSW1hZ2VVcmw7XG4gIH1cblxuXG4gIG9wZW5NZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgdHJ1ZSk7XG4gIH1cblxuICBjbG9zZU1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCBmYWxzZSk7XG4gIH1cblxuICBtYXJrQWxsTWVzc2FnZXNBc1JlYWQoKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZCh0aGlzKTtcbiAgfVxuXG4gIGFkZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICB0aGlzLmxhc3RBY3Rpdml0eUF0ID0gbWVzc2FnZS5jcmVhdGVkQXQ7XG4gIH1cblxuICBub3RpZnlOZXdNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBpZiAodGhpcy5uZXdNZXNzYWdlTm90aWZpZXIpIHtcbiAgICAgIHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyLmFwcGx5KG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG5cbiAgaGFzVXNlcih1c2VySWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy51c2Vycy5tYXAodXNlciA9PiB1c2VyLmlkKSwgaWQgPT4gaWQgPT09IHVzZXJJZCkgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZldGNoTW9yZU1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBmaXJzdFNlZW5NZXNzYWdlSWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCA/IHRoaXMubWVzc2FnZXNbMF0uaWQgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZmluZE1lc3NhZ2VzKHRoaXMsIHBhcmFtcylcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgbWFwKG1lc3NhZ2VzID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0LmFwcGx5KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2VzKTtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VXaXRoSWQoaWQ6IHN0cmluZyk6IE1lc3NhZ2Uge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy5tZXNzYWdlcywgbWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBpZCk7XG4gIH1cblxuICB1cGRhdGUoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgc2VuZE1lc3NhZ2UobmV3TWVzc2FnZTogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuY3JlYXRlTWVzc2FnZSh0aGlzLCBuZXdNZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgIG1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICApO1xuICB9XG5cbiAgcmVtb3ZlTWVzc2FnZShtZXNzYWdlVG9EZWxldGU6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcbiAgICBjb25zdCBpbmRleCA9IEFycmF5VXRpbHMuZmluZEluZGV4KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gbWVzc2FnZVRvRGVsZXRlLmlkKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gbWVzc2FnZVRvRGVsZXRlO1xuICB9XG5cbiAgZGVsZXRlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmRlbGV0ZU1lc3NhZ2UodGhpcywgbWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKG1hcChkZWxldGVkTWVzc2FnZSA9PiB0aGlzLnJlbW92ZU1lc3NhZ2UoZGVsZXRlZE1lc3NhZ2UpKSk7XG4gIH1cblxuICByZXBsYWNlVXNlcnNXaXRoKHJvb206IFJvb20pOiBSb29tIHtcbiAgICB0aGlzLnVzZXJzLnNwbGljZSgwLCB0aGlzLnVzZXJzLmxlbmd0aCk7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy51c2Vycywgcm9vbS51c2Vycyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRVc2VyKHVzZXI6IFVzZXIpIHtcbiAgICBpZiAoIXRoaXMuaGFzVXNlcih1c2VyLmlkKSkge1xuICAgICAgdGhpcy51c2Vycy5wdXNoKHVzZXIpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4vcm9vbS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vbVJlcG9zaXRvcnkge1xuXG4gIHByaXZhdGUgcm9vbVVybDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLnJvb21VcmwgPSBgJHtjb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cblxuICBmaW5kKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldChgJHt0aGlzLnJvb21Vcmx9LyR7aWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20uYnVpbGQoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZEFsbChxdWVyeToge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy5yb29tVXJsLCB7IHBhcmFtczogcXVlcnkgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChqc29uOiBhbnkpID0+IFJvb20ubWFwKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRPcGVuZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5T3BlbmVkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBvbmx5Q2xvc2VkOiBcInRydWVcIiB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0FmdGVyKGlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBmaXJzdFNlZW5Sb29tSWQ6IGlkIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQnlJZHMocm9vbUlkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgXCJyb29tSWRzW11cIjogcm9vbUlkcyB9KTtcbiAgfVxuXG4gIHVwZGF0ZU1lbWJlcnNoaXAocm9vbTogUm9vbSwgb3BlbjogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG9wZW46IG9wZW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgIHJvb20ub3BlbiA9IGRhdGEuZGF0YS5hdHRyaWJ1dGVzLm9wZW47XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgICBpZiAocm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPiAwKSB7XG4gICAgICBjb25zdCBsYXN0UmVhZE1lc3NhZ2VJZCA9IHJvb20ubWVzc2FnZXMubGVuZ3RoID4gMCA/IHJvb20ubWVzc2FnZXNbcm9vbS5tZXNzYWdlcy5sZW5ndGggLSAxXS5pZCA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwL3VucmVhZC1tZXNzYWdlc2AsIHsgZGF0YTogeyBsYXN0UmVhZE1lc3NhZ2VJZDogbGFzdFJlYWRNZXNzYWdlSWQgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5tZXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKDApO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0/bm9EdXBsaWNhdGU9JHt3aXRob3V0RHVwbGljYXRlfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2Vyczoge1xuICAgICAgICAgICAgZGF0YTogdXNlcklkcy5tYXAodXNlcklkID0+ICh7IHR5cGU6IFwidXNlclwiLCBpZDogdXNlcklkIH0pIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgbm9EdXBsaWNhdGU6IGAke3dpdGhvdXREdXBsaWNhdGV9YFxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiBSb29tLmJ1aWxkKHJlc3BvbnNlLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGUocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucHV0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfWAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJyb29tXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBuYW1lOiByb29tLm5hbWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICByb29tLm5hbWUgPSByZXNwb25zZS5kYXRhLmF0dHJpYnV0ZXMubmFtZTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGFkZFVzZXIocm9vbTogUm9vbSwgdXNlcklkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBzYCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcIm1lbWJlcnNoaXBcIixcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogXCJ1c2VyXCIsXG4gICAgICAgICAgICAgIGlkOiB1c2VySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgY29uc3QgbmV3VXNlciA9IFVzZXIuYnVpbGQocmVzcG9uc2UuZGF0YS5yZWxhdGlvbnNoaXBzLnVzZXIuZGF0YSk7XG4gICAgICByb29tLmFkZFVzZXIobmV3VXNlcik7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBkZWxldGVNZXNzYWdlKHJvb206IFJvb20sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5kZWxldGUocm9vbSwgbWVzc2FnZSk7XG4gIH1cblxuICBmaW5kTWVzc2FnZXMocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5maW5kQWxsKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG5cbiAgY3JlYXRlTWVzc2FnZShyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuY3JlYXRlKHJvb20sIGF0dHJpYnV0ZXMpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZiB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBmbGF0TWFwLCBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEFycmF5VXRpbHMgfSBmcm9tIFwiLi4vYXJyYXkudXRpbHNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi8uLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5leHBvcnQgY2xhc3MgTWUge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSk6IE1lIHtcbiAgICBjb25zdCB1bnJlYWRNZXNzYWdlQ291bnQgPSBqc29uLmRhdGEgJiYganNvbi5kYXRhLm1ldGEgPyBqc29uLmRhdGEubWV0YS51bnJlYWRNZXNzYWdlQ291bnQgOiAwO1xuICAgIGNvbnN0IHJvb21Db3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnJvb21Db3VudCA6IDA7XG4gICAgcmV0dXJuIG5ldyBNZShqc29uLmRhdGEuaWQsIFtdLCBbXSwgdW5yZWFkTWVzc2FnZUNvdW50LCByb29tQ291bnQsIHJvb21SZXBvc2l0b3J5KTtcbiAgfVxuXG4gIHB1YmxpYyBkZXZpY2VTZXNzaW9uSWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxSb29tQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGZpcnN0U2VlblJvb206IFJvb207XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgb3BlbmVkUm9vbXM6IFJvb21bXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgcm9vbXM6IFJvb21bXSxcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJvb21Db3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVucmVhZE1lc3NhZ2VDb3VudCB8fCAwKTtcbiAgICB0aGlzLmludGVybmFsUm9vbUNvdW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdChyb29tQ291bnQgfHwgMCk7XG4gIH1cblxuXG4gIGdldCB1bnJlYWRNZXNzYWdlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC52YWx1ZTtcbiAgfVxuXG4gIHNldCB1bnJlYWRNZXNzYWdlQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQubmV4dChjb3VudCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVVucmVhZE1lc3NhZ2VDb3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ7XG4gIH1cblxuICBnZXQgcm9vbUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxSb29tQ291bnQudmFsdWU7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZVJvb21Db3VudCgpOiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxSb29tQ291bnQ7XG4gIH1cblxuICBmZXRjaE9wZW5lZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZE9wZW5lZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hDbG9zZWRSb29tcygpOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRDbG9zZWRSb29tcygpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoTW9yZVJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgaWYgKHRoaXMuZmlyc3RTZWVuUm9vbSkge1xuICAgICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQWZ0ZXIodGhpcy5maXJzdFNlZW5Sb29tLmlkKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgICByZXR1cm4gcm9vbXM7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZihbXSk7XG4gICAgfVxuICB9XG5cbiAgZmV0Y2hSb29tc0J5SWQocm9vbUlkczogc3RyaW5nW10pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmRSb29tc0J5SWRzKHJvb21JZHMpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbXMocm9vbXMpO1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kKHJvb21JZCkucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBmaW5kT3JGZXRjaFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgY29uc3Qgcm9vbSA9IHRoaXMuZmluZFJvb21CeUlkKHJvb21JZCk7XG4gICAgaWYgKHJvb21JZCkge1xuICAgICAgcmV0dXJuIG9mKHJvb20pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaFJvb21CeUlkKHJvb21JZCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTmV3TWVzc2FnZShuZXdNZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgdGhpcy5maW5kT3JGZXRjaFJvb21CeUlkKG5ld01lc3NhZ2Uucm9vbUlkKVxuICAgICAgICAuc3Vic2NyaWJlKHJvb20gPT4ge1xuICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICByb29tLmFkZE1lc3NhZ2UobmV3TWVzc2FnZSk7XG4gICAgICAgICAgICByb29tLm5vdGlmeU5ld01lc3NhZ2UobmV3TWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoIW5ld01lc3NhZ2UuaGFzU2VuZGVySWQodGhpcy5pZCkpIHtcbiAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCArIDE7XG4gICAgICAgICAgICAgIGlmICghcm9vbS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPSByb29tLnVucmVhZE1lc3NhZ2VDb3VudCArIDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgYWRkUm9vbShuZXdSb29tOiBSb29tKSB7XG4gICAgaWYgKCF0aGlzLmhhc1Jvb20obmV3Um9vbSkpIHtcbiAgICAgIGlmICghdGhpcy5maXJzdFNlZW5Sb29tIHx8IG1vbWVudCh0aGlzLmZpcnN0U2VlblJvb20ubGFzdEFjdGl2aXR5QXQpLmlzQWZ0ZXIobmV3Um9vbS5sYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgdGhpcy5maXJzdFNlZW5Sb29tID0gbmV3Um9vbTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5yb29tcywgcm9vbSA9PiByb29tLmlkID09PSBuZXdSb29tLmlkKTtcbiAgICAgIGlmIChyb29tSW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLnJvb21zW3Jvb21JbmRleF0gPSBuZXdSb29tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb29tcy5wdXNoKG5ld1Jvb20pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbmRSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IFJvb20ge1xuICAgIHJldHVybiBBcnJheVV0aWxzLmZpbmQodGhpcy5yb29tcywgcm9vbSA9PiByb29tSWQgPT09IHJvb20uaWQpO1xuICB9XG5cbiAgb3BlblJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5vcGVuTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKGZsYXRNYXAoKG9wZW5lZFJvb206IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFRvT3BlbmVkUm9vbShvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5jbG9zZU1lbWJlcnNoaXAoKVxuICAgICAgICAgICAgICAgICAucGlwZShtYXAoY2xvc2VkUm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9zZWRSb29tO1xuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tcyhyb29tc1RvQ2xvc2U6IFJvb21bXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIG9mKHJvb21zVG9DbG9zZSkucGlwZShcbiAgICAgIG1hcChyb29tcyA9PiB7XG4gICAgICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB0aGlzLmNsb3NlUm9vbShyb29tKSk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIG9wZW5Sb29tQW5kQ2xvc2VPdGhlcnMocm9vbVRvT3BlbjogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb21zVG9CZUNsb3NlZCA9IHRoaXMub3BlbmVkUm9vbXMuZmlsdGVyKHJvb20gPT4gcm9vbS5pZCAhPT0gcm9vbVRvT3Blbi5pZCk7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VSb29tcyhyb29tc1RvQmVDbG9zZWQpLnBpcGUoZmxhdE1hcChyb29tcyA9PiB0aGlzLm9wZW5Sb29tKHJvb21Ub09wZW4pKSk7XG4gIH1cblxuICBoYXNPcGVuZWRSb29tcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcy5sZW5ndGggPiAwO1xuICB9XG5cbiAgY3JlYXRlUm9vbShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuY3JlYXRlKG5hbWUsIHVzZXJJZHMsIHdpdGhvdXREdXBsaWNhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBidWlsZFJvb20odXNlcklkczogc3RyaW5nW10pOiBSb29tIHtcbiAgICBjb25zdCB1c2VycyA9IHVzZXJJZHMubWFwKGlkID0+IG5ldyBVc2VyKGlkLCBcIlwiKSk7XG4gICAgY29uc3Qgbm9TZW5kZXJzID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlVW5yZWFkID0gMDtcbiAgICBjb25zdCBub0lkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IHRoaXMudG9Vc2VyKCk7XG4gICAgcmV0dXJuIG5ldyBSb29tKG5vSWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB0cnVlLFxuICAgICAgbm9NZXNzYWdlVW5yZWFkLFxuICAgICAgdXNlcnMsXG4gICAgICBub1NlbmRlcnMsXG4gICAgICBub01lc3NhZ2UsXG4gICAgICBpbml0aWF0b3IsXG4gICAgICB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShyb29tOiBSb29tLCBjb250ZW50OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gcm9vbS5zZW5kTWVzc2FnZSh7XG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgY29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgICAgZGV2aWNlU2Vzc2lvbklkOiB0aGlzLmRldmljZVNlc3Npb25JZFxuICAgIH0pO1xuICB9XG5cbiAgaXNTZW50QnlNZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2UgJiYgbWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQobWVzc2FnZS5yb29tSWQpO1xuICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgcmV0dXJuIHJvb20uZGVsZXRlKG1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFVzZXJUbyhyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmFkZFVzZXIocm9vbSwgdXNlcklkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm9vbXMocm9vbXM6IFJvb21bXSkge1xuICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICBpZiAocm9vbS5vcGVuICYmICF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbShyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbU9wZW5lZChyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbShyb29tOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb21CeUlkKHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbU9wZW5lZChyb29tVG9GaW5kOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuZmluZCh0aGlzLm9wZW5lZFJvb21zLCByb29tID0+IHJvb21Ub0ZpbmQuaWQgPT09IHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb09wZW5lZFJvb20ocm9vbTogUm9vbSkge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICB0aGlzLm9wZW5lZFJvb21zLnB1c2gocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVGcm9tT3BlbmVkUm9vbShjbG9zZWRSb29tOiBSb29tKSB7XG4gICAgaWYgKHRoaXMuaGFzUm9vbU9wZW5lZChjbG9zZWRSb29tKSkge1xuICAgICAgY29uc3Qgcm9vbUluZGV4ID0gQXJyYXlVdGlscy5maW5kSW5kZXgodGhpcy5vcGVuZWRSb29tcywgcm9vbSA9PiByb29tLmlkID09PSBjbG9zZWRSb29tLmlkKTtcbiAgICAgIHRoaXMub3BlbmVkUm9vbXMuc3BsaWNlKHJvb21JbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBtYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHJvb20ubWFya0FsbE1lc3NhZ2VzQXNSZWFkKClcbiAgICAgICAgICAgICAgIC5waXBlKG1hcChyZWFkTWVzc2FnZUNvdW50ID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gTWF0aC5tYXgodGhpcy51bnJlYWRNZXNzYWdlQ291bnQgLSByZWFkTWVzc2FnZUNvdW50LCAwKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByb29tO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgdG9Vc2VyKCk6IFVzZXIge1xuICAgIHJldHVybiBuZXcgVXNlcih0aGlzLmlkLCBcIlwiKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgZW1wdHkgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVJlcG9zaXRvcnkge1xuXG4gIHByaXZhdGUgdXNlclVybDogc3RyaW5nO1xuICBwcml2YXRlIGFsaXZlVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMudXNlclVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyYDtcbiAgICB0aGlzLmFsaXZlVXJsID0gYCR7dGhpcy51c2VyVXJsfS9hbGl2ZWA7XG4gIH1cblxuICBmaW5kTWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMudXNlclVybCkucGlwZShtYXAobWUgPT4gTWUuYnVpbGQobWUsIHRoaXMucm9vbVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGVBbGl2ZW5lc3MobWU6IE1lKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodGhpcy5hbGl2ZVVybCwgeyBkYXRhOiB7IHR5cGU6IFwiYWxpdmVcIiB9fSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcigoKSA9PiBlbXB0eSgpKSwgbWFwKCgpID0+IG51bGwpKTtcbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgaW8gZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuXG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcFNvY2tldCB7XG5cbiAgcHJpdmF0ZSBzb2NrZXQ6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pIHt9XG5cbiAgY29ubmVjdCh0b2tlbjogc3RyaW5nKTogU29ja2V0SU9DbGllbnQuU29ja2V0IHtcbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QodGhpcy5jb25maWd1cmF0aW9uLnNvY2tldFVybCwge1xuICAgICAgZm9yY2VOZXc6IHRydWUsXG4gICAgICBxdWVyeTogYHRva2VuPSR7dG9rZW59YFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnNvY2tldDtcbiAgfVxuXG4gIHNvY2tldEV4aXN0cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLnNvY2tldCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aW1lciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAsIHB1Ymxpc2hSZXBsYXksIHJlZkNvdW50LCBzaGFyZSwgdGFrZVdoaWxlIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vLi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lU2VydmljZSB7XG5cbiAgcHJpdmF0ZSBjYWNoZWRNZTogT2JzZXJ2YWJsZTxNZT47XG4gIHByaXZhdGUgYWxpdmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtZVJlcG9zaXRvcnk6IE1lUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBzb2NrZXRDbGllbnQ6IEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0dXAodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uaXNBcGlUb2tlblNldCgpKSB7XG4gICAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbiA9IHRva2VuO1xuICAgIH1cbiAgfVxuXG4gIG1lKCk6IE9ic2VydmFibGU8TWU+IHtcbiAgICBpZiAoIXRoaXMuaGFzQ2FjaGVkTWUoKSkge1xuICAgICAgdGhpcy5jYWNoZWRNZSA9IHRoaXMubWVSZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kTWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAobWUgPT4gdGhpcy5zY2hlZHVsZUFsaXZlbmVzcyhtZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2hSZXBsYXkoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmQ291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFyZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lLnBpcGUobWFwKG1lID0+IHRoaXMuY29ubmVjdFNvY2tldChtZSkpKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmNsZWFyKCk7XG4gICAgdGhpcy5jYWNoZWRNZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQWxpdmVuZXNzKG1lOiBNZSk6IE1lIHtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICB0aW1lcigwLCB0aGlzLmNvbmZpZ3VyYXRpb24uYWxpdmVJbnRlcnZhbEluTXMpLnBpcGUoXG4gICAgICB0YWtlV2hpbGUoKCkgPT4gdGhpcy5hbGl2ZSlcbiAgICApXG4gICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLm1lUmVwb3NpdG9yeS51cGRhdGVBbGl2ZW5lc3MobWUpKTtcbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIGhhc0NhY2hlZE1lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlZE1lICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGNvbm5lY3RTb2NrZXQobWU6IE1lKTogTWUge1xuICAgIGlmICghdGhpcy5zb2NrZXRDbGllbnQuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuc29ja2V0Q2xpZW50LmNvbm5lY3QodGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pO1xuICAgICAgc29ja2V0Lm9uKFwibmV3IG1lc3NhZ2VcIiwgZGF0YSA9PiB0aGlzLnJlY2VpdmVOZXdNZXNzYWdlKGRhdGEpKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RlZFwiLCBkYXRhID0+IG1lLmRldmljZVNlc3Npb25JZCA9IGRhdGEuZGV2aWNlU2Vzc2lvbklkKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSByZWNlaXZlTmV3TWVzc2FnZShqc29uOiBhbnkpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gTWVzc2FnZS5idWlsZChqc29uLmRhdGEpO1xuICAgIHRoaXMubWUoKS5zdWJzY3JpYmUobWUgPT4gbWUuaGFuZGxlTmV3TWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbkBQaXBlKHtcbiAgbmFtZTogXCJzb3J0Um9vbXNcIlxufSlcbmV4cG9ydCBjbGFzcyBTb3J0Um9vbVBpcGUgIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybShyb29tczogUm9vbVtdLCBmaWVsZDogc3RyaW5nKTogYW55W10ge1xuICAgIGlmIChyb29tcyAhPT0gdW5kZWZpbmVkICYmIHJvb21zICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcm9vbXMuc29ydCgocm9vbTogUm9vbSwgb3RoZXJSb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RBY3Rpdml0eUF0ICAgICAgPSByb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBjb25zdCBvdGhlckxhc3RBY3Rpdml0eUF0ID0gb3RoZXJSb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBpZiAobW9tZW50KGxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShvdGhlckxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKG1vbWVudChvdGhlckxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShsYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIVFRQX0lOVEVSQ0VQVE9SUywgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IgfSBmcm9tIFwiLi9hdXRoZW50aWNhdGlvbi9odHRwLWF1dGhlbnRpY2F0aW9uLWludGVyY2VwdG9yXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUvbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWVTZXJ2aWNlIH0gZnJvbSBcIi4vbWUvbWUuc2VydmljZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgU29ydFJvb21QaXBlIH0gZnJvbSBcIi4vcGlwZS9zb3J0LXJvb21cIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBIdHRwQ2xpZW50TW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFNvcnRSb29tUGlwZVxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgU29ydFJvb21QaXBlXG4gIF1cbiB9KVxuZXhwb3J0IGNsYXNzIEJhYmlsaU1vZHVsZSB7XG4gIHN0YXRpYyBmb3JSb290KHVybENvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24pOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEJhYmlsaU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogVVJMX0NPTkZJR1VSQVRJT04sXG4gICAgICAgICAgdXNlVmFsdWU6IHVybENvbmZpZ3VyYXRpb25cbiAgICAgICAgfSxcbiAgICAgICAgU29ydFJvb21QaXBlLFxuICAgICAgICBUb2tlbkNvbmZpZ3VyYXRpb24sXG4gICAgICAgIEJvb3RzdHJhcFNvY2tldCxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEhUVFBfSU5URVJDRVBUT1JTLFxuICAgICAgICAgIHVzZUNsYXNzOiBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvcixcbiAgICAgICAgICBtdWx0aTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBNZXNzYWdlUmVwb3NpdG9yeSxcbiAgICAgICAgUm9vbVJlcG9zaXRvcnksXG4gICAgICAgIE1lUmVwb3NpdG9yeSxcbiAgICAgICAgTWVTZXJ2aWNlXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIkluamVjdGFibGUiLCJJbmplY3Rpb25Ub2tlbiIsImNhdGNoRXJyb3IiLCJIdHRwRXJyb3JSZXNwb25zZSIsInRocm93RXJyb3IiLCJJbmplY3QiLCJodHRwIiwibWFwIiwiSHR0cENsaWVudCIsIm1vbWVudCIsIkJlaGF2aW9yU3ViamVjdCIsIm9mIiwiZmxhdE1hcCIsImVtcHR5IiwiaW8uY29ubmVjdCIsInB1Ymxpc2hSZXBsYXkiLCJyZWZDb3VudCIsInNoYXJlIiwidGltZXIiLCJ0YWtlV2hpbGUiLCJQaXBlIiwiSFRUUF9JTlRFUkNFUFRPUlMiLCJOZ01vZHVsZSIsIkh0dHBDbGllbnRNb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtRQU1FO1NBQWdCOzs7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