import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY, Observable } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { UrlHelper } from "../helper/url.helper";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";

@Injectable()
export class MeRepository {

  constructor(private http: HttpClient,
              private roomRepository: RoomRepository,
              private urlHelper: UrlHelper) {}

  findMe(): Observable<Me> {
    return this.http.get(this.userUrl).pipe(take(1), map(me => Me.build(me, this.roomRepository)));
  }

  updateAliveness(): Observable<void> {
    return this.http.put(this.aliveUrl, { data: { type: "alive" }})
                    .pipe(catchError(() => EMPTY), map(() => undefined), take(1));
  }

  private get userUrl(): string {
    return this.urlHelper.urlFor("user");
  }

  private get aliveUrl(): string {
    return `${this.userUrl}/alive`;
  }
}

