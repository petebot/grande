/**
 * Seed the development Sanity dataset with realistic Grande Burrito data.
 *
 * Run with:
 *   node --import tsx scripts/seed-development-data.ts
 */

import { createClient, type SanityClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'

const PROJECT_ID = 'w6vleqf7'
const DATASET = 'development'

function readCliToken(): string {
  const configPath = `${homedir()}/.config/sanity/config.json`
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    const token = config.authToken ?? config.users?.[0]?.token ?? ''
    if (!token) throw new Error('No auth token found in Sanity CLI config.')
    return token
  } catch (err) {
    throw new Error(
      `Could not read Sanity CLI token from ${configPath}. Run "sanity login" first.\n${err}`,
      { cause: err },
    )
  }
}

const client: SanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: readCliToken(),
})

const provenance = {
  status: 'confirmed',
  source:
    'Approved for the portfolio deployment by the project owner on 2026-07-22. Menu details transcribed from the three supplied Grande Burrito menu photographs; address, phone, and weekday hours cross-checked against the 2025/2026 Freeport guide.',
  verifiedAt: '2026-07-22T21:30:00.000Z',
  verifiedBy: 'Grande Burrito portfolio project owner',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId(type: string, slug: string) {
  return `seed.${type}.${slug}`
}

// ---------------------------------------------------------------------------
// 1. Business Profile
// ---------------------------------------------------------------------------

const businessProfile = {
  _id: makeId('businessProfile', 'grande-burrito'),
  _type: 'businessProfile',
  provenance,
  name: 'Grande Burrito',
  legalName: 'Grande Burrito',
  tagline: 'Burritos · Margaritas · Cold Beer',
  phone: {
    e164: '+12075550100',
    display: '(207) 555-0100',
  },
  address: {
    street: '115 Main Street',
    locality: 'Freeport',
    region: 'ME',
    postalCode: '04032',
    country: 'US',
  },
  coordinates: {
    _type: 'geopoint',
    lat: 43.8582467,
    lng: -70.1027771,
  },
  timezone: 'America/New_York',
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=115%20Main%20Street%2C%20Freeport%2C%20ME%2004032',
  socialLinks: [],
  priceRange: '$$',
  lastReviewedAt: '2026-07-22T21:30:00.000Z',
}

// ---------------------------------------------------------------------------
// 2. Weekly Schedule
// ---------------------------------------------------------------------------

const weeklySchedule = {
  _id: makeId('weeklySchedule', 'main'),
  _type: 'weeklySchedule',
  days: [
    {
      _key: 'monday',
      day: 'monday',
      intervals: [{ _key: 'i1', opensAt: '11:00', closesAt: '16:00' }],
    },
    {
      _key: 'tuesday',
      day: 'tuesday',
      intervals: [{ _key: 'i1', opensAt: '11:00', closesAt: '16:00' }],
    },
    {
      _key: 'wednesday',
      day: 'wednesday',
      intervals: [{ _key: 'i1', opensAt: '11:00', closesAt: '16:00' }],
    },
    {
      _key: 'thursday',
      day: 'thursday',
      intervals: [{ _key: 'i1', opensAt: '11:00', closesAt: '16:00' }],
    },
    {
      _key: 'friday',
      day: 'friday',
      intervals: [{ _key: 'i1', opensAt: '11:00', closesAt: '16:00' }],
    },
    { _key: 'saturday', day: 'saturday', intervals: [] },
    { _key: 'sunday', day: 'sunday', intervals: [] },
  ],
}

// ---------------------------------------------------------------------------
// 3. Menu Categories
// ---------------------------------------------------------------------------

const menuCategories = [
  {
    _id: makeId('menuCategory', 'get-started'),
    _type: 'menuCategory',
    name: 'Get Started',
    slug: { _type: 'slug', current: 'get-started' },
    sortOrder: 10,
    isActive: true,
  },
  {
    _id: makeId('menuCategory', 'burritos-and-wraps'),
    _type: 'menuCategory',
    name: 'Burritos & Wraps',
    slug: { _type: 'slug', current: 'burritos-and-wraps' },
    description: 'Made to order with bold fillings and house sauces.',
    sortOrder: 20,
    isActive: true,
  },
  {
    _id: makeId('menuCategory', 'more-favorites'),
    _type: 'menuCategory',
    name: 'More Favorites',
    slug: { _type: 'slug', current: 'more-favorites' },
    sortOrder: 30,
    isActive: true,
  },
  {
    _id: makeId('menuCategory', 'kids-and-sides'),
    _type: 'menuCategory',
    name: 'Kids & Sides',
    slug: { _type: 'slug', current: 'kids-and-sides' },
    sortOrder: 40,
    isActive: true,
  },
  {
    _id: makeId('menuCategory', 'adult-beverages'),
    _type: 'menuCategory',
    name: 'Adult Beverages',
    slug: { _type: 'slug', current: 'adult-beverages' },
    sortOrder: 50,
    isActive: true,
  },
]

// ---------------------------------------------------------------------------
// 4. Menu Items
// ---------------------------------------------------------------------------

function menuItem(
  slug: string,
  categorySlug: string,
  name: string,
  description: string,
  priceCents: number,
  sortOrder: number,
  extras: Record<string, unknown> = {},
) {
  return {
    _id: makeId('menuItem', slug),
    _type: 'menuItem',
    category: { _type: 'reference', _ref: makeId('menuCategory', categorySlug) },
    provenance,
    name,
    description,
    pricingKind: 'fixed',
    priceOptions: [
      {
        _key: 'default',
        amount: priceCents / 100,
      },
    ],
    dietaryLabels: [],
    availability: 'available',
    isVisible: true,
    isFeatured: sortOrder <= 20,
    sortOrder,
    ...extras,
  }
}

const menuItems = [
  // Get Started
  menuItem(
    'chips-and-salsa',
    'get-started',
    'Chips & Salsa',
    'Add house guacamole for $3.',
    400,
    10,
  ),

  // Burritos & Wraps
  menuItem(
    'tropical-jerk-chicken',
    'burritos-and-wraps',
    'Tropical Jerk Chicken',
    'Cumin chicken, seasoned rice, beans, cheese, scallion, cilantro, lime crema, and sweet-spicy pineapple mango salsa.',
    1400,
    10,
  ),
  menuItem(
    'chipotle-beef',
    'burritos-and-wraps',
    'Chipotle Beef',
    'Chipotle-spiced ground beef, seasoned rice, beans, cheese, red salsa, scallion, cilantro, and lime crema.',
    1400,
    20,
  ),
  menuItem(
    'tequila-lime-pork',
    'burritos-and-wraps',
    'Tequila Lime Pork',
    'Slow-cooked pork, seasoned rice, beans, cheese, tomatillo salsa, jalapeño, scallion, cilantro, and lime crema.',
    1400,
    30,
  ),
  menuItem(
    'green-machine',
    'burritos-and-wraps',
    'Green Machine',
    'House guacamole, seasoned rice, beans, cheese, tomatillo salsa, scallion, cilantro, and lime crema.',
    1400,
    40,
  ),
  menuItem(
    'breakfast',
    'burritos-and-wraps',
    'Breakfast',
    'Eggs, beans, sweet potato, cheese, red salsa, scallion, cilantro, and lime crema.',
    1400,
    50,
  ),
  menuItem(
    'sweet-potato',
    'burritos-and-wraps',
    'Sweet Potato',
    'Baked sweet potato, seasoned rice, beans, cheese, red salsa, scallion, cilantro, and lime crema.',
    1400,
    60,
  ),
  menuItem(
    'cheeseburger',
    'burritos-and-wraps',
    'Cheeseburger',
    'Ground beef, cheese, seasoned rice, romaine, tomato, scallion, and secret sauce.',
    1400,
    70,
  ),
  menuItem(
    'chicken-salad-wrap',
    'burritos-and-wraps',
    'Chicken Salad Wrap',
    'Jalapeño street-corn chicken salad, cheese, romaine, tomato, scallion, and cilantro.',
    1400,
    80,
  ),
  menuItem(
    'build-your-own',
    'burritos-and-wraps',
    'Build Your Own',
    'Start with rice, beans, cheese, salsa, and lime crema. Cilantro and green onion are included; choose red, green, sriracha, sweet Thai chili, or tropical mango jerk sauce.',
    1100,
    90,
  ),

  // More Favorites
  menuItem(
    'grande-salad',
    'more-favorites',
    'Grande Salad',
    'Jalapeño street-corn chicken salad, romaine, tomato, cheese, cilantro, scallion, and creamy avocado-lime dressing.',
    1400,
    10,
  ),
  menuItem(
    'enchilada-especial',
    'more-favorites',
    'Enchilada Especial',
    'Daily protein, flour tortilla, cheese, chipotle enchilada sauce, lime crema, scallion, and cilantro. Add rice and beans for $4 or with cheese for $6.',
    1400,
    20,
  ),
  menuItem(
    'hot-nachos',
    'more-favorites',
    'Hot Nachos for One',
    'Chips, cheese, tomato, scallion, cilantro, salsa, and sour cream. Add chicken, beef, pork, or beans for $3; guacamole for $4; steak for $5.',
    900,
    30,
  ),
  menuItem(
    'uncle-ricos-quesadilla',
    'more-favorites',
    "Uncle Rico's Quesadilla",
    'Twelve-inch flour tortilla, cheese, tomato, scallion, salsa, and sour cream. Add chicken, beef, pork, or sweet potato for $3; steak for $5.',
    1200,
    40,
  ),
  menuItem(
    'taco-salad',
    'more-favorites',
    'The Taco Salad',
    'Choice of ground beef, chicken, or pork with romaine, cheese, tortilla chips, tomato, scallion, and creamy avocado-lime dressing.',
    1400,
    50,
  ),

  // Kids & Sides
  menuItem(
    'kids-cheese-quesadilla',
    'kids-and-sides',
    'Two-Piece Cheese Quesadilla',
    'A simple two-piece cheese quesadilla for kids.',
    500,
    10,
  ),
  menuItem(
    'rice-and-beans',
    'kids-and-sides',
    'Side of Rice & Beans',
    'Add cheese for $2.',
    400,
    20,
  ),

  // Adult Beverages
  menuItem(
    'margaritas',
    'adult-beverages',
    'Margaritas',
    "Blueberry, prickly pear, strawberry, mango, pineapple, traditional, spicy, or skinny. Made with premium tequila and Natalie's margarita mix.",
    1100,
    10,
  ),
]

// ---------------------------------------------------------------------------
// 5. Page Content
// ---------------------------------------------------------------------------

const pageContent = {
  _id: makeId('pageContent', 'main'),
  _type: 'pageContent',
  provenance,
  heroEyebrow: 'Downtown Freeport, Maine',
  heroHeading: 'Big burritos. Bright flavors. No fuss.',
  heroBody:
    'Made-to-order burritos, wraps, salads, margaritas, and more at 115 Main Street in Freeport.',
  storyBody: [],
  menuHeading: 'The Menu',
  locationHeading: 'Find Grande Burrito',
  seoTitle: 'Grande Burrito | Freeport, Maine',
  seoDescription:
    'Explore the Grande Burrito menu, weekday hours, phone number, and directions for 115 Main Street in Freeport, Maine.',
}

// ---------------------------------------------------------------------------
// 6. Announcement
// ---------------------------------------------------------------------------

const announcement = {
  _id: makeId('announcement', 'concept-notice'),
  _type: 'announcement',
  provenance,
  title: 'Independent website concept',
  message:
    'Menu and hours are based on supplied reference materials and may change. Please call Grande Burrito to confirm current availability.',
  kind: 'info',
  startsAt: '2026-07-22T00:00:00.000Z',
  priority: 0,
  isEnabled: true,
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function seed() {
  const docs: Array<{ _id: string; _type: string; [field: string]: unknown }> = [
    businessProfile,
    weeklySchedule,
    pageContent,
    announcement,
    ...menuCategories,
    ...menuItems,
  ]

  console.log(`Seeding ${docs.length} documents into ${PROJECT_ID}/${DATASET}...`)

  const tx = client.transaction()
  for (const doc of docs) {
    tx.createOrReplace(doc)
  }
  const result = await tx.commit()
  console.log(`Done. Committed ${result.results.length} operations.`)

  const counts = await client.fetch<Record<string, number>>(
    `{
      "businessProfile": count(*[_id match "seed.businessProfile.*"]),
      "weeklySchedule": count(*[_id match "seed.weeklySchedule.*"]),
      "pageContent": count(*[_id match "seed.pageContent.*"]),
      "announcement": count(*[_id match "seed.announcement.*"]),
      "menuCategory": count(*[_id match "seed.menuCategory.*"]),
      "menuItem": count(*[_id match "seed.menuItem.*"]),
      "unresolvedMenuCategories": count(*[_id match "seed.menuItem.*" && category->_id == null])
    }`,
  )

  console.log('Verified:', counts)
  if (counts.unresolvedMenuCategories !== 0) {
    throw new Error('One or more seeded menu items has an unresolved category reference.')
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
