import { System } from "@src/ECS";
import { PlayerInput, PlayerCombat, Animator, PlayerAnimationKeys } from "@src/ECS/components";

export class PlayerCombatSystem extends System {
  public constructor() {
    super([PlayerInput.COMPONENT_TYPE, PlayerCombat.COMPONENT_TYPE]);
  }

  public execute(delta: number): void {
    const entities = this.world.getEntities(this.componentTypes);
    if (entities.length === 0) {
      return;
    }

    const dtMs = delta * 1000;

    entities.forEach((entity) => {
      const input = entity.getComponent(PlayerInput);
      const combat = entity.getComponent(PlayerCombat);
      const animator = entity.getComponent(Animator);

      const animation = animator.list.get(PlayerAnimationKeys.ATTACK);

      // countdown latch
      if (combat.attackAnimRemainingMs > 0) {
        combat.attackAnimRemainingMs = Math.max(0, combat.attackAnimRemainingMs - dtMs);
        combat.attacking = combat.attackAnimRemainingMs > 0;
      } else {
        combat.attacking = false;
      }

      const usePrimaryPressed = input.attack && !input.prevAttackDown;
      input.prevAttackDown = input.attack;

      if (usePrimaryPressed && combat.primaryWeapon) {
        combat.primaryWeapon.update(this.world, entity);

        combat.attacking = true;
        combat.attackAnimRemainingMs = animation?.duration ?? 0;
      }
    });
  }
}
