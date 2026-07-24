import { defineArrayMember, defineField, defineType } from 'sanity'

import { EmojiInput } from '../components/EmojiInput'
import { validateSingleEmoji } from './emoji'

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'menuCategory' }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'provenance', type: 'provenance', validation: (rule) => rule.required() }),
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'emoji',
      title: 'Menu emoji',
      type: 'string',
      description: 'Optional. Choose one emoji to display before the menu item name.',
      components: { input: EmojiInput },
      validation: (rule) => rule.max(32).custom(validateSingleEmoji),
    }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({
      name: 'pricingKind',
      type: 'string',
      options: {
        list: [
          { title: 'Fixed', value: 'fixed' },
          { title: 'Market', value: 'market' },
        ],
        layout: 'radio',
      },
      initialValue: 'fixed',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceOptions',
      type: 'array',
      hidden: ({ parent }) => parent?.pricingKind !== 'fixed',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { pricingKind?: string } | undefined
          if (parent?.pricingKind === 'fixed' && (!Array.isArray(value) || value.length === 0)) {
            return 'At least one price is required for fixed pricing'
          }
          return true
        }),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({
              name: 'amount',
              title: 'Amount (USD)',
              type: 'number',
              validation: (rule) => rule.required().min(0).precision(2),
            }),
          ],
          preview: {
            select: { label: 'label', amount: 'amount' },
            prepare({ label, amount }) {
              const formatted = typeof amount === 'number' ? `$${amount.toFixed(2)}` : '$0.00'
              return { title: label || 'Price', subtitle: formatted }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'marketPriceLabel',
      type: 'string',
      hidden: ({ parent }) => parent?.pricingKind !== 'market',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { pricingKind?: string } | undefined
          if (parent?.pricingKind === 'market' && !value) {
            return 'Label is required for market pricing'
          }
          return true
        }),
    }),
    defineField({
      name: 'dietaryLabels',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'string',
          options: {
            list: [
              { title: 'Vegetarian', value: 'vegetarian' },
              { title: 'Vegan', value: 'vegan' },
              { title: 'Gluten-free', value: 'gluten-free' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'heatLevel',
      type: 'string',
      options: {
        list: [
          { title: 'Mild', value: 'mild' },
          { title: 'Medium', value: 'medium' },
          { title: 'Hot', value: 'hot' },
        ],
      },
    }),
    defineField({
      name: 'availability',
      type: 'string',
      initialValue: 'available',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Sold out', value: 'sold-out' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isVisible',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seasonality',
      type: 'object',
      fields: [
        defineField({ name: 'startsOn', type: 'date' }),
        defineField({ name: 'endsOn', type: 'date' }),
        defineField({ name: 'label', type: 'string', validation: (rule) => rule.required() }),
      ],
    }),
    defineField({ name: 'image', type: 'reference', to: [{ type: 'media' }] }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer(),
    }),
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
      subtitle: 'category.name',
      availability: 'availability',
      emoji: 'emoji',
    },
    prepare({ title, subtitle, availability, emoji }) {
      return {
        title: `${emoji ? `${emoji} ` : ''}${title}`,
        subtitle: `${subtitle || 'No category'} · ${availability || 'available'}`,
      }
    },
  },
})
