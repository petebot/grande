import { describe, expect, it } from 'vitest'

import { validateSingleEmoji } from './emoji'

describe('validateSingleEmoji', () => {
  it.each([undefined, '🌯', '👩🏽‍🍳', '👨‍👩‍👧‍👦', '🇲🇽', '1️⃣'])('accepts one optional emoji: %s', (value) => {
    expect(validateSingleEmoji(value)).toBe(true)
  })

  it.each(['', 'burrito', '🌯🌮', 'Try 🌯', '🌯 special'])(
    'rejects non-emoji or multiple-grapheme content: %s',
    (value) => {
      expect(validateSingleEmoji(value)).toBe('Choose exactly one emoji')
    },
  )
})
