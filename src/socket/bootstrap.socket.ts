import { Inject, Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { BabiliUrlConfiguration, URL_CONFIGURATION } from "./../configuration/url-configuration.types";



@Injectable()
export class BootstrapSocket {

  private socket: SocketIOClient.Socket;

  constructor(@Inject(URL_CONFIGURATION) private configuration: BabiliUrlConfiguration) {}

  connect(token: string): SocketIOClient.Socket {
    this.socket = io.connect(this.configuration.socketUrl, {
      forceNew: true,
      query: `token=${token}`
    });
    return this.socket;
  }

  socketExists(): boolean {
    return this.socket !== undefined;
  }

  disconnect() {
    if (this.socketExists()) {
      this.socket.close();
      this.socket = undefined;
    }
  }
}
