import { InjectionToken } from "@angular/core";

export const URL_CONFIGURATION = new InjectionToken<BabiliUrlConfiguration>("BabiliUrlConfiguration");

export interface BabiliUrlConfiguration {
  apiUrl: string;
  socketUrl: string;
  aliveIntervalInMs?: number;
}
