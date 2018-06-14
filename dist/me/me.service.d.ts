import { BabiliConfiguration } from "../configuration/babili.configuration";
import { Observable } from "rxjs";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { BootstrapSocket } from "./../socket/bootstrap.socket";
import { MeRepository } from "./me.repository";
import { Me } from "./me.types";
export declare class MeService {
    private meRepository;
    private socketClient;
    private configuration;
    private tokenConfiguration;
    private cachedMe;
    private alive;
    constructor(meRepository: MeRepository, socketClient: BootstrapSocket, configuration: BabiliConfiguration, tokenConfiguration: TokenConfiguration);
    setup(token: string): void;
    me(): Observable<Me>;
    clear(): void;
    private scheduleAliveness(me);
    private hasCachedMe();
    private connectSocket(me);
    private receiveNewMessage(json);
}
