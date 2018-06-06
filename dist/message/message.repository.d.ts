import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BabiliUrlConfiguration } from "../configuration/url-configuration.types";
import { Room } from "../room/room.types";
import { Message } from "./message.types";
export declare class NewMessage {
    content: string;
    contentType: string;
    deviceSessionId: string;
}
export declare class MessageRepository {
    private http;
    private roomUrl;
    constructor(http: HttpClient, configuration: BabiliUrlConfiguration);
    create(room: Room, attributes: NewMessage): Observable<Message>;
    findAll(room: Room, attributes: {
        [param: string]: string | string[];
    }): Observable<Message[]>;
    delete(room: Room, message: Message): Observable<Message>;
    private messageUrl(roomId);
}
