import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { empty, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { UrlHelper } from "../helper/url.helper";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";

@Injectable()
export class MeRepository {

  constructor(private http: HttpClient,
              private roomRepository: RoomRepository,
              private urlHelper: UrlHelper) {}

  findMe(): Observable<Me> {
    return this.http.get(this.userUrl).pipe(map(me => Me.build(me, this.roomRepository)));
  }

  updateAliveness(me: Me): Observable<void> {
    return this.http.put(this.aliveUrl, { data: { type: "alive" }})
                    .pipe(catchError(() => empty()), map(() => null));
  }

  private get userUrl(): string {
    return this.urlHelper.urlFor("user");
  }

  private get aliveUrl(): string {
    return `${this.userUrl}/alive`;
  }
}

