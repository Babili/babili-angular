import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as io from "socket.io-client";
import { URL_CONFIGURATION, UrlConfiguration } from "./../configuration/url-configuration.types";



@Injectable()
export class BootstrapSocket {

  private socket: SocketIOClient.Socket;

  constructor(@Inject(URL_CONFIGURATION) private configuration: UrlConfiguration) {}

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
