import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { BabiliUrlConfiguration, URL_CONFIGURATION } from "./../configuration/url-configuration.types";
import { NotAuthorizedError } from "./not-authorized-error";

@Injectable()
export class HttpAuthenticationInterceptor implements HttpInterceptor {

  constructor(@Inject(URL_CONFIGURATION) private urls: BabiliUrlConfiguration,
              private tokenConfiguration: TokenConfiguration) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldAddHeaderTo(request)) {
      return next.handle(this.addHeaderTo(request, this.tokenConfiguration.apiToken))
                 .pipe(catchError(error => {
                   if (error instanceof HttpErrorResponse && error.status === 401) {
                     return throwError(new NotAuthorizedError(error));
                   } else {
                     return throwError(error);
                   }
                 }));
    } else {
      return next.handle(request);
    }
  }

  private addHeaderTo(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set("Authorization", `Bearer ${token}`)
    });
  }

  private shouldAddHeaderTo(request: HttpRequest<any>): boolean {
    return request.url.startsWith(this.urls.apiUrl);
  }
}
