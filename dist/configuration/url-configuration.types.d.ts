import { InjectionToken } from "@angular/core";
export declare const URL_CONFIGURATION: InjectionToken<UrlConfiguration>;
export interface UrlConfiguration {
    apiUrl: string;
    socketUrl: string;
    aliveIntervalInMs?: number;
}
