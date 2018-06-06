/// <reference types="socket.io-client" />
import { BabiliUrlConfiguration } from "./../configuration/url-configuration.types";
export declare class BootstrapSocket {
    private configuration;
    private socket;
    constructor(configuration: BabiliUrlConfiguration);
    connect(token: string): SocketIOClient.Socket;
    socketExists(): boolean;
    disconnect(): void;
}
