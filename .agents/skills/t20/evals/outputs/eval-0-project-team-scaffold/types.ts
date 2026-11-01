/**
 * types.ts — input file for @saeidex/t20 scaffold
 *
 * Objects: Project, Client, Team
 *
 * Notes:
 *  - `id` and `name` are intentionally omitted: Twenty provides them,
 *    and t20 skips them unconditionally during field extraction.
 *  - Project↔Team uses reciprocal arrays to trigger t20's automatic
 *    many-to-many junction synthesis (ProjectTeam).
 *  - Project↔Client uses a single object ref (many-to-one) on Project
 *    and a reciprocal array (one-to-many) on Client.
 *  - `status` is a literal union → SELECT field (synthesized enum).
 *  - `tags` is an array of a literal union → MULTI_SELECT field (synthesized enum).
 *  - `budget` is number → NUMBER field.
 *  - `company` is string → TEXT field.
 */

export interface Project {
  title: string;
  budget: number;
  status: "active" | "paused" | "done";
  tags: ("internal" | "client" | "urgent")[];
  client: Client;
  teams: Team[];
}

export interface Client {
  company: string;
  projects: Project[];
}

export interface Team {
  projects: Project[];
}
