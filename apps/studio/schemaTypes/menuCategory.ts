import { defineField, defineType } from 'sanity'

export const menuCategory = defineType({
  name: 'menuCategory',
  title: 'Menu Category',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({ name: 'sortOrder', type: 'number', initialValue: 0, validation: (rule) => rule.required().integer() }),
    defineField({ name: 'isActive', type: 'boolean', initialValue: true, validation: (rule) => rule.required() }),
  ],
  orderings: [
    {
      title: 'Sort order, ascending',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, isActive }) {
      return {
        title,
        subtitle: `${subtitle || 'no-slug'}${isActive ? '' : ' (inactive)'}`,
      }
    },
  },
})
