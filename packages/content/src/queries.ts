import {
  CONTENT_PERSPECTIVES,
  PUBLIC_CONTENT_SCHEMA_VERSION,
  type ContentPerspective,
  type IsoDateTime,
} from './types.js'

/** Parameters substituted into the canonical public-content GROQ query. */
export interface PublicSiteContentQueryParams {
  readonly now: IsoDateTime
}

export interface PublicSiteContentQueryOptions {
  readonly perspective: ContentPerspective
  readonly now: IsoDateTime
}

/**
 * Framework-independent fetch input. The caller supplies this to @sanity/client so
 * snapshot generation, public SSR, and authenticated preview cannot drift apart.
 */
export interface PublicSiteContentQueryRequest {
  readonly query: typeof PUBLIC_SITE_CONTENT_QUERY
  readonly params: PublicSiteContentQueryParams
  readonly perspective: ContentPerspective
  readonly useCdn: boolean
}

const publicationStateProjection = `
  "publicationState": select(
    _originalId in path("drafts.**") => "draft",
    "published"
  )`

const provenanceProjection = `
  "provenance": provenance {
    status,
    source,
    defined(verifiedAt) => { verifiedAt },
    defined(verifiedBy) => { verifiedBy }
  }`

/**
 * The only Sanity projection allowed to supply public business facts.
 *
 * Sanity's fetch perspective is intentionally not encoded in GROQ: applying either
 * `published` or `drafts` to this same query lets Content Lake select the appropriate
 * document versions without maintaining a second preview query.
 */
export const PUBLIC_SITE_CONTENT_QUERY: string = `{
  "schemaVersion": ${PUBLIC_CONTENT_SCHEMA_VERSION},
  "generatedAt": $now,
  "contentRevision": array::join(
    (*[
      _type in [
        "businessProfile",
        "weeklySchedule",
        "hoursException",
        "menuCategory",
        "menuItem",
        "announcement",
        "pageContent",
        "media"
      ]
    ] | order(_id asc))[]._rev,
    "."
  ),
  "business": *[_type == "businessProfile"][0] {
    "id": _id,
    "revision": _rev,
    ${publicationStateProjection},
    ${provenanceProjection},
    name,
    defined(legalName) => { legalName },
    defined(tagline) => { tagline },
    phone {
      e164,
      display
    },
    address {
      street,
      locality,
      region,
      postalCode,
      country
    },
    "coordinates": {
      "latitude": coordinates.lat,
      "longitude": coordinates.lng
    },
    timezone,
    defined(orderingUrl) => { orderingUrl },
    directionsUrl,
    "socialLinks": socialLinks[] {
      provider,
      url
    },
    defined(priceRange) => { priceRange },
    lastReviewedAt
  },
  "weeklySchedule": *[_type == "weeklySchedule"][0].days[] {
    day,
    "intervals": intervals[] {
      opensAt,
      closesAt
    }
  },
  "hoursExceptions": *[
    _type == "hoursException" && dateTime(expiresAt) >= dateTime($now)
  ] | order(startsOn asc, endsOn asc, priority desc, _id asc) {
    "id": _id,
    "revision": _rev,
    ${publicationStateProjection},
    ${provenanceProjection},
    startsOn,
    endsOn,
    status,
    defined(intervals) => {
      "intervals": intervals[] {
        opensAt,
        closesAt
      }
    },
    defined(publicNote) => { publicNote },
    priority,
    expiresAt
  },
  "menu": *[_type == "menuCategory" && isActive == true]
    | order(sortOrder asc, _id asc) {
      "id": _id,
      "revision": _rev,
      ${publicationStateProjection},
      name,
      "slug": slug.current,
      defined(description) => { description },
      sortOrder,
      isActive,
      "items": *[
        _type == "menuItem" &&
        category._ref == ^._id &&
        isVisible == true
      ] | order(sortOrder asc, _id asc) {
        "id": _id,
        "revision": _rev,
        ${publicationStateProjection},
        ${provenanceProjection},
        name,
        defined(description) => { description },
        pricingKind,
        pricingKind == "fixed" => {
          "priceOptions": priceOptions[] {
            defined(label) => { label },
            amount
          }
        },
        pricingKind == "market" => { marketPriceLabel },
        "dietaryLabels": dietaryLabels[],
        defined(heatLevel) => { heatLevel },
        availability,
        isVisible,
        isFeatured,
        defined(seasonality) => {
          seasonality {
            defined(startsOn) => { startsOn },
            defined(endsOn) => { endsOn },
            label
          }
        },
        defined(image._ref) => { "imageId": image._ref },
        sortOrder
      }
    },
  "announcements": *[
    _type == "announcement" &&
    isEnabled == true &&
    dateTime(startsAt) <= dateTime($now) &&
    (!defined(endsAt) || dateTime(endsAt) > dateTime($now))
  ] | order(priority desc, startsAt asc, _id asc) {
    "id": _id,
    "revision": _rev,
    ${publicationStateProjection},
    ${provenanceProjection},
    title,
    message,
    kind,
    startsAt,
    defined(endsAt) => { endsAt },
    defined(action) => {
      action {
        label,
        url
      }
    },
    priority,
    isEnabled
  },
  "page": *[_type == "pageContent"][0] {
    "id": _id,
    "revision": _rev,
    ${publicationStateProjection},
    ${provenanceProjection},
    defined(heroEyebrow) => { heroEyebrow },
    heroHeading,
    heroBody,
    defined(storyHeading) => { storyHeading },
    "storyBody": storyBody[] {
      "key": _key,
      "type": _type,
      style,
      defined(listItem) => { listItem },
      defined(level) => { level },
      "children": children[] {
        "key": _key,
        "type": _type,
        text,
        "marks": marks[]
      },
      "markDefinitions": markDefs[] {
        "key": _key,
        "type": "link",
        href
      }
    },
    menuHeading,
    locationHeading,
    seoTitle,
    seoDescription,
    defined(socialImage._ref) => { "socialImageId": socialImage._ref }
  },
  "media": *[_type == "media"] | order(_id asc) {
    "id": _id,
    "revision": _rev,
    ${publicationStateProjection},
    ${provenanceProjection},
    "assetId": image.asset->_id,
    "url": image.asset->url,
    "dimensions": {
      "width": image.asset->metadata.dimensions.width,
      "height": image.asset->metadata.dimensions.height,
      "aspectRatio": image.asset->metadata.dimensions.aspectRatio
    },
    decorative,
    alt,
    defined(caption) => { caption },
    defined(credit) => { credit },
    rightsStatus,
    defined(image.hotspot) => {
      "focalPoint": {
        "x": image.hotspot.x,
        "y": image.hotspot.y
      }
    }
  }
}`

function normalizeQueryInstant(now: IsoDateTime): IsoDateTime {
  if (
    typeof now !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(now) ||
    !/(?:Z|[+-]\d{2}:\d{2})$/.test(now)
  ) {
    throw new TypeError('Public content query now must be an ISO 8601 date-time with a timezone')
  }

  const parsed = new Date(now)
  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError('Public content query now must be a valid ISO 8601 date-time')
  }

  return parsed.toISOString()
}

export function createPublicSiteContentQueryRequest(
  options: PublicSiteContentQueryOptions,
): PublicSiteContentQueryRequest {
  if (!CONTENT_PERSPECTIVES.includes(options.perspective)) {
    throw new TypeError('Public content query perspective must be published or drafts')
  }

  return {
    query: PUBLIC_SITE_CONTENT_QUERY,
    params: { now: normalizeQueryInstant(options.now) },
    perspective: options.perspective,
    useCdn: options.perspective === 'published',
  }
}
