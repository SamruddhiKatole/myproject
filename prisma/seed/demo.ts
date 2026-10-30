// Demo dataset for local development and staging. Run with `npm run db:seed:demo` (demo-run.ts).
// Refuses to run in production. Every demo phone number is in the reserved fake block
// +91999991xxxx (workers) / +91999992xxxx (employers); tests use +91999990xxxx.
import type {
  ApplicationStatus,
  EmployerType,
  Gender,
  GenderRequirement,
  JobStatus,
  JobType,
  PayUnit,
  PrismaClient,
} from "../../src/generated/prisma/client";
import { seedReferenceData } from "./reference";

export const DEMO_WORKER_PREFIX = "+91999991";
export const DEMO_EMPLOYER_PREFIX = "+91999992";

const WORKER_COUNT = 40;
const EMPLOYER_COUNT = 15;
const JOB_COUNT = 40;

const workerNames = [
  "Sunita Bawne",
  "Ramesh Meshram",
  "Akash Uikey",
  "Kavita Dhote",
  "Sanjay Gajbhiye",
  "Rekha Sontakke",
  "Prakash Wankhede",
  "Manda Raut",
  "Vijay Bhoyar",
  "Shobha Khobragade",
  "Raju Kumbhare",
  "Lata Ingle",
  "Ganesh Thakre",
  "Sarita Nagrale",
  "Dinesh Mohod",
  "Asha Pawar",
  "Santosh Chaudhari",
  "Vandana Lokhande",
  "Anil Fulzele",
  "Pushpa Borkar",
];
const employerNames = [
  "Meera Deshpande",
  "Patil Constructions",
  "Shree Kirana Stores",
  "Joshi Household",
  "Kale Builders",
  "Annapurna Tiffins",
  "Gupta Hardware",
  "Rao Family",
  "Sai Electricals",
  "Nagpur Paints & Co",
  "Kulkarni Household",
  "Bhosale Contractors",
  "Green Leaf Café",
  "Agrawal Textiles",
  "Deshmukh Household",
];
const employerTypes: EmployerType[] = [
  "HOUSEHOLD",
  "CONTRACTOR",
  "SHOP",
  "HOUSEHOLD",
  "CONTRACTOR",
  "BUSINESS",
];
const genders: (Gender | null)[] = [
  "WOMAN",
  "MAN",
  "WOMAN",
  "MAN",
  "OTHER",
  "PREFER_NOT_TO_SAY",
  null,
];

interface JobTemplate {
  category: string;
  title: string;
  description: string;
  payAmount: number;
  payUnit: PayUnit;
  jobType: JobType;
  scheduleText: string;
  genderRequirement: GenderRequirement;
}

const jobTemplates: JobTemplate[] = [
  {
    category: "house-help",
    title: "Morning house help for 2BHK",
    description: "Sweeping, mopping and utensils. Six days a week.",
    payAmount: 3500,
    payUnit: "MONTH",
    jobType: "PART_TIME_RECURRING",
    scheduleText: "Mon–Sat 7–9 am",
    genderRequirement: "WOMEN_ONLY",
  },
  {
    category: "cook",
    title: "Cook for family of four",
    description: "Breakfast and dinner, vegetarian Maharashtrian food.",
    payAmount: 6000,
    payUnit: "MONTH",
    jobType: "PART_TIME_RECURRING",
    scheduleText: "Daily 7–9 am and 7–9 pm",
    genderRequirement: "ANY",
  },
  {
    category: "caregiver",
    title: "Day care for elderly mother",
    description: "Help with meals, medicines and walking. Calm and patient person needed.",
    payAmount: 9000,
    payUnit: "MONTH",
    jobType: "FULL_TIME",
    scheduleText: "Mon–Sat 9 am–6 pm",
    genderRequirement: "WOMEN_ONLY",
  },
  {
    category: "painter",
    title: "Painters for 3BHK flat",
    description: "Interior painting, two coats. Material provided.",
    payAmount: 700,
    payUnit: "DAY",
    jobType: "DAILY_WAGE",
    scheduleText: "8 am–6 pm, about 6 days",
    genderRequirement: "ANY",
  },
  {
    category: "construction-helper",
    title: "Site helpers for building work",
    description: "Carrying material and assisting masons at a residential site.",
    payAmount: 550,
    payUnit: "DAY",
    jobType: "DAILY_WAGE",
    scheduleText: "8 am–5 pm",
    genderRequirement: "MEN_ONLY",
  },
  {
    category: "electrician",
    title: "Electrician for house wiring repair",
    description: "Fix faulty switchboards and fan points in two rooms.",
    payAmount: 1500,
    payUnit: "FIXED",
    jobType: "ONE_TIME",
    scheduleText: "One day, flexible",
    genderRequirement: "ANY",
  },
  {
    category: "plumber",
    title: "Plumber for bathroom leak",
    description: "Leaking pipe under washbasin and a dripping tap.",
    payAmount: 800,
    payUnit: "FIXED",
    jobType: "ONE_TIME",
    scheduleText: "This weekend",
    genderRequirement: "ANY",
  },
  {
    category: "shop-helper",
    title: "Helper for kirana shop",
    description: "Packing, arranging stock and helping customers.",
    payAmount: 9000,
    payUnit: "MONTH",
    jobType: "FULL_TIME",
    scheduleText: "10 am–8 pm, Tuesday off",
    genderRequirement: "ANY",
  },
  {
    category: "carpenter",
    title: "Carpenter for wardrobe repair",
    description: "Fix two wardrobe doors and replace hinges.",
    payAmount: 1200,
    payUnit: "FIXED",
    jobType: "ONE_TIME",
    scheduleText: "Any weekday",
    genderRequirement: "ANY",
  },
  {
    category: "cleaner",
    title: "Office cleaning, evenings",
    description: "Small office of 10 people. Cleaning and dusting.",
    payAmount: 5000,
    payUnit: "MONTH",
    jobType: "PART_TIME_RECURRING",
    scheduleText: "Mon–Fri 6–8 pm",
    genderRequirement: "ANY",
  },
];

/** Every job status appears at least once; the rest are OPEN. */
const nonOpenStatuses: JobStatus[] = ["DRAFT", "PAUSED", "CLOSED", "EXPIRED", "FILLED"];
/** Every application status appears at least once. */
const applicationStatuses: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "OFFERED",
  "HIRED",
  "COMPLETED",
  "REJECTED",
  "WITHDRAWN",
  "DECLINED",
  "CLOSED",
  "CANCELLED",
];

const DAY_MS = 24 * 60 * 60 * 1000;

function demoPhone(prefix: string, n: number) {
  return `${prefix}${String(n).padStart(4, "0")}`;
}

function meetsRequirement(requirement: GenderRequirement, gender: Gender | null) {
  if (requirement === "WOMEN_ONLY") return gender === "WOMAN";
  if (requirement === "MEN_ONLY") return gender === "MAN";
  return true;
}

/** Removes previous demo rows so the demo seed can be re-run. Only touches demo phone ranges. */
async function clearDemoData(db: PrismaClient) {
  const demoUsers = await db.user.findMany({
    where: {
      OR: [
        { phoneE164: { startsWith: DEMO_WORKER_PREFIX } },
        { phoneE164: { startsWith: DEMO_EMPLOYER_PREFIX } },
      ],
    },
    select: { id: true },
  });
  const userIds = demoUsers.map((u) => u.id);
  if (userIds.length === 0) return;

  const jobFilter = { employerProfile: { userId: { in: userIds } } };
  await db.$transaction([
    db.application.deleteMany({ where: { job: jobFilter } }),
    db.invite.deleteMany({ where: { job: jobFilter } }),
    db.job.deleteMany({ where: jobFilter }),
    db.workerSkill.deleteMany({ where: { workerProfile: { userId: { in: userIds } } } }),
    db.workerProfile.deleteMany({ where: { userId: { in: userIds } } }),
    db.employerProfile.deleteMany({ where: { userId: { in: userIds } } }),
    db.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);
}

export async function seedDemoData(db: PrismaClient, now = new Date()) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo data when NODE_ENV=production");
  }

  await seedReferenceData(db);
  await clearDemoData(db);

  const localities = await db.locality.findMany({ orderBy: { slug: "asc" }, select: { id: true } });
  const categories = await db.skillCategory.findMany({ select: { id: true, slug: true } });
  const categoryId = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    if (!found) throw new Error(`Missing category ${slug}`);
    return found.id;
  };
  const localityAt = (i: number) => localities[i % localities.length]!.id;

  const workers: { id: string; gender: Gender | null }[] = [];
  for (let i = 0; i < WORKER_COUNT; i++) {
    const gender = genders[i % genders.length] ?? null;
    const template = jobTemplates[i % jobTemplates.length]!;
    const user = await db.user.create({
      data: {
        phoneE164: demoPhone(DEMO_WORKER_PREFIX, i + 1),
        locale: (["mr", "hi", "en"] as const)[i % 3],
        activeMode: "WORKER",
        consentVersion: "demo",
        consentAt: now,
        workerProfile: {
          create: {
            displayName: workerNames[i % workerNames.length]!,
            localityId: localityAt(i * 3),
            experienceYears: (i * 7) % 20,
            expectedPayAmount: template.payAmount,
            expectedPayUnit: template.payUnit,
            availabilityText: i % 2 === 0 ? "Mornings" : "Full day",
            languages: i % 4 === 0 ? ["mr", "hi"] : ["mr"],
            bio: `Experienced in ${template.category.replace("-", " ")} work around Nagpur.`,
            gender,
            isAvailable: i % 9 !== 0,
            skills: {
              create: [
                { categoryId: categoryId(template.category) },
                ...(i % 3 === 0
                  ? [
                      {
                        categoryId: categoryId(
                          jobTemplates[(i + 1) % jobTemplates.length]!.category,
                        ),
                      },
                    ]
                  : []),
              ],
            },
          },
        },
      },
      select: { workerProfile: { select: { id: true } } },
    });
    workers.push({ id: user.workerProfile!.id, gender });
  }

  const employers: string[] = [];
  for (let i = 0; i < EMPLOYER_COUNT; i++) {
    const user = await db.user.create({
      data: {
        phoneE164: demoPhone(DEMO_EMPLOYER_PREFIX, i + 1),
        locale: (["mr", "en", "hi"] as const)[i % 3],
        activeMode: "EMPLOYER",
        consentVersion: "demo",
        consentAt: now,
        employerProfile: {
          create: {
            displayName: employerNames[i % employerNames.length]!,
            employerType: employerTypes[i % employerTypes.length]!,
            localityId: localityAt(i * 4 + 1),
            verificationStatus: i % 4 === 0 ? "KAAMSETU_VERIFIED" : "PHONE_VERIFIED",
          },
        },
      },
      select: { employerProfile: { select: { id: true } } },
    });
    employers.push(user.employerProfile!.id);
  }

  const jobs: { id: string; genderRequirement: GenderRequirement; status: JobStatus }[] = [];
  for (let i = 0; i < JOB_COUNT; i++) {
    const template = jobTemplates[i % jobTemplates.length]!;
    const status: JobStatus = i < nonOpenStatuses.length ? nonOpenStatuses[i]! : "OPEN";
    const published = status !== "DRAFT";
    const publishedAt = published ? new Date(now.getTime() - (i % 10) * DAY_MS) : null;
    const expiresAt =
      status === "EXPIRED"
        ? new Date(now.getTime() - DAY_MS)
        : publishedAt && new Date(publishedAt.getTime() + 14 * DAY_MS);
    const { category, ...fields } = template;
    const job = await db.job.create({
      data: {
        ...fields,
        employerProfileId: employers[i % employers.length]!,
        categoryId: categoryId(category),
        localityId: localityAt(i * 2 + 5),
        openings: template.jobType === "DAILY_WAGE" ? 5 : 2,
        status,
        publishedAt,
        expiresAt,
      },
      select: { id: true, genderRequirement: true, status: true },
    });
    jobs.push(job);
  }

  // Applications: cycle through every status on OPEN jobs, only pairing eligible workers.
  const openJobs = jobs.filter((j) => j.status === "OPEN");
  const hiredPerJob = new Map<string, number>();
  let created = 0;
  for (let i = 0; i < applicationStatuses.length * 3; i++) {
    const status = applicationStatuses[i % applicationStatuses.length]!;
    const job = openJobs[i % openJobs.length]!;
    const worker =
      workers.find(
        (w, index) =>
          index >= (i * 5) % workers.length && meetsRequirement(job.genderRequirement, w.gender),
      ) ?? workers.find((w) => meetsRequirement(job.genderRequirement, w.gender));
    if (!worker) continue;

    const exists = await db.application.findUnique({
      where: { jobId_workerProfileId: { jobId: job.id, workerProfileId: worker.id } },
      select: { id: true },
    });
    if (exists) continue;

    const isHired = status === "HIRED" || status === "COMPLETED";
    const offered = ["OFFERED", "HIRED", "COMPLETED", "DECLINED"].includes(status);
    await db.application.create({
      data: {
        jobId: job.id,
        workerProfileId: worker.id,
        status,
        source: i % 4 === 0 ? "INVITED" : "APPLIED",
        note: i % 2 === 0 ? "I live nearby and can start this week." : null,
        offerPayAmount: offered ? 6000 : null,
        offerPayUnit: offered ? "MONTH" : null,
        hiredAt: isHired ? now : null,
        completedAt: status === "COMPLETED" ? now : null,
        events: { create: { fromStatus: null, toStatus: status, note: "demo seed" } },
      },
    });
    if (isHired) hiredPerJob.set(job.id, (hiredPerJob.get(job.id) ?? 0) + 1);
    created++;
  }

  for (const [jobId, hired] of hiredPerJob) {
    const job = await db.job.findUniqueOrThrow({
      where: { id: jobId },
      select: { openings: true },
    });
    await db.job.update({
      where: { id: jobId },
      data: { hiredCount: hired, openings: Math.max(job.openings, hired) },
    });
  }

  return {
    workers: workers.length,
    employers: employers.length,
    jobs: jobs.length,
    applications: created,
  };
}
