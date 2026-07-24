import { defineArrayMember, defineField, defineType } from 'sanity'

const dayOptions = [
  { title: 'Monday', value: 'monday' },
  { title: 'Tuesday', value: 'tuesday' },
  { title: 'Wednesday', value: 'wednesday' },
  { title: 'Thursday', value: 'thursday' },
  { title: 'Friday', value: 'friday' },
  { title: 'Saturday', value: 'saturday' },
  { title: 'Sunday', value: 'sunday' },
]

export const weeklySchedule = defineType({
  name: 'weeklySchedule',
  title: 'Weekly Schedule',
  type: 'document',
  fields: [
    defineField({
      name: 'days',
      type: 'array',
      validation: (rule) => rule.required().min(7).max(7),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'day',
              type: 'string',
              options: { list: dayOptions },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'intervals',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({ name: 'opensAt', type: 'string', validation: (rule) => rule.required().regex(/^(?:[01]\\d|2[0-3]):[0-5]\\d$/) }),
                    defineField({ name: 'closesAt', type: 'string', validation: (rule) => rule.required().regex(/^(?:[01]\\d|2[0-3]):[0-5]\\d$/) }),
                  ],
                  preview: {
                    select: { opensAt: 'opensAt', closesAt: 'closesAt' },
                    prepare({ opensAt, closesAt }) {
                      return { title: `${opensAt || '--:--'} to ${closesAt || '--:--'}` }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { day: 'day' },
            prepare({ day }) {
              return { title: day || 'Day' }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Weekly Schedule' }
    },
  },
})
