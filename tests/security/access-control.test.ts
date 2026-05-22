import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const paidRoutes = [
  "src/app/api/subjects/route.ts",
  "src/app/api/subjects/[slug]/topics/route.ts",
  "src/app/api/topics/[id]/lesson/route.ts",
  "src/app/api/topics/[id]/questions/route.ts",
  "src/app/api/topics/[id]/attempts/route.ts",
  "src/app/api/topics/[id]/ask/route.ts",
  "src/app/api/mock-exam/route.ts",
];

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function exportedHandlerBody(text: string, method: string): string {
  const pattern = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*{`);
  const match = pattern.exec(text);
  expect(match, `Expected exported ${method} handler`).not.toBeNull();

  let depth = 1;
  let index = (match?.index ?? 0) + (match?.[0].length ?? 0);

  for (; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return text.slice((match?.index ?? 0) + (match?.[0].length ?? 0), index);
  }

  throw new Error(`Could not find end of exported ${method} handler`);
}

function expectHandlerRequiresPurchase(text: string, method: string): void {
  expect(exportedHandlerBody(text, method)).toMatch(/await requirePurchased\(\)/);
}

describe("paid API access control", () => {
  it.each(paidRoutes)("%s requires purchase", (path) => {
    const text = source(path);
    expect(text).toContain("requirePurchased");
    expect(text).toMatch(/await requirePurchased\(\)/);
  });

  it("guards each mock exam handler method", () => {
    const text = source("src/app/api/mock-exam/route.ts");

    expectHandlerRequiresPurchase(text, "GET");
    expectHandlerRequiresPurchase(text, "POST");
    expectHandlerRequiresPurchase(text, "PATCH");
  });

  it("auth library exposes a purchase-required guard", () => {
    const text = source("src/lib/auth.ts");
    expect(text).toContain("export async function requirePurchased");
    expect(text).toContain("Purchase required");
    expect(text).toContain("{ status: 403 }");
  });
});
