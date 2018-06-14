(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common/http'), require('rxjs'), require('rxjs/operators'), require('moment'), require('socket.io-client')) :
    typeof define === 'function' && define.amd ? define('@babili.io/angular', ['exports', '@angular/core', '@angular/common/http', 'rxjs', 'rxjs/operators', 'moment', 'socket.io-client'], factory) :
    (factory((global.babili = global.babili || {}, global.babili.io = global.babili.io || {}, global.babili.io.angular = {}),global.ng.core,global.ng.common.http,null,global.Rx.Observable.prototype,null,null));
}(this, (function (exports,core,http,rxjs,operators,momentLoaded,io) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var BabiliConfiguration = (function () {
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
             */ function () {
                return this.url ? this.url.apiUrl : undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BabiliConfiguration.prototype, "socketUrl", {
            get: /**
             * @return {?}
             */ function () {
                return this.url ? this.url.socketUrl : undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BabiliConfiguration.prototype, "aliveIntervalInMs", {
            get: /**
             * @return {?}
             */ function () {
                return this.url ? this.url.aliveIntervalInMs : 30000;
            },
            enumerable: true,
            configurable: true
        });
        BabiliConfiguration.decorators = [
            { type: core.Injectable },
        ];
        return BabiliConfiguration;
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
                return request.url.startsWith(this.configuration.apiUrl);
            };
        HttpAuthenticationInterceptor.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        HttpAuthenticationInterceptor.ctorParameters = function () {
            return [
                { type: BabiliConfiguration },
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
        Object.defineProperty(MessageRepository.prototype, "roomUrl", {
            get: /**
             * @return {?}
             */ function () {
                return this.configuration.apiUrl + "/user/rooms";
            },
            enumerable: true,
            configurable: true
        });
        MessageRepository.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        MessageRepository.ctorParameters = function () {
            return [
                { type: http.HttpClient },
                { type: BabiliConfiguration }
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
        Object.defineProperty(RoomRepository.prototype, "roomUrl", {
            get: /**
             * @return {?}
             */ function () {
                return this.configuration.apiUrl + "/user/rooms";
            },
            enumerable: true,
            configurable: true
        });
        RoomRepository.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        RoomRepository.ctorParameters = function () {
            return [
                { type: http.HttpClient },
                { type: MessageRepository },
                { type: BabiliConfiguration }
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
        Object.defineProperty(MeRepository.prototype, "userUrl", {
            get: /**
             * @return {?}
             */ function () {
                return this.configuration.apiUrl + "/user";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MeRepository.prototype, "aliveUrl", {
            get: /**
             * @return {?}
             */ function () {
                return this.userUrl + "/alive";
            },
            enumerable: true,
            configurable: true
        });
        MeRepository.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        MeRepository.ctorParameters = function () {
            return [
                { type: http.HttpClient },
                { type: RoomRepository },
                { type: BabiliConfiguration }
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
                { type: BabiliConfiguration }
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
                { type: BabiliConfiguration },
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

    exports.HttpAuthenticationInterceptor = HttpAuthenticationInterceptor;
    exports.NotAuthorizedError = NotAuthorizedError;
    exports.BabiliModule = BabiliModule;
    exports.TokenConfiguration = TokenConfiguration;
    exports.MeRepository = MeRepository;
    exports.MeService = MeService;
    exports.Me = Me;
    exports.MessageRepository = MessageRepository;
    exports.Message = Message;
    exports.SortRoomPipe = SortRoomPipe;
    exports.RoomRepository = RoomRepository;
    exports.Room = Room;
    exports.BootstrapSocket = BootstrapSocket;
    exports.User = User;
    exports.BabiliConfiguration = BabiliConfiguration;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLmlvLWFuZ3VsYXIudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvbi50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2F1dGhlbnRpY2F0aW9uL25vdC1hdXRob3JpemVkLWVycm9yLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvci50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL3VzZXIvdXNlci50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lc3NhZ2UvbWVzc2FnZS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5LnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvcm9vbS9yb29tLnR5cGVzLnRzIiwibmc6Ly9AYmFiaWxpLmlvL2FuZ3VsYXIvcm9vbS9yb29tLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9tZS9tZS50eXBlcy50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnJlcG9zaXRvcnkudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldC50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL21lL21lLnNlcnZpY2UudHMiLCJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci9waXBlL3NvcnQtcm9vbS50cyIsIm5nOi8vQGJhYmlsaS5pby9hbmd1bGFyL2JhYmlsaS5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgSW5qZWN0b3IgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuL3VybC1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCYWJpbGlDb25maWd1cmF0aW9uIHtcblxuICBwcml2YXRlIHVybDogQmFiaWxpVXJsQ29uZmlndXJhdGlvbjtcblxuICBpbml0KGFwaVVybDogc3RyaW5nLCBzb2NrZXRVcmw6IHN0cmluZywgYWxpdmVJbnRlcnZhbEluTXM/OiBudW1iZXIpIHtcbiAgICB0aGlzLnVybCA9IHtcbiAgICAgIGFwaVVybDogYXBpVXJsLFxuICAgICAgc29ja2V0VXJsOiBzb2NrZXRVcmwsXG4gICAgICBhbGl2ZUludGVydmFsSW5NczogYWxpdmVJbnRlcnZhbEluTXNcbiAgICB9O1xuICB9XG5cbiAgZ2V0IGFwaVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybCA/IHRoaXMudXJsLmFwaVVybCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBzb2NrZXRVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmwgPyB0aGlzLnVybC5zb2NrZXRVcmwgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgYWxpdmVJbnRlcnZhbEluTXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy51cmwgPyB0aGlzLnVybC5hbGl2ZUludGVydmFsSW5NcyA6IDMwMDAwO1xuICB9XG59XG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRva2VuQ29uZmlndXJhdGlvbiB7XG4gIHB1YmxpYyBhcGlUb2tlbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBpc0FwaVRva2VuU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFwaVRva2VuICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hcGlUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmFwaVRva2VuICE9PSBcIlwiO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5hcGlUb2tlbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgTm90QXV0aG9yaXplZEVycm9yIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgZXJyb3I6IGFueSkge31cbn1cbiIsImltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlLCBIdHRwRXZlbnQsIEh0dHBIYW5kbGVyLCBIdHRwSW50ZXJjZXB0b3IsIEh0dHBSZXF1ZXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGhyb3dFcnJvciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE5vdEF1dGhvcml6ZWRFcnJvciB9IGZyb20gXCIuL25vdC1hdXRob3JpemVkLWVycm9yXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb25maWd1cmF0aW9uOiBCYWJpbGlDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICBwcml2YXRlIHRva2VuQ29uZmlndXJhdGlvbjogVG9rZW5Db25maWd1cmF0aW9uKSB7fVxuXG4gIGludGVyY2VwdChyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAodGhpcy5zaG91bGRBZGRIZWFkZXJUbyhyZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHRoaXMuYWRkSGVhZGVyVG8ocmVxdWVzdCwgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4pKVxuICAgICAgICAgICAgICAgICAucGlwZShjYXRjaEVycm9yKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSAmJiBlcnJvci5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IE5vdEF1dGhvcml6ZWRFcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXF1ZXN0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZEhlYWRlclRvKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIHRva2VuOiBzdHJpbmcpOiBIdHRwUmVxdWVzdDxhbnk+IHtcbiAgICByZXR1cm4gcmVxdWVzdC5jbG9uZSh7XG4gICAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnMuc2V0KFwiQXV0aG9yaXphdGlvblwiLCBgQmVhcmVyICR7dG9rZW59YClcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvdWxkQWRkSGVhZGVyVG8ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IGJvb2xlYW4ge1xuICAgIHJldHVybiByZXF1ZXN0LnVybC5zdGFydHNXaXRoKHRoaXMuY29uZmlndXJhdGlvbi5hcGlVcmwpO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgVXNlciB7XG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnkpOiBVc2VyIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIG5ldyBVc2VyKGpzb24uaWQsIGpzb24uYXR0cmlidXRlcyA/IGpzb24uYXR0cmlidXRlcy5zdGF0dXMgOiB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogVXNlcltdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKFVzZXIuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHN0YXR1czogc3RyaW5nKSB7fVxufVxuIiwiaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmNvbnN0IG1vbWVudCA9IG1vbWVudExvYWRlZDtcblxuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuLi91c2VyL3VzZXIudHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2Uge1xuXG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnkpOiBNZXNzYWdlIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIHJldHVybiBuZXcgTWVzc2FnZShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb250ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbWVudChhdHRyaWJ1dGVzLmNyZWF0ZWRBdCkudG9EYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVyID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVyLmRhdGEpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5yZWxhdGlvbnNoaXBzLnJvb20uZGF0YS5pZCk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSk6IE1lc3NhZ2VbXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChNZXNzYWdlLmJ1aWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjb250ZW50OiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNvbnRlbnRUeXBlOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IGNyZWF0ZWRBdDogRGF0ZSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgc2VuZGVyOiBVc2VyLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tSWQ6IHN0cmluZykge31cblxuICBoYXNTZW5kZXJJZCh1c2VySWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLnNlbmRlciAmJiB0aGlzLnNlbmRlci5pZCA9PT0gdXNlcklkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnZS50eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTmV3TWVzc2FnZSB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgY29udGVudFR5cGU6IHN0cmluZztcbiAgZGV2aWNlU2Vzc2lvbklkOiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZXNzYWdlUmVwb3NpdG9yeSB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgICAgICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgY3JlYXRlKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QodGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzXG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IE1lc3NhZ2UuYnVpbGQocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocm9vbTogUm9vbSwgYXR0cmlidXRlczoge1twYXJhbTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119KTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLmdldCh0aGlzLm1lc3NhZ2VVcmwocm9vbS5pZCksIHsgcGFyYW1zOiBhdHRyaWJ1dGVzIH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gTWVzc2FnZS5tYXAocmVzcG9uc2UuZGF0YSkpKTtcbiAgfVxuXG4gIGRlbGV0ZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5kZWxldGUoYCR7dGhpcy5tZXNzYWdlVXJsKHJvb20uaWQpfS8ke21lc3NhZ2UuaWR9YClcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlc3BvbnNlID0+IG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgbWVzc2FnZVVybChyb29tSWQ6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbUlkfS9tZXNzYWdlc2A7XG4gIH1cblxuICBwcml2YXRlIGdldCByb29tVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuY29uZmlndXJhdGlvbi5hcGlVcmx9L3VzZXIvcm9vbXNgO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBtb21lbnRMb2FkZWQgZnJvbSBcIm1vbWVudFwiO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlUmVwb3NpdG9yeSwgTmV3TWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20ucmVwb3NpdG9yeVwiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5leHBvcnQgY2xhc3MgUm9vbSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ganNvbi5hdHRyaWJ1dGVzO1xuICAgIGNvbnN0IHVzZXJzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy51c2VycyA/IFVzZXIubWFwKGpzb24ucmVsYXRpb25zaGlwcy51c2Vycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IHNlbmRlcnMgPSBqc29uLnJlbGF0aW9uc2hpcHMgJiYganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlcnMgPyBVc2VyLm1hcChqc29uLnJlbGF0aW9uc2hpcHMuc2VuZGVycy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ganNvbi5yZWxhdGlvbnNoaXBzICYmIGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcyA/IE1lc3NhZ2UubWFwKGpzb24ucmVsYXRpb25zaGlwcy5tZXNzYWdlcy5kYXRhKSA6IFtdO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IGpzb24ucmVsYXRpb25zaGlwcyAmJiBqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yID8gVXNlci5idWlsZChqc29uLnJlbGF0aW9uc2hpcHMuaW5pdGlhdG9yLmRhdGEpIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBuZXcgUm9vbShqc29uLmlkLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMubGFzdEFjdGl2aXR5QXQgPyBtb21lbnQoYXR0cmlidXRlcy5sYXN0QWN0aXZpdHlBdCkudXRjKCkudG9EYXRlKCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy51bnJlYWRNZXNzYWdlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJzLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXJzLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdG9yLFxuICAgICAgICAgICAgICAgICAgICByb29tUmVwb3NpdG9yeSk7XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeTogTWVzc2FnZVJlcG9zaXRvcnkpOiBSb29tW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAocm9vbSA9PiBSb29tLmJ1aWxkKHJvb20sIHJvb21SZXBvc2l0b3J5LCBtZXNzYWdlUmVwb3NpdG9yeSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIG5ld01lc3NhZ2VOb3RpZmllcjogKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGFueTtcbiAgcHJpdmF0ZSBpbnRlcm5hbE9wZW46IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgaW50ZXJuYWxOYW1lOiBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbExhc3RBY3Rpdml0eUF0OiBCZWhhdmlvclN1YmplY3Q8RGF0ZT47XG4gIHByaXZhdGUgaW50ZXJuYWxJbWFnZVVybDogQmVoYXZpb3JTdWJqZWN0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBsYXN0QWN0aXZpdHlBdDogRGF0ZSxcbiAgICAgICAgICAgICAgb3BlbjogYm9vbGVhbixcbiAgICAgICAgICAgICAgdW5yZWFkTWVzc2FnZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHVzZXJzOiBVc2VyW10sXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcnM6IFVzZXJbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgbWVzc2FnZXM6IE1lc3NhZ2VbXSxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgaW5pdGlhdG9yOiBVc2VyLFxuICAgICAgICAgICAgICBwcml2YXRlIHJvb21SZXBvc2l0b3J5OiBSb29tUmVwb3NpdG9yeSkge1xuICAgIHRoaXMuaW50ZXJuYWxPcGVuID0gbmV3IEJlaGF2aW9yU3ViamVjdChvcGVuKTtcbiAgICB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGxhc3RBY3Rpdml0eUF0KTtcbiAgICB0aGlzLmludGVybmFsTmFtZSA9IG5ldyBCZWhhdmlvclN1YmplY3QobmFtZSk7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50KTtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBnZXQgdW5yZWFkTWVzc2FnZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxVbnJlYWRNZXNzYWdlQ291bnQudmFsdWU7XG4gIH1cblxuICBzZXQgdW5yZWFkTWVzc2FnZUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50Lm5leHQoY291bnQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVVbnJlYWRNZXNzYWdlQ291bnQoKTogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50O1xuICB9XG5cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWUudmFsdWU7XG4gIH1cblxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsTmFtZS5uZXh0KG5hbWUpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVOYW1lKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE5hbWU7XG4gIH1cblxuICBnZXQgb3BlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE9wZW4udmFsdWU7XG4gIH1cblxuICBzZXQgb3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgdGhpcy5pbnRlcm5hbE9wZW4ubmV4dChvcGVuKTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlT3BlbigpOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsT3BlbjtcbiAgfVxuXG4gIGdldCBsYXN0QWN0aXZpdHlBdCgpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0LnZhbHVlO1xuICB9XG5cbiAgc2V0IGxhc3RBY3Rpdml0eUF0KGxhc3RBY3Rpdml0eUF0OiBEYXRlKSB7XG4gICAgdGhpcy5pbnRlcm5hbExhc3RBY3Rpdml0eUF0Lm5leHQobGFzdEFjdGl2aXR5QXQpO1xuICB9XG5cbiAgZ2V0IG9ic2VydmFibGVMYXN0QWN0aXZpdHlBdCgpOiBCZWhhdmlvclN1YmplY3Q8RGF0ZT4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsTGFzdEFjdGl2aXR5QXQ7XG4gIH1cblxuICBnZXQgaW1hZ2VVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsLnZhbHVlO1xuICB9XG5cbiAgc2V0IGltYWdlVXJsKGltYWdlVXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLmludGVybmFsSW1hZ2VVcmwubmV4dChpbWFnZVVybCk7XG4gIH1cblxuICBnZXQgb2JzZXJ2YWJsZUltYWdlVXJsKCk6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEltYWdlVXJsO1xuICB9XG5cblxuICBvcGVuTWVtYmVyc2hpcCgpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS51cGRhdGVNZW1iZXJzaGlwKHRoaXMsIHRydWUpO1xuICB9XG5cbiAgY2xvc2VNZW1iZXJzaGlwKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZU1lbWJlcnNoaXAodGhpcywgZmFsc2UpO1xuICB9XG5cbiAgbWFya0FsbE1lc3NhZ2VzQXNSZWFkKCk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkubWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQodGhpcyk7XG4gIH1cblxuICBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5sYXN0QWN0aXZpdHlBdCA9IG1lc3NhZ2UuY3JlYXRlZEF0O1xuICB9XG5cbiAgbm90aWZ5TmV3TWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMubmV3TWVzc2FnZU5vdGlmaWVyKSB7XG4gICAgICB0aGlzLm5ld01lc3NhZ2VOb3RpZmllci5hcHBseShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuXG4gIGhhc1VzZXIodXNlcklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy51c2VycyAmJiB0aGlzLnVzZXJzLnNvbWUodXNlciA9PiB1c2VyLmlkICA9PT0gdXNlcklkKTtcbiAgfVxuXG4gIGZldGNoTW9yZU1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxNZXNzYWdlW10+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBmaXJzdFNlZW5NZXNzYWdlSWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCA/IHRoaXMubWVzc2FnZXNbMF0uaWQgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICAgICAgICAgICAuZmluZE1lc3NhZ2VzKHRoaXMsIHBhcmFtcylcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgbWFwKG1lc3NhZ2VzID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0LmFwcGx5KHRoaXMubWVzc2FnZXMsIG1lc3NhZ2VzKTtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VXaXRoSWQoaWQ6IHN0cmluZyk6IE1lc3NhZ2Uge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kKG1lc3NhZ2UgPT4gbWVzc2FnZS5pZCA9PT0gaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgdXBkYXRlKCk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIHNlbmRNZXNzYWdlKG5ld01lc3NhZ2U6IE5ld01lc3NhZ2UpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgLmNyZWF0ZU1lc3NhZ2UodGhpcywgbmV3TWVzc2FnZSlcbiAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICBtYXAobWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgKTtcbiAgfVxuXG4gIHJlbW92ZU1lc3NhZ2UobWVzc2FnZVRvRGVsZXRlOiBNZXNzYWdlKTogTWVzc2FnZSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm1lc3NhZ2VzID8gdGhpcy5tZXNzYWdlcy5maW5kSW5kZXgobWVzc2FnZSA9PiBtZXNzYWdlLmlkID09PSBtZXNzYWdlVG9EZWxldGUuaWQpIDogLTE7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VUb0RlbGV0ZTtcbiAgfVxuXG4gIGRlbGV0ZShtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnlcbiAgICAgICAgICAgICAgIC5kZWxldGVNZXNzYWdlKHRoaXMsIG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAucGlwZShtYXAoZGVsZXRlZE1lc3NhZ2UgPT4gdGhpcy5yZW1vdmVNZXNzYWdlKGRlbGV0ZWRNZXNzYWdlKSkpO1xuICB9XG5cbiAgcmVwbGFjZVVzZXJzV2l0aChyb29tOiBSb29tKTogUm9vbSB7XG4gICAgdGhpcy51c2Vycy5zcGxpY2UoMCwgdGhpcy51c2Vycy5sZW5ndGgpO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMudXNlcnMsIHJvb20udXNlcnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkVXNlcih1c2VyOiBVc2VyKSB7XG4gICAgaWYgKCF0aGlzLmhhc1VzZXIodXNlci5pZCkpIHtcbiAgICAgIHRoaXMudXNlcnMucHVzaCh1c2VyKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5LCBOZXdNZXNzYWdlIH0gZnJvbSBcIi4uL21lc3NhZ2UvbWVzc2FnZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uL3VzZXIvdXNlci50eXBlc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCIuLy4uL21lc3NhZ2UvbWVzc2FnZS50eXBlc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuL3Jvb20udHlwZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvb21SZXBvc2l0b3J5IHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgICAgICAgICAgIHByaXZhdGUgbWVzc2FnZVJlcG9zaXRvcnk6IE1lc3NhZ2VSZXBvc2l0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgZmluZChpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQoYCR7dGhpcy5yb29tVXJsfS8ke2lkfWApXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLmJ1aWxkKGpzb24uZGF0YSwgdGhpcywgdGhpcy5tZXNzYWdlUmVwb3NpdG9yeSkpKTtcbiAgfVxuXG4gIGZpbmRBbGwocXVlcnk6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIH0pOiBPYnNlcnZhYmxlPFJvb21bXT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMucm9vbVVybCwgeyBwYXJhbXM6IHF1ZXJ5IH0pXG4gICAgICAgICAgICAgICAgICAgIC5waXBlKG1hcCgoanNvbjogYW55KSA9PiBSb29tLm1hcChqc29uLmRhdGEsIHRoaXMsIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICBmaW5kT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seU9wZW5lZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kQ2xvc2VkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgb25seUNsb3NlZDogXCJ0cnVlXCIgfSk7XG4gIH1cblxuICBmaW5kUm9vbXNBZnRlcihpZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5maW5kQWxsKHsgZmlyc3RTZWVuUm9vbUlkOiBpZCB9KTtcbiAgfVxuXG4gIGZpbmRSb29tc0J5SWRzKHJvb21JZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEFsbCh7IFwicm9vbUlkc1tdXCI6IHJvb21JZHMgfSk7XG4gIH1cblxuICB1cGRhdGVNZW1iZXJzaGlwKHJvb206IFJvb20sIG9wZW46IGJvb2xlYW4pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcGAsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBvcGVuOiBvcGVuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICByb29tLm9wZW4gPSBkYXRhLmRhdGEuYXR0cmlidXRlcy5vcGVuO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgbWFya0FsbFJlY2VpdmVkTWVzc2FnZXNBc1JlYWQocm9vbTogUm9vbSk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgaWYgKHJvb20udW5yZWFkTWVzc2FnZUNvdW50ID4gMCkge1xuICAgICAgY29uc3QgbGFzdFJlYWRNZXNzYWdlSWQgPSByb29tLm1lc3NhZ2VzLmxlbmd0aCA+IDAgPyByb29tLm1lc3NhZ2VzW3Jvb20ubWVzc2FnZXMubGVuZ3RoIC0gMV0uaWQgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH0vbWVtYmVyc2hpcC91bnJlYWQtbWVzc2FnZXNgLCB7IGRhdGE6IHsgbGFzdFJlYWRNZXNzYWdlSWQ6IGxhc3RSZWFkTWVzc2FnZUlkIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbS51bnJlYWRNZXNzYWdlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEubWV0YS5jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZigwKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGUobmFtZTogc3RyaW5nLCB1c2VySWRzOiBzdHJpbmdbXSwgd2l0aG91dER1cGxpY2F0ZTogYm9vbGVhbik6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdChgJHt0aGlzLnJvb21Vcmx9P25vRHVwbGljYXRlPSR7d2l0aG91dER1cGxpY2F0ZX1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9LFxuICAgICAgICByZWxhdGlvbnNoaXBzOiB7XG4gICAgICAgICAgdXNlcnM6IHtcbiAgICAgICAgICAgIGRhdGE6IHVzZXJJZHMubWFwKHVzZXJJZCA9PiAoeyB0eXBlOiBcInVzZXJcIiwgaWQ6IHVzZXJJZCB9KSApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIG5vRHVwbGljYXRlOiBgJHt3aXRob3V0RHVwbGljYXRlfWBcbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4gUm9vbS5idWlsZChyZXNwb25zZS5kYXRhLCB0aGlzLCB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5KSkpO1xuICB9XG5cbiAgdXBkYXRlKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gdGhpcy5odHRwLnB1dChgJHt0aGlzLnJvb21Vcmx9LyR7cm9vbS5pZH1gLCB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHR5cGU6IFwicm9vbVwiLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgbmFtZTogcm9vbS5uYW1lXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5waXBlKG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgcm9vbS5uYW1lID0gcmVzcG9uc2UuZGF0YS5hdHRyaWJ1dGVzLm5hbWU7XG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9KSk7XG4gIH1cblxuICBhZGRVc2VyKHJvb206IFJvb20sIHVzZXJJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMucm9vbVVybH0vJHtyb29tLmlkfS9tZW1iZXJzaGlwc2AsIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZTogXCJtZW1iZXJzaGlwXCIsXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IHtcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwidXNlclwiLFxuICAgICAgICAgICAgICBpZDogdXNlcklkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkucGlwZShtYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IG5ld1VzZXIgPSBVc2VyLmJ1aWxkKHJlc3BvbnNlLmRhdGEucmVsYXRpb25zaGlwcy51c2VyLmRhdGEpO1xuICAgICAgcm9vbS5hZGRVc2VyKG5ld1VzZXIpO1xuICAgICAgcmV0dXJuIHJvb207XG4gICAgfSkpO1xuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShyb29tOiBSb29tLCBtZXNzYWdlOiBNZXNzYWdlKTogT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZGVsZXRlKHJvb20sIG1lc3NhZ2UpO1xuICB9XG5cbiAgZmluZE1lc3NhZ2VzKHJvb206IFJvb20sIGF0dHJpYnV0ZXM6IHtbcGFyYW06IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSk6IE9ic2VydmFibGU8TWVzc2FnZVtdPiB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZVJlcG9zaXRvcnkuZmluZEFsbChyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIGNyZWF0ZU1lc3NhZ2Uocm9vbTogUm9vbSwgYXR0cmlidXRlczogTmV3TWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VSZXBvc2l0b3J5LmNyZWF0ZShyb29tLCBhdHRyaWJ1dGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJvb21VcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWd1cmF0aW9uLmFwaVVybH0vdXNlci9yb29tc2A7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGZsYXRNYXAsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCIuLi9yb29tL3Jvb20udHlwZXNcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vLi4vbWVzc2FnZS9tZXNzYWdlLnR5cGVzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmV4cG9ydCBjbGFzcyBNZSB7XG5cbiAgc3RhdGljIGJ1aWxkKGpzb246IGFueSwgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KTogTWUge1xuICAgIGNvbnN0IHVucmVhZE1lc3NhZ2VDb3VudCA9IGpzb24uZGF0YSAmJiBqc29uLmRhdGEubWV0YSA/IGpzb24uZGF0YS5tZXRhLnVucmVhZE1lc3NhZ2VDb3VudCA6IDA7XG4gICAgY29uc3Qgcm9vbUNvdW50ID0ganNvbi5kYXRhICYmIGpzb24uZGF0YS5tZXRhID8ganNvbi5kYXRhLm1ldGEucm9vbUNvdW50IDogMDtcbiAgICByZXR1cm4gbmV3IE1lKGpzb24uZGF0YS5pZCwgW10sIFtdLCB1bnJlYWRNZXNzYWdlQ291bnQsIHJvb21Db3VudCwgcm9vbVJlcG9zaXRvcnkpO1xuICB9XG5cbiAgcHVibGljIGRldmljZVNlc3Npb25JZDogc3RyaW5nO1xuICBwcml2YXRlIGludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50OiBCZWhhdmlvclN1YmplY3Q8bnVtYmVyPjtcbiAgcHJpdmF0ZSBpbnRlcm5hbFJvb21Db3VudDogQmVoYXZpb3JTdWJqZWN0PG51bWJlcj47XG4gIHByaXZhdGUgZmlyc3RTZWVuUm9vbTogUm9vbTtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBvcGVuZWRSb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICByZWFkb25seSByb29tczogUm9vbVtdLFxuICAgICAgICAgICAgICB1bnJlYWRNZXNzYWdlQ291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcm9vbUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgcm9vbVJlcG9zaXRvcnk6IFJvb21SZXBvc2l0b3J5KSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudCA9IG5ldyBCZWhhdmlvclN1YmplY3QodW5yZWFkTWVzc2FnZUNvdW50IHx8IDApO1xuICAgIHRoaXMuaW50ZXJuYWxSb29tQ291bnQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHJvb21Db3VudCB8fCAwKTtcbiAgfVxuXG5cbiAgZ2V0IHVucmVhZE1lc3NhZ2VDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsVW5yZWFkTWVzc2FnZUNvdW50LnZhbHVlO1xuICB9XG5cbiAgc2V0IHVucmVhZE1lc3NhZ2VDb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudC5uZXh0KGNvdW50KTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlVW5yZWFkTWVzc2FnZUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFVucmVhZE1lc3NhZ2VDb3VudDtcbiAgfVxuXG4gIGdldCByb29tQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudC52YWx1ZTtcbiAgfVxuXG4gIGdldCBvYnNlcnZhYmxlUm9vbUNvdW50KCk6IEJlaGF2aW9yU3ViamVjdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFJvb21Db3VudDtcbiAgfVxuXG4gIGZldGNoT3BlbmVkUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kT3BlbmVkUm9vbXMoKS5waXBlKG1hcChyb29tcyA9PiB7XG4gICAgICB0aGlzLmFkZFJvb21zKHJvb21zKTtcbiAgICAgIHJldHVybiByb29tcztcbiAgICB9KSk7XG4gIH1cblxuICBmZXRjaENsb3NlZFJvb21zKCk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZENsb3NlZFJvb21zKCkucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hNb3JlUm9vbXMoKTogT2JzZXJ2YWJsZTxSb29tW10+IHtcbiAgICBpZiAodGhpcy5maXJzdFNlZW5Sb29tKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb29tUmVwb3NpdG9yeS5maW5kUm9vbXNBZnRlcih0aGlzLmZpcnN0U2VlblJvb20uaWQpLnBpcGUobWFwKHJvb21zID0+IHtcbiAgICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKFtdKTtcbiAgICB9XG4gIH1cblxuICBmZXRjaFJvb21zQnlJZChyb29tSWRzOiBzdHJpbmdbXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuZmluZFJvb21zQnlJZHMocm9vbUlkcykucGlwZShtYXAocm9vbXMgPT4ge1xuICAgICAgdGhpcy5hZGRSb29tcyhyb29tcyk7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSkpO1xuICB9XG5cbiAgZmV0Y2hSb29tQnlJZChyb29tSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmZpbmQocm9vbUlkKS5waXBlKG1hcChyb29tID0+IHtcbiAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgIHJldHVybiByb29tO1xuICAgIH0pKTtcbiAgfVxuXG4gIGZpbmRPckZldGNoUm9vbUJ5SWQocm9vbUlkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQocm9vbUlkKTtcbiAgICBpZiAocm9vbUlkKSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZldGNoUm9vbUJ5SWQocm9vbUlkKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVOZXdNZXNzYWdlKG5ld01lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICB0aGlzLmZpbmRPckZldGNoUm9vbUJ5SWQobmV3TWVzc2FnZS5yb29tSWQpXG4gICAgICAgIC5zdWJzY3JpYmUocm9vbSA9PiB7XG4gICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIHJvb20uYWRkTWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIHJvb20ubm90aWZ5TmV3TWVzc2FnZShuZXdNZXNzYWdlKTtcbiAgICAgICAgICAgIGlmICghbmV3TWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKSkge1xuICAgICAgICAgICAgICB0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCA9IHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgaWYgKCFyb29tLm9wZW4pIHtcbiAgICAgICAgICAgICAgICByb29tLnVucmVhZE1lc3NhZ2VDb3VudCA9IHJvb20udW5yZWFkTWVzc2FnZUNvdW50ICsgMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBhZGRSb29tKG5ld1Jvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbShuZXdSb29tKSkge1xuICAgICAgaWYgKCF0aGlzLmZpcnN0U2VlblJvb20gfHwgbW9tZW50KHRoaXMuZmlyc3RTZWVuUm9vbS5sYXN0QWN0aXZpdHlBdCkuaXNBZnRlcihuZXdSb29tLmxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICB0aGlzLmZpcnN0U2VlblJvb20gPSBuZXdSb29tO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByb29tSW5kZXggPSB0aGlzLnJvb21zID8gdGhpcy5yb29tcy5maW5kSW5kZXgocm9vbSA9PiByb29tLmlkID09PSBuZXdSb29tLmlkKSA6IC0xO1xuICAgICAgaWYgKHJvb21JbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMucm9vbXNbcm9vbUluZGV4XSA9IG5ld1Jvb207XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb21zLnB1c2gobmV3Um9vbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmluZFJvb21CeUlkKHJvb21JZDogc3RyaW5nKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMucm9vbXMgPyB0aGlzLnJvb21zLmZpbmQocm9vbSA9PiByb29tSWQgPT09IHJvb20uaWQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgb3BlblJvb20ocm9vbTogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGlmICghdGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5vcGVuTWVtYmVyc2hpcCgpXG4gICAgICAgICAgICAgICAgIC5waXBlKGZsYXRNYXAoKG9wZW5lZFJvb206IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFRvT3BlbmVkUm9vbShvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXJrQWxsUmVjZWl2ZWRNZXNzYWdlc0FzUmVhZChvcGVuZWRSb29tKTtcbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICBpZiAodGhpcy5oYXNSb29tT3BlbmVkKHJvb20pKSB7XG4gICAgICByZXR1cm4gcm9vbS5jbG9zZU1lbWJlcnNoaXAoKVxuICAgICAgICAgICAgICAgICAucGlwZShtYXAoY2xvc2VkUm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9zZWRSb29tO1xuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yocm9vbSk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VSb29tcyhyb29tc1RvQ2xvc2U6IFJvb21bXSk6IE9ic2VydmFibGU8Um9vbVtdPiB7XG4gICAgcmV0dXJuIG9mKHJvb21zVG9DbG9zZSkucGlwZShcbiAgICAgIG1hcChyb29tcyA9PiB7XG4gICAgICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB0aGlzLmNsb3NlUm9vbShyb29tKSk7XG4gICAgICAgIHJldHVybiByb29tcztcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIG9wZW5Sb29tQW5kQ2xvc2VPdGhlcnMocm9vbVRvT3BlbjogUm9vbSk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIGNvbnN0IHJvb21zVG9CZUNsb3NlZCA9IHRoaXMub3BlbmVkUm9vbXMuZmlsdGVyKHJvb20gPT4gcm9vbS5pZCAhPT0gcm9vbVRvT3Blbi5pZCk7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VSb29tcyhyb29tc1RvQmVDbG9zZWQpLnBpcGUoZmxhdE1hcChyb29tcyA9PiB0aGlzLm9wZW5Sb29tKHJvb21Ub09wZW4pKSk7XG4gIH1cblxuICBoYXNPcGVuZWRSb29tcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZWRSb29tcy5sZW5ndGggPiAwO1xuICB9XG5cbiAgY3JlYXRlUm9vbShuYW1lOiBzdHJpbmcsIHVzZXJJZHM6IHN0cmluZ1tdLCB3aXRob3V0RHVwbGljYXRlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxSb29tPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vbVJlcG9zaXRvcnkuY3JlYXRlKG5hbWUsIHVzZXJJZHMsIHdpdGhvdXREdXBsaWNhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShtYXAocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUm9vbShyb29tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBidWlsZFJvb20odXNlcklkczogc3RyaW5nW10pOiBSb29tIHtcbiAgICBjb25zdCB1c2VycyA9IHVzZXJJZHMubWFwKGlkID0+IG5ldyBVc2VyKGlkLCBcIlwiKSk7XG4gICAgY29uc3Qgbm9TZW5kZXJzID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlID0gW107XG4gICAgY29uc3Qgbm9NZXNzYWdlVW5yZWFkID0gMDtcbiAgICBjb25zdCBub0lkID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGluaXRpYXRvciA9IHRoaXMudG9Vc2VyKCk7XG4gICAgcmV0dXJuIG5ldyBSb29tKG5vSWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB0cnVlLFxuICAgICAgbm9NZXNzYWdlVW5yZWFkLFxuICAgICAgdXNlcnMsXG4gICAgICBub1NlbmRlcnMsXG4gICAgICBub01lc3NhZ2UsXG4gICAgICBpbml0aWF0b3IsXG4gICAgICB0aGlzLnJvb21SZXBvc2l0b3J5XG4gICAgICk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShyb29tOiBSb29tLCBjb250ZW50OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gcm9vbS5zZW5kTWVzc2FnZSh7XG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgY29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgICAgZGV2aWNlU2Vzc2lvbklkOiB0aGlzLmRldmljZVNlc3Npb25JZFxuICAgIH0pO1xuICB9XG5cbiAgaXNTZW50QnlNZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2UgJiYgbWVzc2FnZS5oYXNTZW5kZXJJZCh0aGlzLmlkKTtcbiAgfVxuXG4gIGRlbGV0ZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSk6IE9ic2VydmFibGU8TWVzc2FnZT4ge1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBjb25zdCByb29tID0gdGhpcy5maW5kUm9vbUJ5SWQobWVzc2FnZS5yb29tSWQpO1xuICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgcmV0dXJuIHJvb20uZGVsZXRlKG1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFVzZXJUbyhyb29tOiBSb29tLCB1c2VySWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Um9vbT4ge1xuICAgIHJldHVybiB0aGlzLnJvb21SZXBvc2l0b3J5LmFkZFVzZXIocm9vbSwgdXNlcklkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm9vbXMocm9vbXM6IFJvb21bXSkge1xuICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICB0aGlzLmFkZFJvb20ocm9vbSk7XG4gICAgICBpZiAocm9vbS5vcGVuICYmICF0aGlzLmhhc1Jvb21PcGVuZWQocm9vbSkpIHtcbiAgICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbShyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNSb29tT3BlbmVkKHJvb21Ub0ZpbmQ6IFJvb20pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm9vbU9wZW5lZChyb29tVG9GaW5kKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbShyb29tOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvb21CeUlkKHJvb20uaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kUm9vbU9wZW5lZChyb29tVG9GaW5kOiBSb29tKTogUm9vbSB7XG4gICAgcmV0dXJuIHRoaXMub3BlbmVkUm9vbXMgPyB0aGlzLm9wZW5lZFJvb21zLmZpbmQocm9vbSA9PiByb29tVG9GaW5kLmlkID09PSByb29tLmlkKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9PcGVuZWRSb29tKHJvb206IFJvb20pIHtcbiAgICBpZiAoIXRoaXMuaGFzUm9vbU9wZW5lZChyb29tKSkge1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5wdXNoKHJvb20pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRnJvbU9wZW5lZFJvb20oY2xvc2VkUm9vbTogUm9vbSkge1xuICAgIGlmICh0aGlzLmhhc1Jvb21PcGVuZWQoY2xvc2VkUm9vbSkpIHtcbiAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMub3BlbmVkUm9vbXMgPyB0aGlzLm9wZW5lZFJvb21zLmZpbmRJbmRleChyb29tID0+IHJvb20uaWQgPT09IGNsb3NlZFJvb20uaWQpIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5vcGVuZWRSb29tcy5zcGxpY2Uocm9vbUluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1hcmtBbGxSZWNlaXZlZE1lc3NhZ2VzQXNSZWFkKHJvb206IFJvb20pOiBPYnNlcnZhYmxlPFJvb20+IHtcbiAgICByZXR1cm4gcm9vbS5tYXJrQWxsTWVzc2FnZXNBc1JlYWQoKVxuICAgICAgICAgICAgICAgLnBpcGUobWFwKHJlYWRNZXNzYWdlQ291bnQgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy51bnJlYWRNZXNzYWdlQ291bnQgPSBNYXRoLm1heCh0aGlzLnVucmVhZE1lc3NhZ2VDb3VudCAtIHJlYWRNZXNzYWdlQ291bnQsIDApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb207XG4gICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b1VzZXIoKTogVXNlciB7XG4gICAgcmV0dXJuIG5ldyBVc2VyKHRoaXMuaWQsIFwiXCIpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHsgZW1wdHksIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuLy4uL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVJlcG9zaXRvcnkge1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSByb29tUmVwb3NpdG9yeTogUm9vbVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbikge31cblxuICBmaW5kTWUoKTogT2JzZXJ2YWJsZTxNZT4ge1xuICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KHRoaXMudXNlclVybCkucGlwZShtYXAobWUgPT4gTWUuYnVpbGQobWUsIHRoaXMucm9vbVJlcG9zaXRvcnkpKSk7XG4gIH1cblxuICB1cGRhdGVBbGl2ZW5lc3MobWU6IE1lKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodGhpcy5hbGl2ZVVybCwgeyBkYXRhOiB7IHR5cGU6IFwiYWxpdmVcIiB9fSlcbiAgICAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcigoKSA9PiBlbXB0eSgpKSwgbWFwKCgpID0+IG51bGwpKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHVzZXJVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWd1cmF0aW9uLmFwaVVybH0vdXNlcmA7XG4gIH1cblxuICBwcml2YXRlIGdldCBhbGl2ZVVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLnVzZXJVcmx9L2FsaXZlYDtcbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vY29uZmlndXJhdGlvbi9iYWJpbGkuY29uZmlndXJhdGlvblwiO1xuaW1wb3J0ICogYXMgaW8gZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcFNvY2tldCB7XG5cbiAgcHJpdmF0ZSBzb2NrZXQ6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbmZpZ3VyYXRpb246IEJhYmlsaUNvbmZpZ3VyYXRpb24pIHt9XG5cbiAgY29ubmVjdCh0b2tlbjogc3RyaW5nKTogU29ja2V0SU9DbGllbnQuU29ja2V0IHtcbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QodGhpcy5jb25maWd1cmF0aW9uLnNvY2tldFVybCwge1xuICAgICAgZm9yY2VOZXc6IHRydWUsXG4gICAgICBxdWVyeTogYHRva2VuPSR7dG9rZW59YFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnNvY2tldDtcbiAgfVxuXG4gIHNvY2tldEV4aXN0cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuc29ja2V0RXhpc3RzKCkpIHtcbiAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLnNvY2tldCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQmFiaWxpQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aW1lciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBtYXAsIHB1Ymxpc2hSZXBsYXksIHJlZkNvdW50LCBzaGFyZSwgdGFrZVdoaWxlIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBUb2tlbkNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi8uLi9jb25maWd1cmF0aW9uL3Rva2VuLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi8uLi9tZXNzYWdlL21lc3NhZ2UudHlwZXNcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuLy4uL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5pbXBvcnQgeyBNZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBNZSB9IGZyb20gXCIuL21lLnR5cGVzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZVNlcnZpY2Uge1xuXG4gIHByaXZhdGUgY2FjaGVkTWU6IE9ic2VydmFibGU8TWU+O1xuICBwcml2YXRlIGFsaXZlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVSZXBvc2l0b3J5OiBNZVJlcG9zaXRvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgc29ja2V0Q2xpZW50OiBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgcHJpdmF0ZSB0b2tlbkNvbmZpZ3VyYXRpb246IFRva2VuQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHNldHVwKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudG9rZW5Db25maWd1cmF0aW9uLmlzQXBpVG9rZW5TZXQoKSkge1xuICAgICAgdGhpcy50b2tlbkNvbmZpZ3VyYXRpb24uYXBpVG9rZW4gPSB0b2tlbjtcbiAgICB9XG4gIH1cblxuICBtZSgpOiBPYnNlcnZhYmxlPE1lPiB7XG4gICAgaWYgKCF0aGlzLmhhc0NhY2hlZE1lKCkpIHtcbiAgICAgIHRoaXMuY2FjaGVkTWUgPSB0aGlzLm1lUmVwb3NpdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZE1lKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwKG1lID0+IHRoaXMuc2NoZWR1bGVBbGl2ZW5lc3MobWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoUmVwbGF5KDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZkNvdW50KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZS5waXBlKG1hcChtZSA9PiB0aGlzLmNvbm5lY3RTb2NrZXQobWUpKSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnRva2VuQ29uZmlndXJhdGlvbi5jbGVhcigpO1xuICAgIHRoaXMuY2FjaGVkTWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZUFsaXZlbmVzcyhtZTogTWUpOiBNZSB7XG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG4gICAgdGltZXIoMCwgdGhpcy5jb25maWd1cmF0aW9uLmFsaXZlSW50ZXJ2YWxJbk1zKS5waXBlKFxuICAgICAgdGFrZVdoaWxlKCgpID0+IHRoaXMuYWxpdmUpXG4gICAgKVxuICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5tZVJlcG9zaXRvcnkudXBkYXRlQWxpdmVuZXNzKG1lKSk7XG4gICAgcmV0dXJuIG1lO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNDYWNoZWRNZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZWRNZSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25uZWN0U29ja2V0KG1lOiBNZSk6IE1lIHtcbiAgICBpZiAoIXRoaXMuc29ja2V0Q2xpZW50LnNvY2tldEV4aXN0cygpKSB7XG4gICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLnNvY2tldENsaWVudC5jb25uZWN0KHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuKTtcbiAgICAgIHNvY2tldC5vbihcIm5ldyBtZXNzYWdlXCIsIGRhdGEgPT4gdGhpcy5yZWNlaXZlTmV3TWVzc2FnZShkYXRhKSk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0ZWRcIiwgZGF0YSA9PiBtZS5kZXZpY2VTZXNzaW9uSWQgPSBkYXRhLmRldmljZVNlc3Npb25JZCk7XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVjZWl2ZU5ld01lc3NhZ2UoanNvbjogYW55KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IE1lc3NhZ2UuYnVpbGQoanNvbi5kYXRhKTtcbiAgICB0aGlzLm1lKCkuc3Vic2NyaWJlKG1lID0+IG1lLmhhbmRsZU5ld01lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIi4uL3Jvb20vcm9vbS50eXBlc1wiO1xuY29uc3QgbW9tZW50ID0gbW9tZW50TG9hZGVkO1xuXG5AUGlwZSh7XG4gIG5hbWU6IFwic29ydFJvb21zXCJcbn0pXG5leHBvcnQgY2xhc3MgU29ydFJvb21QaXBlICBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0ocm9vbXM6IFJvb21bXSwgZmllbGQ6IHN0cmluZyk6IGFueVtdIHtcbiAgICBpZiAocm9vbXMgIT09IHVuZGVmaW5lZCAmJiByb29tcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJvb21zLnNvcnQoKHJvb206IFJvb20sIG90aGVyUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBjb25zdCBsYXN0QWN0aXZpdHlBdCAgICAgID0gcm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgY29uc3Qgb3RoZXJMYXN0QWN0aXZpdHlBdCA9IG90aGVyUm9vbS5sYXN0QWN0aXZpdHlBdDtcbiAgICAgICAgaWYgKG1vbWVudChsYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUob3RoZXJMYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmIChtb21lbnQob3RoZXJMYXN0QWN0aXZpdHlBdCkuaXNCZWZvcmUobGFzdEFjdGl2aXR5QXQpKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSHR0cENsaWVudE1vZHVsZSwgSFRUUF9JTlRFUkNFUFRPUlMgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEJhYmlsaUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi9jb25maWd1cmF0aW9uL2JhYmlsaS5jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBIdHRwQXV0aGVudGljYXRpb25JbnRlcmNlcHRvciB9IGZyb20gXCIuL2F1dGhlbnRpY2F0aW9uL2h0dHAtYXV0aGVudGljYXRpb24taW50ZXJjZXB0b3JcIjtcbmltcG9ydCB7IFRva2VuQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vdG9rZW4tY29uZmlndXJhdGlvbi50eXBlc1wiO1xuaW1wb3J0IHsgTWVSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWUvbWUucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgTWVTZXJ2aWNlIH0gZnJvbSBcIi4vbWUvbWUuc2VydmljZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi9tZXNzYWdlL21lc3NhZ2UucmVwb3NpdG9yeVwiO1xuaW1wb3J0IHsgU29ydFJvb21QaXBlIH0gZnJvbSBcIi4vcGlwZS9zb3J0LXJvb21cIjtcbmltcG9ydCB7IFJvb21SZXBvc2l0b3J5IH0gZnJvbSBcIi4vcm9vbS9yb29tLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IEJvb3RzdHJhcFNvY2tldCB9IGZyb20gXCIuL3NvY2tldC9ib290c3RyYXAuc29ja2V0XCI7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBIdHRwQ2xpZW50TW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFNvcnRSb29tUGlwZVxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgU29ydFJvb21QaXBlXG4gIF1cbiB9KVxuZXhwb3J0IGNsYXNzIEJhYmlsaU1vZHVsZSB7XG4gIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQmFiaWxpTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEJhYmlsaUNvbmZpZ3VyYXRpb24sXG4gICAgICAgIFNvcnRSb29tUGlwZSxcbiAgICAgICAgVG9rZW5Db25maWd1cmF0aW9uLFxuICAgICAgICBCb290c3RyYXBTb2NrZXQsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgTWVzc2FnZVJlcG9zaXRvcnksXG4gICAgICAgIFJvb21SZXBvc2l0b3J5LFxuICAgICAgICBNZVJlcG9zaXRvcnksXG4gICAgICAgIE1lU2VydmljZVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJJbmplY3RhYmxlIiwiY2F0Y2hFcnJvciIsIkh0dHBFcnJvclJlc3BvbnNlIiwidGhyb3dFcnJvciIsImh0dHAiLCJtYXAiLCJIdHRwQ2xpZW50IiwibW9tZW50IiwiQmVoYXZpb3JTdWJqZWN0Iiwib2YiLCJmbGF0TWFwIiwiZW1wdHkiLCJpby5jb25uZWN0IiwicHVibGlzaFJlcGxheSIsInJlZkNvdW50Iiwic2hhcmUiLCJ0aW1lciIsInRha2VXaGlsZSIsIlBpcGUiLCJIVFRQX0lOVEVSQ0VQVE9SUyIsIk5nTW9kdWxlIiwiSHR0cENsaWVudE1vZHVsZSJdLCJt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