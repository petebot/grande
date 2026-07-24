import { defineField, defineType } from 'sanity'

export const provenance = defineType({
  name: 'provenance',
  title: 'Provenance',
  type: 'object',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Placeholder', value: 'placeholder' },
          { title: 'Provisional', value: 'provisional' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Licensed', value: 'licensed' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(200),
    }),
    defineField({
      name: 'verifiedAt',
      title: 'Verified at',
      type: 'datetime',
    }),
    defineField({
      name: 'verifiedBy',
      title: 'Verified by',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      status: 'status',
      source: 'source',
    },
    prepare({ status, source }) {
      return {
        title: status ? `Provenance: ${status}` : 'Provenance',
        subtitle: source || 'No source recorded',
      }
    },
  },
})
