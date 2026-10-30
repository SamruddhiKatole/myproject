import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_EMPLOYER_PREFIX, DEMO_WORKER_PREFIX, seedDemoData } from "../../prisma/seed/demo";
import { seedAdmin, seedReferenceData } from "../../prisma/seed/reference";
import { getTestDb, resetDatabase, testPhone } from "../helpers/db";

const db = getTestDb();

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.$disconnect();
});

async function makeEmployerAndWorker() {
  await seedReferenceData(db);
  const locality = await db.locality.findFirstOrThrow({ where: { slug: "dharampeth" } });
  const category = await db.skillCategory.findFirstOrThrow({ where: { slug: "cook" } });
  const employerUser = await db.user.create({
    data: {
      phoneE164: testPhone(),
      employerProfile: {
        create: {
          displayName: "Test Employer",
          employerType: "HOUSEHOLD",
          localityId: locality.id,
        },
      },
    },
    include: { employerProfile: true },
  });
  const workerUser = await db.user.create({
    data: {
      phoneE164: testPhone(),
      workerProfile: {
        create: { displayName: "Test Worker", localityId: locality.id, bio: "स्वयंपाक आणि घरकाम" },
      },
    },
    include: { workerProfile: true },
  });
  const job = await db.job.create({
    data: {
      employerProfileId: employerUser.employerProfile!.id,
      categoryId: category.id,
      localityId: locality.id,
      title: "Cook for family dinner",
      description: "Vegetarian cooking, पोळी भाजी, evenings only",
      payAmount: 5000,
      payUnit: "MONTH",
      jobType: "PART_TIME_RECURRING",
      status: "OPEN",
    },
  });
  return { employerUser, workerUser, worker: workerUser.workerProfile!, job };
}

describe("reference seed", () => {
  it("is idempotent: running twice gives the same row counts", async () => {
    const first = await seedReferenceData(db);
    const counts1 = [
      await db.city.count(),
      await db.locality.count(),
      await db.skillCategory.count(),
    ];
    await seedReferenceData(db);
    const counts2 = [
      await db.city.count(),
      await db.locality.count(),
      await db.skillCategory.count(),
    ];
    expect(counts1).toEqual([1, first.localities, first.categories]);
    expect(counts2).toEqual(counts1);
  });

  it("creates the admin from ADMIN_PHONE and rejects malformed numbers", async () => {
    const phone = testPhone();
    await seedAdmin(db, phone);
    await seedAdmin(db, phone);
    expect(await db.user.count({ where: { phoneE164: phone, isAdmin: true } })).toBe(1);
    await expect(seedAdmin(db, "9876543210")).rejects.toThrow(/E\.164/);
    await expect(seedAdmin(db, undefined)).resolves.toMatchObject({
      admin: expect.stringContaining("skipped"),
    });
  });
});

describe("unique constraints", () => {
  it("rejects a duplicate phone number", async () => {
    const phone = testPhone();
    await db.user.create({ data: { phoneE164: phone } });
    await expect(db.user.create({ data: { phoneE164: phone } })).rejects.toThrow();
  });

  it("rejects a second application by the same worker to the same job", async () => {
    const { worker, job } = await makeEmployerAndWorker();
    await db.application.create({ data: { jobId: job.id, workerProfileId: worker.id } });
    await expect(
      db.application.create({ data: { jobId: job.id, workerProfileId: worker.id } }),
    ).rejects.toThrow();
  });

  it("rejects a second review by the same author for the same application", async () => {
    const { employerUser, workerUser, worker, job } = await makeEmployerAndWorker();
    const application = await db.application.create({
      data: { jobId: job.id, workerProfileId: worker.id, status: "COMPLETED" },
    });
    const review = {
      applicationId: application.id,
      authorUserId: employerUser.id,
      subjectUserId: workerUser.id,
      subjectRole: "WORKER" as const,
      rating: 5,
    };
    await db.review.create({ data: review });
    await expect(db.review.create({ data: { ...review, rating: 4 } })).rejects.toThrow();
  });
});

describe("CHECK constraints", () => {
  it("rejects a rating outside 1–5", async () => {
    const { employerUser, workerUser, worker, job } = await makeEmployerAndWorker();
    const application = await db.application.create({
      data: { jobId: job.id, workerProfileId: worker.id },
    });
    await expect(
      db.review.create({
        data: {
          applicationId: application.id,
          authorUserId: employerUser.id,
          subjectUserId: workerUser.id,
          subjectRole: "WORKER",
          rating: 6,
        },
      }),
    ).rejects.toThrow();
  });

  it("rejects hiredCount above openings and out-of-range pay", async () => {
    const { job } = await makeEmployerAndWorker();
    await expect(
      db.job.update({ where: { id: job.id }, data: { hiredCount: 2, openings: 1 } }),
    ).rejects.toThrow();
    await expect(
      db.job.update({ where: { id: job.id }, data: { payAmount: 0 } }),
    ).rejects.toThrow();
  });

  it("rejects a user blocking themselves", async () => {
    const user = await db.user.create({ data: { phoneE164: testPhone() } });
    await expect(
      db.block.create({ data: { blockerUserId: user.id, blockedUserId: user.id } }),
    ).rejects.toThrow();
  });
});

describe("gender fields (D-015)", () => {
  it("defaults genderRequirement to ANY and stores worker gender as optional", async () => {
    const { job, worker } = await makeEmployerAndWorker();
    expect(job.genderRequirement).toBe("ANY");
    expect(worker.gender).toBeNull();
    const updated = await db.workerProfile.update({
      where: { id: worker.id },
      data: { gender: "WOMAN" },
    });
    expect(updated.gender).toBe("WOMAN");
  });
});

describe("full-text search", () => {
  it("finds a job by an English keyword and a Devanagari keyword via the generated column", async () => {
    const { job } = await makeEmployerAndWorker();
    const byEnglish = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Job" WHERE "searchVector" @@ plainto_tsquery('simple', 'vegetarian')`;
    const byMarathi = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Job" WHERE "searchVector" @@ plainto_tsquery('simple', 'भाजी')`;
    expect(byEnglish.map((r) => r.id)).toContain(job.id);
    expect(byMarathi.map((r) => r.id)).toContain(job.id);
  });

  it("keeps the search vector in sync after an update", async () => {
    const { job } = await makeEmployerAndWorker();
    await db.job.update({ where: { id: job.id }, data: { title: "Tiffin cook" } });
    const rows = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Job" WHERE "searchVector" @@ plainto_tsquery('simple', 'tiffin')`;
    expect(rows.map((r) => r.id)).toContain(job.id);
  });

  it("indexes worker bios in Marathi", async () => {
    const { worker } = await makeEmployerAndWorker();
    const rows = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "WorkerProfile" WHERE "searchVector" @@ plainto_tsquery('simple', 'घरकाम')`;
    expect(rows.map((r) => r.id)).toContain(worker.id);
  });
});

describe("demo seed", () => {
  it("creates applications in every status and only uses reserved demo numbers", async () => {
    const counts = await seedDemoData(db);
    expect(counts).toMatchObject({ workers: 40, employers: 15, jobs: 40 });

    const statuses = await db.application.groupBy({ by: ["status"], _count: true });
    expect(statuses.map((s) => s.status).sort()).toEqual([
      "APPLIED",
      "CANCELLED",
      "CLOSED",
      "COMPLETED",
      "DECLINED",
      "HIRED",
      "OFFERED",
      "REJECTED",
      "SHORTLISTED",
      "WITHDRAWN",
    ]);

    const nonDemo = await db.user.count({
      where: {
        NOT: [
          { phoneE164: { startsWith: DEMO_WORKER_PREFIX } },
          { phoneE164: { startsWith: DEMO_EMPLOYER_PREFIX } },
        ],
      },
    });
    expect(nonDemo).toBe(0);
  });

  it("never pairs a worker with a restricted job they don't qualify for", async () => {
    await seedDemoData(db);
    const mismatches = await db.application.count({
      where: {
        OR: [
          { job: { genderRequirement: "WOMEN_ONLY" }, NOT: { workerProfile: { gender: "WOMAN" } } },
          { job: { genderRequirement: "MEN_ONLY" }, NOT: { workerProfile: { gender: "MAN" } } },
        ],
      },
    });
    expect(mismatches).toBe(0);
  });

  it("can be re-run without duplicating data", async () => {
    await seedDemoData(db);
    const first = await db.user.count();
    await seedDemoData(db);
    expect(await db.user.count()).toBe(first);
  });

  it("refuses to run when NODE_ENV=production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      await expect(seedDemoData(db)).rejects.toThrow(/production/);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
