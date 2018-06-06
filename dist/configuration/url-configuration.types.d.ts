import { InjectionToken } from "@angular/core";
export declare const URL_CONFIGURATION: InjectionToken<BabiliUrlConfiguration>;
export interface BabiliUrlConfiguration {
    apiUrl: string;
    socketUrl: string;
    aliveIntervalInMs?: number;
}
