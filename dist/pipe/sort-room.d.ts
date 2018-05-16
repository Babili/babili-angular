import { PipeTransform } from "@angular/core";
import { Room } from "../room/room.types";
export declare class SortRoomPipe implements PipeTransform {
    transform(rooms: Room[], field: string): any[];
}
