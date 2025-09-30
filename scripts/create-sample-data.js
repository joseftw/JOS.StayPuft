#!/usr/bin/env node

/**
 * Create Sample Data for Static Site POC
 * 
 * This creates sample Ghost-like data for testing the static site generator
 * without requiring access to an actual Ghost instance.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../_data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sample data matching Ghost API structure
const samplePosts = [
  {
    id: '1',
    uuid: 'sample-uuid-1',
    title: 'Welcome to Static Site Generation',
    slug: 'welcome-to-static-site-generation',
    html: '<p>This is a sample post demonstrating static site generation with Eleventy and Ghost CMS.</p><p>The static site approach offers several benefits:</p><ul><li>Blazing fast page loads</li><li>Lower hosting costs</li><li>Better security</li><li>Infinite scalability</li></ul>',
    comment_id: '1',
    feature_image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200',
    featured: true,
    visibility: 'public',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z',
    published_at: '2024-01-15T10:00:00.000Z',
    custom_excerpt: 'Learn about static site generation with Ghost CMS',
    codeinjection_head: null,
    codeinjection_foot: null,
    custom_template: null,
    canonical_url: null,
    url: '/welcome-to-static-site-generation/',
    excerpt: 'Learn about static site generation with Ghost CMS',
    reading_time: 2,
    og_image: null,
    og_title: null,
    og_description: null,
    twitter_image: null,
    twitter_title: null,
    twitter_description: null,
    meta_title: null,
    meta_description: null,
    primary_author: {
      id: '1',
      name: 'Josef Ottosson',
      slug: 'josef',
      profile_image: null,
      cover_image: null,
      bio: 'Developer and blogger',
      website: 'https://josef.codes',
      location: null,
      facebook: null,
      twitter: null,
      meta_title: null,
      meta_description: null,
      url: '/author/josef/'
    },
    primary_tag: {
      id: '1',
      name: 'Technology',
      slug: 'technology',
      description: 'Posts about technology and development',
      feature_image: null,
      visibility: 'public',
      meta_title: null,
      meta_description: null,
      url: '/tag/technology/'
    },
    authors: [
      {
        id: '1',
        name: 'Josef Ottosson',
        slug: 'josef',
        profile_image: null,
        cover_image: null,
        bio: 'Developer and blogger',
        website: 'https://josef.codes',
        location: null,
        facebook: null,
        twitter: null,
        meta_title: null,
        meta_description: null,
        url: '/author/josef/'
      }
    ],
    tags: [
      {
        id: '1',
        name: 'Technology',
        slug: 'technology',
        description: 'Posts about technology and development',
        feature_image: null,
        visibility: 'public',
        meta_title: null,
        meta_description: null,
        url: '/tag/technology/'
      },
      {
        id: '2',
        name: 'Ghost',
        slug: 'ghost',
        description: 'Posts about Ghost CMS',
        feature_image: null,
        visibility: 'public',
        meta_title: null,
        meta_description: null,
        url: '/tag/ghost/'
      }
    ]
  },
  {
    id: '2',
    uuid: 'sample-uuid-2',
    title: 'Building Modern Websites',
    slug: 'building-modern-websites',
    html: '<p>Modern web development has evolved significantly. Here are some key trends:</p><h2>Static Site Generators</h2><p>Static sites offer unparalleled performance and security.</p><h2>JAMstack Architecture</h2><p>JavaScript, APIs, and Markup form the foundation of modern web development.</p>',
    comment_id: '2',
    feature_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
    featured: false,
    visibility: 'public',
    created_at: '2024-01-20T14:30:00.000Z',
    updated_at: '2024-01-20T14:30:00.000Z',
    published_at: '2024-01-20T14:30:00.000Z',
    custom_excerpt: 'Exploring modern web development practices',
    url: '/building-modern-websites/',
    excerpt: 'Exploring modern web development practices',
    reading_time: 3,
    primary_author: {
      id: '1',
      name: 'Josef Ottosson',
      slug: 'josef',
      url: '/author/josef/'
    },
    primary_tag: {
      id: '1',
      name: 'Technology',
      slug: 'technology',
      url: '/tag/technology/'
    },
    authors: [
      {
        id: '1',
        name: 'Josef Ottosson',
        slug: 'josef',
        url: '/author/josef/'
      }
    ],
    tags: [
      {
        id: '1',
        name: 'Technology',
        slug: 'technology',
        url: '/tag/technology/'
      }
    ]
  },
  {
    id: '3',
    uuid: 'sample-uuid-3',
    title: 'The Future of Content Management',
    slug: 'future-of-content-management',
    html: '<p>Content management systems are evolving to meet modern needs.</p><p>Headless CMS architectures allow for greater flexibility in content delivery across multiple platforms and devices.</p><p>Ghost CMS is a perfect example of this modern approach.</p>',
    comment_id: '3',
    feature_image: null,
    featured: false,
    visibility: 'public',
    created_at: '2024-01-25T09:15:00.000Z',
    updated_at: '2024-01-25T09:15:00.000Z',
    published_at: '2024-01-25T09:15:00.000Z',
    custom_excerpt: 'How CMS platforms are evolving',
    url: '/future-of-content-management/',
    excerpt: 'How CMS platforms are evolving',
    reading_time: 4,
    primary_author: {
      id: '1',
      name: 'Josef Ottosson',
      slug: 'josef',
      url: '/author/josef/'
    },
    primary_tag: {
      id: '2',
      name: 'Ghost',
      slug: 'ghost',
      url: '/tag/ghost/'
    },
    authors: [
      {
        id: '1',
        name: 'Josef Ottosson',
        slug: 'josef',
        url: '/author/josef/'
      }
    ],
    tags: [
      {
        id: '2',
        name: 'Ghost',
        slug: 'ghost',
        url: '/tag/ghost/'
      }
    ]
  }
];

const samplePages = [
  {
    id: 'page-1',
    uuid: 'sample-page-uuid-1',
    title: 'About',
    slug: 'about',
    html: '<p>This is the about page for the static site POC.</p><p>This demonstrates how pages are rendered in the static site.</p>',
    feature_image: null,
    featured: false,
    visibility: 'public',
    created_at: '2024-01-10T10:00:00.000Z',
    updated_at: '2024-01-10T10:00:00.000Z',
    published_at: '2024-01-10T10:00:00.000Z',
    custom_excerpt: 'About this site',
    url: '/about/',
    excerpt: 'About this site',
    reading_time: 1,
    authors: [
      {
        id: '1',
        name: 'Josef Ottosson',
        slug: 'josef',
        url: '/author/josef/'
      }
    ]
  }
];

const sampleTags = [
  {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Posts about technology and development',
    feature_image: null,
    visibility: 'public',
    meta_title: null,
    meta_description: null,
    url: '/tag/technology/',
    count: {
      posts: 2
    }
  },
  {
    id: '2',
    name: 'Ghost',
    slug: 'ghost',
    description: 'Posts about Ghost CMS',
    feature_image: null,
    visibility: 'public',
    meta_title: null,
    meta_description: null,
    url: '/tag/ghost/',
    count: {
      posts: 1
    }
  }
];

const sampleAuthors = [
  {
    id: '1',
    name: 'Josef Ottosson',
    slug: 'josef',
    profile_image: null,
    cover_image: null,
    bio: 'Developer and blogger',
    website: 'https://josef.codes',
    location: null,
    facebook: null,
    twitter: null,
    meta_title: null,
    meta_description: null,
    url: '/author/josef/',
    count: {
      posts: 3
    }
  }
];

const sampleSettings = {
  title: 'JOS.StayPuft - Static Demo',
  description: 'A demonstration of static site generation with Ghost CMS',
  logo: null,
  icon: null,
  accent_color: '#15171A',
  cover_image: null,
  facebook: null,
  twitter: '@josefottosson',
  lang: 'en',
  locale: 'en',
  timezone: 'UTC',
  codeinjection_head: null,
  codeinjection_foot: null,
  navigation: [
    {
      label: 'Home',
      url: '/'
    },
    {
      label: 'About',
      url: '/about/'
    },
    {
      label: 'GitHub',
      url: 'https://github.com/joseftw/JOS.StayPuft'
    }
  ],
  meta_title: 'JOS.StayPuft',
  meta_description: 'A beautiful, minimal Ghost theme',
  og_image: null,
  og_title: null,
  og_description: null,
  twitter_image: null,
  twitter_title: null,
  twitter_description: null,
  url: 'http://localhost:8080'
};

console.log('📝 Creating sample data for POC...\n');

// Save all data files
fs.writeFileSync(path.join(OUTPUT_DIR, 'posts.json'), JSON.stringify(samplePosts, null, 2));
console.log('✅ Created posts.json (3 sample posts)');

fs.writeFileSync(path.join(OUTPUT_DIR, 'pages.json'), JSON.stringify(samplePages, null, 2));
console.log('✅ Created pages.json (1 sample page)');

fs.writeFileSync(path.join(OUTPUT_DIR, 'tags.json'), JSON.stringify(sampleTags, null, 2));
console.log('✅ Created tags.json (2 sample tags)');

fs.writeFileSync(path.join(OUTPUT_DIR, 'authors.json'), JSON.stringify(sampleAuthors, null, 2));
console.log('✅ Created authors.json (1 sample author)');

fs.writeFileSync(path.join(OUTPUT_DIR, 'settings.json'), JSON.stringify(sampleSettings, null, 2));
console.log('✅ Created settings.json');

fs.writeFileSync(path.join(OUTPUT_DIR, 'ghost.json'), JSON.stringify({
  posts: samplePosts,
  pages: samplePages,
  tags: sampleTags,
  authors: sampleAuthors,
  settings: sampleSettings
}, null, 2));
console.log('✅ Created ghost.json (combined data)');

console.log('\n✨ Sample data created successfully!');
console.log('\nNext steps:');
console.log('   1. Run: npm run static:build');
console.log('   2. Or run: npm run static:serve (for development preview)');
