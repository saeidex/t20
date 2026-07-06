import { afterEach, describe, expect, it, vi } from "vitest";

import { createCLI } from "./create-cli.js";

describe("createCLI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exits when -e has no value", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(((() => {
      throw new Error("EXIT");
    }) as never));

    expect(() =>
      createCLI([
        "node",
        "t20",
        "-i",
        "src/types.d.ts",
        "-o",
        "dist",
        "-e",
      ])
    ).toThrow("EXIT");

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        "Option -e requires one or more entity names. Allowed values: constant, object, view, navItem."
      )
    );
  });

  it("exits when entities includes invalid names", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(((() => {
      throw new Error("EXIT");
    }) as never));

    expect(() =>
      createCLI([
        "node",
        "t20",
        "-i",
        "src/types.d.ts",
        "-e",
        "somethingNotExistInTheEntityType",
      ])
    ).toThrow("EXIT");

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        "Invalid entity name(s): somethingNotExistInTheEntityType. Allowed values: constant, object, view, navItem."
      )
    );
  });
});
