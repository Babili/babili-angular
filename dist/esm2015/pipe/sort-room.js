/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Pipe } from "@angular/core";
import * as momentLoaded from "moment";
const /** @type {?} */ moment = momentLoaded;
export class SortRoomPipe {
    /**
     * @param {?} rooms
     * @param {?} field
     * @return {?}
     */
    transform(rooms, field) {
        if (rooms !== undefined && rooms !== null) {
            return rooms.sort((room, otherRoom) => {
                const /** @type {?} */ lastActivityAt = room.lastActivityAt;
                const /** @type {?} */ otherLastActivityAt = otherRoom.lastActivityAt;
                if (moment(lastActivityAt).isBefore(otherLastActivityAt)) {
                    return 1;
                }
                else if (moment(otherLastActivityAt).isBefore(lastActivityAt)) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
        }
        else {
            return rooms;
        }
    }
}
SortRoomPipe.decorators = [
    { type: Pipe, args: [{
                name: "sortRooms"
            },] },
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1yb29tLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGJhYmlsaS9hbmd1bGFyLyIsInNvdXJjZXMiOlsicGlwZS9zb3J0LXJvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sS0FBSyxZQUFZLE1BQU0sUUFBUSxDQUFDO0FBRXZDLHVCQUFNLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFLNUIsTUFBTTs7Ozs7O0lBQ0osU0FBUyxDQUFDLEtBQWEsRUFBRSxLQUFhO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFVLEVBQUUsU0FBZSxFQUFFLEVBQUU7Z0JBQ2hELHVCQUFNLGNBQWMsR0FBUSxJQUFJLENBQUMsY0FBYyxDQUFDO2dCQUNoRCx1QkFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUNyRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUNWO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ1g7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDVjthQUNGLENBQUMsQ0FBQztTQUNKO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsS0FBSyxDQUFDO1NBQ2Q7S0FDRjs7O1lBcEJGLElBQUksU0FBQztnQkFDSixJQUFJLEVBQUUsV0FBVzthQUNsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgbW9tZW50TG9hZGVkIGZyb20gXCJtb21lbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwiLi4vcm9vbS9yb29tLnR5cGVzXCI7XG5jb25zdCBtb21lbnQgPSBtb21lbnRMb2FkZWQ7XG5cbkBQaXBlKHtcbiAgbmFtZTogXCJzb3J0Um9vbXNcIlxufSlcbmV4cG9ydCBjbGFzcyBTb3J0Um9vbVBpcGUgIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybShyb29tczogUm9vbVtdLCBmaWVsZDogc3RyaW5nKTogYW55W10ge1xuICAgIGlmIChyb29tcyAhPT0gdW5kZWZpbmVkICYmIHJvb21zICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcm9vbXMuc29ydCgocm9vbTogUm9vbSwgb3RoZXJSb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RBY3Rpdml0eUF0ICAgICAgPSByb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBjb25zdCBvdGhlckxhc3RBY3Rpdml0eUF0ID0gb3RoZXJSb29tLmxhc3RBY3Rpdml0eUF0O1xuICAgICAgICBpZiAobW9tZW50KGxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShvdGhlckxhc3RBY3Rpdml0eUF0KSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKG1vbWVudChvdGhlckxhc3RBY3Rpdml0eUF0KS5pc0JlZm9yZShsYXN0QWN0aXZpdHlBdCkpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuICB9XG59XG4iXX0=