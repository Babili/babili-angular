import { Pipe, PipeTransform } from "@angular/core";
import dayjs from "dayjs";
import { Room, sortRoomByLastActivityDesc } from "../room/room.types";

@Pipe({
  name: "sortRooms"
})
export class SortRoomPipe implements PipeTransform {
  transform(rooms: Room[], _field: string): any[] {
    return sortRoomByLastActivityDesc(rooms);
  }
}
