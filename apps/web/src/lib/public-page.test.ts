import { describe, expect, it } from 'vitest'

import { createPublicPageContent } from './public-page'
import {
  DEVELOPMENT_REFERENCE_NOW,
  developmentContentFixture,
} from '../../../../packages/content/test/fixtures/development-content'

describe('createPublicPageContent', () => {
  it('keeps timer inputs and visible content while removing editorial metadata', () => {
    const publicContent = createPublicPageContent(
      developmentContentFixture,
      new Date(DEVELOPMENT_REFERENCE_NOW),
    )
    const serialized = JSON.stringify(publicContent)

    expect(publicContent.announcements.map(({ title }) => title)).toEqual([
      'Future development closure',
      'Active development notice',
    ])
    expect(publicContent.hoursExceptions[0]).toMatchObject({
      startsOn: '2030-07-20',
      status: 'closed',
    })
    expect(publicContent.menu[0]?.items[0]).toMatchObject({
      emoji: '🌯',
      name: 'The Impossibly Long Named Fictional Burrito Built for Wrapping Tests',
      pricingKind: 'fixed',
    })

    expect(serialized).not.toContain('development.business-profile')
    expect(serialized).not.toContain('revision-001')
    expect(serialized).not.toContain('publicationState')
    expect(serialized).not.toContain('provenance')
    expect(serialized).not.toContain('verifiedBy')
    expect(serialized).not.toContain('assetId')
  })
})
