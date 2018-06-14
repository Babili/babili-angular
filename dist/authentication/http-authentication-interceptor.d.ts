import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { Observable } from "rxjs";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
export declare class HttpAuthenticationInterceptor implements HttpInterceptor {
    private configuration;
    private tokenConfiguration;
    constructor(configuration: BabiliConfiguration, tokenConfiguration: TokenConfiguration);
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    private addHeaderTo(request, token);
    private shouldAddHeaderTo(request);
}
