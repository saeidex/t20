import { createHash } from "node:crypto";

// UUIDv5-shaped id derived from seed: stable across re-runs, distinct per seed.
export const deriveUuid = (seed: string): string => {
  const hex = createHash("sha1").update(seed).digest("hex");
  const version = `5${hex.slice(13, 16)}`;
  const variant = (
    (parseInt(hex.slice(16, 18), 16) & 0x3f) |
    0x80
  )
    .toString(16)
    .padStart(2, "0");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    version,
    variant + hex.slice(18, 20),
    hex.slice(20, 32),
  ].join("-");
};
