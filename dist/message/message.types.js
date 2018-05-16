"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const user_types_1 = require("../user/user.types");
class Message {
    constructor(id, content, contentType, createdAt, sender, roomId) {
        this.id = id;
        this.content = content;
        this.contentType = contentType;
        this.createdAt = createdAt;
        this.sender = sender;
        this.roomId = roomId;
    }
    static build(json) {
        const attributes = json.attributes;
        return new Message(json.id, attributes.content, attributes.contentType, moment.utc(attributes.createdAt), json.relationships.sender ? user_types_1.User.build(json.relationships.sender.data) : undefined, json.relationships.room.data.id);
    }
    static map(json) {
        if (json) {
            return json.map(Message.build);
        }
        else {
            return undefined;
        }
    }
    hasSenderId(userId) {
        return this.sender && this.sender.id === userId;
    }
}
exports.Message = Message;
