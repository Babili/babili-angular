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
const room_repository_1 = require("./../room/room.repository");
const me_types_1 = require("./me.types");
let MeRepository = class MeRepository {
    constructor(http, roomRepository, configuration) {
        this.http = http;
        this.roomRepository = roomRepository;
        this.userUrl = `${configuration.apiUrl}/user`;
        this.aliveUrl = `${this.userUrl}/alive`;
    }
    findMe() {
        return this.http.get(this.userUrl).pipe(operators_1.map(me => me_types_1.Me.build(me, this.roomRepository)));
    }
    updateAliveness(me) {
        return this.http.put(this.aliveUrl, { data: { type: "alive" } })
            .pipe(operators_1.catchError(() => rxjs_1.empty()), operators_1.map(() => null));
    }
};
MeRepository = __decorate([
    core_1.Injectable(),
    __param(2, core_1.Inject(url_configuration_types_1.URL_CONFIGURATION)),
    __metadata("design:paramtypes", [http_1.HttpClient,
        room_repository_1.RoomRepository, Object])
], MeRepository);
exports.MeRepository = MeRepository;
