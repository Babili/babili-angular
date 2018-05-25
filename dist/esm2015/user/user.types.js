/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
export class User {
    /**
     * @param {?} id
     * @param {?} status
     */
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static build(json) {
        if (json) {
            return new User(json.id, json.attributes ? json.attributes.status : undefined);
        }
        else {
            return undefined;
        }
    }
    /**
     * @param {?} json
     * @return {?}
     */
    static map(json) {
        if (json) {
            return json.map(User.build);
        }
        else {
            return undefined;
        }
    }
}
function User_tsickle_Closure_declarations() {
    /** @type {?} */
    User.prototype.id;
    /** @type {?} */
    User.prototype.status;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkvYW5ndWxhci8iLCJzb3VyY2VzIjpbInVzZXIvdXNlci50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsTUFBTTs7Ozs7SUFpQkosWUFBcUIsRUFBVSxFQUNWLE1BQWM7UUFEZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsV0FBTSxHQUFOLE1BQU0sQ0FBUTtLQUFJOzs7OztJQWpCdkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFTO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDaEY7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxTQUFTLENBQUM7U0FDbEI7S0FDRjs7Ozs7SUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQVM7UUFDbEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM3QjtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLFNBQVMsQ0FBQztTQUNsQjtLQUNGO0NBSUYiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgVXNlciB7XG4gIHN0YXRpYyBidWlsZChqc29uOiBhbnkpOiBVc2VyIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIG5ldyBVc2VyKGpzb24uaWQsIGpzb24uYXR0cmlidXRlcyA/IGpzb24uYXR0cmlidXRlcy5zdGF0dXMgOiB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBtYXAoanNvbjogYW55KTogVXNlcltdIHtcbiAgICBpZiAoanNvbikge1xuICAgICAgcmV0dXJuIGpzb24ubWFwKFVzZXIuYnVpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHJlYWRvbmx5IHN0YXR1czogc3RyaW5nKSB7fVxufVxuIl19