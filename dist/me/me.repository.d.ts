import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UrlConfiguration } from "../configuration/url-configuration.types";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";
export declare class MeRepository {
    private http;
    private roomRepository;
    private userUrl;
    private aliveUrl;
    constructor(http: HttpClient, roomRepository: RoomRepository, configuration: UrlConfiguration);
    findMe(): Observable<Me>;
    updateAliveness(me: Me): Observable<void>;
}
