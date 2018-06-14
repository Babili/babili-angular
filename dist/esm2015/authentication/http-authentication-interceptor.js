/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BabiliConfiguration } from "../configuration/babili.configuration";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { TokenConfiguration } from "./../configuration/token-configuration.types";
import { NotAuthorizedError } from "./not-authorized-error";
export class HttpAuthenticationInterceptor {
    /**
     * @param {?} configuration
     * @param {?} tokenConfiguration
     */
    constructor(configuration, tokenConfiguration) {
        this.configuration = configuration;
        this.tokenConfiguration = tokenConfiguration;
    }
    /**
     * @param {?} request
     * @param {?} next
     * @return {?}
     */
    intercept(request, next) {
        if (this.shouldAddHeaderTo(request)) {
            return next.handle(this.addHeaderTo(request, this.tokenConfiguration.apiToken))
                .pipe(catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return throwError(new NotAuthorizedError(error));
                }
                else {
                    return throwError(error);
                }
            }));
        }
        else {
            return next.handle(request);
        }
    }
    /**
     * @param {?} request
     * @param {?} token
     * @return {?}
     */
    addHeaderTo(request, token) {
        return request.clone({
            headers: request.headers.set("Authorization", `Bearer ${token}`)
        });
    }
    /**
     * @param {?} request
     * @return {?}
     */
    shouldAddHeaderTo(request) {
        return request.url.startsWith(this.configuration.apiUrl);
    }
}
HttpAuthenticationInterceptor.decorators = [
    { type: Injectable },
];
/** @nocollapse */
HttpAuthenticationInterceptor.ctorParameters = () => [
    { type: BabiliConfiguration },
    { type: TokenConfiguration }
];
function HttpAuthenticationInterceptor_tsickle_Closure_declarations() {
    /** @type {?} */
    HttpAuthenticationInterceptor.prototype.configuration;
    /** @type {?} */
    HttpAuthenticationInterceptor.prototype.tokenConfiguration;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbImF1dGhlbnRpY2F0aW9uL2h0dHAtYXV0aGVudGljYXRpb24taW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBd0QsTUFBTSxzQkFBc0IsQ0FBQztBQUMvRyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sRUFBYyxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRzVELE1BQU07Ozs7O0lBRUosWUFBb0IsYUFBa0MsRUFDbEM7UUFEQSxrQkFBYSxHQUFiLGFBQWEsQ0FBcUI7UUFDbEMsdUJBQWtCLEdBQWxCLGtCQUFrQjtLQUF3Qjs7Ozs7O0lBRTlELFNBQVMsQ0FBQyxPQUF5QixFQUFFLElBQWlCO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNuRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixFQUFFLENBQUMsQ0FBQyxLQUFLLFlBQVksaUJBQWlCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUMvRCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDbEQ7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDMUI7YUFDRixDQUFDLENBQUMsQ0FBQztTQUNoQjtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0I7S0FDRjs7Ozs7O0lBRU8sV0FBVyxDQUFDLE9BQXlCLEVBQUUsS0FBYTtRQUMxRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNuQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQVUsS0FBSyxFQUFFLENBQUM7U0FDakUsQ0FBQyxDQUFDOzs7Ozs7SUFHRyxpQkFBaUIsQ0FBQyxPQUF5QjtRQUNqRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7OztZQTVCNUQsVUFBVTs7OztZQU5GLG1CQUFtQjtZQUduQixrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwSGFuZGxlciwgSHR0cEludGVyY2VwdG9yLCBIdHRwUmVxdWVzdCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBCYWJpbGlDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL2NvbmZpZ3VyYXRpb24vYmFiaWxpLmNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIHRocm93RXJyb3IgfSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vLi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBOb3RBdXRob3JpemVkRXJyb3IgfSBmcm9tIFwiLi9ub3QtYXV0aG9yaXplZC1lcnJvclwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cEF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlndXJhdGlvbjogQmFiaWxpQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgcHJpdmF0ZSB0b2tlbkNvbmZpZ3VyYXRpb246IFRva2VuQ29uZmlndXJhdGlvbikge31cblxuICBpbnRlcmNlcHQocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuc2hvdWxkQWRkSGVhZGVyVG8ocmVxdWVzdCkpIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZSh0aGlzLmFkZEhlYWRlclRvKHJlcXVlc3QsIHRoaXMudG9rZW5Db25maWd1cmF0aW9uLmFwaVRva2VuKSlcbiAgICAgICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcihlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSHR0cEVycm9yUmVzcG9uc2UgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBOb3RBdXRob3JpemVkRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxdWVzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRIZWFkZXJUbyhyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCB0b2tlbjogc3RyaW5nKTogSHR0cFJlcXVlc3Q8YW55PiB7XG4gICAgcmV0dXJuIHJlcXVlc3QuY2xvbmUoe1xuICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzLnNldChcIkF1dGhvcml6YXRpb25cIiwgYEJlYXJlciAke3Rva2VufWApXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZEFkZEhlYWRlclRvKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gcmVxdWVzdC51cmwuc3RhcnRzV2l0aCh0aGlzLmNvbmZpZ3VyYXRpb24uYXBpVXJsKTtcbiAgfVxufVxuIl19