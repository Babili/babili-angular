# Babili Angular

Typescript implementation to use Babili in an Angular app.
This implementation works with RxJS 6+ and Angular 6+.

## Usage

### Install (with npm)

npm install --save @babili.io/angular

### Enable Babili

In your Angular root module: 
* import `BabiliModule.forRoot()`;
* provide an instance of `Babili.UrlConfiguration`  to configure your babili endpoints.

```typescript
import { Babili } from "@babili.io/angular";

const configuration: BabiliUrlConfiguration = {
  apiUrl: "https://api.your-babili-service.io:443",
  socketUrl: "https://pusher.your-babili-service.io:443",
  aliveIntervalInMs: 5000
};

@NgModule({
  declarations: [ 
    // ...
  ],
  imports: [
    // ...
    BabiliModule.forRoot(configuration)
    // ...
  ],
  entryComponents: [
    // ...
  ],
  providers: [
    // ...
  ]
})
export class AppModule {}
```

Then, you can inject babili services in every module that imports `BabiliModule`

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

* Inject `MeService`:
```typescript
import { Injectable } from "@angular/core";
import { Babili } from "@babili.io/angular";

@Injectable()
export class AnyService {
  constructor(private babiliMeService: MeService) {}

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

* Build: `npm run build`
