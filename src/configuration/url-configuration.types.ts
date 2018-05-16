import { InjectionToken } from "@angular/core";

export const URL_CONFIGURATION = new InjectionToken<UrlConfiguration>("BabiliUrlConfiguration");

export interface UrlConfiguration {
  apiUrl: string;
  socketUrl: string;
  aliveIntervalInMs?: number;
}
