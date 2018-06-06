import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { empty } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BabiliUrlConfiguration, URL_CONFIGURATION } from "../configuration/url-configuration.types";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";

@Injectable()
export class MeRepository {

  private userUrl: string;
  private aliveUrl: string;

  constructor(private http: HttpClient,
              private roomRepository: RoomRepository,
              @Inject(URL_CONFIGURATION) configuration: BabiliUrlConfiguration) {
    this.userUrl = `${configuration.apiUrl}/user`;
    this.aliveUrl = `${this.userUrl}/alive`;
  }

  findMe(): Observable<Me> {
    return this.http.get(this.userUrl).pipe(map(me => Me.build(me, this.roomRepository)));
  }

  updateAliveness(me: Me): Observable<void> {
    return this.http.put(this.aliveUrl, { data: { type: "alive" }})
                    .pipe(catchError(() => empty()), map(() => null));
  }
}

