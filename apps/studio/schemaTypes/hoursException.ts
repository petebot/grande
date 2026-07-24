import { defineArrayMember, defineField, defineType } from 'sanity'

export const hoursException = defineType({
  name: 'hoursException',
  title: 'Hours Exception',
  type: 'document',
  fields: [
    defineField({ name: 'provenance', type: 'provenance', validation: (rule) => rule.required() }),
    defineField({ name: 'startsOn', type: 'date', validation: (rule) => rule.required() }),
    defineField({ name: 'endsOn', type: 'date', validation: (rule) => rule.required() }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Closed', value: 'closed' },
          { title: 'Special hours', value: 'special-hours' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intervals',
      type: 'array',
      hidden: ({ parent }) => parent?.status === 'closed',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'opensAt',
              type: 'string',
              validation: (rule) => rule.required().regex(/^(?:[01]\\d|2[0-3]):[0-5]\\d$/),
            }),
            defineField({
              name: 'closesAt',
              type: 'string',
              validation: (rule) => rule.required().regex(/^(?:[01]\\d|2[0-3]):[0-5]\\d$/),
            }),
          ],
        }),
      ],
    }),
    defineField({ name: 'publicNote', type: 'string' }),
    defineField({
      name: 'priority',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer(),
    }),
    defineField({ name: 'expiresAt', type: 'datetime', validation: (rule) => rule.required() }),
  ],
  preview: {
    select: {
      status: 'status',
      startsOn: 'startsOn',
      endsOn: 'endsOn',
    },
    prepare({ status, startsOn, endsOn }) {
      return {
        title: status === 'closed' ? 'Closed exception' : 'Special-hours exception',
        subtitle: `${startsOn || '?'} to ${endsOn || '?'}`,
      }
    },
  },
})
