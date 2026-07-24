import type {
  Announcement,
  AnnouncementAction,
  AnnouncementKind,
  BusinessTimezone,
  DietaryLabel,
  HeatLevel,
  MenuAvailability,
  MenuItemPricing,
  MenuItemSeasonality,
  NormalizedPublicSiteSnapshot,
  PhoneNumber,
  PortableTextListItem,
  PostalAddress,
  ScheduleInterval,
  WeeklyScheduleDay,
} from '@grande/content'

export interface PublicPageBusiness {
  readonly address: PostalAddress
  readonly directionsUrl: string
  readonly name: string
  readonly orderingUrl?: string
  readonly phone: PhoneNumber
  readonly timezone: BusinessTimezone
}

export interface PublicHoursException {
  readonly endsOn: string
  readonly intervals: readonly ScheduleInterval[]
  readonly priority: number
  readonly publicNote?: string
  readonly startsOn: string
  readonly status: 'closed' | 'special-hours'
}

export interface PublicMenuItemBase {
  readonly availability: MenuAvailability
  readonly description?: string
  readonly dietaryLabels: readonly DietaryLabel[]
  readonly emoji?: string
  readonly heatLevel?: HeatLevel
  readonly name: string
  readonly seasonality?: MenuItemSeasonality
}

export type PublicMenuItem = PublicMenuItemBase & MenuItemPricing

export interface PublicMenuCategory {
  readonly description?: string
  readonly items: readonly PublicMenuItem[]
  readonly name: string
  readonly slug: string
}

export interface PublicAnnouncement {
  readonly action?: AnnouncementAction
  readonly endsAt?: string
  readonly kind: AnnouncementKind
  readonly message: string
  readonly startsAt: string
  readonly title: string
}

export interface PublicStoryBlock {
  readonly listItem?: PortableTextListItem
  readonly text: string
}

export interface PublicPageCopy {
  readonly heroBody: string
  readonly heroEyebrow?: string
  readonly heroHeading: string
  readonly locationHeading: string
  readonly menuHeading: string
  readonly storyBlocks: readonly PublicStoryBlock[]
  readonly storyHeading?: string
}

export interface PublicPageContent {
  readonly announcements: readonly PublicAnnouncement[]
  readonly business: PublicPageBusiness
  readonly hoursExceptions: readonly PublicHoursException[]
  readonly menu: readonly PublicMenuCategory[]
  readonly page: PublicPageCopy
  readonly weeklySchedule: readonly WeeklyScheduleDay[]
}

function publicAnnouncement(announcement: Announcement): PublicAnnouncement {
  return {
    ...(announcement.action ? { action: announcement.action } : {}),
    ...(announcement.endsAt ? { endsAt: announcement.endsAt } : {}),
    kind: announcement.kind,
    message: announcement.message,
    startsAt: announcement.startsAt,
    title: announcement.title,
  }
}

export function createPublicPageContent(
  content: NormalizedPublicSiteSnapshot,
  now: Date,
): PublicPageContent {
  const instant = now.toISOString()

  return {
    announcements: content.announcements
      .filter(({ endsAt, isEnabled }) => isEnabled && (endsAt === undefined || endsAt > instant))
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          left.startsAt.localeCompare(right.startsAt) ||
          left.title.localeCompare(right.title),
      )
      .map(publicAnnouncement),
    business: {
      address: content.business.address,
      directionsUrl: content.business.directionsUrl,
      name: content.business.name,
      ...(content.business.orderingUrl ? { orderingUrl: content.business.orderingUrl } : {}),
      phone: content.business.phone,
      timezone: content.business.timezone,
    },
    hoursExceptions: content.hoursExceptions.map(
      ({ endsOn, intervals, priority, publicNote, startsOn, status }) => ({
        endsOn,
        intervals,
        priority,
        ...(publicNote ? { publicNote } : {}),
        startsOn,
        status,
      }),
    ),
    menu: content.menu.map(({ description, items, name, slug }) => ({
      ...(description ? { description } : {}),
      items: items.map((item) => {
        const base: PublicMenuItemBase = {
          availability: item.availability,
          ...(item.description ? { description: item.description } : {}),
          dietaryLabels: item.dietaryLabels,
          ...(item.emoji ? { emoji: item.emoji } : {}),
          ...(item.heatLevel ? { heatLevel: item.heatLevel } : {}),
          name: item.name,
          ...(item.seasonality ? { seasonality: item.seasonality } : {}),
        }

        return item.pricingKind === 'fixed'
          ? { ...base, priceOptions: item.priceOptions, pricingKind: item.pricingKind }
          : {
              ...base,
              marketPriceLabel: item.marketPriceLabel,
              pricingKind: item.pricingKind,
            }
      }),
      name,
      slug,
    })),
    page: {
      heroBody: content.page.heroBody,
      ...(content.page.heroEyebrow ? { heroEyebrow: content.page.heroEyebrow } : {}),
      heroHeading: content.page.heroHeading,
      locationHeading: content.page.locationHeading,
      menuHeading: content.page.menuHeading,
      storyBlocks: content.page.storyBody.map(({ children, listItem }) => ({
        ...(listItem ? { listItem } : {}),
        text: children.map(({ text }) => text).join(''),
      })),
      ...(content.page.storyHeading ? { storyHeading: content.page.storyHeading } : {}),
    },
    weeklySchedule: content.weeklySchedule,
  }
}
