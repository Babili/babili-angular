export class User {
  static build(json: any): User | undefined {
    if (json) {
      return new User(json.id, json.attributes ? json.attributes.status : undefined);
    } else {
      return undefined;
    }
  }

  static map(json: any): User[] {
    return json?.map(User.build) || [];
  }

  constructor(readonly id: string,
              readonly status: string) {}
}
