import io from "socket.io-client";

import dispatch, * as GameEvents from "@src/shared/events";

import { IPlaceData, ISpawnpoint } from "@shared/models/world.model";

import config from "@src/config";

const WS_PLACE_EVENT = "place";
const WS_SPAWN_EVENT = "spawn";
const WS_DESPAWN_EVENT = "despawn";

const WS_USER_JOINED_ROOM = "user_joined_room";
const WS_USER_LEFT_ROOM = "user_left_room";

class WebSocketService {
  private socket;

  connect(): Promise<void> {
    return new Promise((resolve) => {
      this.socket = io(config.WEBSOCKET_API);

      this.socket.on("connect", () => {
        console.info(`Connected`);

        this.socket.on("disconnect", () => {
          console.info(`Disconnected`);
        });

        this.socket.on(WS_PLACE_EVENT, ({ data, options }) => {
          dispatch(GameEvents.placeEvent(data.layerId, data.tileTypeId, data.coords, options.pushToStack));
        });

        this.socket.on(WS_SPAWN_EVENT, ({ data, options }) => {
          dispatch(
            GameEvents.spawnEvent(
              data.uuid, //
              data.type,
              data.position,
              data.direction,
              data.debug,
              options.pushToStack
            )
          );
        });

        this.socket.on(WS_DESPAWN_EVENT, ({ data: uuid, options }) => {
          dispatch(GameEvents.despawnEvent(uuid, options.pushToStack));
        });

        this.socket.on(WS_USER_JOINED_ROOM, (uuid) => {
          console.log(`user ${uuid} joined room`);
          dispatch(GameEvents.userJoinedRoomEvent(uuid));
        });

        this.socket.on(WS_USER_LEFT_ROOM, (uuid) => {
          console.log(`user ${uuid} left room`);
          dispatch(GameEvents.userLeftRoomEvent(uuid));
        });

        resolve();
      });
    });
  }

  joinRoom(roomId): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject();
      }

      this.socket.emit("join_room", roomId);
      resolve();
    });
  }

  placeEvent(roomId: string, data: IPlaceData, pushToStack: boolean) {
    return this.emitEvent(roomId, WS_PLACE_EVENT, data, { pushToStack });
  }

  spawnEvent(roomId: string, data: ISpawnpoint, pushToStack: boolean) {
    return this.emitEvent(roomId, WS_SPAWN_EVENT, data, { pushToStack });
  }

  despawnEvent(roomId: string, uuid: string, pushToStack: boolean) {
    return this.emitEvent(roomId, WS_DESPAWN_EVENT, uuid, { pushToStack });
  }

  private emitEvent<T = any>(roomId: string, type: string, data: T, options: Record<string, any> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject();
      }

      this.socket.emit("event", { roomId, event: { type, data, options } });
      resolve();
    });
  }
}

export const wsSvc = new WebSocketService();
