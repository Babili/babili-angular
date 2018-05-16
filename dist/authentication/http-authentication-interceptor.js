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
const token_configuration_types_1 = require("./../configuration/token-configuration.types");
const url_configuration_types_1 = require("./../configuration/url-configuration.types");
const not_authorized_error_1 = require("./not-authorized-error");
let HttpAuthenticationInterceptor = class HttpAuthenticationInterceptor {
    constructor(urls, tokenConfiguration) {
        this.urls = urls;
        this.tokenConfiguration = tokenConfiguration;
    }
    intercept(request, next) {
        if (this.shouldAddHeaderTo(request)) {
            return next.handle(this.addHeaderTo(request, this.tokenConfiguration.apiToken))
                .pipe(operators_1.catchError(error => {
                if (error instanceof http_1.HttpErrorResponse && error.status === 401) {
                    return rxjs_1.throwError(new not_authorized_error_1.NotAuthorizedError(error));
                }
                else {
                    return rxjs_1.throwError(error);
                }
            }));
        }
        else {
            return next.handle(request);
        }
    }
    addHeaderTo(request, token) {
        return request.clone({
            headers: request.headers.set("Authorization", `Bearer ${token}`)
        });
    }
    shouldAddHeaderTo(request) {
        return request.url.startsWith(this.urls.apiUrl);
    }
};
HttpAuthenticationInterceptor = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject(url_configuration_types_1.URL_CONFIGURATION)),
    __metadata("design:paramtypes", [Object, token_configuration_types_1.TokenConfiguration])
], HttpAuthenticationInterceptor);
exports.HttpAuthenticationInterceptor = HttpAuthenticationInterceptor;
