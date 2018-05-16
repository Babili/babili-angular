export declare class User {
    readonly id: string;
    readonly status: string;
    static build(json: any): User;
    static map(json: any): User[];
    constructor(id: string, status: string);
}
