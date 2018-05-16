"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("@angular/common/http");
const core_1 = require("@angular/core");
const http_authentication_interceptor_1 = require("./authentication/http-authentication-interceptor");
const token_configuration_types_1 = require("./configuration/token-configuration.types");
const me_repository_1 = require("./me/me.repository");
const me_service_1 = require("./me/me.service");
const message_repository_1 = require("./message/message.repository");
const sort_room_1 = require("./pipe/sort-room");
const room_repository_1 = require("./room/room.repository");
const bootstrap_socket_1 = require("./socket/bootstrap.socket");
let BabiliModule = BabiliModule_1 = class BabiliModule {
    static forRoot() {
        return {
            ngModule: BabiliModule_1,
            providers: [
                sort_room_1.SortRoomPipe,
                token_configuration_types_1.TokenConfiguration,
                bootstrap_socket_1.BootstrapSocket,
                {
                    provide: http_1.HTTP_INTERCEPTORS,
                    useClass: http_authentication_interceptor_1.HttpAuthenticationInterceptor,
                    multi: true
                },
                message_repository_1.MessageRepository,
                room_repository_1.RoomRepository,
                me_repository_1.MeRepository,
                me_service_1.MeService
            ]
        };
    }
};
BabiliModule = BabiliModule_1 = __decorate([
    core_1.NgModule({
        imports: [
            http_1.HttpClientModule
        ]
    })
], BabiliModule);
exports.BabiliModule = BabiliModule;
var BabiliModule_1;
