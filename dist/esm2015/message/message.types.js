/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as momentLoaded from "moment";
const /** @type {?} */ moment = momentLoaded;
import { User } from "../user/user.types";
export class Message {
    /**
     * @param {?} id
     * @param {?} content
     * @param {?} contentType
     * @param {?} createdAt
     * @param {?} sender
     * @param {?} roomId
     */
    constructor(id, content, contentType, createdAt, sender, roomId) {
        this.id = id;
        this.content = content;
        this.contentType = contentType;
        this.createdAt = createdAt;
        this.sender = sender;
        this.roomId = roomId;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static build(json) {
        const /** @type {?} */ attributes = json.attributes;
        return new Message(json.id, attributes.content, attributes.contentType, moment(attributes.createdAt).toDate(), json.relationships.sender ? User.build(json.relationships.sender.data) : undefined, json.relationships.room.data.id);
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static map(json) {
        if (json) {
            return json.map(Message.build);
        }
        else {
            return undefined;
        }
    }
    /**
     * @param {?} userId
     * @return {?}
     */
    hasSenderId(userId) {
        return this.sender && this.sender.id === userId;
    }
}
function Message_tsickle_Closure_declarations() {
    /** @type {?} */
    Message.prototype.id;
    /** @type {?} */
    Message.prototype.content;
    /** @type {?} */
    Message.prototype.contentType;
    /** @type {?} */
    Message.prototype.createdAt;
    /** @type {?} */
    Message.prototype.sender;
    /** @type {?} */
    Message.prototype.roomId;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkvYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lc3NhZ2UvbWVzc2FnZS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsdUJBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQztBQUU1QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsTUFBTTs7Ozs7Ozs7O0lBb0JKLFlBQXFCLEVBQVUsRUFDVixPQUFlLEVBQ2YsV0FBbUIsRUFDbkIsU0FBZSxFQUNmLE1BQVksRUFDWixNQUFjO1FBTGQsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUNWLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUNuQixjQUFTLEdBQVQsU0FBUyxDQUFNO1FBQ2YsV0FBTSxHQUFOLE1BQU0sQ0FBTTtRQUNaLFdBQU0sR0FBTixNQUFNLENBQVE7S0FBSTs7Ozs7SUF2QnZDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBUztRQUNwQix1QkFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFDTixVQUFVLENBQUMsT0FBTyxFQUNsQixVQUFVLENBQUMsV0FBVyxFQUN0QixNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUNsRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDdEQ7Ozs7O0lBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFTO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxTQUFTLENBQUM7U0FDbEI7S0FDRjs7Ozs7SUFTRCxXQUFXLENBQUMsTUFBYztRQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUM7S0FDakQ7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55KTogTWVzc2FnZSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGpzb24uYXR0cmlidXRlcztcbiAgICByZXR1cm4gbmV3IE1lc3NhZ2UoanNvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29udGVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb21lbnQoYXR0cmlidXRlcy5jcmVhdGVkQXQpLnRvRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlciA/IFVzZXIuYnVpbGQoanNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlci5kYXRhKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5yb29tLmRhdGEuaWQpO1xuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBNZXNzYWdlW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoTWVzc2FnZS5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjb250ZW50VHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjcmVhdGVkQXQ6IERhdGUsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcjogVXNlcixcbiAgICAgICAgICAgICAgcmVhZG9ubHkgcm9vbUlkOiBzdHJpbmcpIHt9XG5cbiAgaGFzU2VuZGVySWQodXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5zZW5kZXIgJiYgdGhpcy5zZW5kZXIuaWQgPT09IHVzZXJJZDtcbiAgfVxufVxuIl19