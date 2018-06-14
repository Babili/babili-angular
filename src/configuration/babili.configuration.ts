import { Injectable, Injector } from "@angular/core";
import { BabiliUrlConfiguration } from "./url-configuration.types";

@Injectable()
export class BabiliConfiguration {

  private url: BabiliUrlConfiguration;

  init(apiUrl: string, socketUrl: string, aliveIntervalInMs?: number) {
    this.url = {
      apiUrl: apiUrl,
      socketUrl: socketUrl,
      aliveIntervalInMs: aliveIntervalInMs
    };
  }

  get apiUrl(): string {
    return this.url ? this.url.apiUrl : undefined;
  }

  get socketUrl(): string {
    return this.url ? this.url.socketUrl : undefined;
  }

  get aliveIntervalInMs(): number {
    return this.url ? this.url.aliveIntervalInMs : 30000;
  }
}
