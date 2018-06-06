import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { HttpAuthenticationInterceptor } from "./authentication/http-authentication-interceptor";
import { TokenConfiguration } from "./configuration/token-configuration.types";
import { BabiliUrlConfiguration, URL_CONFIGURATION } from "./configuration/url-configuration.types";
import { MeRepository } from "./me/me.repository";
import { MeService } from "./me/me.service";
import { MessageRepository } from "./message/message.repository";
import { SortRoomPipe } from "./pipe/sort-room";
import { RoomRepository } from "./room/room.repository";
import { BootstrapSocket } from "./socket/bootstrap.socket";

@NgModule({
  imports: [
    HttpClientModule
  ],
  declarations: [
    SortRoomPipe
  ],
  exports: [
    SortRoomPipe
  ]
 })
export class BabiliModule {
  static forRoot(urlConfiguration: BabiliUrlConfiguration): ModuleWithProviders {
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
