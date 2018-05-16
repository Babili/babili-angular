# Babili Angular

Typescript implementation to use Babili in an Angular app.
This implementation works with RxJS 6+ and Angular 6+.

## Usage

### Install (with npm)

npm install --save babili-angular-ts

### Enable Babili

In your Angular root module: 
* import `Babili.BabiliModule.forRoot()`;
* provide an instance of `Babili.UrlConfiguration`  to configure your babili endpoints.

```typescript
import { Babili } from "babili-angular";

@NgModule({
  declarations: [ 
    // ...
  ],
  imports: [
    // ...
    Babili.BabiliModule.forRoot()
    // ...
  ],
  entryComponents: [
    // ...
  ],
  providers: [
    // ...
    {
      provide: Babili.URL_CONFIGURATION,
      useValue: {
        apiUrl: "https://api.your-babili-service.io:443",
        socketUrl: "https://pusher.your-babili-service.io:443",
        aliveIntervalInMs: 5000
      }
    },
    // ...
  ]
})
export class AppModule {}
```

Then, you can inject babili services in every module that imports `Babili.BabiliModule`

```typescript
@NgModule({
  imports: [
    // ...
    Babili.BabiliModule
  ]
 })
export class SubModule {
}
```

### Examples

* Inject `Babili.MeService`:
```typescript
import { Injectable } from "@angular/core";
import { Babili } from "babili-angular";

@Injectable()
export class AnyService {
  constructor(private babiliMeService: Babili.MeService) {}

  // ...
}
```

* Setup Babili and connect a user
```typescript

import { Observable } from "rxjs";

// ...
connect(babiliToken: string): Observable<Babili.Me> {
  this.babiliMeService.setup(babiliToken);
  return this.babiliMeService.me();
}
```

* Disconnect
```typescript
disconnect() {
  this.babiliMeService.clear();
}
```

## Development

### Build

* Install typescript: `npm install -g tsc ts-node`
* Build: `npm run build`
