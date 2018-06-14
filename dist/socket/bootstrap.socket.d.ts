/// <reference types="socket.io-client" />
import { BabiliConfiguration } from "../configuration/babili.configuration";
export declare class BootstrapSocket {
    private configuration;
    private socket;
    constructor(configuration: BabiliConfiguration);
    connect(token: string): SocketIOClient.Socket;
    socketExists(): boolean;
    disconnect(): void;
}
