import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { BabiliUrlConfiguration, URL_CONFIGURATION } from "../configuration/url-configuration.types";
import { Room } from "../room/room.types";
import { Message } from "./message.types";

export class NewMessage {
  content: string;
  contentType: string;
  deviceSessionId: string;
}

@Injectable()
export class MessageRepository {

  private roomUrl: string;

  constructor(private http: HttpClient,
              @Inject(URL_CONFIGURATION) configuration: BabiliUrlConfiguration) {
    this.roomUrl = `${configuration.apiUrl}/user/rooms`;
  }

  create(room: Room, attributes: NewMessage): Observable<Message> {
    return this.http.post(this.messageUrl(room.id), {
      data: {
        type: "message",
        attributes: attributes
      }
    }).pipe(map((response: any) => Message.build(response.data)));
  }

  findAll(room: Room, attributes: {[param: string]: string | string[]}): Observable<Message[]> {
    return this.http.get(this.messageUrl(room.id), { params: attributes })
                    .pipe(map((response: any) => Message.map(response.data)));
  }

  delete(room: Room, message: Message): Observable<Message> {
    return this.http.delete(`${this.messageUrl(room.id)}/${message.id}`)
                    .pipe(map(response => message));
  }

  private messageUrl(roomId: string) {
    return `${this.roomUrl}/${roomId}/messages`;
  }

}
