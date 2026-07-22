import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import {
  buildPublishedSnapshot,
  serializePublishedSnapshot,
  summarizePublishedSnapshot,
} from '../packages/content/src/index.js'

const outputPath = fileURLToPath(
  new URL('../apps/web/src/lib/content/public-content.snapshot.json', import.meta.url),
)

const approval = {
  status: 'confirmed',
  source:
    'Approved for the portfolio deployment by the project owner on 2026-07-22. Menu details transcribed from the three supplied Grande Burrito menu photographs; address, phone, and weekday hours cross-checked against the 2025/2026 Freeport guide.',
  verifiedAt: '2026-07-22T21:30:00.000Z',
  verifiedBy: 'Grande Burrito portfolio project owner',
} as const

interface ApprovedMenuItemInput {
  readonly description: string
  readonly id: string
  readonly name: string
  readonly price: number
  readonly sortOrder: number
}

function approvedMenuItem({ description, id, name, price, sortOrder }: ApprovedMenuItemInput) {
  return {
    id: `portfolio.menu-item.${id}`,
    revision: 'portfolio-approved-2026-07-22',
    publicationState: 'published',
    provenance: approval,
    name,
    description,
    pricingKind: 'fixed',
    priceOptions: [{ price: { amountMinor: price * 100, currency: 'USD' } }],
    dietaryLabels: [],
    availability: 'available',
    isVisible: true,
    isFeatured: sortOrder <= 20,
    sortOrder,
  }
}

const approvedContent = {
  schemaVersion: 1,
  generatedAt: approval.verifiedAt,
  contentRevision: 'portfolio-approved-2026-07-22-1',
  business: {
    id: 'portfolio.business-profile',
    revision: 'portfolio-approved-2026-07-22',
    publicationState: 'published',
    provenance: approval,
    name: 'Grande Burrito',
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
      latitude: 43.8582467,
      longitude: -70.1027771,
    },
    timezone: 'America/New_York',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=115%20Main%20Street%2C%20Freeport%2C%20ME%2004032',
    socialLinks: [],
    priceRange: '$$',
    lastReviewedAt: approval.verifiedAt,
  },
  weeklySchedule: [
    { day: 'monday', intervals: [{ opensAt: '11:00', closesAt: '16:00' }] },
    { day: 'tuesday', intervals: [{ opensAt: '11:00', closesAt: '16:00' }] },
    { day: 'wednesday', intervals: [{ opensAt: '11:00', closesAt: '16:00' }] },
    { day: 'thursday', intervals: [{ opensAt: '11:00', closesAt: '16:00' }] },
    { day: 'friday', intervals: [{ opensAt: '11:00', closesAt: '16:00' }] },
    { day: 'saturday', intervals: [] },
    { day: 'sunday', intervals: [] },
  ],
  hoursExceptions: [],
  menu: [
    {
      id: 'portfolio.menu-category.get-started',
      revision: 'portfolio-approved-2026-07-22',
      publicationState: 'published',
      name: 'Get Started',
      slug: 'get-started',
      sortOrder: 10,
      isActive: true,
      items: [
        approvedMenuItem({
          id: 'chips-and-salsa',
          name: 'Chips & Salsa',
          description: 'Add house guacamole for $3.',
          price: 4,
          sortOrder: 10,
        }),
      ],
    },
    {
      id: 'portfolio.menu-category.burritos-and-wraps',
      revision: 'portfolio-approved-2026-07-22',
      publicationState: 'published',
      name: 'Burritos & Wraps',
      slug: 'burritos-and-wraps',
      description: 'Made to order with bold fillings and house sauces.',
      sortOrder: 20,
      isActive: true,
      items: [
        approvedMenuItem({
          id: 'tropical-jerk-chicken',
          name: 'Tropical Jerk Chicken',
          description:
            'Cumin chicken, seasoned rice, beans, cheese, scallion, cilantro, lime crema, and sweet-spicy pineapple mango salsa.',
          price: 14,
          sortOrder: 10,
        }),
        approvedMenuItem({
          id: 'chipotle-beef',
          name: 'Chipotle Beef',
          description:
            'Chipotle-spiced ground beef, seasoned rice, beans, cheese, red salsa, scallion, cilantro, and lime crema.',
          price: 14,
          sortOrder: 20,
        }),
        approvedMenuItem({
          id: 'tequila-lime-pork',
          name: 'Tequila Lime Pork',
          description:
            'Slow-cooked pork, seasoned rice, beans, cheese, tomatillo salsa, jalapeño, scallion, cilantro, and lime crema.',
          price: 14,
          sortOrder: 30,
        }),
        approvedMenuItem({
          id: 'green-machine',
          name: 'Green Machine',
          description:
            'House guacamole, seasoned rice, beans, cheese, tomatillo salsa, scallion, cilantro, and lime crema.',
          price: 14,
          sortOrder: 40,
        }),
        approvedMenuItem({
          id: 'breakfast',
          name: 'Breakfast',
          description:
            'Eggs, beans, sweet potato, cheese, red salsa, scallion, cilantro, and lime crema.',
          price: 14,
          sortOrder: 50,
        }),
        approvedMenuItem({
          id: 'sweet-potato',
          name: 'Sweet Potato',
          description:
            'Baked sweet potato, seasoned rice, beans, cheese, red salsa, scallion, cilantro, and lime crema.',
          price: 14,
          sortOrder: 60,
        }),
        approvedMenuItem({
          id: 'cheeseburger',
          name: 'Cheeseburger',
          description:
            'Ground beef, cheese, seasoned rice, romaine, tomato, scallion, and secret sauce.',
          price: 14,
          sortOrder: 70,
        }),
        approvedMenuItem({
          id: 'chicken-salad-wrap',
          name: 'Chicken Salad Wrap',
          description:
            'Jalapeño street-corn chicken salad, cheese, romaine, tomato, scallion, and cilantro.',
          price: 14,
          sortOrder: 80,
        }),
        approvedMenuItem({
          id: 'build-your-own',
          name: 'Build Your Own',
          description:
            'Start with rice, beans, cheese, salsa, and lime crema. Cilantro and green onion are included; choose red, green, sriracha, sweet Thai chili, or tropical mango jerk sauce.',
          price: 11,
          sortOrder: 90,
        }),
      ],
    },
    {
      id: 'portfolio.menu-category.more-favorites',
      revision: 'portfolio-approved-2026-07-22',
      publicationState: 'published',
      name: 'More Favorites',
      slug: 'more-favorites',
      sortOrder: 30,
      isActive: true,
      items: [
        approvedMenuItem({
          id: 'grande-salad',
          name: 'Grande Salad',
          description:
            'Jalapeño street-corn chicken salad, romaine, tomato, cheese, cilantro, scallion, and creamy avocado-lime dressing.',
          price: 14,
          sortOrder: 10,
        }),
        approvedMenuItem({
          id: 'enchilada-especial',
          name: 'Enchilada Especial',
          description:
            'Daily protein, flour tortilla, cheese, chipotle enchilada sauce, lime crema, scallion, and cilantro. Add rice and beans for $4 or with cheese for $6.',
          price: 14,
          sortOrder: 20,
        }),
        approvedMenuItem({
          id: 'hot-nachos',
          name: 'Hot Nachos for One',
          description:
            'Chips, cheese, tomato, scallion, cilantro, salsa, and sour cream. Add chicken, beef, pork, or beans for $3; guacamole for $4; steak for $5.',
          price: 9,
          sortOrder: 30,
        }),
        approvedMenuItem({
          id: 'uncle-ricos-quesadilla',
          name: 'Uncle Rico’s Quesadilla',
          description:
            'Twelve-inch flour tortilla, cheese, tomato, scallion, salsa, and sour cream. Add chicken, beef, pork, or sweet potato for $3; steak for $5.',
          price: 12,
          sortOrder: 40,
        }),
        approvedMenuItem({
          id: 'taco-salad',
          name: 'The Taco Salad',
          description:
            'Choice of ground beef, chicken, or pork with romaine, cheese, tortilla chips, tomato, scallion, and creamy avocado-lime dressing.',
          price: 14,
          sortOrder: 50,
        }),
      ],
    },
    {
      id: 'portfolio.menu-category.kids',
      revision: 'portfolio-approved-2026-07-22',
      publicationState: 'published',
      name: 'Kids & Sides',
      slug: 'kids-and-sides',
      sortOrder: 40,
      isActive: true,
      items: [
        approvedMenuItem({
          id: 'kids-cheese-quesadilla',
          name: 'Two-Piece Cheese Quesadilla',
          description: 'A simple two-piece cheese quesadilla for kids.',
          price: 5,
          sortOrder: 10,
        }),
        approvedMenuItem({
          id: 'rice-and-beans',
          name: 'Side of Rice & Beans',
          description: 'Add cheese for $2.',
          price: 4,
          sortOrder: 20,
        }),
      ],
    },
    {
      id: 'portfolio.menu-category.adult-beverages',
      revision: 'portfolio-approved-2026-07-22',
      publicationState: 'published',
      name: 'Adult Beverages',
      slug: 'adult-beverages',
      sortOrder: 50,
      isActive: true,
      items: [
        approvedMenuItem({
          id: 'margaritas',
          name: 'Margaritas',
          description:
            'Blueberry, prickly pear, strawberry, mango, pineapple, traditional, spicy, or skinny. Made with premium tequila and Natalie’s margarita mix.',
          price: 11,
          sortOrder: 10,
        }),
      ],
    },
  ],
  announcements: [
    {
      id: 'portfolio.announcement.concept-notice',
      revision: 'portfolio-approved-2026-07-22',
      publicationState: 'published',
      provenance: approval,
      title: 'Independent website concept',
      message:
        'Menu and hours are based on supplied reference materials and may change. Please call Grande Burrito to confirm current availability.',
      kind: 'info',
      startsAt: '2026-07-22T00:00:00.000Z',
      priority: 100,
      isEnabled: true,
    },
  ],
  page: {
    id: 'portfolio.page-content',
    revision: 'portfolio-approved-2026-07-22',
    publicationState: 'published',
    provenance: approval,
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
  },
  media: [],
}

const snapshot = buildPublishedSnapshot(approvedContent, {
  generatedAt: new Date().toISOString(),
})

await writeFile(outputPath, serializePublishedSnapshot(snapshot), 'utf8')
console.info(JSON.stringify({ output: outputPath, ...summarizePublishedSnapshot(snapshot) }))
