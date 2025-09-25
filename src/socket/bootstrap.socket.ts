import { inject, Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { UrlHelper } from "../helper/url.helper";

@Injectable()
export class BootstrapSocket {
  private urlHelper = inject(UrlHelper);

  private socket: Socket;


  connect(token: string): Socket {
    this.socket = io(this.urlHelper.socketUrl, {
      forceNew: true,
      transports: ["websocket"], // babili-pusher does not support long HTTP polling
      auth: {
        token: token
      }
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
