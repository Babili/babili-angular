import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { UrlConfiguration } from "./../configuration/url-configuration.types";
export declare class HttpAuthenticationInterceptor implements HttpInterceptor {
    private urls;
    private tokenConfiguration;
    constructor(urls: UrlConfiguration, tokenConfiguration: TokenConfiguration);
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    private addHeaderTo(request, token);
    private shouldAddHeaderTo(request);
}
