import { defineArrayMember, defineField, defineType } from 'sanity'

export const pageContent = defineType({
  name: 'pageContent',
  title: 'Page Content',
  type: 'document',
  fields: [
    defineField({ name: 'provenance', type: 'provenance', validation: (rule) => rule.required() }),
    defineField({ name: 'heroEyebrow', type: 'string' }),
    defineField({ name: 'heroHeading', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'heroBody', type: 'text', rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: 'storyHeading', type: 'string' }),
    defineField({
      name: 'storyBody',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    validation: (rule) =>
                      rule.required().uri({ allowRelative: true, scheme: ['https'] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'menuHeading', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'locationHeading', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'seoTitle', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'socialImage', type: 'reference', to: [{ type: 'media' }] }),
  ],
  preview: {
    select: { title: 'seoTitle', subtitle: 'heroHeading' },
  },
})
