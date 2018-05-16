"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("@angular/common/http");
const core_1 = require("@angular/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const url_configuration_types_1 = require("../configuration/url-configuration.types");
const message_repository_1 = require("../message/message.repository");
const user_types_1 = require("../user/user.types");
const room_types_1 = require("./room.types");
let RoomRepository = class RoomRepository {
    constructor(http, messageRepository, configuration) {
        this.http = http;
        this.messageRepository = messageRepository;
        this.roomUrl = `${configuration.apiUrl}/user/rooms`;
    }
    find(id) {
        return this.http.get(`${this.roomUrl}/${id}`)
            .pipe(operators_1.map((json) => room_types_1.Room.build(json.data, this, this.messageRepository)));
    }
    findAll(query) {
        return this.http.get(this.roomUrl, { params: query })
            .pipe(operators_1.map((json) => room_types_1.Room.map(json.data, this, this.messageRepository)));
    }
    findOpenedRooms() {
        return this.findAll({ onlyOpened: "true" });
    }
    findClosedRooms() {
        return this.findAll({ onlyClosed: "true" });
    }
    findRoomsAfter(id) {
        return this.findAll({ firstSeenRoomId: id });
    }
    findRoomsByIds(roomIds) {
        return this.findAll({ "roomIds[]": roomIds });
    }
    updateMembership(room, open) {
        return this.http.put(`${this.roomUrl}/${room.id}/membership`, {
            data: {
                type: "membership",
                attributes: {
                    open: open
                }
            }
        }).pipe(operators_1.map((data) => {
            room.open = data.data.attributes.open;
            return room;
        }));
    }
    markAllReceivedMessagesAsRead(room) {
        if (room.unreadMessageCount > 0) {
            const lastReadMessageId = room.messages.length > 0 ? room.messages[room.messages.length - 1].id : undefined;
            return this.http.put(`${this.roomUrl}/${room.id}/membership/unread-messages`, { data: { lastReadMessageId: lastReadMessageId } })
                .pipe(operators_1.map((data) => {
                room.unreadMessageCount = 0;
                return data.meta.count;
            }));
        }
        else {
            return rxjs_1.of(0);
        }
    }
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
        }).pipe(operators_1.map((response) => room_types_1.Room.build(response.data, this, this.messageRepository)));
    }
    update(room) {
        return this.http.put(`${this.roomUrl}/${room.id}`, {
            data: {
                type: "room",
                attributes: {
                    name: room.name
                }
            }
        }).pipe(operators_1.map((response) => {
            room.name = response.data.attributes.name;
            return room;
        }));
    }
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
        }).pipe(operators_1.map((response) => {
            const newUser = user_types_1.User.build(response.data.relationships.user.data);
            room.addUser(newUser);
            return room;
        }));
    }
    deleteMessage(room, message) {
        return this.messageRepository.delete(room, message);
    }
    findMessages(room, attributes) {
        return this.messageRepository.findAll(room, attributes);
    }
    createMessage(room, attributes) {
        return this.messageRepository.create(room, attributes);
    }
};
RoomRepository = __decorate([
    core_1.Injectable(),
    __param(2, core_1.Inject(url_configuration_types_1.URL_CONFIGURATION)),
    __metadata("design:paramtypes", [http_1.HttpClient,
        message_repository_1.MessageRepository, Object])
], RoomRepository);
exports.RoomRepository = RoomRepository;
