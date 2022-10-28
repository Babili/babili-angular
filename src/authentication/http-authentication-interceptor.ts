import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { UrlHelper } from "../helper/url.helper";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { NotAuthorizedError } from "./not-authorized-error";

@Injectable()
export class HttpAuthenticationInterceptor implements HttpInterceptor {

  constructor(private urlHelper: UrlHelper,
              private tokenConfiguration: TokenConfiguration) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldAddHeaderTo(request)) {
      return next.handle(this.addHeaderTo(request, this.tokenConfiguration.apiToken))
                 .pipe(catchError(error => {
                   if (error instanceof HttpErrorResponse && error.status === 401) {
                     return throwError(() => new NotAuthorizedError(error));
                   } else {
                     return throwError(() => error);
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
    return this.urlHelper.isApi(request.url);
  }
}
