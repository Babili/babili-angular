/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var User = /** @class */ (function () {
    function User(id, status) {
        this.id = id;
        this.status = status;
    }
    /**
     * @param {?} json
     * @return {?}
     */
    User.build = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        if (json) {
            return new User(json.id, json.attributes ? json.attributes.status : undefined);
        }
        else {
            return undefined;
        }
    };
    /**
     * @param {?} json
     * @return {?}
     */
    User.map = /**
     * @param {?} json
     * @return {?}
     */
    function (json) {
        if (json) {
            return json.map(User.build);
        }
        else {
            return undefined;
        }
    };
    return User;
}());
export { User };
function User_tsickle_Closure_declarations() {
    /** @type {?} */
    User.prototype.id;
    /** @type {?} */
    User.prototype.status;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci50eXBlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BiYWJpbGkuaW8vYW5ndWxhci8iLCJzb3VyY2VzIjpbInVzZXIvdXNlci50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBQTtJQWlCRSxjQUFxQixFQUFVLEVBQ1YsTUFBYztRQURkLE9BQUUsR0FBRixFQUFFLENBQVE7UUFDVixXQUFNLEdBQU4sTUFBTSxDQUFRO0tBQUk7Ozs7O0lBakJoQyxVQUFLOzs7O0lBQVosVUFBYSxJQUFTO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDaEY7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxTQUFTLENBQUM7U0FDbEI7S0FDRjs7Ozs7SUFFTSxRQUFHOzs7O0lBQVYsVUFBVyxJQUFTO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxTQUFTLENBQUM7U0FDbEI7S0FDRjtlQWZIO0lBbUJDLENBQUE7QUFuQkQsZ0JBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFVzZXIge1xuICBzdGF0aWMgYnVpbGQoanNvbjogYW55KTogVXNlciB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBuZXcgVXNlcihqc29uLmlkLCBqc29uLmF0dHJpYnV0ZXMgPyBqc29uLmF0dHJpYnV0ZXMuc3RhdHVzIDogdW5kZWZpbmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbWFwKGpzb246IGFueSk6IFVzZXJbXSB7XG4gICAgaWYgKGpzb24pIHtcbiAgICAgIHJldHVybiBqc29uLm1hcChVc2VyLmJ1aWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICAgICAgICByZWFkb25seSBzdGF0dXM6IHN0cmluZykge31cbn1cbiJdfQ==