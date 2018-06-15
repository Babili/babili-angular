import { Injectable } from "@angular/core";
import { Observable, timer } from "rxjs";
import { map, publishReplay, refCount, share, takeWhile } from "rxjs/operators";
import { UrlHelper } from "../helper/url.helper";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { Message } from "./../message/message.types";
import { BootstrapSocket } from "./../socket/bootstrap.socket";
import { MeRepository } from "./me.repository";
import { Me } from "./me.types";

@Injectable()
export class MeService {

  private cachedMe: Observable<Me>;
  private alive: boolean;

  constructor(private meRepository: MeRepository,
              private socketClient: BootstrapSocket,
              private urlHelper: UrlHelper,
              private tokenConfiguration: TokenConfiguration) {
    this.alive = false;
  }

  setup(token: string): void {
    if (!this.tokenConfiguration.isApiTokenSet()) {
      this.tokenConfiguration.apiToken = token;
    }
  }

  me(): Observable<Me> {
    if (!this.hasCachedMe()) {
      this.cachedMe = this.meRepository
                          .findMe()
                          .pipe(
                            map(me => this.scheduleAliveness(me)),
                            publishReplay(1),
                            refCount(),
                            share()
                          );
    }
    return this.cachedMe.pipe(map(me => this.connectSocket(me)));
  }

  clear() {
    this.tokenConfiguration.clear();
    this.cachedMe = undefined;
    this.alive = false;
  }

  private scheduleAliveness(me: Me): Me {
    this.alive = true;
    timer(0, this.urlHelper.aliveIntervalInMs).pipe(
      takeWhile(() => this.alive)
    )
    .subscribe(() => this.meRepository.updateAliveness(me));
    return me;
  }

  private hasCachedMe(): boolean {
    return this.cachedMe !== undefined;
  }

  private connectSocket(me: Me): Me {
    if (!this.socketClient.socketExists()) {
      const socket = this.socketClient.connect(this.tokenConfiguration.apiToken);
      socket.on("new message", data => this.receiveNewMessage(data));
      socket.on("connected", data => me.deviceSessionId = data.deviceSessionId);
    }
    return me;
  }

  private receiveNewMessage(json: any) {
    const message = Message.build(json.data);
    this.me().subscribe(me => me.handleNewMessage(message));
  }
}
