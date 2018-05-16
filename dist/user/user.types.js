"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
    static build(json) {
        if (json) {
            return new User(json.id, json.attributes ? json.attributes.status : undefined);
        }
        else {
            return undefined;
        }
    }
    static map(json) {
        if (json) {
            return json.map(User.build);
        }
        else {
            return undefined;
        }
    }
}
exports.User = User;
