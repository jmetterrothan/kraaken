import * as GameEvents from "@src/shared/events";

declare global {
  interface WindowEventMap {
    level_state_switch: GameEvents.LevelStateSwitchEvent;
    editor_state_switch: GameEvents.EditorStateSwitchEvent;
    zoom: GameEvents.ZoomEvent;
    change_level: GameEvents.ChangeLevelEvent;
    spawn_event: GameEvents.SpawnEvent;
    despawn_event: GameEvents.DespawnEvent;
    place_event: GameEvents.PlaceEvent;
    save: GameEvents.SaveEvent;
    user_joined_level: GameEvents.UserJoinedLevelEvent;
    user_left_level: GameEvents.UserLeftLevelEvent;
    ui_undo: void;
    ui_redo: void;
  }
}
export {};
