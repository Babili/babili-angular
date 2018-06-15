# Babili Angular

Typescript implementation to use Babili in an Angular app.
This implementation works with RxJS 6+ and Angular 6+.

## Usage

### Install (with npm)

npm install --save @babili.io/angular

### Enable Babili

In your Angular root module: 
* import `BabiliModule.forRoot()`;
* when starting your application, call `BabiliConfiguration(apiUrl: string, socketUrl: string, aliveIntervalInMs?: number)`, `BabiliConfiguration` is injectable

```typescript
import { Babili } from "@babili.io/angular";

@NgModule({
  declarations: [ 
    // ...
  ],
  imports: [
    // ...
    BabiliModule.forRoot()
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

```typescript
import { BabiliBootstraper } from "@babili.io/angular";


@Component({})
export class App {

  constructor(babili: BabiliBootstraper) {
    babili.init("https://api.your-babili-service.io:443", "https://pusher.your-babili-service.io:443", 5000);
  }
}
```

Then, you can inject babili services in every module that imports `BabiliModule`

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
