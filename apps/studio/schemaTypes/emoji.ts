const emojiCodePoint = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u
const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export function validateSingleEmoji(value: string | undefined): true | string {
  if (value === undefined) return true

  const normalized = value.trim()
  const graphemes = [...graphemeSegmenter.segment(normalized)]
  if (graphemes.length !== 1 || !emojiCodePoint.test(normalized)) {
    return 'Choose exactly one emoji'
  }

  return true
}
