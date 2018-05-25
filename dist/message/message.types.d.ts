import { User } from "../user/user.types";
export declare class Message {
    readonly id: string;
    readonly content: string;
    readonly contentType: string;
    readonly createdAt: Date;
    readonly sender: User;
    readonly roomId: string;
    static build(json: any): Message;
    static map(json: any): Message[];
    constructor(id: string, content: string, contentType: string, createdAt: Date, sender: User, roomId: string);
    hasSenderId(userId: string): boolean;
}
