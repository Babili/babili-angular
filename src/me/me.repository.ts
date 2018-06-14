import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { empty, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";

@Injectable()
export class MeRepository {

  constructor(private http: HttpClient,
              private roomRepository: RoomRepository,
              private configuration: BabiliConfiguration) {}

  findMe(): Observable<Me> {
    return this.http.get(this.userUrl).pipe(map(me => Me.build(me, this.roomRepository)));
  }

  updateAliveness(me: Me): Observable<void> {
    return this.http.put(this.aliveUrl, { data: { type: "alive" }})
                    .pipe(catchError(() => empty()), map(() => null));
  }

  private get userUrl(): string {
    return `${this.configuration.apiUrl}/user`;
  }

  private get aliveUrl(): string {
    return `${this.userUrl}/alive`;
  }
}

