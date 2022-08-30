import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Message } from "../message/message.types";
import { User } from "../user/user.types";
import { NewMessage } from "./../message/message.repository";
import { RoomRepository } from "./room.repository";

export function sortRoomByLastActivityDesc(rooms: Room[]): Room[] {
  return rooms.sort(function (room, otherRoom) {
    return otherRoom.lastActivityAt.getTime() - room.lastActivityAt.getTime();
  });
}

export class Room {

  static build(json: any, roomRepository: RoomRepository): Room {
    const attributes = json.attributes;
    const users = json.relationships && json.relationships.users ? User.map(json.relationships.users.data) : [];
    const senders = json.relationships && json.relationships.senders ? User.map(json.relationships.senders.data) : [];
    const messages = json.relationships && json.relationships.messages ? Message.map(json.relationships.messages.data) : [];
    const initiator = json.relationships && json.relationships.initiator ? User.build(json.relationships.initiator.data) : undefined;
    return new Room(json.id,
                    attributes.name,
                    new Date(attributes.lastActivityAt),
                    attributes.open,
                    attributes.unreadMessageCount,
                    users,
                    senders,
                    messages,
                    initiator,
                    roomRepository);
  }

  static map(json: any, roomRepository: RoomRepository): Room[] {
    if (json) {
      return json.map(room => Room.build(room, roomRepository));
    } else {
      return [];
    }
  }

  private internalOnMessageReceived: Subject<Message>;
  private internalOpen: BehaviorSubject<boolean>;
  private internalUnreadMessageCount: BehaviorSubject<number>;
  private internalName: BehaviorSubject<string>;
  private internalLastActivityAt: BehaviorSubject<Date>;
  private internalLastMessage: BehaviorSubject<Message>;
  private internalImageUrl: BehaviorSubject<string>;
  private internalShortname: BehaviorSubject<string>;

  constructor(readonly id: string,
              name: string,
              lastActivityAt: Date,
              open: boolean,
              unreadMessageCount: number,
              readonly users: User[],
              readonly senders: User[],
              readonly messages: Message[],
              readonly initiator?: User,
              private roomRepository?: RoomRepository) {
    this.internalOpen = new BehaviorSubject(open);
    this.internalLastActivityAt = new BehaviorSubject(lastActivityAt);
    this.internalLastMessage = new BehaviorSubject(this.findLastMessage());
    this.internalName = new BehaviorSubject(name);
    this.internalUnreadMessageCount = new BehaviorSubject(unreadMessageCount);
    this.internalImageUrl = new BehaviorSubject("");
    this.internalShortname = new BehaviorSubject("");
    this.internalOnMessageReceived = new Subject();
  }

  get unreadMessageCount(): number {
    return this.internalUnreadMessageCount.value;
  }

  set unreadMessageCount(count: number) {
    this.internalUnreadMessageCount.next(count);
  }

  get observableUnreadMessageCount(): BehaviorSubject<number> {
    return this.internalUnreadMessageCount;
  }

  get name(): string {
    return this.internalName.value;
  }

  set name(name: string) {
    this.internalName.next(name);
  }

  get observableName(): BehaviorSubject<string> {
    return this.internalName;
  }

  get open(): boolean {
    return this.internalOpen.value;
  }

  set open(open: boolean) {
    this.internalOpen.next(open);
  }

  get observableOpen(): BehaviorSubject<boolean> {
    return this.internalOpen;
  }

  get lastActivityAt(): Date {
    return this.internalLastActivityAt.value;
  }

  set lastActivityAt(lastActivityAt: Date) {
    this.internalLastActivityAt.next(lastActivityAt);
  }

  get observableLastActivityAt(): BehaviorSubject<Date> {
    return this.internalLastActivityAt;
  }

  get lastMessage(): Message {
    return this.internalLastMessage.value;
  }

  set lastMessage(message: Message) {
    this.internalLastMessage.next(message);
  }

  get observableLastMessage(): BehaviorSubject<Message> {
    return this.internalLastMessage;
  }

  get imageUrl(): string {
    return this.internalImageUrl.value;
  }

  set imageUrl(imageUrl: string) {
    this.internalImageUrl.next(imageUrl);
  }

  get observableImageUrl(): BehaviorSubject<string> {
    return this.internalImageUrl;
  }

  set shortname(shortname: string) {
    this.internalShortname.next(shortname);
  }

  get observableShortname(): BehaviorSubject<string> {
    return this.internalShortname;
  }

  get onMessageReceived(): Observable<Message> {
    return this.internalOnMessageReceived;
  }

  openMembership(): Observable<Room> {
    return this.roomRepository.updateMembership(this, true);
  }

  closeMembership(): Observable<Room> {
    return this.roomRepository.updateMembership(this, false);
  }

  markAllMessagesAsRead(): Observable<number> {
    return this.roomRepository.markAllReceivedMessagesAsRead(this);
  }

  addMessage(message: Message) {
    this.messages.push(message);
    this.lastActivityAt = message.createdAt;
    this.lastMessage = message;
  }

  notifyNewMessage(message: Message) {
    this.internalOnMessageReceived.next(message);
  }

  hasUser(userId: string): boolean {
    return this.users && this.users.some(user => user.id  === userId);
  }

  fetchMoreMessage(): Observable<Message[]> {
    const params = {
      firstSeenMessageId: this.messages.length > 0 ? this.messages[0].id : undefined
    };
    return this.roomRepository
               .findMessages(this, params)
               .pipe(
      map(messages => {
        this.messages.unshift.apply(this.messages, messages);
        return messages;
      })
    );
  }

  findMessageWithId(id: string): Message {
    return this.messages ? this.messages.find(message => message.id === id) : undefined;
  }

  update(): Observable<Room> {
    return this.roomRepository.update(this);
  }

  sendMessage(newMessage: NewMessage): Observable<Message> {
    return this.roomRepository
               .createMessage(this, newMessage)
               .pipe(
                 map(message => {
                   this.addMessage(message);
                   return message;
                 })
               );
  }

  removeMessage(messageToDelete: Message): Message {
    const index = this.messages ? this.messages.findIndex(message => message.id === messageToDelete.id) : -1;
    if (index > -1) {
      this.messages.splice(index, 1);
    }
    return messageToDelete;
  }

  delete(message: Message): Observable<Message> {
    return this.roomRepository
               .deleteMessage(this, message)
               .pipe(map(deletedMessage => this.removeMessage(deletedMessage)));
  }

  replaceUsersWith(room: Room): Room {
    this.users.splice(0, this.users.length);
    Array.prototype.push.apply(this.users, room.users);
    return this;
  }

  addUser(user: User) {
    if (!this.hasUser(user.id)) {
      this.users.push(user);
    }
  }

  isPersisted(): boolean {
    return this.id !== null && this.id !== undefined;
  }

  private findLastMessage(): Message {
    if (this.messages.length > 0) {
      return this.messages[this.messages.length - 1];
    } else {
      return undefined;
    }
  }
}
