export interface GooglePlaceAttribution {
  readonly provider: string
  readonly providerUri?: string
}

export interface GooglePlaceSummary {
  readonly attributions: readonly GooglePlaceAttribution[]
  readonly rating: number
  readonly reviewCount: number
  readonly reviewsUrl: string
}
