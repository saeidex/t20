import type { Entity } from "../create-cli.js";

export function isEntityIncludes(
  entities: Array<Entity> | undefined,
  entity: Entity
): boolean {
  if (!entities || entities.length === 0) return true;
  return entities.includes(entity);
}
