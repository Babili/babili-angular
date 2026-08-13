# Babili Angular

Typescript implementation to use Babili in an Angular app.
This implementation works with RxJS 7+ and Angular 7+.

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

### Publish

Releases are published to npm automatically by [`.github/workflows/release.yml`](.github/workflows/release.yml) whenever a tag matching `v*.*.*` is pushed:

1. Bump `version` in `package.json`.
2. Commit the change, then tag and push it:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
3. The workflow installs dependencies, lints, builds, and runs `npm publish --provenance --access public` from `dist/`.

Publishing uses npm's [trusted publishing](https://docs.npmjs.com/trusted-publishers) via GitHub Actions OIDC, so no `NPM_TOKEN` secret is involved. This requires the package to have a Trusted Publisher configured on npmjs.com (Settings → Trusted Publisher) pointing at the `Babili/babili-angular` repo and the `release.yml` workflow.
