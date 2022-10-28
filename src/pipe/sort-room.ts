import { Pipe, PipeTransform } from "@angular/core";
import { Room, sortRoomByLastActivityDesc } from "../room/room.types";

@Pipe({
  name: "sortRooms"
})
export class SortRoomPipe implements PipeTransform {
  transform(rooms: Room[], ..._arg): Room[] {
    return sortRoomByLastActivityDesc(rooms);
  }
}
