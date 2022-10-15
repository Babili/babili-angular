import { Injectable } from "@angular/core";
import { BabiliUrlConfiguration } from "../configuration/url-configuration.types";

@Injectable()
export class UrlHelper {

  private apiBasePath: string;
  private configuration: BabiliUrlConfiguration;

  init(urlConfiguration: BabiliUrlConfiguration) {
    this.apiBasePath = `${urlConfiguration.apiUrl}/`;
    this.configuration = urlConfiguration;
  }

  urlFor(path: string): string {
    return `${this.apiBasePath}${path}`;
  }

  isApi(url: string): boolean {
    return url?.startsWith(this.apiBasePath) || false;
  }

  get aliveIntervalInMs(): number {
    return this.configuration ? this.configuration.aliveIntervalInMs : 30000;
  }

  get socketUrl(): string {
    return this.configuration ? this.configuration.socketUrl : undefined;
  }
}
