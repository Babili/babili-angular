import { Injectable } from "@angular/core";

@Injectable()
export class TokenConfiguration {
  public apiToken: string;
  
  isApiTokenSet(): boolean {
    return this.apiToken !== undefined && this.apiToken !== null && this.apiToken !== "";
  }

  clear() {
    this.apiToken = undefined;
  }

}
