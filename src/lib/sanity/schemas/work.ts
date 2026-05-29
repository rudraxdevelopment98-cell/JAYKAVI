import { defineField, defineType } from 'sanity';

export const workSchema = defineType({
  name: 'work',
  title: 'Works',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subtitle', type: 'string' }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Film', value: 'film' },
          { title: 'Series', value: 'series' },
          { title: 'Short', value: 'short' },
          { title: 'Event', value: 'event' },
          { title: 'Installation', value: 'installation' },
          { title: 'Art', value: 'art' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'genres',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'drama', 'documentary', 'thriller', 'romance',
          'sci-fi', 'animation', 'experimental', 'biography',
        ],
      },
    }),
    defineField({ name: 'releaseYear', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'duration', type: 'number', description: 'Duration in minutes' }),
    defineField({ name: 'rating', type: 'number' }),
    defineField({ name: 'synopsis', type: 'text', rows: 5 }),
    defineField({ name: 'synopsisShort', type: 'text', rows: 2 }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'heroVideo', type: 'cloudinary.asset' }),
    defineField({ name: 'trailer', type: 'cloudinary.asset' }),
    defineField({
      name: 'galleryImages',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'cast',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', type: 'string', title: 'Name' },
          { name: 'role', type: 'string', title: 'Role' },
          { name: 'photo', type: 'image', title: 'Photo' },
          { name: 'biography', type: 'text', title: 'Biography' },
        ],
      }],
    }),
    defineField({
      name: 'crew',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', type: 'string', title: 'Name' },
          { name: 'title', type: 'string', title: 'Title / Role' },
          { name: 'photo', type: 'image', title: 'Photo' },
        ],
      }],
    }),
    defineField({
      name: 'awards',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'festivalName', type: 'string', title: 'Festival Name' },
          { name: 'category', type: 'string', title: 'Category' },
          { name: 'year', type: 'number', title: 'Year' },
          {
            name: 'status',
            type: 'string',
            options: { list: ['winner', 'nominee'] },
            title: 'Status',
          },
          { name: 'logo', type: 'image', title: 'Festival Logo' },
        ],
      }],
    }),
    defineField({
      name: 'streamingPlatforms',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'platform', type: 'string', title: 'Platform Name' },
          { name: 'url', type: 'url', title: 'URL' },
          { name: 'logo', type: 'image', title: 'Logo' },
        ],
      }],
    }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'isNew', type: 'boolean', initialValue: false }),
    defineField({ name: 'isFeatured', type: 'boolean', initialValue: false }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'SEO Title' },
        { name: 'description', type: 'text', title: 'SEO Description' },
        { name: 'ogImage', type: 'image', title: 'OG Image' },
        { name: 'keywords', type: 'array', of: [{ type: 'string' }], title: 'Keywords' },
        { name: 'noIndex', type: 'boolean', initialValue: false, title: 'No Index' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'heroImage', subtitle: 'category' },
  },
});
