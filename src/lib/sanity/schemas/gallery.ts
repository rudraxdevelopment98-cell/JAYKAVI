import { defineField, defineType } from 'sanity';

export const galleryItemSchema = defineType({
  name: 'galleryItem',
  title: 'Gallery Items',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'artistStatement', type: 'text', rows: 3 }),
    defineField({ name: 'medium', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'year', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'dimensions', type: 'string' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'collection',
      type: 'reference',
      to: [{ type: 'collection' }],
    }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'isFeatured', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'medium' },
  },
});

export const collectionSchema = defineType({
  name: 'collection',
  title: 'Collections',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'curatedBy', type: 'string' }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage' },
  },
});
