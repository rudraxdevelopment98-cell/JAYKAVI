import { defineField, defineType } from 'sanity';

export const siteConfigSchema = defineType({
  name: 'siteConfig',
  title: 'Site Configuration',
  type: 'document',
  fields: [
    defineField({ name: 'siteName', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'logo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'logoDark', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'platform',
            type: 'string',
            options: {
              list: ['instagram', 'twitter', 'linkedin', 'vimeo', 'imdb', 'website'],
            },
          },
          { name: 'url', type: 'url' },
        ],
      }],
    }),
    defineField({ name: 'contactEmail', type: 'email' }),
    defineField({ name: 'contactPhone', type: 'string' }),
    defineField({
      name: 'defaultSEO',
      type: 'object',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'ogImage', type: 'image' },
        { name: 'keywords', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'announcementBanner',
      type: 'object',
      fields: [
        { name: 'text', type: 'string', title: 'Message' },
        { name: 'link', type: 'url', title: 'Link URL' },
        { name: 'isActive', type: 'boolean', initialValue: false, title: 'Active?' },
      ],
    }),
  ],
  preview: { select: { title: 'siteName' } },
});
