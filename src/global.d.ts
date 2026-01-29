import * as GameEvents from "@src/shared/events";

declare global {
  interface WindowEventMap {
    level_state_switch: GameEvents.LevelStateSwitchEvent;
    editor_state_switch: GameEvents.EditorStateSwitchEvent;
    zoom: GameEvents.ZoomEvent;
    change_room: GameEvents.ChangeRoomEvent;
    spawn_event: GameEvents.SpawnEvent;
    despawn_event: GameEvents.DespawnEvent;
    place_event: GameEvents.PlaceEvent;
    save: GameEvents.SaveEvent;
    user_joined_room: GameEvents.UserJoinedRoomEvent;
    user_left_room: GameEvents.UserLeftRoomEvent;
    ui_undo: void;
    ui_redo: void;
    shake_camera: GameEvents.ShakeCameraEvent;
  }
}
export {};
