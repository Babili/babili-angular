import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { UrlHelper } from "../helper/url.helper";
import { Room } from "../room/room.types";
import { Message } from "./message.types";

export class NewMessage {
  content: string;
  contentType: string;
  deviceSessionId: string;
}

@Injectable()
export class MessageRepository {

  constructor(private http: HttpClient,
              private urlHelper: UrlHelper) {}

  create(room: Room, attributes: NewMessage): Observable<Message> {
    return this.http.post(this.messageUrl(room.id!), {
      data: {
        type: "message",
        attributes: attributes
      }
    }).pipe(take(1), map((response: any) => Message.build(response.data)));
  }

  findAll(room: Room, attributes: {[param: string]: string | string[]}): Observable<Message[]> {
    return this.http.get(this.messageUrl(room.id!), { params: attributes })
                    .pipe(take(1), map((response: any) => Message.map(response.data)));
  }

  delete(room: Room, message: Message): Observable<Message> {
    return this.http.delete(`${this.messageUrl(room.id!)}/${message.id}`)
                    .pipe(take(1), map(_ => message));
  }

  private messageUrl(roomId: string) {
    return `${this.roomUrl}/${roomId}/messages`;
  }

  private get roomUrl(): string {
    return this.urlHelper.urlFor("user/rooms");
  }
}
