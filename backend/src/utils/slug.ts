import type { PrismaClient } from "@prisma/client";
import crypto from "crypto";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "org";
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function uniqueTenantSlug(
  prisma: PrismaClient,
  name: string,
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let attempt = 0;

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return slug;
}
