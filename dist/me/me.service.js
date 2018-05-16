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
const core_1 = require("@angular/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const token_configuration_types_1 = require("./../configuration/token-configuration.types");
const url_configuration_types_1 = require("./../configuration/url-configuration.types");
const message_types_1 = require("./../message/message.types");
const bootstrap_socket_1 = require("./../socket/bootstrap.socket");
const me_repository_1 = require("./me.repository");
let MeService = class MeService {
    constructor(meRepository, socketClient, configuration, tokenConfiguration) {
        this.meRepository = meRepository;
        this.socketClient = socketClient;
        this.configuration = configuration;
        this.tokenConfiguration = tokenConfiguration;
        this.alive = false;
    }
    setup(token) {
        if (!this.tokenConfiguration.isApiTokenSet()) {
            this.tokenConfiguration.apiToken = token;
        }
    }
    me() {
        if (!this.hasCachedMe()) {
            this.cachedMe = this.meRepository
                .findMe()
                .pipe(operators_1.map(me => this.scheduleAliveness(me)), operators_1.publishReplay(1), operators_1.refCount(), operators_1.share());
        }
        return this.cachedMe.pipe(operators_1.map(me => this.connectSocket(me)));
    }
    clear() {
        this.tokenConfiguration.clear();
        this.cachedMe = undefined;
        this.alive = false;
    }
    scheduleAliveness(me) {
        this.alive = true;
        rxjs_1.timer(0, this.configuration.aliveIntervalInMs).pipe(operators_1.takeWhile(() => this.alive))
            .subscribe(() => this.meRepository.updateAliveness(me));
        return me;
    }
    hasCachedMe() {
        return this.cachedMe !== undefined;
    }
    connectSocket(me) {
        if (!this.socketClient.socketExists()) {
            const socket = this.socketClient.connect(this.tokenConfiguration.apiToken);
            socket.on("new message", data => this.receiveNewMessage(data));
            socket.on("connected", data => me.deviceSessionId = data.deviceSessionId);
        }
        return me;
    }
    receiveNewMessage(json) {
        const message = message_types_1.Message.build(json.data);
        this.me().subscribe(me => me.handleNewMessage(message));
    }
};
MeService = __decorate([
    core_1.Injectable(),
    __param(2, core_1.Inject(url_configuration_types_1.URL_CONFIGURATION)),
    __metadata("design:paramtypes", [me_repository_1.MeRepository,
        bootstrap_socket_1.BootstrapSocket, Object, token_configuration_types_1.TokenConfiguration])
], MeService);
exports.MeService = MeService;
