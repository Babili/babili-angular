import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Message } from "../message/message.types";
import { User } from "../user/user.types";
import { NewMessage } from "./../message/message.repository";
import { RoomRepository } from "./room.repository";

export function sortRoomByLastActivityDesc(rooms: Room[]): Room[] {
  if (rooms !== undefined && rooms !== null) {
    return rooms.sort((room, otherRoom) => {
      return (otherRoom.lastActivityAt?.getTime() || 0) - (room.lastActivityAt?.getTime() || 0);
    });
  } else {
    return [];
  }
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

  private _onMessageReceived$: Subject<Message>;
  private _open$: BehaviorSubject<boolean>;
  private _unreadMessageCount$: BehaviorSubject<number>;
  private _name$: BehaviorSubject<string>;
  private _imageUrl$: BehaviorSubject<string>;
  private _shortname$: BehaviorSubject<string>;
  private _messages$: BehaviorSubject<Message[]>;
  private _users$: BehaviorSubject<User[]>;
  private _senders$: BehaviorSubject<User[]>;
  private _lastActivityAt$: BehaviorSubject<Date | undefined>;
  readonly lastMessage$: Observable<Message | undefined>;
  readonly isPersisted: boolean;

  constructor(readonly id: string | undefined,
              name: string,
              lastActivityAt: Date | undefined,
              open: boolean,
              unreadMessageCount: number,
              users: User[],
              senders: User[],
              messages: Message[],
              readonly initiator: User | undefined,
              private roomRepository: RoomRepository) {
    this._open$ = new BehaviorSubject(open);
    this._messages$ = new BehaviorSubject(messages);
    this.lastMessage$ = this._messages$.pipe(map(list => list?.length > 0 ? list[list.length - 1] : undefined));
    this._lastActivityAt$ = new BehaviorSubject<Date | undefined>(lastActivityAt || (messages?.length > 0 ? messages[messages.length - 1]?.createdAt : undefined));
    this._name$ = new BehaviorSubject(name);
    this._unreadMessageCount$ = new BehaviorSubject(unreadMessageCount);
    this._users$ = new BehaviorSubject(users || []);
    this._senders$ = new BehaviorSubject(senders || []);
    this._imageUrl$ = new BehaviorSubject("");
    this._shortname$ = new BehaviorSubject("");
    this._onMessageReceived$ = new Subject();
    this.isPersisted = this.id !== null && this.id !== undefined;
  }

  get unreadMessageCount(): number {
    return this._unreadMessageCount$.value;
  }

  set unreadMessageCount(count: number) {
    this._unreadMessageCount$.next(count);
  }

  get unreadMessageCount$(): Observable<number> {
    return this._unreadMessageCount$;
  }
  
  get name(): string {
    return this._name$.value;
  }

  set name(name: string) {
    this._name$.next(name);
  }

  get name$(): Observable<string> {
    return this._name$;
  }

  get shortname(): string {
    return this._shortname$.value;
  }

  set shortname(shortname: string) {
    this._shortname$.next(shortname);
  }

  get shortname$(): Observable<string> {
    return this._shortname$;
  }

  get open(): boolean {
    return this._open$.value;
  }

  set open(open: boolean) {
    this._open$.next(open);
  }

  get open$(): Observable<boolean> {
    return this._open$;
  }

  get messages(): Message[] {
    return this._messages$.value;
  }

  get messages$(): Observable<Message[]> {
    return this._messages$;
  }

  get lastActivityAt(): Date | undefined {
    return this._lastActivityAt$.value;
  }

  get lastActivityAt$(): Observable<Date | undefined> {
    return this._lastActivityAt$;
  }

  get imageUrl(): string {
    return this._imageUrl$.value;
  }

  set imageUrl(imageUrl: string) {
    this._imageUrl$.next(imageUrl);
  }

  get imageUrl$(): Observable<string> {
    return this._imageUrl$;
  }

  get users(): User[] {
    return this._users$.value;
  }

  get users$(): Observable<User[]> {
    return this._users$;
  }

  get senders(): User[] {
    return this._senders$.value;
  }

  get senders$(): Observable<User[]> {
    return this._senders$;
  }

  get onMessageReceived$(): Observable<Message> {
    return this._onMessageReceived$;
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
    this._messages$.next([...this._messages$.value, message]);
  }

  notifyNewMessage(message: Message) {
    this._onMessageReceived$.next(message);
  }

  hasUser(userId: string): boolean {
    return this._users$.value.some(user => user.id  === userId);
  }

  fetchMoreMessage(): Observable<Message[]> {
    const params = this._messages$.value.length > 0 ? { firstSeenMessageId: this._messages$.value[0].id } : {} as {[param: string]: string | string[]};
    return this.roomRepository
               .findMessages(this, params)
               .pipe(
      map(messages => {
        this._messages$.next([...this._messages$.value, ...messages]);
        return messages;
      })
    );
  }

  findMessageWithId(id: string): Message | undefined {
    return this._messages$.value?.find(message => message.id === id);
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
    const index = this._messages$.value?.findIndex(message => message.id === messageToDelete.id) || -1;
    if (index > -1) {
      const messages = [...this._messages$.value];
      messages.splice(index, 1);
      this._messages$.next(messages);
    } 
    return messageToDelete;
  }

  delete(message: Message): Observable<Message | undefined> {
    return this.roomRepository
               .deleteMessage(this, message)
               .pipe(map(deletedMessage => this.removeMessage(deletedMessage)));
  }

  replaceUsersWith(room: Room): Room {
    this._users$.next(room._users$.value);
    return this;
  }

  addUser(user: User) {
    if (!this.hasUser(user.id)) {
      this._users$.next([...this._users$.value, user]);
    }
  }
}
