/**
 * Patch conflict detection for the autonomous coding loop.
 *
 * solocoder generates diffs in parallel across multiple tasks. Before
 * applying them we need to know whether two patches touch the same
 * lines (real conflict), adjacent lines (risky), or disjoint regions
 * (safe to apply in any order). This module works on unified-diff
 * hunks only — no repo access — so it's easy to run in a worker.
 */

export type Hunk = {
  filePath: string;
  oldStart: number;          // 1-indexed line in the old file
  oldLines: number;
  newStart: number;
  newLines: number;
  text: string;
};

export type Patch = {
  id: string;
  taskId: string;
  hunks: Hunk[];
};

export type Conflict = {
  a: string;
  b: string;
  filePath: string;
  kind: "overlap" | "adjacent" | "same-file";
  aRange: [number, number];
  bRange: [number, number];
};

/** Parse a unified diff into Hunks. Accepts `diff --git` or plain form. */
export function parseUnifiedDiff(diff: string): Hunk[] {
  const lines = diff.split("\n");
  const hunks: Hunk[] = [];
  let filePath = "";
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("+++ ")) {
      filePath = line.slice(4).replace(/^b\//, "").replace(/\s.*$/, "");
      i++;
      continue;
    }
    const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (!m) { i++; continue; }
    const oldStart = parseInt(m[1], 10);
    const oldLines = m[2] ? parseInt(m[2], 10) : 1;
    const newStart = parseInt(m[3], 10);
    const newLines = m[4] ? parseInt(m[4], 10) : 1;
    const body: string[] = [];
    i++;
    while (i < lines.length && !lines[i].startsWith("@@") && !lines[i].startsWith("+++ ") && !lines[i].startsWith("diff ")) {
      body.push(lines[i]);
      i++;
    }
    hunks.push({ filePath, oldStart, oldLines, newStart, newLines, text: body.join("\n") });
  }
  return hunks;
}

function rangesOverlap(a: [number, number], b: [number, number]): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

function rangesAdjacent(a: [number, number], b: [number, number], slack: number): boolean {
  if (rangesOverlap(a, b)) return false;
  return Math.abs(a[1] - b[0]) <= slack || Math.abs(b[1] - a[0]) <= slack;
}

export type DetectOptions = {
  adjacencySlackLines: number;  // treat hunks within N lines as adjacent
};

export const DEFAULT_DETECT_OPTIONS: DetectOptions = { adjacencySlackLines: 3 };

/** Pairwise conflict report. Quadratic in hunks — fine for <1000. */
export function detectConflicts(
  patches: Patch[],
  opts: DetectOptions = DEFAULT_DETECT_OPTIONS,
): Conflict[] {
  const out: Conflict[] = [];
  for (let i = 0; i < patches.length; i++) {
    for (let j = i + 1; j < patches.length; j++) {
      const a = patches[i];
      const b = patches[j];
      for (const ha of a.hunks) {
        for (const hb of b.hunks) {
          if (ha.filePath !== hb.filePath) continue;
          const aRange: [number, number] = [ha.oldStart, ha.oldStart + ha.oldLines - 1];
          const bRange: [number, number] = [hb.oldStart, hb.oldStart + hb.oldLines - 1];
          if (rangesOverlap(aRange, bRange)) {
            out.push({ a: a.id, b: b.id, filePath: ha.filePath, kind: "overlap", aRange, bRange });
          } else if (rangesAdjacent(aRange, bRange, opts.adjacencySlackLines)) {
            out.push({ a: a.id, b: b.id, filePath: ha.filePath, kind: "adjacent", aRange, bRange });
          } else {
            // same file but no line-level touch — logged so UI can group
            out.push({ a: a.id, b: b.id, filePath: ha.filePath, kind: "same-file", aRange, bRange });
          }
        }
      }
    }
  }
  return out;
}

/** Topologically order patches so conflicting ones are serialised. */
export function orderForApply(patches: Patch[], conflicts: Conflict[]): string[][] {
  const blockers = new Map<string, Set<string>>();
  for (const p of patches) blockers.set(p.id, new Set());
  for (const c of conflicts) {
    if (c.kind === "same-file") continue;
    // enforce order by earliest patch id to be deterministic
    const [first, second] = [c.a, c.b].sort();
    blockers.get(second)!.add(first);
  }
  const waves: string[][] = [];
  const done = new Set<string>();
  while (done.size < patches.length) {
    const wave = patches
      .filter((p) => !done.has(p.id))
      .filter((p) => [...blockers.get(p.id)!].every((b) => done.has(b)))
      .map((p) => p.id)
      .sort();
    if (wave.length === 0) break; // should not happen — deterministic sort breaks ties
    for (const id of wave) done.add(id);
    waves.push(wave);
  }
  return waves;
}
