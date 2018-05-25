import { Pipe, PipeTransform } from "@angular/core";
import * as momentLoaded from "moment";
import { Room } from "../room/room.types";
const moment = momentLoaded;

@Pipe({
  name: "sortRooms"
})
export class SortRoomPipe  implements PipeTransform {
  transform(rooms: Room[], field: string): any[] {
    if (rooms !== undefined && rooms !== null) {
      return rooms.sort((room: Room, otherRoom: Room) => {
        const lastActivityAt      = room.lastActivityAt;
        const otherLastActivityAt = otherRoom.lastActivityAt;
        if (moment(lastActivityAt).isBefore(otherLastActivityAt)) {
          return 1;
        } else if (moment(otherLastActivityAt).isBefore(lastActivityAt)) {
          return -1;
        } else {
          return 0;
        }
      });
    } else {
      return rooms;
    }
  }
}
