import { describe, it, expect } from "vitest";
import { Solocoder } from "../src/core.js";
describe("Solocoder", () => {
  it("init", () => { expect(new Solocoder().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Solocoder(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Solocoder(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
