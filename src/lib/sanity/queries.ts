import { groq } from 'next-sanity';

// ─── Fragments ──────────────────────────────────────────────────────────────

const imageFragment = groq`
  _type,
  asset->{ _id, url, metadata { dimensions, palette, blurHash } },
  hotspot,
  alt
`;

const seoFragment = groq`
  title,
  description,
  ogImage { ${imageFragment} },
  keywords,
  noIndex
`;

const slugFragment = groq`slug { current }`;

// ─── Work ────────────────────────────────────────────────────────────────────

export const workCardFragment = groq`
  _id,
  _type,
  title,
  tagline,
  category,
  genres,
  releaseYear,
  duration,
  rating,
  synopsisShort,
  heroImage { ${imageFragment} },
  isNew,
  isFeatured,
  tags,
  ${slugFragment}
`;

export const getFeaturedWorksQuery = groq`
  *[_type == "work" && isFeatured == true] | order(publishedAt desc) [0...6] {
    ${workCardFragment}
  }
`;

export const getAllWorksQuery = groq`
  *[_type == "work"] | order(publishedAt desc) {
    ${workCardFragment}
  }
`;

export const getWorkBySlugQuery = groq`
  *[_type == "work" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    subtitle,
    tagline,
    category,
    genres,
    releaseYear,
    duration,
    rating,
    synopsis,
    synopsisShort,
    heroImage { ${imageFragment} },
    heroVideo,
    trailer,
    galleryImages[] { ${imageFragment} },
    cast[] { _key, name, role, photo { ${imageFragment} }, biography },
    crew[] { _key, name, title, photo { ${imageFragment} } },
    awards[] { _key, festivalName, category, year, status, logo { ${imageFragment} } },
    streamingPlatforms[] { _key, platform, url, logo { ${imageFragment} }, availableRegions },
    isNew,
    isFeatured,
    publishedAt,
    seo { ${seoFragment} },
    ${slugFragment}
  }
`;

export const getWorkSlugsPaths = groq`
  *[_type == "work"] { ${slugFragment} }
`;

// ─── Events ──────────────────────────────────────────────────────────────────

export const getUpcomingEventsQuery = groq`
  *[_type == "event" && !isPast] | order(startDate asc) {
    _id,
    title,
    subtitle,
    type,
    startDate,
    endDate,
    location,
    heroImage { ${imageFragment} },
    isFeatured,
    ticketUrl,
    ${slugFragment}
  }
`;

export const getPastEventsQuery = groq`
  *[_type == "event" && isPast] | order(startDate desc) [0...12] {
    _id,
    title,
    type,
    startDate,
    location,
    heroImage { ${imageFragment} },
    ${slugFragment}
  }
`;

export const getEventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    subtitle,
    type,
    startDate,
    endDate,
    location,
    heroImage { ${imageFragment} },
    ambientVideo,
    description,
    ticketUrl,
    isFeatured,
    isPast,
    gallery[] { ${imageFragment} },
    relatedWork->{ title, ${slugFragment} },
    seo { ${seoFragment} },
    ${slugFragment}
  }
`;

// ─── Gallery ─────────────────────────────────────────────────────────────────

export const getGalleryItemsQuery = groq`
  *[_type == "galleryItem"] | order(_createdAt desc) {
    _id,
    title,
    medium,
    year,
    dimensions,
    image { ${imageFragment} },
    tags,
    isFeatured,
    ${slugFragment}
  }
`;

export const getFeaturedGalleryQuery = groq`
  *[_type == "galleryItem" && isFeatured == true] | order(_createdAt desc) [0...8] {
    _id,
    title,
    medium,
    year,
    image { ${imageFragment} },
    ${slugFragment}
  }
`;

// ─── Site config ─────────────────────────────────────────────────────────────

export const getSiteConfigQuery = groq`
  *[_id == "siteConfig"][0] {
    siteName,
    tagline,
    logo { ${imageFragment} },
    logoDark { ${imageFragment} },
    socialLinks,
    contactEmail,
    contactPhone,
    defaultSEO { ${seoFragment} },
    announcementBanner
  }
`;

// ─── Search ───────────────────────────────────────────────────────────────────

export const getSearchIndexQuery = groq`
  {
    "works": *[_type == "work"] {
      "id": _id,
      "type": "work",
      title,
      "description": synopsisShort,
      "slug": slug.current,
      "image": heroImage.asset->url,
      genres,
      category,
      releaseYear
    },
    "events": *[_type == "event"] {
      "id": _id,
      "type": "event",
      title,
      "description": select(defined(subtitle) => subtitle, ""),
      "slug": slug.current,
      "image": heroImage.asset->url,
      "category": type,
      startDate
    },
    "gallery": *[_type == "galleryItem"] {
      "id": _id,
      "type": "gallery",
      title,
      "description": medium,
      "slug": slug.current,
      "image": image.asset->url,
      year
    }
  }
`;
