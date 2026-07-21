/**
 * Canonical, framework-independent content contract shared by the public site,
 * Studio, snapshot generator, fixtures, and tests.
 *
 * These types describe normalized content, not raw Sanity documents. Runtime
 * validation and normalization are added in later foundation tasks.
 */

export const PUBLIC_CONTENT_SCHEMA_VERSION = 1 as const

export const BUSINESS_TIMEZONE = 'America/New_York' as const

export const CONTENT_PERSPECTIVES = ['published', 'drafts'] as const
export type ContentPerspective = (typeof CONTENT_PERSPECTIVES)[number]

export const CONTENT_SOURCES = ['live', 'cache', 'snapshot'] as const
export type ContentSource = (typeof CONTENT_SOURCES)[number]

export const PUBLICATION_STATES = ['draft', 'published'] as const
export type PublicationState = (typeof PUBLICATION_STATES)[number]

export type PublicContentSchemaVersion = typeof PUBLIC_CONTENT_SCHEMA_VERSION
export type BusinessTimezone = typeof BUSINESS_TIMEZONE
export type ContentId = string
export type ContentRevision = string
export type IsoDate = string
export type IsoDateTime = string
export type LocalTime = string
export type SafeUrl = string
export type HttpsUrl = SafeUrl

export interface ContentIdentity {
  readonly id: ContentId
  readonly revision: ContentRevision
  readonly publicationState: PublicationState
}

export const PROVENANCE_STATUSES = ['placeholder', 'provisional', 'confirmed', 'licensed'] as const
export type ProvenanceStatus = (typeof PROVENANCE_STATUSES)[number]

interface ProvenanceBase {
  readonly source: string
}

export type ContentProvenance = ProvenanceBase &
  (
    | {
        readonly status: 'placeholder' | 'provisional'
        readonly verifiedAt?: IsoDateTime
        readonly verifiedBy?: string
      }
    | {
        readonly status: 'confirmed' | 'licensed'
        readonly verifiedAt: IsoDateTime
        readonly verifiedBy: string
      }
  )

export interface ProvenancedContent extends ContentIdentity {
  readonly provenance: ContentProvenance
}

export const CURRENCY_CODES = ['USD'] as const
export type CurrencyCode = (typeof CURRENCY_CODES)[number]

/** An integer amount in the currency's minor unit; for USD, cents. */
export interface Money {
  readonly amountMinor: number
  readonly currency: CurrencyCode
}

export interface PriceOption {
  readonly label?: string
  readonly price: Money
}

export type FixedPricing = {
  readonly pricingKind: 'fixed'
  readonly priceOptions: readonly [PriceOption, ...PriceOption[]]
  readonly marketPriceLabel?: never
}

export type MarketPricing = {
  readonly pricingKind: 'market'
  readonly marketPriceLabel: string
  readonly priceOptions?: never
}

export type MenuItemPricing = FixedPricing | MarketPricing

export interface PostalAddress {
  readonly street: string
  readonly locality: string
  readonly region: string
  readonly postalCode: string
  readonly country: string
}

export interface Coordinates {
  readonly latitude: number
  readonly longitude: number
}

export interface PhoneNumber {
  readonly e164: string
  readonly display: string
}

export const SOCIAL_PROVIDERS = ['facebook', 'instagram', 'tiktok', 'youtube'] as const
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]

export interface SocialLink {
  readonly provider: SocialProvider
  readonly url: HttpsUrl
}

export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const
export type PriceRange = (typeof PRICE_RANGES)[number]

export interface BusinessProfile extends ProvenancedContent {
  readonly name: string
  readonly legalName?: string
  readonly tagline?: string
  readonly phone: PhoneNumber
  readonly address: PostalAddress
  readonly coordinates: Coordinates
  readonly timezone: BusinessTimezone
  readonly orderingUrl?: HttpsUrl
  readonly directionsUrl: HttpsUrl
  readonly socialLinks: readonly SocialLink[]
  readonly priceRange?: PriceRange
  readonly lastReviewedAt: IsoDateTime
}

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

/** Local wall-clock values in HH:mm form. An interval may cross midnight. */
export interface ScheduleInterval {
  readonly opensAt: LocalTime
  readonly closesAt: LocalTime
}

export interface WeeklyScheduleDay {
  readonly day: DayOfWeek
  readonly intervals: readonly ScheduleInterval[]
}

export const HOURS_EXCEPTION_STATUSES = ['closed', 'special-hours'] as const
export type HoursExceptionStatus = (typeof HOURS_EXCEPTION_STATUSES)[number]

interface HoursExceptionBase extends ProvenancedContent {
  readonly startsOn: IsoDate
  readonly endsOn: IsoDate
  readonly publicNote?: string
  readonly priority: number
  readonly expiresAt: IsoDateTime
}

export type HoursException = HoursExceptionBase &
  (
    | {
        readonly status: 'closed'
        readonly intervals: readonly []
      }
    | {
        readonly status: 'special-hours'
        readonly intervals: readonly [ScheduleInterval, ...ScheduleInterval[]]
      }
  )

export const MENU_AVAILABILITY_STATES = ['available', 'sold-out'] as const
export type MenuAvailability = (typeof MENU_AVAILABILITY_STATES)[number]

export const HEAT_LEVELS = ['mild', 'medium', 'hot'] as const
export type HeatLevel = (typeof HEAT_LEVELS)[number]

export const DIETARY_LABELS = ['vegetarian', 'vegan', 'gluten-free'] as const
export type DietaryLabel = (typeof DIETARY_LABELS)[number]

export interface MenuItemSeasonality {
  readonly startsOn?: IsoDate
  readonly endsOn?: IsoDate
  readonly label: string
}

export interface MenuItemBase extends ProvenancedContent {
  readonly name: string
  readonly description?: string
  readonly dietaryLabels: readonly DietaryLabel[]
  readonly heatLevel?: HeatLevel
  readonly availability: MenuAvailability
  readonly isVisible: boolean
  readonly isFeatured: boolean
  readonly seasonality?: MenuItemSeasonality
  readonly imageId?: ContentId
  readonly sortOrder: number
}

export type MenuItem = MenuItemBase & MenuItemPricing

export interface MenuCategory extends ContentIdentity {
  readonly name: string
  readonly slug: string
  readonly description?: string
  readonly sortOrder: number
  readonly isActive: boolean
  readonly items: readonly MenuItem[]
}

export const ANNOUNCEMENT_KINDS = ['info', 'service-change', 'closure', 'promotion'] as const
export type AnnouncementKind = (typeof ANNOUNCEMENT_KINDS)[number]

export interface AnnouncementAction {
  readonly label: string
  readonly url: SafeUrl
}

export interface Announcement extends ProvenancedContent {
  readonly title: string
  readonly message: string
  readonly kind: AnnouncementKind
  readonly startsAt: IsoDateTime
  readonly endsAt?: IsoDateTime
  readonly action?: AnnouncementAction
  readonly priority: number
  readonly isEnabled: boolean
}

export type PortableTextStyle = 'normal'
export type PortableTextListItem = 'bullet' | 'number'

export interface PortableTextSpan {
  readonly key: string
  readonly type: 'span'
  readonly text: string
  readonly marks: readonly string[]
}

export interface PortableTextLinkMark {
  readonly key: string
  readonly type: 'link'
  readonly href: SafeUrl
}

export interface PortableTextBlock {
  readonly key: string
  readonly type: 'block'
  readonly style: PortableTextStyle
  readonly listItem?: PortableTextListItem
  readonly level?: number
  readonly children: readonly PortableTextSpan[]
  readonly markDefinitions: readonly PortableTextLinkMark[]
}

export interface PageContent extends ProvenancedContent {
  readonly heroEyebrow?: string
  readonly heroHeading: string
  readonly heroBody: string
  readonly storyHeading?: string
  readonly storyBody: readonly PortableTextBlock[]
  readonly menuHeading: string
  readonly locationHeading: string
  readonly seoTitle: string
  readonly seoDescription: string
  readonly socialImageId?: ContentId
}

export const MEDIA_RIGHTS_STATUSES = [
  'provisional',
  'owned',
  'licensed',
  'permission-granted',
] as const
export type MediaRightsStatus = (typeof MEDIA_RIGHTS_STATUSES)[number]

export interface MediaDimensions {
  readonly width: number
  readonly height: number
  readonly aspectRatio: number
}

/** Normalized Sanity hotspot coordinates in the inclusive range from 0 to 1. */
export interface MediaFocalPoint {
  readonly x: number
  readonly y: number
}

export type MediaAccessibility =
  | {
      readonly decorative: true
      readonly alt: ''
    }
  | {
      readonly decorative: false
      readonly alt: string
    }

export interface PublicMediaBase extends ProvenancedContent {
  readonly assetId: string
  readonly url: HttpsUrl
  readonly dimensions: MediaDimensions
  readonly caption?: string
  readonly credit?: string
  readonly rightsStatus: MediaRightsStatus
  readonly focalPoint?: MediaFocalPoint
}

export type PublicMedia = PublicMediaBase & MediaAccessibility

/**
 * The single versioned boundary consumed by live requests, draft preview, fixtures,
 * generated snapshots, and the public application.
 */
export interface NormalizedPublicSiteSnapshot {
  readonly schemaVersion: PublicContentSchemaVersion
  readonly generatedAt: IsoDateTime
  readonly contentRevision: ContentRevision
  readonly business: BusinessProfile
  readonly weeklySchedule: readonly WeeklyScheduleDay[]
  readonly hoursExceptions: readonly HoursException[]
  readonly menu: readonly MenuCategory[]
  readonly announcements: readonly Announcement[]
  readonly page: PageContent
  readonly media: readonly PublicMedia[]
}
