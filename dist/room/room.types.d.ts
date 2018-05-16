import * as moment from "moment";
import { BehaviorSubject, Observable } from "rxjs";
import { Message } from "../message/message.types";
import { User } from "../user/user.types";
import { MessageRepository, NewMessage } from "./../message/message.repository";
import { RoomRepository } from "./room.repository";
export declare class Room {
    readonly id: string;
    readonly users: User[];
    readonly senders: User[];
    readonly messages: Message[];
    readonly initiator: User;
    private roomRepository;
    static build(json: any, roomRepository: RoomRepository, messageRepository: MessageRepository): Room;
    static map(json: any, roomRepository: RoomRepository, messageRepository: MessageRepository): Room[];
    newMessageNotifier: (message: Message) => any;
    private internalOpen;
    private internalUnreadMessageCount;
    private internalName;
    private internalLastActivityAt;
    private internalImageUrl;
    constructor(id: string, name: string, lastActivityAt: moment.Moment, open: boolean, unreadMessageCount: number, users: User[], senders: User[], messages: Message[], initiator: User, roomRepository: RoomRepository);
    unreadMessageCount: number;
    readonly observableUnreadMessageCount: BehaviorSubject<number>;
    name: string;
    readonly observableName: BehaviorSubject<string>;
    open: boolean;
    readonly observableOpen: BehaviorSubject<boolean>;
    lastActivityAt: moment.Moment;
    readonly observableLastActivityAt: BehaviorSubject<moment.Moment>;
    imageUrl: string;
    readonly observableImageUrl: BehaviorSubject<string>;
    openMembership(): Observable<Room>;
    closeMembership(): Observable<Room>;
    markAllMessagesAsRead(): Observable<number>;
    addMessage(message: Message): void;
    notifyNewMessage(message: Message): void;
    hasUser(userId: string): boolean;
    fetchMoreMessage(): Observable<Message[]>;
    findMessageWithId(id: string): Message;
    update(): Observable<Room>;
    sendMessage(newMessage: NewMessage): Observable<Message>;
    removeMessage(messageToDelete: Message): Message;
    delete(message: Message): Observable<Message>;
    replaceUsersWith(room: Room): Room;
    addUser(user: User): void;
}
