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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvY29uZmlndXJhdGlvbi91cmwtY29uZmlndXJhdGlvbi50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2F1dGhlbnRpY2F0aW9uL25vdC1hdXRob3JpemVkLWVycm9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvci50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3VzZXIvdXNlci50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lc3NhZ2UvbWVzc2FnZS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvcm9vbS9yb29tLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvcm9vbS9yb29tLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9tZS9tZS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldC50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnNlcnZpY2UudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9waXBlL3NvcnQtcm9vbS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2JhYmlsaS5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUb2tlbkNvbmZpZ3VyYXRpb24ge1xuICBwdWJsaWMgYXBpVG9rZW46IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgaXNBcGlUb2tlblNldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hcGlUb2tlbiAhPT0gdW5kZWZpbmVkICYmIHRoaXMuYXBpVG9rZW4gIT09IG51bGwgJiYgdGhpcy5hcGlUb2tlbiAhPT0gXCJcIjtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuYXBpVG9rZW4gPSB1bmRlZmluZWQ7XG4gIH1cblxufVxuIiwiaW1wb3J0IHsgSW5qZWN0aW9uVG9rZW4gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5leHBvcnQgY29uc3QgVVJMX0NPTkZJR1VSQVRJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48QmFiaWxpVXJsQ29uZmlndXJhdGlvbj4oXCJCYWJpbGlVcmxDb25maWd1cmF0aW9uXCIpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhYmlsaVVybENvbmZpZ3VyYXRpb24ge1xuICBhcGlVcmw6IHN0cmluZztcbiAgc29ja2V0VXJsOiBzdHJpbmc7XG4gIGFsaXZlSW50ZXJ2YWxJbk1zPzogbnVtYmVyO1xufVxuIiwiZXhwb3J0IGNsYXNzIE5vdEF1dGhvcml6ZWRFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGVycm9yOiBhbnkpIHt9XG59XG4iLCJpbXBvcnQgeyBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwSGFuZGxlciwgSHR0cEludGVyY2VwdG9yLCBIdHRwUmVxdWVzdCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRocm93RXJyb3IgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE5vdEF1dGhvcml6ZWRFcnJvciB9IGZyb20gXCIuL25vdC1hdXRob3JpemVkLWVycm9yXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgcHJpdmF0ZSB1cmxzOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7fVxuXG4gIGludGVyY2VwdChyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAodGhpcy5zaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHRoaXMuYWRkSGVhZGVyVG8ocmVxdWVzdCwgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pKVxuICAgICAgICAgICAgICAgICAucGlwZShjYXRjaEVycm9yKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSAmJiBlcnJvci5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IE5vdEF1dGhvcml6ZWRFcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXF1ZXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZEhlYWRlclRvKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIHRva2VuOiBzdHJpbmcpOiBIdHRwUmVxdWVzdDxhbnk+IHtcbiAgICByZXR1cm4gcmVxdWVzdC5jbG9uZSh7XG4gICAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnMuc2V0KFwiQXV0aG9yaXphdGlvblwiLCBgQmVhcmVyICR7dG9rZW59YClcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvdWxkQWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IGJvb2xlYW4ge1xuICAgIHJldHVybiByZXF1ZXN0LnVybC5zdGFydHNXaXRoKHRoaXMudXJscy5hcGlVcmwpO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgVXNlciB7XG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnkpOiBVc2VyIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIG5ldyBVc2VyKGpzb24uaWQsIGpzb24uYXR0cmlidXRlcyA/IGpzb24uYXR0cmlidXRlcy5zdGF0dXMgOiB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogVXNlcltdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKFVzZXIuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHN0YXR1czogc3RyaW5nKSB7fVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2Uge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnkpOiBNZXNzYWdlIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIHJldHVybiBuZXcgTWVzc2FnZShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb250ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbWVudChhdHRyaWJ1dGVzLmNyZWF0ZWRBdCkudG9EYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVyID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVyLmRhdGEpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5yZWxhdGlvbnNoaXBzLnJvb20uZGF0YS5pZCk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSk6IE1lc3NhZ2VbXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChNZXNzYWdlLmJ1aWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjb250ZW50OiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnRUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNyZWF0ZWRBdDogRGF0ZSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc2VuZGVyOiBVc2VyLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tSWQ6IHN0cmluZykge31cblxuICBoYXNTZW5kZXJJZCh1c2VySWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLnNlbmRlciAmJiB0aGlzLnNlbmRlci5pZCA9PT0gdXNlcklkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnZS50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTmV3TWVzc2FnZSB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgY29udGVudFR5cGU6IHN0cmluZztcbiAgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZXNzYWdlUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSByb29tVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5yb29tVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG5cbiAgY3JlYXRlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QodGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IE1lc3NhZ2UuYnVpbGQocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHsgcGFyYW1zOiBhdHRyaWJ1dGVzIH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5tYXAocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGRlbGV0ZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUoYCR7dGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpfS8ke21lc3NhZ2UuaWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlc3BvbnNlID0+IG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgbWVzc2FnZVVybChyb29tSWQ6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbUlkfS9tZXNzYWdlc2A7XG4gIH1cblxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnksIE5ld01lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9yb29tLnJlcG9zaXRvcnlcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuZXhwb3J0IGNsYXNzIFJvb20ge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGpzb24uYXR0cmlidXRlcztcbiAgICBjb25zdCB1c2VycyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMudXNlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBzZW5kZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5zZW5kZXJzID8gVXNlci5tYXAoanNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBtZXNzYWdlcyA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMgPyBNZXNzYWdlLm1hcChqc29uLnJlbGF0aW9uc2hpcHMubWVzc2FnZXMuZGF0YSkgOiBbXTtcbiAgICBjb25zdCBpbml0aWF0b3IgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvciA/IFVzZXIuYnVpbGQoanNvbi5yZWxhdGlvbnNoaXBzLmluaXRpYXRvci5kYXRhKSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gbmV3IFJvb20oanNvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmxhc3RBY3Rpdml0eUF0ID8gbW9tZW50KGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQpLnV0YygpLnRvRGF0ZSgpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm9wZW4sXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudW5yZWFkTWVzc2FnZUNvdW50LFxuICAgICAgICAgICAgICAgICAgICB1c2VycyxcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVycyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRvcixcbiAgICAgICAgICAgICAgICAgICAgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnksIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5KTogUm9vbVtdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKHJvb20gPT4gUm9vbS5idWlsZChyb29tLCByb29tUmVwb3NpdG9yeSwgbWVzc2FnZVJlcG9zaXRvcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBuZXdNZXNzYWdlTm90aWZpZXI6IChtZXNzYWdlOiBNZXNzYWdlKSA9PiBhbnk7XG4gIHByaXZhdGUgaW50ZXJuYWxPcGVuOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG4gIHByaXZhdGUgaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQ6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+O1xuICBwcml2YXRlIGludGVybmFsTmFtZTogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG4gIHByaXZhdGUgaW50ZXJuYWxMYXN0QWN0aXZpdHlBdDogQmVoYXZpb3JTdWJqZWN0PERhdGU+O1xuICBwcml2YXRlIGludGVybmFsSW1hZ2VVcmw6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIG5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgbGFzdEFjdGl2aXR5QXQ6IERhdGUsXG4gICAgICAgICAgICAgIG9wZW46IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHVucmVhZE1lc3NhZ2VDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICByZWFkb25seSB1c2VyczogVXNlcltdLFxuICAgICAgICAgICAgICByZWFkb25seSBzZW5kZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IG1lc3NhZ2VzOiBNZXNzYWdlW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGluaXRpYXRvcjogVXNlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnkpIHtcbiAgICB0aGlzLmludGVybmFsT3BlbiA9IG5ldyBCZWhhdmlvclN1YmplY3Qob3Blbik7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0ID0gbmV3IEJlaGF2aW9yU3ViamVjdChsYXN0QWN0aXZpdHlBdCk7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG5hbWUpO1xuICAgIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVucmVhZE1lc3NhZ2VDb3VudCk7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsID0gbmV3IEJlaGF2aW9yU3ViamVjdCh1bmRlZmluZWQpO1xuICB9XG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lLnZhbHVlO1xuICB9XG5cbiAgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbE5hbWUubmV4dChuYW1lKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTmFtZSgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxOYW1lO1xuICB9XG5cbiAgZ2V0IG9wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxPcGVuLnZhbHVlO1xuICB9XG5cbiAgc2V0IG9wZW4ob3BlbjogYm9vbGVhbikge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuLm5leHQob3Blbik7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZU9wZW4oKTogQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW47XG4gIH1cblxuICBnZXQgbGFzdEFjdGl2aXR5QXQoKTogRGF0ZSB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC52YWx1ZTtcbiAgfVxuXG4gIHNldCBsYXN0QWN0aXZpdHlBdChsYXN0QWN0aXZpdHlBdDogRGF0ZSkge1xuICAgIHRoaXMuaW50ZXJuYWxMYXN0QWN0aXZpdHlBdC5uZXh0KGxhc3RBY3Rpdml0eUF0KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlTGFzdEFjdGl2aXR5QXQoKTogQmVoYXZpb3JTdWJqZWN0PERhdGU+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0O1xuICB9XG5cbiAgZ2V0IGltYWdlVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybC52YWx1ZTtcbiAgfVxuXG4gIHNldCBpbWFnZVVybChpbWFnZVVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5pbnRlcm5hbEltYWdlVXJsLm5leHQoaW1hZ2VVcmwpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVJbWFnZVVybCgpOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbWFnZVVybDtcbiAgfVxuXG5cbiAgb3Blbk1lbWJlcnNoaXAoKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkudXBkYXRlTWVtYmVyc2hpcCh0aGlzLCB0cnVlKTtcbiAgfVxuXG4gIGNsb3NlTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIGZhbHNlKTtcbiAgfVxuXG4gIG1hcmtBbGxNZXNzYWdlc0FzUmVhZCgpOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5Lm1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHRoaXMpO1xuICB9XG5cbiAgYWRkTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgIHRoaXMubGFzdEFjdGl2aXR5QXQgPSBtZXNzYWdlLmNyZWF0ZWRBdDtcbiAgfVxuXG4gIG5vdGlmeU5ld01lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGlmICh0aGlzLm5ld01lc3NhZ2VOb3RpZmllcikge1xuICAgICAgdGhpcy5uZXdNZXNzYWdlTm90aWZpZXIuYXBwbHkobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cblxuICBoYXNVc2VyKHVzZXJJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudXNlcnMgJiYgdGhpcy51c2Vycy5zb21lKHVzZXIgPT4gdXNlci5pZCAgPT09IHVzZXJJZCk7XG4gIH1cblxuICBmZXRjaE1vcmVNZXNzYWdlKCk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgZmlyc3RTZWVuTWVzc2FnZUlkOiB0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDAgPyB0aGlzLm1lc3NhZ2VzWzBdLmlkIDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmZpbmRNZXNzYWdlcyh0aGlzLCBwYXJhbXMpXG4gICAgICAgICAgICAgICAucGlwZShcbiAgICAgIG1hcChtZXNzYWdlcyA9PiB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMudW5zaGlmdC5hcHBseSh0aGlzLm1lc3NhZ2VzLCBtZXNzYWdlcyk7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGZpbmRNZXNzYWdlV2l0aElkKGlkOiBzdHJpbmcpOiBNZXNzYWdlIHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlcyA/IHRoaXMubWVzc2FnZXMuZmluZChtZXNzYWdlID0+IG1lc3NhZ2UuaWQgPT09IGlkKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHVwZGF0ZSgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGUodGhpcyk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShuZXdNZXNzYWdlOiBOZXdNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5jcmVhdGVNZXNzYWdlKHRoaXMsIG5ld01lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgbWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICk7XG4gIH1cblxuICByZW1vdmVNZXNzYWdlKG1lc3NhZ2VUb0RlbGV0ZTogTWVzc2FnZSk6IE1lc3NhZ2Uge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5tZXNzYWdlcyA/IHRoaXMubWVzc2FnZXMuZmluZEluZGV4KG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gbWVzc2FnZVRvRGVsZXRlLmlkKSA6IC0xO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlVG9EZWxldGU7XG4gIH1cblxuICBkZWxldGUobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZGVsZXRlTWVzc2FnZSh0aGlzLCBtZXNzYWdlKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKGRlbGV0ZWRNZXNzYWdlID0+IHRoaXMucmVtb3ZlTWVzc2FnZShkZWxldGVkTWVzc2FnZSkpKTtcbiAgfVxuXG4gIHJlcGxhY2VVc2Vyc1dpdGgocm9vbTogUm9vbSk6IFJvb20ge1xuICAgIHRoaXMudXNlcnMuc3BsaWNlKDAsIHRoaXMudXNlcnMubGVuZ3RoKTtcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLnVzZXJzLCByb29tLnVzZXJzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZFVzZXIodXNlcjogVXNlcikge1xuICAgIGlmICghdGhpcy5oYXNVc2VyKHVzZXIuaWQpKSB7XG4gICAgICB0aGlzLnVzZXJzLnB1c2godXNlcik7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBCYWJpbGlVcmxDb25maWd1cmF0aW9uLCBVUkxfQ09ORklHVVJBVElPTiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi9yb29tLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb29tUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSByb29tVXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIG1lc3NhZ2VSZXBvc2l0b3J5OiBNZXNzYWdlUmVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgQEluamVjdChVUkxfQ09ORklHVVJBVElPTikgY29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMucm9vbVVybCA9IGAke2NvbmZpZ3VyYXRpb24uYXBpVXJsfS91c2VyL3Jvb21zYDtcbiAgfVxuXG4gIGZpbmQoaWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KGAke3RoaXMucm9vbVVybH0vJHtpZH1gKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGpzb246IGFueSkgPT4gUm9vbS5idWlsZChqc29uLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICBmaW5kQWxsKHF1ZXJ5OiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXSB9KTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLnJvb21VcmwsIHsgcGFyYW1zOiBxdWVyeSB9KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGpzb246IGFueSkgPT4gUm9vbS5tYXAoanNvbi5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgZmluZE9wZW5lZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IG9ubHlPcGVuZWQ6IFwidHJ1ZVwiIH0pO1xuICB9XG5cbiAgZmluZENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IG9ubHlDbG9zZWQ6IFwidHJ1ZVwiIH0pO1xuICB9XG5cbiAgZmluZFJvb21zQWZ0ZXIoaWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IGZpcnN0U2VlblJvb21JZDogaWQgfSk7XG4gIH1cblxuICBmaW5kUm9vbXNCeUlkcyhyb29tSWRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRBbGwoeyBcInJvb21JZHNbXVwiOiByb29tSWRzIH0pO1xuICB9XG5cbiAgdXBkYXRlTWVtYmVyc2hpcChyb29tOiBSb29tLCBvcGVuOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXBgLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVtYmVyc2hpcFwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgb3Blbjogb3BlblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgcm9vbS5vcGVuID0gZGF0YS5kYXRhLmF0dHJpYnV0ZXMub3BlbjtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICAgIGlmIChyb29tLnVucmVhZE1lc3NhZ2VDb3VudCA+IDApIHtcbiAgICAgIGNvbnN0IGxhc3RSZWFkTWVzc2FnZUlkID0gcm9vbS5tZXNzYWdlcy5sZW5ndGggPiAwID8gcm9vbS5tZXNzYWdlc1tyb29tLm1lc3NhZ2VzLmxlbmd0aCAtIDFdLmlkIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9L21lbWJlcnNoaXAvdW5yZWFkLW1lc3NhZ2VzYCwgeyBkYXRhOiB7IGxhc3RSZWFkTWVzc2FnZUlkOiBsYXN0UmVhZE1lc3NhZ2VJZCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLm1ldGEuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YoMCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlKG5hbWU6IHN0cmluZywgdXNlcklkczogc3RyaW5nW10sIHdpdGhvdXREdXBsaWNhdGU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoYCR7dGhpcy5yb29tVXJsfT9ub0R1cGxpY2F0ZT0ke3dpdGhvdXREdXBsaWNhdGV9YCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcInJvb21cIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVsYXRpb25zaGlwczoge1xuICAgICAgICAgIHVzZXJzOiB7XG4gICAgICAgICAgICBkYXRhOiB1c2VySWRzLm1hcCh1c2VySWQgPT4gKHsgdHlwZTogXCJ1c2VyXCIsIGlkOiB1c2VySWQgfSkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBub0R1cGxpY2F0ZTogYCR7d2l0aG91dER1cGxpY2F0ZX1gXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IFJvb20uYnVpbGQocmVzcG9uc2UuZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIHVwZGF0ZShyb29tOiBSb29tKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQoYCR7dGhpcy5yb29tVXJsfS8ke3Jvb20uaWR9YCwge1xuICAgICAgZGF0YToge1xuICAgICAgICB0eXBlOiBcInJvb21cIixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIG5hbWU6IHJvb20ubmFtZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIHJvb20ubmFtZSA9IHJlc3BvbnNlLmRhdGEuYXR0cmlidXRlcy5uYW1lO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgYWRkVXNlcihyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcHNgLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVtYmVyc2hpcFwiLFxuICAgICAgICByZWxhdGlvbnNoaXBzOiB7XG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICB0eXBlOiBcInVzZXJcIixcbiAgICAgICAgICAgICAgaWQ6IHVzZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLnBpcGUobWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICBjb25zdCBuZXdVc2VyID0gVXNlci5idWlsZChyZXNwb25zZS5kYXRhLnJlbGF0aW9uc2hpcHMudXNlci5kYXRhKTtcbiAgICAgIHJvb20uYWRkVXNlcihuZXdVc2VyKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2Uocm9vbTogUm9vbSwgbWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmRlbGV0ZShyb29tLCBtZXNzYWdlKTtcbiAgfVxuXG4gIGZpbmRNZXNzYWdlcyhyb29tOiBSb29tLCBhdHRyaWJ1dGVzOiB7W3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0pOiBPYnNlcnZhYmxlPE1lc3NhZ2VbXT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmZpbmRBbGwocm9vbSwgYXR0cmlidXRlcyk7XG4gIH1cblxuICBjcmVhdGVNZXNzYWdlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlUmVwb3NpdG9yeS5jcmVhdGUocm9vbSwgYXR0cmlidXRlcyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGZsYXRNYXAsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmV4cG9ydCBjbGFzcyBNZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KTogTWUge1xuICAgIGNvbnN0IHVucmVhZE1lc3NhZ2VDb3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnVucmVhZE1lc3NhZ2VDb3VudCA6IDA7XG4gICAgY29uc3Qgcm9vbUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEucm9vbUNvdW50IDogMDtcbiAgICByZXR1cm4gbmV3IE1lKGpzb24uZGF0YS5pZCwgW10sIFtdLCB1bnJlYWRNZXNzYWdlQ291bnQsIHJvb21Db3VudCwgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgcHVibGljIGRldmljZVNlc3Npb25JZDogc3RyaW5nO1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFJvb21Db3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgZmlyc3RTZWVuUm9vbTogUm9vbTtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBvcGVuZWRSb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcm9vbUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50IHx8IDApO1xuICAgIHRoaXMuaW50ZXJuYWxSb29tQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHJvb21Db3VudCB8fCAwKTtcbiAgfVxuXG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCByb29tQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudC52YWx1ZTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlUm9vbUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudDtcbiAgfVxuXG4gIGZldGNoT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kT3BlbmVkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZENsb3NlZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hNb3JlUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICBpZiAodGhpcy5maXJzdFNlZW5Sb29tKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNBZnRlcih0aGlzLmZpcnN0U2VlblJvb20uaWQpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKFtdKTtcbiAgICB9XG4gIH1cblxuICBmZXRjaFJvb21zQnlJZChyb29tSWRzOiBzdHJpbmdbXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQnlJZHMocm9vbUlkcykucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmQocm9vbUlkKS5waXBlKG1hcChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZpbmRPckZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQocm9vbUlkKTtcbiAgICBpZiAocm9vbUlkKSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZldGNoUm9vbUJ5SWQocm9vbUlkKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVOZXdNZXNzYWdlKG5ld01lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLmZpbmRPckZldGNoUm9vbUJ5SWQobmV3TWVzc2FnZS5yb29tSWQpXG4gICAgICAgIC5zdWJzY3JpYmUocm9vbSA9PiB7XG4gICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIHJvb20uYWRkTWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIHJvb20ubm90aWZ5TmV3TWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIGlmICghbmV3TWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgaWYgKCFyb29tLm9wZW4pIHtcbiAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IHJvb20udW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBhZGRSb29tKG5ld1Jvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbShuZXdSb29tKSkge1xuICAgICAgaWYgKCF0aGlzLmZpcnN0U2VlblJvb20gfHwgbW9tZW50KHRoaXMuZmlyc3RTZWVuUm9vbS5sYXN0QWN0aXZpdHlBdCkuaXNBZnRlcihuZXdSb29tLmxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICB0aGlzLmZpcnN0U2VlblJvb20gPSBuZXdSb29tO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByb29tSW5kZXggPSB0aGlzLnJvb21zID8gdGhpcy5yb29tcy5maW5kSW5kZXgocm9vbSA9PiByb29tLmlkID09PSBuZXdSb29tLmlkKSA6IC0xO1xuICAgICAgaWYgKHJvb21JbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMucm9vbXNbcm9vbUluZGV4XSA9IG5ld1Jvb207XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb21zLnB1c2gobmV3Um9vbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmluZFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMucm9vbXMgPyB0aGlzLnJvb21zLmZpbmQocm9vbSA9PiByb29tSWQgPT09IHJvb20uaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgb3BlblJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5vcGVuTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKGZsYXRNYXAoKG9wZW5lZFJvb206IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFRvT3BlbmVkUm9vbShvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5jbG9zZU1lbWJlcnNoaXAoKVxuICAgICAgICAgICAgICAgICAucGlwZShtYXAoY2xvc2VkUm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9zZWRSb29tO1xuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tcyhyb29tc1RvQ2xvc2U6IFJvb21bXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIG9mKHJvb21zVG9DbG9zZSkucGlwZShcbiAgICAgIG1hcChyb29tcyA9PiB7XG4gICAgICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB0aGlzLmNsb3NlUm9vbShyb29tKSk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIG9wZW5Sb29tQW5kQ2xvc2VPdGhlcnMocm9vbVRvT3BlbjogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb21zVG9CZUNsb3NlZCA9IHRoaXMub3BlbmVkUm9vbXMuZmlsdGVyKHJvb20gPT4gcm9vbS5pZCAhPT0gcm9vbVRvT3Blbi5pZCk7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VSb29tcyhyb29tc1RvQmVDbG9zZWQpLnBpcGUoZmxhdE1hcChyb29tcyA9PiB0aGlzLm9wZW5Sb29tKHJvb21Ub09wZW4pKSk7XG4gIH1cblxuICBoYXNPcGVuZWRSb29tcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcy5sZW5ndGggPiAwO1xuICB9XG5cbiAgY3JlYXRlUm9vbShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuY3JlYXRlKG5hbWUsIHVzZXJJZHMsIHdpdGhvdXREdXBsaWNhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBidWlsZFJvb20odXNlcklkczogc3RyaW5nW10pOiBSb29tIHtcbiAgICBjb25zdCB1c2VycyA9IHVzZXJJZHMubWFwKGlkID0+IG5ldyBVc2VyKGlkLCBcIlwiKSk7XG4gICAgY29uc3Qgbm9TZW5kZXJzID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlVW5yZWFkID0gMDtcbiAgICBjb25zdCBub0lkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IHRoaXMudG9Vc2VyKCk7XG4gICAgcmV0dXJuIG5ldyBSb29tKG5vSWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB0cnVlLFxuICAgICAgbm9NZXNzYWdlVW5yZWFkLFxuICAgICAgdXNlcnMsXG4gICAgICBub1NlbmRlcnMsXG4gICAgICBub01lc3NhZ2UsXG4gICAgICBpbml0aWF0b3IsXG4gICAgICB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShyb29tOiBSb29tLCBjb250ZW50OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gcm9vbS5zZW5kTWVzc2FnZSh7XG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgY29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgICAgZGV2aWNlU2Vzc2lvbklkOiB0aGlzLmRldmljZVNlc3Npb25JZFxuICAgIH0pO1xuICB9XG5cbiAgaXNTZW50QnlNZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2UgJiYgbWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQobWVzc2FnZS5yb29tSWQpO1xuICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgcmV0dXJuIHJvb20uZGVsZXRlKG1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFVzZXJUbyhyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmFkZFVzZXIocm9vbSwgdXNlcklkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm9vbXMocm9vbXM6IFJvb21bXSkge1xuICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICBpZiAocm9vbS5vcGVuICYmICF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbShyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbU9wZW5lZChyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbShyb29tOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb21CeUlkKHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbU9wZW5lZChyb29tVG9GaW5kOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMub3BlbmVkUm9vbXMgPyB0aGlzLm9wZW5lZFJvb21zLmZpbmQocm9vbSA9PiByb29tVG9GaW5kLmlkID09PSByb29tLmlkKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9PcGVuZWRSb29tKHJvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbTogUm9vbSkge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQoY2xvc2VkUm9vbSkpIHtcbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMub3BlbmVkUm9vbXMgPyB0aGlzLm9wZW5lZFJvb21zLmZpbmRJbmRleChyb29tID0+IHJvb20uaWQgPT09IGNsb3NlZFJvb20uaWQpIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5zcGxpY2Uocm9vbUluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gcm9vbS5tYXJrQWxsTWVzc2FnZXNBc1JlYWQoKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlYWRNZXNzYWdlQ291bnQgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSBNYXRoLm1heCh0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCAtIHJlYWRNZXNzYWdlQ291bnQsIDApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1VzZXIoKTogVXNlciB7XG4gICAgcmV0dXJuIG5ldyBVc2VyKHRoaXMuaWQsIFwiXCIpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBlbXB0eSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sIFVSTF9DT05GSUdVUkFUSU9OIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vLi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lIH0gZnJvbSBcIi4vbWUudHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lUmVwb3NpdG9yeSB7XG5cbiAgcHJpdmF0ZSB1c2VyVXJsOiBzdHJpbmc7XG4gIHByaXZhdGUgYWxpdmVVcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBjb25maWd1cmF0aW9uOiBCYWJpbGlVcmxDb25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy51c2VyVXJsID0gYCR7Y29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXJgO1xuICAgIHRoaXMuYWxpdmVVcmwgPSBgJHt0aGlzLnVzZXJVcmx9L2FsaXZlYDtcbiAgfVxuXG4gIGZpbmRNZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQodGhpcy51c2VyVXJsKS5waXBlKG1hcChtZSA9PiBNZS5idWlsZChtZSwgdGhpcy5yb29tUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIHVwZGF0ZUFsaXZlbmVzcyhtZTogTWUpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dCh0aGlzLmFsaXZlVXJsLCB7IGRhdGE6IHsgdHlwZTogXCJhbGl2ZVwiIH19KVxuICAgICAgICAgICAgICAgICAgICAucGlwZShjYXRjaEVycm9yKCgpID0+IGVtcHR5KCkpLCBtYXAoKCkgPT4gbnVsbCkpO1xuICB9XG59XG5cbiIsImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgKiBhcyBpbyBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5cblxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwU29ja2V0IHtcblxuICBwcml2YXRlIHNvY2tldDogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoVVJMX0NPTkZJR1VSQVRJT04pIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbikge31cblxuICBjb25uZWN0KHRva2VuOiBzdHJpbmcpOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCh0aGlzLmNvbmZpZ3VyYXRpb24uc29ja2V0VXJsLCB7XG4gICAgICBmb3JjZU5ldzogdHJ1ZSxcbiAgICAgIHF1ZXJ5OiBgdG9rZW49JHt0b2tlbn1gXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0O1xuICB9XG5cbiAgc29ja2V0RXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNvY2tldCAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBpZiAodGhpcy5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRpbWVyIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCwgcHVibGlzaFJlcGxheSwgcmVmQ291bnQsIHNoYXJlLCB0YWtlV2hpbGUgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLy4uL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi8uLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWUgfSBmcm9tIFwiLi9tZS50eXBlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVTZXJ2aWNlIHtcblxuICBwcml2YXRlIGNhY2hlZE1lOiBPYnNlcnZhYmxlPE1lPjtcbiAgcHJpdmF0ZSBhbGl2ZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1lUmVwb3NpdG9yeTogTWVSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIHNvY2tldENsaWVudDogQm9vdHN0cmFwU29ja2V0LFxuICAgICAgICAgICAgICBASW5qZWN0KFVSTF9DT05GSUdVUkFUSU9OKSBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaVVybENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgdG9rZW5Db25maWd1cmF0aW9uOiBUb2tlbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gIH1cblxuICBzZXR1cCh0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5pc0FwaVRva2VuU2V0KCkpIHtcbiAgICAgIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuID0gdG9rZW47XG4gICAgfVxuICB9XG5cbiAgbWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIGlmICghdGhpcy5oYXNDYWNoZWRNZSgpKSB7XG4gICAgICB0aGlzLmNhY2hlZE1lID0gdGhpcy5tZVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmRNZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcChtZSA9PiB0aGlzLnNjaGVkdWxlQWxpdmVuZXNzKG1lKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaFJlcGxheSgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZDb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXJlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUucGlwZShtYXAobWUgPT4gdGhpcy5jb25uZWN0U29ja2V0KG1lKSkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uY2xlYXIoKTtcbiAgICB0aGlzLmNhY2hlZE1lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVBbGl2ZW5lc3MobWU6IE1lKTogTWUge1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuICAgIHRpbWVyKDAsIHRoaXMuY29uZmlndXJhdGlvbi5hbGl2ZUludGVydmFsSW5NcykucGlwZShcbiAgICAgIHRha2VXaGlsZSgoKSA9PiB0aGlzLmFsaXZlKVxuICAgIClcbiAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMubWVSZXBvc2l0b3J5LnVwZGF0ZUFsaXZlbmVzcyhtZSkpO1xuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgaGFzQ2FjaGVkTWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkTWUgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgY29ubmVjdFNvY2tldChtZTogTWUpOiBNZSB7XG4gICAgaWYgKCF0aGlzLnNvY2tldENsaWVudC5zb2NrZXRFeGlzdHMoKSkge1xuICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5zb2NrZXRDbGllbnQuY29ubmVjdCh0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5hcGlUb2tlbik7XG4gICAgICBzb2NrZXQub24oXCJuZXcgbWVzc2FnZVwiLCBkYXRhID0+IHRoaXMucmVjZWl2ZU5ld01lc3NhZ2UoZGF0YSkpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdGVkXCIsIGRhdGEgPT4gbWUuZGV2aWNlU2Vzc2lvbklkID0gZGF0YS5kZXZpY2VTZXNzaW9uSWQpO1xuICAgIH1cbiAgICByZXR1cm4gbWU7XG4gIH1cblxuICBwcml2YXRlIHJlY2VpdmVOZXdNZXNzYWdlKGpzb246IGFueSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBNZXNzYWdlLmJ1aWxkKGpzb24uZGF0YSk7XG4gICAgdGhpcy5tZSgpLnN1YnNjcmliZShtZSA9PiBtZS5oYW5kbGVOZXdNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuQFBpcGUoe1xuICBuYW1lOiBcInNvcnRSb29tc1wiXG59KVxuZXhwb3J0IGNsYXNzIFNvcnRSb29tUGlwZSAgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHJvb21zOiBSb29tW10sIGZpZWxkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgaWYgKHJvb21zICE9PSB1bmRlZmluZWQgJiYgcm9vbXMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiByb29tcy5zb3J0KChyb29tOiBSb29tLCBvdGhlclJvb206IFJvb20pID0+IHtcbiAgICAgICAgY29uc3QgbGFzdEFjdGl2aXR5QXQgICAgICA9IHJvb20ubGFzdEFjdGl2aXR5QXQ7XG4gICAgICAgIGNvbnN0IG90aGVyTGFzdEFjdGl2aXR5QXQgPSBvdGhlclJvb20ubGFzdEFjdGl2aXR5QXQ7XG4gICAgICAgIGlmIChtb21lbnQobGFzdEFjdGl2aXR5QXQpLmlzQmVmb3JlKG90aGVyTGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSBpZiAobW9tZW50KG90aGVyTGFzdEFjdGl2aXR5QXQpLmlzQmVmb3JlKGxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEhUVFBfSU5URVJDRVBUT1JTLCBIdHRwQ2xpZW50TW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvciB9IGZyb20gXCIuL2F1dGhlbnRpY2F0aW9uL2h0dHAtYXV0aGVudGljYXRpb24taW50ZXJjZXB0b3JcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiwgVVJMX0NPTkZJR1VSQVRJT04gfSBmcm9tIFwiLi9jb25maWd1cmF0aW9uL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBNZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZS9tZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZVNlcnZpY2UgfSBmcm9tIFwiLi9tZS9tZS5zZXJ2aWNlXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBTb3J0Um9vbVBpcGUgfSBmcm9tIFwiLi9waXBlL3NvcnQtcm9vbVwiO1xuaW1wb3J0IHsgUm9vbVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9yb29tL3Jvb20ucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgQm9vdHN0cmFwU29ja2V0IH0gZnJvbSBcIi4vc29ja2V0L2Jvb3RzdHJhcC5zb2NrZXRcIjtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIEh0dHBDbGllbnRNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgU29ydFJvb21QaXBlXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBTb3J0Um9vbVBpcGVcbiAgXVxuIH0pXG5leHBvcnQgY2xhc3MgQmFiaWxpTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QodXJsQ29uZmlndXJhdGlvbjogQmFiaWxpVXJsQ29uZmlndXJhdGlvbik6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQmFiaWxpTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBVUkxfQ09ORklHVVJBVElPTixcbiAgICAgICAgICB1c2VWYWx1ZTogdXJsQ29uZmlndXJhdGlvblxuICAgICAgICB9LFxuICAgICAgICBTb3J0Um9vbVBpcGUsXG4gICAgICAgIFRva2VuQ29uZmlndXJhdGlvbixcbiAgICAgICAgQm9vdHN0cmFwU29ja2V0LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsXG4gICAgICAgICAgdXNlQ2xhc3M6IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yLFxuICAgICAgICAgIG11bHRpOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIE1lc3NhZ2VSZXBvc2l0b3J5LFxuICAgICAgICBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgTWVSZXBvc2l0b3J5LFxuICAgICAgICBNZVNlcnZpY2VcbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXSwibmFtZXMiOlsiSW5qZWN0YWJsZSIsIkluamVjdGlvblRva2VuIiwiY2F0Y2hFcnJvciIsIkh0dHBFcnJvclJlc3BvbnNlIiwidGhyb3dFcnJvciIsIkluamVjdCIsImh0dHAiLCJtYXAiLCJIdHRwQ2xpZW50IiwibW9tZW50IiwiQmVoYXZpb3JTdWJqZWN0Iiwib2YiLCJmbGF0TWFwIiwiZW1wdHkiLCJpby5jb25uZWN0IiwicHVibGlzaFJlcGxheSIsInJlZkNvdW50Iiwic2hhcmUiLCJ0aW1lciIsInRha2VXaGlsZSIsIlBpcGUiLCJIVFRQX0lOVEVSQ0VQVE9SUyIsIk5nTW9kdWxlIiwiSHR0cENsaWVudE1vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO1FBTUU7U0FBZ0I7Ozs7UUFFaEIsMENBQWE7OztZQUFiO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUM7YUFDdEY7Ozs7UUFFRCxrQ0FBSzs7O1lBQUw7Z0JBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7YUFDM0I7O29CQVpGQSxlQUFVOzs7O2lDQUZYOzs7Ozs7O0FDQUEseUJBRWEsaUJBQWlCLEdBQUcsSUFBSUMsbUJBQWMsQ0FBeUIsd0JBQXdCLENBQUM7Ozs7OztBQ0ZyRyxRQUFBO1FBQ0UsNEJBQXFCLEtBQVU7WUFBVixVQUFLLEdBQUwsS0FBSyxDQUFLO1NBQUk7aUNBRHJDO1FBRUM7Ozs7OztBQ0ZEO1FBV0UsdUNBQStDLElBQTRCLEVBQ3ZEO1lBRDJCLFNBQUksR0FBSixJQUFJLENBQXdCO1lBQ3ZELHVCQUFrQixHQUFsQixrQkFBa0I7U0FBd0I7Ozs7OztRQUU5RCxpREFBUzs7Ozs7WUFBVCxVQUFVLE9BQXlCLEVBQUUsSUFBaUI7Z0JBQ3BELElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNuQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUNuRSxJQUFJLENBQUNDLG9CQUFVLENBQUMsVUFBQSxLQUFLO3dCQUNwQixJQUFJLEtBQUssWUFBWUMsc0JBQWlCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7NEJBQzlELE9BQU9DLGVBQVUsQ0FBQyxJQUFJLGtCQUFr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