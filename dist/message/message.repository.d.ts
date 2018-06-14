import { HttpClient } from "@angular/common/http";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { Observable } from "rxjs";
import { Room } from "../room/room.types";
import { Message } from "./message.types";
export declare class NewMessage {
    content: string;
    contentType: string;
    deviceSessionId: string;
}
export declare class MessageRepository {
    private http;
    private configuration;
    constructor(http: HttpClient, configuration: BabiliConfiguration);
    create(room: Room, attributes: NewMessage): Observable<Message>;
    findAll(room: Room, attributes: {
        [param: string]: string | string[];
    }): Observable<Message[]>;
    delete(room: Room, message: Message): Observable<Message>;
    private messageUrl(roomId);
    private readonly roomUrl;
}
