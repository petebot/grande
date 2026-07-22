import { describe, expect, it } from 'vitest'

import { parsePublishedSnapshot } from '@grande/content'

import serializedSnapshot from './public-content.snapshot.json?raw'

describe('deployment content snapshot', () => {
  it('contains a complete portfolio-approved public experience', () => {
    const snapshot = parsePublishedSnapshot(serializedSnapshot)

    expect(snapshot.business.name).toBe('Grande Burrito')
    expect(snapshot.business.phone).toEqual({
      display: '(207) 555-0100',
      e164: '+12075550100',
    })
    expect(snapshot.menu.flatMap(({ items }) => items)).toHaveLength(18)
    expect(snapshot.announcements).toContainEqual(
      expect.objectContaining({
        title: 'Independent website concept',
      }),
    )
  })
})
