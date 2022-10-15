import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { UrlHelper } from "../helper/url.helper";
import { MessageRepository, NewMessage } from "../message/message.repository";
import { User } from "../user/user.types";
import { Message } from "./../message/message.types";
import { Room } from "./room.types";

@Injectable()
export class RoomRepository {

  constructor(private http: HttpClient,
              private messageRepository: MessageRepository,
              private urlHelper: UrlHelper) {}

  find(id: string): Observable<Room> {
    return this.http.get(`${this.roomUrl}/${id}`)
                    .pipe(map((json: any) => Room.build(json.data, this)));
  }

  findAll(query: {[param: string]: string | string[] }): Observable<Room[]> {
    return this.http.get(this.roomUrl, { params: query })
                    .pipe(map((json: any) => Room.map(json.data, this)));
  }

  findOpenedRooms(): Observable<Room[]> {
    return this.findAll({ onlyOpened: "true" });
  }

  findClosedRooms(): Observable<Room[]> {
    return this.findAll({ onlyClosed: "true" });
  }

  findRoomsAfter(id: string | undefined): Observable<Room[]> {
    return this.findAll(id ? { firstSeenRoomId: id } : {});
  }

  findRoomsByIds(roomIds: string[]) {
    return this.findAll({ "roomIds[]": roomIds });
  }

  updateMembership(room: Room, open: boolean): Observable<Room> {
    return this.http.put(`${this.roomUrl}/${room.id}/membership`, {
      data: {
        type: "membership",
        attributes: {
          open: open
        }
      }
    }).pipe(map((data: any) => {
      room.open = data.data.attributes.open;
      return room;
    }));
  }

  markAllReceivedMessagesAsRead(room: Room): Observable<number> {
    if (room.unreadMessageCount > 0) {
      const lastReadMessageId = room.messages.length > 0 ? room.messages[room.messages.length - 1].id : undefined;
      return this.http.put(`${this.roomUrl}/${room.id}/membership/unread-messages`, { data: { lastReadMessageId: lastReadMessageId } })
                      .pipe(map((data: any) => {
                        room.unreadMessageCount = 0;
                        return data.meta.count;
                      }));
    } else {
      return of(0);
    }
  }

  create(name: string, userIds: string[], withoutDuplicate: boolean): Observable<Room> {
    return this.http.post(`${this.roomUrl}?noDuplicate=${withoutDuplicate}`, {
      data: {
        type: "room",
        attributes: {
          name: name
        },
        relationships: {
          users: {
            data: userIds.map(userId => ({ type: "user", id: userId }) )
          }
        }
      }
    }, {
      params: {
        noDuplicate: `${withoutDuplicate}`
      }
    }).pipe(map((response: any) => Room.build(response.data, this)));
  }

  update(room: Room): Observable<Room> {
    return this.http.put(`${this.roomUrl}/${room.id}`, {
      data: {
        type: "room",
        attributes: {
          name: room.name
        }
      }
    }).pipe(map((response: any) => {
      room.name = response.data.attributes.name;
      return room;
    }));
  }

  addUser(room: Room, userId: string): Observable<Room> {
    return this.http.post(`${this.roomUrl}/${room.id}/memberships`, {
      data: {
        type: "membership",
        relationships: {
          user: {
            data: {
              type: "user",
              id: userId
            }
          }
        }
      }
    }).pipe(map((response: any) => {
      const newUser = User.build(response.data.relationships.user.data);
      if (newUser) {
        room.addUser(newUser);
      }
      return room;
    }));
  }

  deleteMessage(room: Room, message: Message): Observable<Message> {
    return this.messageRepository.delete(room, message);
  }

  findMessages(room: Room, attributes: {[param: string]: string | string[]}): Observable<Message[]> {
    return this.messageRepository.findAll(room, attributes);
  }

  createMessage(room: Room, attributes: NewMessage): Observable<Message> {
    return this.messageRepository.create(room, attributes);
  }

  private get roomUrl(): string {
    return this.urlHelper.urlFor("user/rooms");
  }
}
