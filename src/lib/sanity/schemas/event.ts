import { defineField, defineType } from 'sanity';

export const eventSchema = defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subtitle', type: 'string' }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Premiere', value: 'premiere' },
          { title: 'Screening', value: 'screening' },
          { title: 'Installation', value: 'installation' },
          { title: 'Festival', value: 'festival' },
          { title: 'Workshop', value: 'workshop' },
          { title: 'Live', value: 'live' },
        ],
      },
    }),
    defineField({ name: 'startDate', type: 'datetime', validation: (r) => r.required() }),
    defineField({ name: 'endDate', type: 'datetime' }),
    defineField({
      name: 'location',
      type: 'object',
      fields: [
        { name: 'venueName', type: 'string', title: 'Venue Name' },
        { name: 'address', type: 'string', title: 'Address' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'country', type: 'string', title: 'Country' },
        {
          name: 'coordinates',
          type: 'object',
          fields: [
            { name: 'lat', type: 'number', title: 'Latitude' },
            { name: 'lng', type: 'number', title: 'Longitude' },
          ],
          title: 'Coordinates',
        },
        { name: 'isVirtual', type: 'boolean', title: 'Is Virtual?', initialValue: false },
        { name: 'virtualUrl', type: 'url', title: 'Virtual Event URL' },
      ],
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'ambientVideo', type: 'cloudinary.asset' }),
    defineField({ name: 'description', type: 'text', rows: 5 }),
    defineField({ name: 'ticketUrl', type: 'url' }),
    defineField({ name: 'isFeatured', type: 'boolean', initialValue: false }),
    defineField({ name: 'isPast', type: 'boolean', initialValue: false }),
    defineField({
      name: 'relatedWork',
      type: 'reference',
      to: [{ type: 'work' }],
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'SEO Title' },
        { name: 'description', type: 'text', title: 'SEO Description' },
        { name: 'ogImage', type: 'image', title: 'OG Image' },
        { name: 'noIndex', type: 'boolean', initialValue: false, title: 'No Index' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'heroImage', subtitle: 'type' },
  },
});
