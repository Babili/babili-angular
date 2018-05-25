/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as momentLoaded from "moment";
var /** @type {?} */ moment = momentLoaded;
import { User } from "../user/user.types";
var Message = /** @class */ (function () {
    function Message(id, content, contentType, createdAt, sender, roomId) {
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
    Message.build = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        var /** @type {?} */ attributes = json.attributes;
        return new Message(json.id, attributes.content, attributes.contentType, moment(attributes.createdAt).toDate(), json.relationships.sender ? User.build(json.relationships.sender.data) : undefined, json.relationships.room.data.id);
    };
    /**
     * @param {?} json
     * @return {?}
     */
    Message.map = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        if (json) {
            return json.map(Message.build);
        }
        else {
            return undefined;
        }
    };
    /**
     * @param {?} userId
     * @return {?}
     */
    Message.prototype.hasSenderId = /**
     * @param {?} userId
     * @return {?}
     */
    function (userId) {
        return this.sender && this.sender.id === userId;
    };
    return Message;
}());
export { Message };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbIm1lc3NhZ2UvbWVzc2FnZS50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMscUJBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQztBQUU1QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsSUFBQTtJQW9CRSxpQkFBcUIsRUFBVSxFQUNWLE9BQWUsRUFDZixXQUFtQixFQUNuQixTQUFlLEVBQ2YsTUFBWSxFQUNaLE1BQWM7UUFMZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQU07UUFDZixXQUFNLEdBQU4sTUFBTSxDQUFNO1FBQ1osV0FBTSxHQUFOLE1BQU0sQ0FBUTtLQUFJOzs7OztJQXZCaEMsYUFBSzs7OztJQUFaLFVBQWEsSUFBUztRQUNwQixxQkFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFDTixVQUFVLENBQUMsT0FBTyxFQUNsQixVQUFVLENBQUMsV0FBVyxFQUN0QixNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUNsRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDdEQ7Ozs7O0lBRU0sV0FBRzs7OztJQUFWLFVBQVcsSUFBUztRQUNsQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsU0FBUyxDQUFDO1NBQ2xCO0tBQ0Y7Ozs7O0lBU0QsNkJBQVc7Ozs7SUFBWCxVQUFZLE1BQWM7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDO0tBQ2pEO2tCQWxDSDtJQW1DQyxDQUFBO0FBOUJELG1CQThCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG1vbWVudExvYWRlZCBmcm9tIFwibW9tZW50XCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vdXNlci91c2VyLnR5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlIHtcblxuICBzdGF0aWMgYnVpbGQoanNvbjogYW55KTogTWVzc2FnZSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGpzb24uYXR0cmlidXRlcztcbiAgICByZXR1cm4gbmV3IE1lc3NhZ2UoanNvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29udGVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb21lbnQoYXR0cmlidXRlcy5jcmVhdGVkQXQpLnRvRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlciA/IFVzZXIuYnVpbGQoanNvbi5yZWxhdGlvbnNoaXBzLnNlbmRlci5kYXRhKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ucmVsYXRpb25zaGlwcy5yb29tLmRhdGEuaWQpO1xuICB9XG5cbiAgc3RhdGljIG1hcChqc29uOiBhbnkpOiBNZXNzYWdlW10ge1xuICAgIGlmIChqc29uKSB7XG4gICAgICByZXR1cm4ganNvbi5tYXAoTWVzc2FnZS5idWlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgICAgICAgcmVhZG9ubHkgY29udGVudDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjb250ZW50VHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBjcmVhdGVkQXQ6IERhdGUsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHNlbmRlcjogVXNlcixcbiAgICAgICAgICAgICAgcmVhZG9ubHkgcm9vbUlkOiBzdHJpbmcpIHt9XG5cbiAgaGFzU2VuZGVySWQodXNlcklkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5zZW5kZXIgJiYgdGhpcy5zZW5kZXIuaWQgPT09IHVzZXJJZDtcbiAgfVxufVxuIl19