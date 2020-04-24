import * as momentLoaded from "moment";
import { BehaviorSubject, Observable, of } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { Room } from "../room/room.types";
import { User } from "../user/user.types";
import { Message } from "./../message/message.types";
import { RoomRepository } from "./../room/room.repository";
const moment = momentLoaded;

export class Me {

  static build(json: any, roomRepository: RoomRepository): Me {
    const unreadMessageCount = json.data && json.data.meta ? json.data.meta.unreadMessageCount : 0;
    const roomCount = json.data && json.data.meta ? json.data.meta.roomCount : 0;
    return new Me(json.data.id, [], [], unreadMessageCount, roomCount, roomRepository);
  }

  public deviceSessionId: string;
  private internalUnreadMessageCount: BehaviorSubject<number>;
  private internalRoomCount: BehaviorSubject<number>;
  private firstSeenRoom: Room;

  constructor(readonly id: string,
              readonly openedRooms: Room[],
              readonly rooms: Room[],
              unreadMessageCount: number,
              roomCount: number,
              private roomRepository: RoomRepository) {
    this.internalUnreadMessageCount = new BehaviorSubject(unreadMessageCount || 0);
    this.internalRoomCount = new BehaviorSubject(roomCount || 0);
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

  get roomCount(): number {
    return this.internalRoomCount.value;
  }

  get observableRoomCount(): BehaviorSubject<number> {
    return this.internalRoomCount;
  }

  fetchOpenedRooms(): Observable<Room[]> {
    return this.roomRepository.findOpenedRooms().pipe(map(rooms => {
      this.addRooms(rooms);
      return rooms;
    }));
  }

  fetchClosedRooms(): Observable<Room[]> {
    return this.roomRepository.findClosedRooms().pipe(map(rooms => {
      this.addRooms(rooms);
      return rooms;
    }));
  }

  fetchMoreRooms(): Observable<Room[]> {
    if (this.firstSeenRoom) {
      return this.roomRepository.findRoomsAfter(this.firstSeenRoom.id).pipe(map(rooms => {
        this.addRooms(rooms);
        return rooms;
      }));
    } else {
      return of([]);
    }
  }

  fetchRoomsById(roomIds: string[]): Observable<Room[]> {
    return this.roomRepository.findRoomsByIds(roomIds).pipe(map(rooms => {
      this.addRooms(rooms);
      return rooms;
    }));
  }

  fetchRoomById(roomId: string): Observable<Room> {
    return this.roomRepository.find(roomId).pipe(map(room => {
      this.addRoom(room);
      return room;
    }));
  }

  findOrFetchRoomById(roomId: string): Observable<Room> {
    const room = this.findRoomById(roomId);
    if (roomId) {
      return of(room);
    } else {
      return this.fetchRoomById(roomId);
    }
  }

  handleNewMessage(newMessage: Message) {
    this.findOrFetchRoomById(newMessage.roomId)
        .subscribe(room => {
          if (room) {
            room.addMessage(newMessage);
            room.notifyNewMessage(newMessage);
            if (!newMessage.hasSenderId(this.id)) {
              this.unreadMessageCount = this.unreadMessageCount + 1;
              if (!room.open) {
                room.unreadMessageCount = room.unreadMessageCount + 1;
              }
            }
          }
        });
  }

  addRoom(newRoom: Room) {
    if (!this.hasRoom(newRoom)) {
      if (!this.firstSeenRoom || moment(this.firstSeenRoom.lastActivityAt).isAfter(newRoom.lastActivityAt)) {
        this.firstSeenRoom = newRoom;
      }

      const roomIndex = this.rooms ? this.rooms.findIndex(room => room.id === newRoom.id) : -1;
      if (roomIndex > -1) {
        this.rooms[roomIndex] = newRoom;
      } else {
        this.rooms.push(newRoom);
      }
    }
  }

  findRoomById(roomId: string): Room {
    return this.rooms ? this.rooms.find(room => roomId === room.id) : undefined;
  }

  openRoom(room: Room): Observable<Room> {
    if (!this.hasRoomOpened(room)) {
      return room.openMembership()
                 .pipe(flatMap((openedRoom: Room) => {
                   this.addToOpenedRoom(openedRoom);
                   return this.markAllReceivedMessagesAsRead(openedRoom);
                 }));
    } else {
      return of(room);
    }
  }

  closeRoom(room: Room): Observable<Room> {
    if (this.hasRoomOpened(room)) {
      return room.closeMembership()
                 .pipe(map(closedRoom => {
                    this.removeFromOpenedRoom(closedRoom);
                    return closedRoom;
                  }));
    } else {
      return of(room);
    }
  }

  closeRooms(roomsToClose: Room[]): Observable<Room[]> {
    return of(roomsToClose).pipe(
      map(rooms => {
        rooms.forEach(room => this.closeRoom(room));
        return rooms;
      })
    );
  }

  openRoomAndCloseOthers(roomToOpen: Room): Observable<Room> {
    const roomsToBeClosed = this.openedRooms.filter(room => room.id !== roomToOpen.id);
    return this.closeRooms(roomsToBeClosed).pipe(flatMap(rooms => this.openRoom(roomToOpen)));
  }

  hasOpenedRooms(): boolean {
    return this.openedRooms.length > 0;
  }

  createRoom(name: string, userIds: string[], withoutDuplicate: boolean): Observable<Room> {
    return this.roomRepository.create(name, userIds, withoutDuplicate)
                              .pipe(map(room => {
                                this.addRoom(room);
                                return room;
                              }));
  }

  buildRoom(userIds: string[]): Room {
    const users = userIds.map(id => new User(id, ""));
    const noSenders = [];
    const noMessage = [];
    const noMessageUnread = 0;
    const noId = undefined;
    const initiator = this.toUser();
    return new Room(noId,
      undefined,
      undefined,
      true,
      noMessageUnread,
      users,
      noSenders,
      noMessage,
      initiator,
      this.roomRepository
     );
  }

  sendMessage(room: Room, content: string, contentType: string): Observable<Message> {
    return room.sendMessage({
      content: content,
      contentType: contentType,
      deviceSessionId: this.deviceSessionId
    });
  }

  isSentByMe(message: Message) {
    return message && message.hasSenderId(this.id);
  }

  deleteMessage(message: Message): Observable<Message> {
    if (message) {
      const room = this.findRoomById(message.roomId);
      if (room) {
        return room.delete(message);
      } else {
        return of(undefined);
      }
    } else {
      return of(undefined);
    }
  }

  addUserTo(room: Room, userId: string): Observable<Room> {
    return this.roomRepository.addUser(room, userId);
  }

  private addRooms(rooms: Room[]) {
    rooms.forEach(room => {
      this.addRoom(room);
      if (room.open && !this.hasRoomOpened(room)) {
        this.openedRooms.push(room);
      }
    });
  }

  private hasRoom(roomToFind: Room): boolean {
    return this.findRoom(roomToFind) !== undefined;
  }

  private hasRoomOpened(roomToFind: Room): boolean {
    return this.findRoomOpened(roomToFind) !== undefined;
  }

  private findRoom(room: Room): Room {
    return this.findRoomById(room.id);
  }

  private findRoomOpened(roomToFind: Room): Room {
    return this.openedRooms !== undefined && this.openedRooms !== null && roomToFind !== null && roomToFind !== undefined ? this.openedRooms.find(room => roomToFind.id === room.id) : undefined;
  }

  private addToOpenedRoom(room: Room) {
    if (!this.hasRoomOpened(room)) {
      this.openedRooms.push(room);
    }
  }

  private removeFromOpenedRoom(closedRoom: Room) {
    if (this.hasRoomOpened(closedRoom)) {
      const roomIndex = this.openedRooms ? this.openedRooms.findIndex(room => room.id === closedRoom.id) : undefined;
      this.openedRooms.splice(roomIndex, 1);
    }
  }

  markAllReceivedMessagesAsRead(room: Room): Observable<Room> {
    return room.markAllMessagesAsRead()
               .pipe(map(readMessageCount => {
                  this.unreadMessageCount = Math.max(this.unreadMessageCount - readMessageCount, 0);
                  return room;
                }));
  }

  private toUser(): User {
    return new User(this.id, "");
  }
}
