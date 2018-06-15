import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { UrlHelper } from "../helper/url.helper";

@Injectable()
export class BootstrapSocket {

  private socket: SocketIOClient.Socket;

  constructor(private urlHelper: UrlHelper) {}

  connect(token: string): SocketIOClient.Socket {
    this.socket = io.connect(this.urlHelper.socketUrl, {
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
