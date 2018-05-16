import * as moment from "moment";
import { User } from "../user/user.types";
export declare class Message {
    readonly id: string;
    readonly content: string;
    readonly contentType: string;
    readonly createdAt: moment.Moment;
    readonly sender: User;
    readonly roomId: string;
    static build(json: any): Message;
    static map(json: any): Message[];
    constructor(id: string, content: string, contentType: string, createdAt: moment.Moment, sender: User, roomId: string);
    hasSenderId(userId: string): boolean;
}
