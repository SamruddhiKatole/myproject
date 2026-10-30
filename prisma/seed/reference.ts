import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import type { PrismaClient } from "../../src/generated/prisma/client";

/** Generous box around Nagpur city; any seeded centroid outside it is a data error. */
export const NAGPUR_BOUNDS = { minLat: 21.0, maxLat: 21.25, minLng: 78.95, maxLng: 79.2 } as const;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase-kebab slug");
const names = { nameEn: z.string().min(1), nameHi: z.string().min(1), nameMr: z.string().min(1) };

const localitiesFileSchema = z.object({
  city: z.object({ slug, ...names }),
  localities: z
    .array(
      z.object({
        slug,
        ...names,
        lat: z.number().min(NAGPUR_BOUNDS.minLat).max(NAGPUR_BOUNDS.maxLat),
        lng: z.number().min(NAGPUR_BOUNDS.minLng).max(NAGPUR_BOUNDS.maxLng),
      }),
    )
    .min(1),
});

const categoriesFileSchema = z.object({
  categories: z.array(z.object({ slug, icon: z.string().min(1), ...names })).min(1),
});

function readJson(relativePath: string): unknown {
  const path = fileURLToPath(new URL(relativePath, import.meta.url));
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertUniqueSlugs(kind: string, items: { slug: string }[]) {
  const seen = new Set<string>();
  for (const { slug: s } of items) {
    if (seen.has(s)) throw new Error(`Duplicate ${kind} slug in seed data: ${s}`);
    seen.add(s);
  }
}

export function loadLocalities() {
  const data = localitiesFileSchema.parse(readJson("./data/nagpur-localities.json"));
  assertUniqueSlugs("locality", data.localities);
  return data;
}

export function loadCategories() {
  const data = categoriesFileSchema.parse(readJson("./data/categories.json"));
  assertUniqueSlugs("category", data.categories);
  return data;
}

/** Idempotent: safe to run on every deploy and in every environment. */
export async function seedReferenceData(db: PrismaClient) {
  const { city, localities } = loadLocalities();
  const { categories } = loadCategories();

  const cityRow = await db.city.upsert({
    where: { slug: city.slug },
    create: city,
    update: { nameEn: city.nameEn, nameHi: city.nameHi, nameMr: city.nameMr },
  });

  for (const locality of localities) {
    await db.locality.upsert({
      where: { cityId_slug: { cityId: cityRow.id, slug: locality.slug } },
      create: { ...locality, cityId: cityRow.id },
      update: {
        nameEn: locality.nameEn,
        nameHi: locality.nameHi,
        nameMr: locality.nameMr,
        lat: locality.lat,
        lng: locality.lng,
      },
    });
  }

  for (const [index, category] of categories.entries()) {
    const sortOrder = (index + 1) * 10;
    await db.skillCategory.upsert({
      where: { slug: category.slug },
      create: { ...category, sortOrder },
      update: {
        icon: category.icon,
        nameEn: category.nameEn,
        nameHi: category.nameHi,
        nameMr: category.nameMr,
        sortOrder,
      },
    });
  }

  return { cities: 1, localities: localities.length, categories: categories.length };
}

const indianMobileE164 = /^\+91[6-9]\d{9}$/;

/** Creates or promotes the admin account from ADMIN_PHONE. The number is never logged. */
export async function seedAdmin(db: PrismaClient, adminPhone: string | undefined) {
  if (!adminPhone) return { admin: "skipped (ADMIN_PHONE not set)" };
  if (!indianMobileE164.test(adminPhone)) {
    throw new Error(
      "ADMIN_PHONE must be an Indian mobile number in E.164 form, e.g. +9198xxxxxxxx",
    );
  }
  await db.user.upsert({
    where: { phoneE164: adminPhone },
    create: { phoneE164: adminPhone, isAdmin: true, locale: "en" },
    update: { isAdmin: true },
  });
  return { admin: "ensured" };
}
