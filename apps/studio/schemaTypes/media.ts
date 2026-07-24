import { defineField, defineType } from 'sanity'

export const media = defineType({
  name: 'media',
  title: 'Media',
  type: 'document',
  fields: [
    defineField({ name: 'provenance', type: 'provenance', validation: (rule) => rule.required() }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'decorative', type: 'boolean', initialValue: false, validation: (rule) => rule.required() }),
    defineField({
      name: 'alt',
      type: 'string',
      description: 'Leave empty only when decorative is enabled.',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { decorative?: boolean } | undefined
          const decorative = parent?.decorative === true
          const text = typeof value === 'string' ? value.trim() : ''
          if (!decorative && !text) return 'Alt text is required when image is not decorative'
          if (decorative && text) return 'Decorative images must have empty alt text'
          return true
        }),
    }),
    defineField({ name: 'caption', type: 'string' }),
    defineField({ name: 'credit', type: 'string' }),
    defineField({
      name: 'rightsStatus',
      type: 'string',
      options: {
        list: [
          { title: 'Provisional', value: 'provisional' },
          { title: 'Owned', value: 'owned' },
          { title: 'Licensed', value: 'licensed' },
          { title: 'Permission granted', value: 'permission-granted' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'alt',
      subtitle: 'rightsStatus',
      media: 'image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Decorative image',
        subtitle,
        media,
      }
    },
  },
})
