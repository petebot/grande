import { defineField, defineType } from 'sanity'

export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({ name: 'provenance', type: 'provenance', validation: (rule) => rule.required() }),
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'message', type: 'text', rows: 3, validation: (rule) => rule.required() }),
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Service change', value: 'service-change' },
          { title: 'Closure', value: 'closure' },
          { title: 'Promotion', value: 'promotion' },
        ],
      },
      initialValue: 'info',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'startsAt', type: 'datetime', validation: (rule) => rule.required() }),
    defineField({ name: 'endsAt', type: 'datetime' }),
    defineField({
      name: 'action',
      type: 'object',
      fields: [
        defineField({ name: 'label', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'url', type: 'url', validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ['https'] }) }),
      ],
    }),
    defineField({ name: 'priority', type: 'number', initialValue: 0, validation: (rule) => rule.required().integer() }),
    defineField({ name: 'isEnabled', type: 'boolean', initialValue: true, validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'kind', enabled: 'isEnabled' },
    prepare({ title, subtitle, enabled }) {
      return {
        title,
        subtitle: `${subtitle || 'announcement'}${enabled ? '' : ' (disabled)'}`,
      }
    },
  },
})
