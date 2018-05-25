import * as momentLoaded from "moment";
const moment = momentLoaded;
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ArrayUtils } from "../array.utils";
import { Message } from "../message/message.types";
import { User } from "../user/user.types";
import { MessageRepository, NewMessage } from "./../message/message.repository";
import { RoomRepository } from "./room.repository";

export class Room {

  static build(json: any, roomRepository: RoomRepository, messageRepository: MessageRepository): Room {
    const attributes = json.attributes;
    const users = json.relationships && json.relationships.users ? User.map(json.relationships.users.data) : [];
    const senders = json.relationships && json.relationships.senders ? User.map(json.relationships.senders.data) : [];
    const messages = json.relationships && json.relationships.messages ? Message.map(json.relationships.messages.data) : [];
    const initiator = json.relationships && json.relationships.initiator ? User.build(json.relationships.initiator.data) : undefined;
    return new Room(json.id,
                    attributes.name,
                    attributes.lastActivityAt ? moment(attributes.lastActivityAt).utc().toDate() : undefined,
                    attributes.open,
                    attributes.unreadMessageCount,
                    users,
                    senders,
                    messages,
                    initiator,
                    roomRepository);
  }

  static map(json: any, roomRepository: RoomRepository, messageRepository: MessageRepository): Room[] {
    if (json) {
      return json.map(room => Room.build(room, roomRepository, messageRepository));
    } else {
      return undefined;
    }
  }

  newMessageNotifier: (message: Message) => any;
  private internalOpen: BehaviorSubject<boolean>;
  private internalUnreadMessageCount: BehaviorSubject<number>;
  private internalName: BehaviorSubject<string>;
  private internalLastActivityAt: BehaviorSubject<Date>;
  private internalImageUrl: BehaviorSubject<string>;

  constructor(readonly id: string,
              name: string,
              lastActivityAt: Date,
              open: boolean,
              unreadMessageCount: number,
              readonly users: User[],
              readonly senders: User[],
              readonly messages: Message[],
              readonly initiator: User,
              private roomRepository: RoomRepository) {
    this.internalOpen = new BehaviorSubject(open);
    this.internalLastActivityAt = new BehaviorSubject(lastActivityAt);
    this.internalName = new BehaviorSubject(name);
    this.internalUnreadMessageCount = new BehaviorSubject(unreadMessageCount);
    this.internalImageUrl = new BehaviorSubject(undefined);
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

  get imageUrl(): string {
    return this.internalImageUrl.value;
  }

  set imageUrl(imageUrl: string) {
    this.internalImageUrl.next(imageUrl);
  }

  get observableImageUrl(): BehaviorSubject<string> {
    return this.internalImageUrl;
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
  }

  notifyNewMessage(message: Message) {
    if (this.newMessageNotifier) {
      this.newMessageNotifier.apply(message);
    }
  }


  hasUser(userId: string): boolean {
    return ArrayUtils.find(this.users.map(user => user.id), id => id === userId) !== undefined;
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
    return ArrayUtils.find(this.messages, message => message.id === id);
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
    const index = ArrayUtils.findIndex(this.messages, message => message.id === messageToDelete.id);
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
}
