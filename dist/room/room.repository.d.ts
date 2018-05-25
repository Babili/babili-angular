import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UrlConfiguration } from "../configuration/url-configuration.types";
import { MessageRepository, NewMessage } from "../message/message.repository";
import { Message } from "./../message/message.types";
import { Room } from "./room.types";
export declare class RoomRepository {
    private http;
    private messageRepository;
    private roomUrl;
    constructor(http: HttpClient, messageRepository: MessageRepository, configuration: UrlConfiguration);
    find(id: string): Observable<Room>;
    findAll(query: {
        [param: string]: string | string[];
    }): Observable<Room[]>;
    findOpenedRooms(): Observable<Room[]>;
    findClosedRooms(): Observable<Room[]>;
    findRoomsAfter(id: string): Observable<Room[]>;
    findRoomsByIds(roomIds: string[]): Observable<Room[]>;
    updateMembership(room: Room, open: boolean): Observable<Room>;
    markAllReceivedMessagesAsRead(room: Room): Observable<number>;
    create(name: string, userIds: string[], withoutDuplicate: boolean): Observable<Room>;
    update(room: Room): Observable<Room>;
    addUser(room: Room, userId: string): Observable<Room>;
    deleteMessage(room: Room, message: Message): Observable<Message>;
    findMessages(room: Room, attributes: {
        [param: string]: string | string[];
    }): Observable<Message[]>;
    createMessage(room: Room, attributes: NewMessage): Observable<Message>;
}