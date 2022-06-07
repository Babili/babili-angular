import dayjs from "dayjs";

import { User } from "../user/user.types";

export class Message {

  static build(json: any): Message {
    const attributes = json.attributes;
    return new Message(json.id,
                        attributes.content,
                        attributes.contentType,
                        attributes.createdAt ? dayjs(attributes.createdAt).toDate() : undefined,
                        json.relationships.sender ? User.build(json.relationships.sender.data) : undefined,
                        json.relationships.room.data.id);
  }

  static map(json: any): Message[] {
    if (json) {
      return json.map(Message.build);
    } else {
      return undefined;
    }
  }

  constructor(readonly id: string,
              readonly content: string,
              readonly contentType: string,
              readonly createdAt: Date,
              readonly sender: User,
              readonly roomId: string) {}

  hasSenderId(userId: string) {
    return this.sender && this.sender.id === userId;
  }
}
