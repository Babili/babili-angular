export declare class BabiliConfiguration {
    private url;
    init(apiUrl: string, socketUrl: string, aliveIntervalInMs?: number): void;
    readonly apiUrl: string;
    readonly socketUrl: string;
    readonly aliveIntervalInMs: number;
}
