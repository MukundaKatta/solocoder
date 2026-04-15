/**
 * Lightweight unified-diff generator for showing agent edits in the UI.
 *
 * Produces a standard unified diff with context lines, chunk headers,
 * and a Myers-style LCS-based hunk split. Zero dependencies — safe to
 * run in the browser for side-by-side preview.
 */

export type DiffLine =
  | { type: "ctx"; text: string; a: number; b: number }
  | { type: "add"; text: string; b: number }
  | { type: "del"; text: string; a: number };

export type Hunk = {
  aStart: number;
  aCount: number;
  bStart: number;
  bCount: number;
  lines: DiffLine[];
};

/** Longest Common Subsequence lengths table (space O(n*m)). */
function lcs(a: string[], b: string[]): number[][] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

/** Walk the DP table backwards to produce the raw edit script. */
function backtrack(a: string[], b: string[]): DiffLine[] {
  const dp = lcs(a, b);
  const out: DiffLine[] = [];
  let i = a.length, j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.push({ type: "ctx", text: a[i - 1], a: i, b: j });
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.push({ type: "del", text: a[i - 1], a: i });
      i--;
    } else {
      out.push({ type: "add", text: b[j - 1], b: j });
      j--;
    }
  }
  while (i > 0) { out.push({ type: "del", text: a[i - 1], a: i }); i--; }
  while (j > 0) { out.push({ type: "add", text: b[j - 1], b: j }); j--; }
  return out.reverse();
}

/** Split the edit script into hunks with N lines of context. */
export function diff(before: string, after: string, context = 3): Hunk[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const script = backtrack(a, b);
  const hunks: Hunk[] = [];
  let i = 0;
  while (i < script.length) {
    while (i < script.length && script[i].type === "ctx") i++;
    if (i >= script.length) break;
    const start = Math.max(0, i - context);
    let end = i;
    while (end < script.length) {
      if (script[end].type !== "ctx") { end++; continue; }
      let ctxRun = 0;
      while (end + ctxRun < script.length && script[end + ctxRun].type === "ctx") ctxRun++;
      if (ctxRun >= 2 * context) break;
      end += ctxRun;
    }
    const sliceEnd = Math.min(script.length, end + context);
    const lines = script.slice(start, sliceEnd);
    const firstA = lines.find((l): l is Exclude<DiffLine, { type: "add" }> => l.type !== "add");
    const firstB = lines.find((l): l is Exclude<DiffLine, { type: "del" }> => l.type !== "del");
    const aCount = lines.filter((l) => l.type !== "add").length;
    const bCount = lines.filter((l) => l.type !== "del").length;
    hunks.push({
      aStart: firstA ? firstA.a : 1,
      aCount,
      bStart: firstB ? firstB.b : 1,
      bCount,
      lines,
    });
    i = sliceEnd;
  }
  return hunks;
}

export function toUnifiedDiff(
  before: string,
  after: string,
  filename = "file",
  context = 3,
): string {
  const hunks = diff(before, after, context);
  if (hunks.length === 0) return "";
  const header = `--- a/${filename}\n+++ b/${filename}\n`;
  const body = hunks
    .map((h) => {
      const head = `@@ -${h.aStart},${h.aCount} +${h.bStart},${h.bCount} @@`;
      const body = h.lines
        .map((l) => {
          if (l.type === "ctx") return ` ${l.text}`;
          if (l.type === "add") return `+${l.text}`;
          return `-${l.text}`;
        })
        .join("\n");
      return `${head}\n${body}`;
    })
    .join("\n");
  return header + body + "\n";
}
