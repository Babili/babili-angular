import { Injectable } from "@angular/core";
import { BabiliUrlConfiguration } from "./configuration/url-configuration.types";
import { UrlHelper } from "./helper/url.helper";

@Injectable()
export class BabiliBootstraper {

  constructor(private urlHelper: UrlHelper) {}

  init(apiUrl: string, socketUrl: string, aliveIntervalInMs?: number) {
    const configuration: BabiliUrlConfiguration = {
      apiUrl: apiUrl,
      socketUrl: socketUrl,
      aliveIntervalInMs: aliveIntervalInMs
    };
    this.urlHelper.init(configuration);
  }
}
