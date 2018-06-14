import { HttpClient } from "@angular/common/http";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { Observable } from "rxjs";
import { RoomRepository } from "./../room/room.repository";
import { Me } from "./me.types";
export declare class MeRepository {
    private http;
    private roomRepository;
    private configuration;
    constructor(http: HttpClient, roomRepository: RoomRepository, configuration: BabiliConfiguration);
    findMe(): Observable<Me>;
    updateAliveness(me: Me): Observable<void>;
    private readonly userUrl;
    private readonly aliveUrl;
}
