import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const plans = [
  {
    name: 'free',
    maxLinks: 25,
    maxClicksPerMonth: 10_000,
    maxDomains: 0,
    maxMembers: 1,
    analyticsRetentionDays: 7,
    hasCustomSlugs: false,
    hasPasswordProtect: false,
    hasLinkExpiry: false,
    hasAdvancedAnalytics: false,
    hasCustomQr: false,
    hasApiAccess: false,
    hasCsvExport: false,
    stripePriceId: null
  },
  {
    name: 'pro',
    maxLinks: 1000,
    maxClicksPerMonth: 100_000,
    maxDomains: 1,
    maxMembers: 1,
    analyticsRetentionDays: 90,
    hasCustomSlugs: true,
    hasPasswordProtect: true,
    hasLinkExpiry: true,
    hasAdvancedAnalytics: true,
    hasCustomQr: false,
    hasApiAccess: false,
    hasCsvExport: true,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null
  },
  {
    name: 'team',
    maxLinks: 5000,
    maxClicksPerMonth: 500_000,
    maxDomains: 3,
    maxMembers: 5,
    analyticsRetentionDays: 365,
    hasCustomSlugs: true,
    hasPasswordProtect: true,
    hasLinkExpiry: true,
    hasAdvancedAnalytics: true,
    hasCustomQr: true,
    hasApiAccess: true,
    hasCsvExport: true,
    stripePriceId: process.env.STRIPE_PRICE_TEAM ?? null
  },
  {
    name: 'agency',
    maxLinks: 999_999,
    maxClicksPerMonth: 5_000_000,
    maxDomains: 10,
    maxMembers: 15,
    analyticsRetentionDays: 730,
    hasCustomSlugs: true,
    hasPasswordProtect: true,
    hasLinkExpiry: true,
    hasAdvancedAnalytics: true,
    hasCustomQr: true,
    hasApiAccess: true,
    hasCsvExport: true,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? null
  }
]

async function main() {
  console.log('Seeding plans...')
  for (const plan of plans) {
    await db.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    })
  }
  console.log('Plans seeded.')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
