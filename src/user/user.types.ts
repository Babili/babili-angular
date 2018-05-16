export class User {
  static build(json: any): User {
    if (json) {
      return new User(json.id, json.attributes ? json.attributes.status : undefined);
    } else {
      return undefined;
    }
  }

  static map(json: any): User[] {
    if (json) {
      return json.map(User.build);
    } else {
      return undefined;
    }
  }

  constructor(readonly id: string,
              readonly status: string) {}
}
