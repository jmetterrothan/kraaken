import io, { Socket } from "socket.io-client";

import dispatch, * as GameEvents from "@src/shared/events";

import { IPlaceData, ISpawnpoint } from "@src/shared/models/world.model";

import config from "@src/config";

const WS_PLACE_EVENT = "place";
const WS_SPAWN_EVENT = "spawn";
const WS_DESPAWN_EVENT = "despawn";

const WS_USER_JOINED_LEVEL = "user_joined_level";
const WS_USER_LEFT_LEVEL = "user_left_level";

class WebSocketService {
  private socket: Socket = io(config.WEBSOCKET_API);

  connect(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.on("connect", () => {
        console.info(`Connected`);

        this.socket.on("disconnect", () => {
          console.info(`Disconnected`);
        });

        this.socket.on(WS_PLACE_EVENT, ({ data, options }) => {
          dispatch(GameEvents.placeEvent(data.layerId, data.coords, options.pushToStack));
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

        this.socket.on(WS_USER_JOINED_LEVEL, (uuid) => {
          console.log(`user ${uuid} joined level`);
          dispatch(GameEvents.userJoinedLevelEvent(uuid));
        });

        this.socket.on(WS_USER_LEFT_LEVEL, (uuid) => {
          console.log(`user ${uuid} left level`);
          dispatch(GameEvents.userLeftLevelEvent(uuid));
        });

        resolve();
      });
    });
  }

  sync(levelId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject();
      }

      this.socket.emit("sync_level", levelId);
      resolve();
    });
  }

  joinLevel(levelId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject();
      }

      this.socket.emit("join_level", levelId);
      resolve();
    });
  }

  resetLevel(levelId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject();
      }

      this.socket.emit("reset_level", levelId);
      resolve();
    });
  }

  placeEvent(levelId: string, data: IPlaceData, pushToStack: boolean) {
    return this.emitEvent(levelId, WS_PLACE_EVENT, data, { pushToStack });
  }

  spawnEvent(levelId: string, data: ISpawnpoint, pushToStack: boolean) {
    return this.emitEvent(levelId, WS_SPAWN_EVENT, data, { pushToStack });
  }

  despawnEvent(levelId: string, uuid: string, pushToStack: boolean) {
    return this.emitEvent(levelId, WS_DESPAWN_EVENT, uuid, { pushToStack });
  }

  private emitEvent<T = any>(levelId: string, type: string, data: T, options: Record<string, any> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject();
      }

      this.socket.emit("event", { levelId, event: { type, data, options } });
      resolve();
    });
  }
}

export const wsSvc = new WebSocketService();
