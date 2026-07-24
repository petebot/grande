import {
  ANNOUNCEMENT_KINDS,
  BUSINESS_TIMEZONE,
  DAYS_OF_WEEK,
  DIETARY_LABELS,
  HEAT_LEVELS,
  HOURS_EXCEPTION_STATUSES,
  MEDIA_RIGHTS_STATUSES,
  MENU_AVAILABILITY_STATES,
  PRICE_RANGES,
  PUBLICATION_STATES,
  PUBLIC_CONTENT_SCHEMA_VERSION,
  SOCIAL_PROVIDERS,
  type Announcement,
  type BusinessProfile,
  type ContentIdentity,
  type ContentPerspective,
  type ContentProvenance,
  type HoursException,
  type MenuCategory,
  type MenuItem,
  type NormalizedPublicSiteSnapshot,
  type PageContent,
  type PortableTextBlock,
  type PriceOption,
  type PublicMedia,
  type ScheduleInterval,
  type WeeklyScheduleDay,
} from './types.js'

export interface ContentValidationIssue {
  readonly path: string
  readonly message: string
}

export class ContentValidationError extends Error {
  readonly issues: readonly ContentValidationIssue[]

  constructor(issues: readonly ContentValidationIssue[]) {
    const first = issues[0]
    super(
      first
        ? `Invalid public content at ${first.path}: ${first.message}`
        : 'Invalid public content',
    )
    this.name = 'ContentValidationError'
    this.issues = issues
  }
}

export interface NormalizePublicSiteContentOptions {
  readonly perspective: ContentPerspective
}

type UnknownRecord = Record<string, unknown>

function invalid(path: string, message: string): never {
  throw new ContentValidationError([{ path, message }])
}

function record(value: unknown, path: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalid(path, 'must be an object')
  }

  return value as UnknownRecord
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    return invalid(path, 'must be an array')
  }

  return value
}

function text(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    return invalid(path, 'must be a string')
  }

  const normalized = value.trim()
  if (!normalized) {
    return invalid(path, 'must not be empty')
  }

  return normalized
}

function optionalText(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : text(value, path)
}

function portableTextSpan(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    return invalid(path, 'must be a string')
  }

  if (!value.trim()) {
    return invalid(path, 'must not be empty')
  }

  return value
}

function boolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    return invalid(path, 'must be a boolean')
  }

  return value
}

function finiteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return invalid(path, 'must be a finite number')
  }

  return value
}

function integer(value: unknown, path: string): number {
  const normalized = finiteNumber(value, path)
  if (!Number.isInteger(normalized)) {
    return invalid(path, 'must be an integer')
  }

  return normalized
}

function oneOf<const Values extends readonly string[]>(
  value: unknown,
  allowed: Values,
  path: string,
): Values[number] {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    return invalid(path, `must be one of: ${allowed.join(', ')}`)
  }

  return value as Values[number]
}

function isoDate(value: unknown, path: string): string {
  const normalized = text(value, path)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return invalid(path, 'must use YYYY-MM-DD format')
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    return invalid(path, 'must be a valid calendar date')
  }

  return normalized
}

function isoDateTime(value: unknown, path: string): string {
  const normalized = text(value, path)
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return invalid(path, 'must be a valid ISO date-time')
  }

  return parsed.toISOString()
}

function localTime(value: unknown, path: string): string {
  const normalized = text(value, path)
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    return invalid(path, 'must use 24-hour HH:mm format')
  }

  return normalized
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

function httpsUrl(value: unknown, path: string): string {
  const normalized = text(value, path)

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      return invalid(path, 'must be an HTTPS URL without embedded credentials')
    }

    return parsed.toString()
  } catch {
    return invalid(path, 'must be a valid HTTPS URL')
  }
}

function safeUrl(value: unknown, path: string): string {
  const normalized = text(value, path)

  if (normalized.startsWith('/') && !normalized.startsWith('//') && !normalized.includes('\\')) {
    return normalized
  }

  return httpsUrl(normalized, path)
}

function identity(
  source: UnknownRecord,
  path: string,
  perspective: ContentPerspective,
): ContentIdentity {
  const publicationState = oneOf(
    source.publicationState,
    PUBLICATION_STATES,
    `${path}.publicationState`,
  )

  if (perspective === 'published' && publicationState !== 'published') {
    return invalid(`${path}.publicationState`, 'draft content is not allowed in published output')
  }

  return {
    id: text(source.id, `${path}.id`),
    revision: text(source.revision, `${path}.revision`),
    publicationState,
  }
}

function provenance(
  value: unknown,
  path: string,
  perspective: ContentPerspective,
): ContentProvenance {
  const source = record(value, path)
  const status = oneOf(
    source.status,
    ['placeholder', 'provisional', 'confirmed', 'licensed'] as const,
    `${path}.status`,
  )
  const normalizedSource = text(source.source, `${path}.source`)

  if (perspective === 'published' && status !== 'confirmed' && status !== 'licensed') {
    return invalid(`${path}.status`, 'published content must be confirmed or licensed')
  }

  if (status === 'confirmed' || status === 'licensed') {
    return {
      status,
      source: normalizedSource,
      verifiedAt: isoDateTime(source.verifiedAt, `${path}.verifiedAt`),
      verifiedBy: text(source.verifiedBy, `${path}.verifiedBy`),
    }
  }

  const verifiedAt =
    source.verifiedAt === undefined
      ? undefined
      : isoDateTime(source.verifiedAt, `${path}.verifiedAt`)
  const verifiedBy = optionalText(source.verifiedBy, `${path}.verifiedBy`)

  return {
    status,
    source: normalizedSource,
    ...(verifiedAt === undefined ? {} : { verifiedAt }),
    ...(verifiedBy === undefined ? {} : { verifiedBy }),
  }
}

function scheduleInterval(value: unknown, path: string): ScheduleInterval {
  const source = record(value, path)
  const opensAt = localTime(source.opensAt, `${path}.opensAt`)
  const closesAt = localTime(source.closesAt, `${path}.closesAt`)
  if (opensAt === closesAt) {
    return invalid(`${path}.closesAt`, 'must differ from opensAt')
  }

  return { opensAt, closesAt }
}

function normalizedIntervals(value: unknown, path: string): ScheduleInterval[] {
  const intervals = array(value, path).map((interval, index) =>
    scheduleInterval(interval, `${path}[${index}]`),
  )

  intervals.sort((left, right) => {
    const startDifference = timeToMinutes(left.opensAt) - timeToMinutes(right.opensAt)
    return startDifference || compareText(left.closesAt, right.closesAt)
  })

  for (let index = 1; index < intervals.length; index += 1) {
    const previous = intervals[index - 1]
    const current = intervals[index]
    if (!previous || !current) continue

    const previousStart = timeToMinutes(previous.opensAt)
    const previousEnd =
      timeToMinutes(previous.closesAt) <= previousStart
        ? timeToMinutes(previous.closesAt) + 24 * 60
        : timeToMinutes(previous.closesAt)
    const currentStart = timeToMinutes(current.opensAt)

    if (currentStart < previousEnd) {
      return invalid(path, 'intervals must not overlap')
    }
  }

  return intervals
}

function weeklySchedule(value: unknown): WeeklyScheduleDay[] {
  const seenDays = new Set<string>()
  const days = array(value, 'weeklySchedule').map((dayValue, index) => {
    const path = `weeklySchedule[${index}]`
    const source = record(dayValue, path)
    const day = oneOf(source.day, DAYS_OF_WEEK, `${path}.day`)
    if (seenDays.has(day)) {
      return invalid(`${path}.day`, 'weekday must be unique')
    }
    seenDays.add(day)

    return {
      day,
      intervals: normalizedIntervals(source.intervals, `${path}.intervals`),
    }
  })

  if (days.length !== DAYS_OF_WEEK.length || seenDays.size !== DAYS_OF_WEEK.length) {
    return invalid('weeklySchedule', 'must contain each weekday exactly once')
  }

  days.sort((left, right) => DAYS_OF_WEEK.indexOf(left.day) - DAYS_OF_WEEK.indexOf(right.day))
  validateWeeklyCrossDayOverlaps(days)
  return days
}

function validateWeeklyCrossDayOverlaps(days: readonly WeeklyScheduleDay[]) {
  const expanded = days.flatMap((day, dayIndex) =>
    day.intervals.map((interval) => {
      const startInDay = timeToMinutes(interval.opensAt)
      const endInDay = timeToMinutes(interval.closesAt)
      const start = dayIndex * 24 * 60 + startInDay
      const end = dayIndex * 24 * 60 + (endInDay <= startInDay ? endInDay + 24 * 60 : endInDay)
      return { start, end }
    }),
  )

  const firstDayRepeated = expanded
    .filter(({ start }) => start < 24 * 60)
    .map(({ start, end }) => ({ start: start + 7 * 24 * 60, end: end + 7 * 24 * 60 }))
  const ordered = [...expanded, ...firstDayRepeated].sort((left, right) => left.start - right.start)

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1]
    const current = ordered[index]
    if (previous && current && current.start < previous.end) {
      return invalid('weeklySchedule', 'intervals must not overlap across weekday boundaries')
    }
  }
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function dateSpanDays(startsOn: string, endsOn: string): number {
  return (
    (new Date(`${endsOn}T00:00:00.000Z`).getTime() -
      new Date(`${startsOn}T00:00:00.000Z`).getTime()) /
      86_400_000 +
    1
  )
}

function hoursExceptions(value: unknown, perspective: ContentPerspective): HoursException[] {
  const parsed = array(value, 'hoursExceptions').map((exceptionValue, index) => {
    const path = `hoursExceptions[${index}]`
    const source = record(exceptionValue, path)
    const startsOn = isoDate(source.startsOn, `${path}.startsOn`)
    const endsOn = isoDate(source.endsOn, `${path}.endsOn`)
    if (endsOn < startsOn) {
      return invalid(`${path}.endsOn`, 'must be the same as or later than startsOn')
    }

    const status = oneOf(source.status, HOURS_EXCEPTION_STATUSES, `${path}.status`)
    const intervalSource =
      status === 'closed' && source.intervals === undefined ? [] : source.intervals
    const intervals = normalizedIntervals(intervalSource, `${path}.intervals`)
    if (status === 'closed' && intervals.length !== 0) {
      return invalid(`${path}.intervals`, 'closed exceptions must not contain intervals')
    }
    if (status === 'special-hours' && intervals.length === 0) {
      return invalid(`${path}.intervals`, 'special-hours exceptions require an interval')
    }

    const base = {
      ...identity(source, path, perspective),
      provenance: provenance(source.provenance, `${path}.provenance`, perspective),
      startsOn,
      endsOn,
      ...(source.publicNote === undefined
        ? {}
        : { publicNote: text(source.publicNote, `${path}.publicNote`) }),
      priority: integer(source.priority, `${path}.priority`),
      expiresAt: isoDateTime(source.expiresAt, `${path}.expiresAt`),
    }

    const normalized: HoursException =
      status === 'closed'
        ? { ...base, status, intervals: [] }
        : { ...base, status, intervals: [intervals[0]!, ...intervals.slice(1)] }

    return { normalized, sourceIndex: index }
  })

  for (let leftIndex = 0; leftIndex < parsed.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < parsed.length; rightIndex += 1) {
      const left = parsed[leftIndex]
      const right = parsed[rightIndex]
      if (!left || !right) continue

      const overlaps =
        left.normalized.startsOn <= right.normalized.endsOn &&
        right.normalized.startsOn <= left.normalized.endsOn
      const sameSpan =
        dateSpanDays(left.normalized.startsOn, left.normalized.endsOn) ===
        dateSpanDays(right.normalized.startsOn, right.normalized.endsOn)

      if (overlaps && sameSpan && left.normalized.priority === right.normalized.priority) {
        return invalid(
          `hoursExceptions[${right.sourceIndex}]`,
          'overlapping exceptions with equal span and priority are ambiguous',
        )
      }
    }
  }

  return parsed
    .map(({ normalized }) => normalized)
    .sort(
      (left, right) =>
        compareText(left.startsOn, right.startsOn) ||
        dateSpanDays(left.startsOn, left.endsOn) - dateSpanDays(right.startsOn, right.endsOn) ||
        right.priority - left.priority ||
        compareText(left.id, right.id),
    )
}

function money(value: UnknownRecord, path: string): PriceOption['price'] {
  const hasDecimalAmount = value.amount !== undefined
  const hasNormalizedPrice = value.price !== undefined
  if (hasDecimalAmount === hasNormalizedPrice) {
    return invalid(path, 'must contain exactly one of amount or price')
  }

  if (hasDecimalAmount) {
    const amount = finiteNumber(value.amount, `${path}.amount`)
    if (amount < 0) {
      return invalid(`${path}.amount`, 'must not be negative')
    }

    const scaled = amount * 100
    const amountMinor = Math.round(scaled)
    if (Math.abs(scaled - amountMinor) > 1e-8) {
      return invalid(`${path}.amount`, 'must not contain fractional cents')
    }

    return { amountMinor, currency: 'USD' }
  }

  const price = record(value.price, `${path}.price`)
  const amountMinor = integer(price.amountMinor, `${path}.price.amountMinor`)
  if (amountMinor < 0) {
    return invalid(`${path}.price.amountMinor`, 'must not be negative')
  }
  if (price.currency !== 'USD') {
    return invalid(`${path}.price.currency`, 'must be USD')
  }

  return { amountMinor, currency: 'USD' }
}

function priceOption(value: unknown, path: string, labelRequired: boolean): PriceOption {
  const source = record(value, path)
  const label = optionalText(source.label, `${path}.label`)
  if (labelRequired && label === undefined) {
    return invalid(`${path}.label`, 'is required when an item has multiple prices')
  }

  return {
    ...(label === undefined ? {} : { label }),
    price: money(source, path),
  }
}

function menuItem(value: unknown, path: string, perspective: ContentPerspective): MenuItem {
  const source = record(value, path)
  const pricingKind = oneOf(source.pricingKind, ['fixed', 'market'] as const, `${path}.pricingKind`)
  const dietaryLabels = array(source.dietaryLabels, `${path}.dietaryLabels`).map((label, index) =>
    oneOf(label, DIETARY_LABELS, `${path}.dietaryLabels[${index}]`),
  )
  if (new Set(dietaryLabels).size !== dietaryLabels.length) {
    return invalid(`${path}.dietaryLabels`, 'must not contain duplicates')
  }
  dietaryLabels.sort((left, right) => DIETARY_LABELS.indexOf(left) - DIETARY_LABELS.indexOf(right))

  const seasonalitySource =
    source.seasonality === undefined ? undefined : record(source.seasonality, `${path}.seasonality`)
  const seasonality = seasonalitySource
    ? {
        ...(seasonalitySource.startsOn === undefined
          ? {}
          : { startsOn: isoDate(seasonalitySource.startsOn, `${path}.seasonality.startsOn`) }),
        ...(seasonalitySource.endsOn === undefined
          ? {}
          : { endsOn: isoDate(seasonalitySource.endsOn, `${path}.seasonality.endsOn`) }),
        label: text(seasonalitySource.label, `${path}.seasonality.label`),
      }
    : undefined
  if (seasonality?.startsOn && seasonality.endsOn && seasonality.endsOn < seasonality.startsOn) {
    return invalid(`${path}.seasonality.endsOn`, 'must be the same as or later than startsOn')
  }

  const base = {
    ...identity(source, path, perspective),
    provenance: provenance(source.provenance, `${path}.provenance`, perspective),
    name: text(source.name, `${path}.name`),
    ...(source.emoji === undefined ? {} : { emoji: text(source.emoji, `${path}.emoji`) }),
    ...(source.description === undefined
      ? {}
      : { description: text(source.description, `${path}.description`) }),
    dietaryLabels,
    ...(source.heatLevel === undefined
      ? {}
      : { heatLevel: oneOf(source.heatLevel, HEAT_LEVELS, `${path}.heatLevel`) }),
    availability: oneOf(source.availability, MENU_AVAILABILITY_STATES, `${path}.availability`),
    isVisible: boolean(source.isVisible, `${path}.isVisible`),
    isFeatured: boolean(source.isFeatured, `${path}.isFeatured`),
    ...(seasonality === undefined ? {} : { seasonality }),
    ...(source.imageId === undefined ? {} : { imageId: text(source.imageId, `${path}.imageId`) }),
    sortOrder: integer(source.sortOrder, `${path}.sortOrder`),
  }

  if (pricingKind === 'fixed') {
    if (source.marketPriceLabel !== undefined) {
      return invalid(`${path}.marketPriceLabel`, 'must not be set for fixed pricing')
    }
    const priceValues = array(source.priceOptions, `${path}.priceOptions`)
    if (priceValues.length === 0) {
      return invalid(`${path}.priceOptions`, 'must contain at least one price')
    }
    const prices = priceValues.map((option, index) =>
      priceOption(option, `${path}.priceOptions[${index}]`, priceValues.length > 1),
    )

    return {
      ...base,
      pricingKind,
      priceOptions: [prices[0]!, ...prices.slice(1)],
    }
  }

  if (source.priceOptions !== undefined) {
    return invalid(`${path}.priceOptions`, 'must not be set for market pricing')
  }

  return {
    ...base,
    pricingKind,
    marketPriceLabel: text(source.marketPriceLabel, `${path}.marketPriceLabel`),
  }
}

function menu(value: unknown, perspective: ContentPerspective): MenuCategory[] {
  const categories = array(value, 'menu').map((categoryValue, categoryIndex) => {
    const path = `menu[${categoryIndex}]`
    const source = record(categoryValue, path)
    const items = array(source.items, `${path}.items`)
      .map((item, itemIndex) => menuItem(item, `${path}.items[${itemIndex}]`, perspective))
      .filter(({ isVisible }) => isVisible)
      .sort(
        (left, right) =>
          left.sortOrder - right.sortOrder ||
          compareText(left.name, right.name) ||
          compareText(left.id, right.id),
      )

    return {
      ...identity(source, path, perspective),
      name: text(source.name, `${path}.name`),
      slug: text(source.slug, `${path}.slug`),
      ...(source.description === undefined
        ? {}
        : { description: text(source.description, `${path}.description`) }),
      sortOrder: integer(source.sortOrder, `${path}.sortOrder`),
      isActive: boolean(source.isActive, `${path}.isActive`),
      items,
    }
  })

  const active = categories
    .filter(({ isActive }) => isActive)
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        compareText(left.name, right.name) ||
        compareText(left.id, right.id),
    )

  const names = new Set<string>()
  const slugs = new Set<string>()
  for (let index = 0; index < active.length; index += 1) {
    const category = active[index]
    if (!category) continue
    if (names.has(category.name)) {
      return invalid(`menu[${index}].name`, 'active category names must be unique')
    }
    if (slugs.has(category.slug)) {
      return invalid(`menu[${index}].slug`, 'active category slugs must be unique')
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug)) {
      return invalid(`menu[${index}].slug`, 'must be a lowercase URL-safe slug')
    }
    names.add(category.name)
    slugs.add(category.slug)
  }

  return active
}

function announcement(value: unknown, path: string, perspective: ContentPerspective): Announcement {
  const source = record(value, path)
  const startsAt = isoDateTime(source.startsAt, `${path}.startsAt`)
  const endsAt =
    source.endsAt === undefined ? undefined : isoDateTime(source.endsAt, `${path}.endsAt`)
  if (endsAt && endsAt <= startsAt) {
    return invalid(`${path}.endsAt`, 'must be later than startsAt')
  }

  const actionSource =
    source.action === undefined ? undefined : record(source.action, `${path}.action`)
  const action = actionSource
    ? {
        label: text(actionSource.label, `${path}.action.label`),
        url: safeUrl(actionSource.url, `${path}.action.url`),
      }
    : undefined

  return {
    ...identity(source, path, perspective),
    provenance: provenance(source.provenance, `${path}.provenance`, perspective),
    title: text(source.title, `${path}.title`),
    message: text(source.message, `${path}.message`),
    kind: oneOf(source.kind, ANNOUNCEMENT_KINDS, `${path}.kind`),
    startsAt,
    ...(endsAt === undefined ? {} : { endsAt }),
    ...(action === undefined ? {} : { action }),
    priority: integer(source.priority, `${path}.priority`),
    isEnabled: boolean(source.isEnabled, `${path}.isEnabled`),
  }
}

function announcements(value: unknown, perspective: ContentPerspective): Announcement[] {
  return array(value, 'announcements')
    .map((item, index) => announcement(item, `announcements[${index}]`, perspective))
    .filter(({ isEnabled }) => isEnabled)
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        compareText(left.startsAt, right.startsAt) ||
        compareText(left.id, right.id),
    )
}

function portableText(value: unknown, path: string): PortableTextBlock[] {
  return array(value, path).map((blockValue, blockIndex) => {
    const blockPath = `${path}[${blockIndex}]`
    const block = record(blockValue, blockPath)
    if (block.type !== 'block') return invalid(`${blockPath}.type`, 'must be block')
    if (block.style !== 'normal') return invalid(`${blockPath}.style`, 'must be normal')

    const markDefinitions = array(block.markDefinitions, `${blockPath}.markDefinitions`).map(
      (markValue, markIndex) => {
        const markPath = `${blockPath}.markDefinitions[${markIndex}]`
        const mark = record(markValue, markPath)
        if (mark.type !== 'link') return invalid(`${markPath}.type`, 'must be link')
        return {
          key: text(mark.key, `${markPath}.key`),
          type: 'link' as const,
          href: safeUrl(mark.href, `${markPath}.href`),
        }
      },
    )
    const linkKeys = new Set(markDefinitions.map(({ key }) => key))

    const children = array(block.children, `${blockPath}.children`).map((spanValue, spanIndex) => {
      const spanPath = `${blockPath}.children[${spanIndex}]`
      const span = record(spanValue, spanPath)
      if (span.type !== 'span') return invalid(`${spanPath}.type`, 'must be span')
      const marks = array(span.marks, `${spanPath}.marks`).map((mark, markIndex) => {
        const normalizedMark = text(mark, `${spanPath}.marks[${markIndex}]`)
        if (
          normalizedMark !== 'strong' &&
          normalizedMark !== 'em' &&
          !linkKeys.has(normalizedMark)
        ) {
          return invalid(`${spanPath}.marks[${markIndex}]`, 'must be strong, em, or a defined link')
        }
        return normalizedMark
      })
      return {
        key: text(span.key, `${spanPath}.key`),
        type: 'span' as const,
        text: portableTextSpan(span.text, `${spanPath}.text`),
        marks,
      }
    })

    const listItem =
      block.listItem === undefined
        ? undefined
        : oneOf(block.listItem, ['bullet', 'number'] as const, `${blockPath}.listItem`)
    const level = block.level === undefined ? undefined : integer(block.level, `${blockPath}.level`)
    if (level !== undefined && level < 1) {
      return invalid(`${blockPath}.level`, 'must be at least 1')
    }

    return {
      key: text(block.key, `${blockPath}.key`),
      type: 'block' as const,
      style: 'normal' as const,
      ...(listItem === undefined ? {} : { listItem }),
      ...(level === undefined ? {} : { level }),
      children,
      markDefinitions,
    }
  })
}

function page(value: unknown, perspective: ContentPerspective): PageContent {
  const path = 'page'
  const source = record(value, path)
  return {
    ...identity(source, path, perspective),
    provenance: provenance(source.provenance, `${path}.provenance`, perspective),
    ...(source.heroEyebrow === undefined
      ? {}
      : { heroEyebrow: text(source.heroEyebrow, `${path}.heroEyebrow`) }),
    heroHeading: text(source.heroHeading, `${path}.heroHeading`),
    heroBody: text(source.heroBody, `${path}.heroBody`),
    ...(source.storyHeading === undefined
      ? {}
      : { storyHeading: text(source.storyHeading, `${path}.storyHeading`) }),
    storyBody: portableText(source.storyBody, `${path}.storyBody`),
    menuHeading: text(source.menuHeading, `${path}.menuHeading`),
    locationHeading: text(source.locationHeading, `${path}.locationHeading`),
    seoTitle: text(source.seoTitle, `${path}.seoTitle`),
    seoDescription: text(source.seoDescription, `${path}.seoDescription`),
    ...(source.socialImageId === undefined
      ? {}
      : { socialImageId: text(source.socialImageId, `${path}.socialImageId`) }),
  }
}

function mediaItem(value: unknown, path: string, perspective: ContentPerspective): PublicMedia {
  const source = record(value, path)
  const dimensionsSource = record(source.dimensions, `${path}.dimensions`)
  const width = integer(dimensionsSource.width, `${path}.dimensions.width`)
  const height = integer(dimensionsSource.height, `${path}.dimensions.height`)
  if (width <= 0) return invalid(`${path}.dimensions.width`, 'must be positive')
  if (height <= 0) return invalid(`${path}.dimensions.height`, 'must be positive')

  const rightsStatus = oneOf(source.rightsStatus, MEDIA_RIGHTS_STATUSES, `${path}.rightsStatus`)
  if (perspective === 'published' && rightsStatus === 'provisional') {
    return invalid(`${path}.rightsStatus`, 'published media must have production-safe rights')
  }

  const focalSource =
    source.focalPoint === undefined ? undefined : record(source.focalPoint, `${path}.focalPoint`)
  const focalPoint = focalSource
    ? {
        x: finiteNumber(focalSource.x, `${path}.focalPoint.x`),
        y: finiteNumber(focalSource.y, `${path}.focalPoint.y`),
      }
    : undefined
  if (focalPoint && (focalPoint.x < 0 || focalPoint.x > 1)) {
    return invalid(`${path}.focalPoint.x`, 'must be between 0 and 1')
  }
  if (focalPoint && (focalPoint.y < 0 || focalPoint.y > 1)) {
    return invalid(`${path}.focalPoint.y`, 'must be between 0 and 1')
  }

  const decorative = boolean(source.decorative, `${path}.decorative`)
  if (typeof source.alt !== 'string') return invalid(`${path}.alt`, 'must be a string')
  const alt = source.alt.trim()
  if (decorative && alt !== '') {
    return invalid(`${path}.alt`, 'decorative media must have empty alt text')
  }
  if (!decorative && alt === '') {
    return invalid(`${path}.alt`, 'meaningful media must have alt text')
  }

  const base = {
    ...identity(source, path, perspective),
    provenance: provenance(source.provenance, `${path}.provenance`, perspective),
    assetId: text(source.assetId, `${path}.assetId`),
    url: httpsUrl(source.url, `${path}.url`),
    dimensions: { width, height, aspectRatio: width / height },
    ...(source.caption === undefined ? {} : { caption: text(source.caption, `${path}.caption`) }),
    ...(source.credit === undefined ? {} : { credit: text(source.credit, `${path}.credit`) }),
    rightsStatus,
    ...(focalPoint === undefined ? {} : { focalPoint }),
  }

  return decorative ? { ...base, decorative, alt: '' } : { ...base, decorative, alt }
}

function media(value: unknown, perspective: ContentPerspective): PublicMedia[] {
  return array(value, 'media')
    .map((item, index) => mediaItem(item, `media[${index}]`, perspective))
    .sort((left, right) => compareText(left.id, right.id))
}

function business(value: unknown, perspective: ContentPerspective): BusinessProfile {
  const path = 'business'
  const source = record(value, path)
  const addressSource = record(source.address, `${path}.address`)
  const coordinatesSource = record(source.coordinates, `${path}.coordinates`)
  const latitude = finiteNumber(coordinatesSource.latitude, `${path}.coordinates.latitude`)
  const longitude = finiteNumber(coordinatesSource.longitude, `${path}.coordinates.longitude`)
  if (latitude < -90 || latitude > 90) {
    return invalid(`${path}.coordinates.latitude`, 'must be between -90 and 90')
  }
  if (longitude < -180 || longitude > 180) {
    return invalid(`${path}.coordinates.longitude`, 'must be between -180 and 180')
  }

  const phoneSource = record(source.phone, `${path}.phone`)
  const e164 = text(phoneSource.e164, `${path}.phone.e164`)
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) {
    return invalid(`${path}.phone.e164`, 'must be a valid E.164 phone number')
  }

  const socialLinks = array(source.socialLinks, `${path}.socialLinks`).map((linkValue, index) => {
    const linkPath = `${path}.socialLinks[${index}]`
    const link = record(linkValue, linkPath)
    return {
      provider: oneOf(link.provider, SOCIAL_PROVIDERS, `${linkPath}.provider`),
      url: httpsUrl(link.url, `${linkPath}.url`),
    }
  })
  socialLinks.sort((left, right) => compareText(left.provider, right.provider))

  if (source.timezone !== BUSINESS_TIMEZONE) {
    return invalid(`${path}.timezone`, `must be ${BUSINESS_TIMEZONE}`)
  }

  return {
    ...identity(source, path, perspective),
    provenance: provenance(source.provenance, `${path}.provenance`, perspective),
    name: text(source.name, `${path}.name`),
    ...(source.legalName === undefined
      ? {}
      : { legalName: text(source.legalName, `${path}.legalName`) }),
    ...(source.tagline === undefined ? {} : { tagline: text(source.tagline, `${path}.tagline`) }),
    phone: {
      e164,
      display: text(phoneSource.display, `${path}.phone.display`),
    },
    address: {
      street: text(addressSource.street, `${path}.address.street`),
      locality: text(addressSource.locality, `${path}.address.locality`),
      region: text(addressSource.region, `${path}.address.region`),
      postalCode: text(addressSource.postalCode, `${path}.address.postalCode`),
      country: text(addressSource.country, `${path}.address.country`).toUpperCase(),
    },
    coordinates: { latitude, longitude },
    timezone: BUSINESS_TIMEZONE,
    ...(source.orderingUrl === undefined
      ? {}
      : { orderingUrl: httpsUrl(source.orderingUrl, `${path}.orderingUrl`) }),
    directionsUrl: httpsUrl(source.directionsUrl, `${path}.directionsUrl`),
    socialLinks,
    ...(source.priceRange === undefined
      ? {}
      : { priceRange: oneOf(source.priceRange, PRICE_RANGES, `${path}.priceRange`) }),
    lastReviewedAt: isoDateTime(source.lastReviewedAt, `${path}.lastReviewedAt`),
  }
}

function assertUniqueEntityIds(snapshot: NormalizedPublicSiteSnapshot) {
  const entries: readonly (readonly [string, string])[] = [
    [snapshot.business.id, 'business.id'],
    [snapshot.page.id, 'page.id'],
    ...snapshot.hoursExceptions.map(
      ({ id }, index) => [id, `hoursExceptions[${index}].id`] as const,
    ),
    ...snapshot.menu.flatMap((category, categoryIndex) => [
      [category.id, `menu[${categoryIndex}].id`] as const,
      ...category.items.map(
        ({ id }, itemIndex) => [id, `menu[${categoryIndex}].items[${itemIndex}].id`] as const,
      ),
    ]),
    ...snapshot.announcements.map(({ id }, index) => [id, `announcements[${index}].id`] as const),
    ...snapshot.media.map(({ id }, index) => [id, `media[${index}].id`] as const),
  ]
  const seen = new Set<string>()
  for (const [id, path] of entries) {
    if (seen.has(id)) return invalid(path, 'content entity IDs must be unique')
    seen.add(id)
  }
}

function assertMediaReferences(snapshot: NormalizedPublicSiteSnapshot) {
  const mediaIds = new Set(snapshot.media.map(({ id }) => id))
  if (snapshot.page.socialImageId && !mediaIds.has(snapshot.page.socialImageId)) {
    return invalid('page.socialImageId', 'must reference normalized media')
  }

  for (let categoryIndex = 0; categoryIndex < snapshot.menu.length; categoryIndex += 1) {
    const category = snapshot.menu[categoryIndex]
    if (!category) continue
    for (let itemIndex = 0; itemIndex < category.items.length; itemIndex += 1) {
      const item = category.items[itemIndex]
      if (item?.imageId && !mediaIds.has(item.imageId)) {
        return invalid(
          `menu[${categoryIndex}].items[${itemIndex}].imageId`,
          'must reference normalized media',
        )
      }
    }
  }
}

export function normalizePublicSiteContent(
  value: unknown,
  options: NormalizePublicSiteContentOptions,
): NormalizedPublicSiteSnapshot {
  const source = record(value, '$')
  if (source.schemaVersion !== PUBLIC_CONTENT_SCHEMA_VERSION) {
    return invalid('schemaVersion', `must equal ${PUBLIC_CONTENT_SCHEMA_VERSION}`)
  }

  const normalized: NormalizedPublicSiteSnapshot = {
    schemaVersion: PUBLIC_CONTENT_SCHEMA_VERSION,
    generatedAt: isoDateTime(source.generatedAt, 'generatedAt'),
    contentRevision: text(source.contentRevision, 'contentRevision'),
    business: business(source.business, options.perspective),
    weeklySchedule: weeklySchedule(source.weeklySchedule),
    hoursExceptions: hoursExceptions(source.hoursExceptions, options.perspective),
    menu: menu(source.menu, options.perspective),
    announcements: announcements(source.announcements, options.perspective),
    page: page(source.page, options.perspective),
    media: media(source.media, options.perspective),
  }

  assertUniqueEntityIds(normalized)
  assertMediaReferences(normalized)
  return normalized
}
