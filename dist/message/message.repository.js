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
const operators_1 = require("rxjs/operators");
const url_configuration_types_1 = require("../configuration/url-configuration.types");
const message_types_1 = require("./message.types");
class NewMessage {
}
exports.NewMessage = NewMessage;
let MessageRepository = class MessageRepository {
    constructor(http, configuration) {
        this.http = http;
        this.roomUrl = `${configuration.apiUrl}/user/rooms`;
    }
    create(room, attributes) {
        return this.http.post(this.messageUrl(room.id), {
            data: {
                type: "message",
                attributes: attributes
            }
        }).pipe(operators_1.map((response) => message_types_1.Message.build(response.data)));
    }
    findAll(room, attributes) {
        return this.http.get(this.messageUrl(room.id), { params: attributes })
            .pipe(operators_1.map((response) => message_types_1.Message.map(response.data)));
    }
    delete(room, message) {
        return this.http.delete(`${this.messageUrl(room.id)}/${message.id}`)
            .pipe(operators_1.map(response => message));
    }
    messageUrl(roomId) {
        return `${this.roomUrl}/${roomId}/messages`;
    }
};
MessageRepository = __decorate([
    core_1.Injectable(),
    __param(1, core_1.Inject(url_configuration_types_1.URL_CONFIGURATION)),
    __metadata("design:paramtypes", [http_1.HttpClient, Object])
], MessageRepository);
exports.MessageRepository = MessageRepository;