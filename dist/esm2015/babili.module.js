/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { HttpAuthenticationInterceptor } from "./authentication/http-authentication-interceptor";
import { TokenConfiguration } from "./configuration/token-configuration.types";
import { URL_CONFIGURATION } from "./configuration/url-configuration.types";
import { MeRepository } from "./me/me.repository";
import { MeService } from "./me/me.service";
import { MessageRepository } from "./message/message.repository";
import { SortRoomPipe } from "./pipe/sort-room";
import { RoomRepository } from "./room/room.repository";
import { BootstrapSocket } from "./socket/bootstrap.socket";
export class BabiliModule {
    /**
     * @param {?} urlConfiguration
     * @return {?}
     */
    static forRoot(urlConfiguration) {
        return {
            ngModule: BabiliModule,
            providers: [
                {
                    provide: URL_CONFIGURATION,
                    useValue: urlConfiguration
                },
                SortRoomPipe,
                TokenConfiguration,
                BootstrapSocket,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpAuthenticationInterceptor,
                    multi: true
                },
                MessageRepository,
                RoomRepository,
                MeRepository,
                MeService
            ]
        };
    }
}
BabiliModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    HttpClientModule
                ],
                declarations: [
                    SortRoomPipe
                ]
            },] },
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFiaWxpLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkvYW5ndWxhci8iLCJzb3VyY2VzIjpbImJhYmlsaS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxpQkFBaUIsRUFBb0IsTUFBTSx5Q0FBeUMsQ0FBQztBQUM5RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBVTVELE1BQU07Ozs7O0lBQ0osTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBa0M7UUFDL0MsTUFBTSxDQUFDO1lBQ0wsUUFBUSxFQUFFLFlBQVk7WUFDdEIsU0FBUyxFQUFFO2dCQUNUO29CQUNFLE9BQU8sRUFBRSxpQkFBaUI7b0JBQzFCLFFBQVEsRUFBRSxnQkFBZ0I7aUJBQzNCO2dCQUNELFlBQVk7Z0JBQ1osa0JBQWtCO2dCQUNsQixlQUFlO2dCQUNmO29CQUNFLE9BQU8sRUFBRSxpQkFBaUI7b0JBQzFCLFFBQVEsRUFBRSw2QkFBNkI7b0JBQ3ZDLEtBQUssRUFBRSxJQUFJO2lCQUNaO2dCQUNELGlCQUFpQjtnQkFDakIsY0FBYztnQkFDZCxZQUFZO2dCQUNaLFNBQVM7YUFDVjtTQUNGLENBQUM7S0FDSDs7O1lBL0JGLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsZ0JBQWdCO2lCQUNqQjtnQkFDRCxZQUFZLEVBQUU7b0JBQ1osWUFBWTtpQkFDYjthQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMsIEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yIH0gZnJvbSBcIi4vYXV0aGVudGljYXRpb24vaHR0cC1hdXRoZW50aWNhdGlvbi1pbnRlcmNlcHRvclwiO1xuaW1wb3J0IHsgVG9rZW5Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4vY29uZmlndXJhdGlvbi90b2tlbi1jb25maWd1cmF0aW9uLnR5cGVzXCI7XG5pbXBvcnQgeyBVUkxfQ09ORklHVVJBVElPTiwgVXJsQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb24vdXJsLWNvbmZpZ3VyYXRpb24udHlwZXNcIjtcbmltcG9ydCB7IE1lUmVwb3NpdG9yeSB9IGZyb20gXCIuL21lL21lLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IE1lU2VydmljZSB9IGZyb20gXCIuL21lL21lLnNlcnZpY2VcIjtcbmltcG9ydCB7IE1lc3NhZ2VSZXBvc2l0b3J5IH0gZnJvbSBcIi4vbWVzc2FnZS9tZXNzYWdlLnJlcG9zaXRvcnlcIjtcbmltcG9ydCB7IFNvcnRSb29tUGlwZSB9IGZyb20gXCIuL3BpcGUvc29ydC1yb29tXCI7XG5pbXBvcnQgeyBSb29tUmVwb3NpdG9yeSB9IGZyb20gXCIuL3Jvb20vcm9vbS5yZXBvc2l0b3J5XCI7XG5pbXBvcnQgeyBCb290c3RyYXBTb2NrZXQgfSBmcm9tIFwiLi9zb2NrZXQvYm9vdHN0cmFwLnNvY2tldFwiO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgSHR0cENsaWVudE1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBTb3J0Um9vbVBpcGVcbiAgXVxuIH0pXG5leHBvcnQgY2xhc3MgQmFiaWxpTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QodXJsQ29uZmlndXJhdGlvbjogVXJsQ29uZmlndXJhdGlvbik6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQmFiaWxpTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBVUkxfQ09ORklHVVJBVElPTixcbiAgICAgICAgICB1c2VWYWx1ZTogdXJsQ29uZmlndXJhdGlvblxuICAgICAgICB9LFxuICAgICAgICBTb3J0Um9vbVBpcGUsXG4gICAgICAgIFRva2VuQ29uZmlndXJhdGlvbixcbiAgICAgICAgQm9vdHN0cmFwU29ja2V0LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsXG4gICAgICAgICAgdXNlQ2xhc3M6IEh0dHBBdXRoZW50aWNhdGlvbkludGVyY2VwdG9yLFxuICAgICAgICAgIG11bHRpOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIE1lc3NhZ2VSZXBvc2l0b3J5LFxuICAgICAgICBSb29tUmVwb3NpdG9yeSxcbiAgICAgICAgTWVSZXBvc2l0b3J5LFxuICAgICAgICBNZVNlcnZpY2VcbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXX0=