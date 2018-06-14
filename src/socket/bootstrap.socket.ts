import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import * as io from "socket.io-client";

@Injectable()
export class BootstrapSocket {

  private socket: SocketIOClient.Socket;

  constructor(private configuration: BabiliConfiguration) {}

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
