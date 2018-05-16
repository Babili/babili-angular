/// <reference types="socket.io-client" />
import { UrlConfiguration } from "./../configuration/url-configuration.types";
export declare class BootstrapSocket {
    private configuration;
    private socket;
    constructor(configuration: UrlConfiguration);
    connect(token: string): SocketIOClient.Socket;
    socketExists(): boolean;
    disconnect(): void;
}
