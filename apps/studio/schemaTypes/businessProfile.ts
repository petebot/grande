import { defineArrayMember, defineField, defineType } from 'sanity'

export const businessProfile = defineType({
  name: 'businessProfile',
  title: 'Business Profile',
  type: 'document',
  fields: [
    defineField({ name: 'provenance', type: 'provenance', validation: (rule) => rule.required() }),
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required().min(2) }),
    defineField({ name: 'legalName', type: 'string' }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({
      name: 'phone',
      type: 'object',
      fields: [
        defineField({ name: 'e164', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'display', type: 'string', validation: (rule) => rule.required() }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      type: 'object',
      fields: [
        defineField({ name: 'street', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'locality', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'region', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'postalCode', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'country', type: 'string', validation: (rule) => rule.required() }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coordinates',
      type: 'geopoint',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'timezone',
      type: 'string',
      initialValue: 'America/New_York',
      validation: (rule) => rule.required().custom((value) => value === 'America/New_York' || 'Use America/New_York'),
    }),
    defineField({ name: 'orderingUrl', type: 'url', validation: (rule) => rule.uri({ scheme: ['https'] }) }),
    defineField({
      name: 'directionsUrl',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'provider',
              type: 'string',
              options: {
                list: [
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'YouTube', value: 'youtube' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (rule) => rule.required().uri({ scheme: ['https'] }),
            }),
          ],
          preview: {
            select: { title: 'provider', subtitle: 'url' },
          },
        }),
      ],
    }),
    defineField({
      name: 'priceRange',
      type: 'string',
      options: {
        list: ['$', '$$', '$$$', '$$$$'],
        layout: 'radio',
      },
    }),
    defineField({ name: 'lastReviewedAt', type: 'datetime', validation: (rule) => rule.required() }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'tagline',
    },
  },
})
