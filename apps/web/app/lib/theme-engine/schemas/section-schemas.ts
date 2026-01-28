/**
 * Section Schemas - Shopify OS 2.0 Compatible Section Definitions
 *
 * Each section has a schema that defines:
 * - What settings are available
 * - What blocks can be added
 * - Where the section can be used
 * - Default values and presets
 */

import type { SectionSchema, SettingDefinition } from '../types';

// ============================================================================
// COMMON SETTING GROUPS (Reusable)
// ============================================================================

/**
 * Common padding settings used by most sections
 */
export const PADDING_SETTINGS: SettingDefinition[] = [
  {
    type: 'header',
    id: 'padding_header',
    label: 'Section Padding',
  },
  {
    type: 'range',
    id: 'padding_top',
    label: 'Top Padding',
    min: 0,
    max: 100,
    step: 4,
    unit: 'px',
    default: 40,
  },
  {
    type: 'range',
    id: 'padding_bottom',
    label: 'Bottom Padding',
    min: 0,
    max: 100,
    step: 4,
    unit: 'px',
    default: 40,
  },
];

/**
 * Color scheme settings
 */
export const COLOR_SETTINGS: SettingDefinition[] = [
  {
    type: 'header',
    id: 'color_header',
    label: 'Colors',
  },
  {
    type: 'color',
    id: 'background_color',
    label: 'Background Color',
    default: '',
    info: 'Leave empty to use theme default',
  },
  {
    type: 'color',
    id: 'text_color',
    label: 'Text Color',
    default: '',
    info: 'Leave empty to use theme default',
  },
];

/**
 * Common heading settings
 */
export const HEADING_SETTINGS: SettingDefinition[] = [
  {
    type: 'text',
    id: 'heading',
    label: 'Heading',
    default: '',
  },
  {
    type: 'select',
    id: 'heading_size',
    label: 'Heading Size',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ],
    default: 'medium',
  },
  {
    type: 'text',
    id: 'subheading',
    label: 'Subheading',
    default: '',
  },
];

/**
 * Button/CTA settings
 */
export const BUTTON_SETTINGS: SettingDefinition[] = [
  {
    type: 'header',
    id: 'button_header',
    label: 'Button',
  },
  {
    type: 'text',
    id: 'button_label',
    label: 'Button Label',
    default: '',
  },
  {
    type: 'url',
    id: 'button_link',
    label: 'Button Link',
    default: '',
  },
  {
    type: 'select',
    id: 'button_style',
    label: 'Button Style',
    options: [
      { value: 'primary', label: 'Primary' },
      { value: 'secondary', label: 'Secondary' },
      { value: 'outline', label: 'Outline' },
      { value: 'link', label: 'Link' },
    ],
    default: 'primary',
  },
];

// ============================================================================
// HERO SECTION SCHEMA
// ============================================================================

export const HERO_SECTION_SCHEMA: SectionSchema = {
  name: 'Hero Banner',
  tag: 'section',
  class: 'section-hero',

  enabled_on: {
    templates: ['index'],
    groups: ['body'],
  },

  settings: [
    // Layout
    {
      type: 'header',
      id: 'layout_header',
      label: 'Layout',
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout Style',
      options: [
        { value: 'image_first', label: 'Image Left' },
        { value: 'text_first', label: 'Text Left' },
        { value: 'full_width', label: 'Full Width Image' },
        { value: 'split', label: 'Split Screen' },
      ],
      default: 'text_first',
    },
    {
      type: 'select',
      id: 'height',
      label: 'Section Height',
      options: [
        { value: 'small', label: 'Small (400px)' },
        { value: 'medium', label: 'Medium (500px)' },
        { value: 'large', label: 'Large (600px)' },
        { value: 'full', label: 'Full Screen' },
      ],
      default: 'medium',
    },
    {
      type: 'select',
      id: 'content_alignment',
      label: 'Content Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'left',
    },

    // Content
    {
      type: 'header',
      id: 'content_header',
      label: 'Content',
    },
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Welcome to our store',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Discover our amazing collection of products',
    },

    // Primary Button
    {
      type: 'header',
      id: 'primary_button_header',
      label: 'Primary Button',
    },
    {
      type: 'text',
      id: 'primary_button_label',
      label: 'Button Label',
      default: 'Shop Now',
    },
    {
      type: 'url',
      id: 'primary_button_link',
      label: 'Button Link',
      default: '/products',
    },

    // Secondary Button
    {
      type: 'header',
      id: 'secondary_button_header',
      label: 'Secondary Button',
    },
    {
      type: 'text',
      id: 'secondary_button_label',
      label: 'Button Label',
      default: '',
    },
    {
      type: 'url',
      id: 'secondary_button_link',
      label: 'Button Link',
      default: '',
    },

    // Media
    {
      type: 'header',
      id: 'media_header',
      label: 'Media',
    },
    {
      type: 'image_picker',
      id: 'image',
      label: 'Background Image',
    },
    {
      type: 'video_url',
      id: 'video_url',
      label: 'Video URL (YouTube/Vimeo)',
      info: 'Video will replace image if provided',
    },
    {
      type: 'range',
      id: 'overlay_opacity',
      label: 'Overlay Opacity',
      min: 0,
      max: 100,
      step: 5,
      unit: '%',
      default: 40,
    },

    // Colors
    ...COLOR_SETTINGS,

    // Padding
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'Hero with Image',
      category: 'Hero',
      settings: {
        layout: 'text_first',
        heading: 'Welcome to our store',
        subheading: 'Discover our amazing collection',
        primary_button_label: 'Shop Now',
        primary_button_link: '/products',
      },
    },
    {
      name: 'Full Width Hero',
      category: 'Hero',
      settings: {
        layout: 'full_width',
        height: 'large',
        content_alignment: 'center',
        overlay_opacity: 50,
      },
    },
    {
      name: 'Video Hero',
      category: 'Hero',
      settings: {
        layout: 'full_width',
        height: 'full',
        content_alignment: 'center',
      },
    },
  ],
};

// ============================================================================
// PRODUCT GRID SECTION SCHEMA
// ============================================================================

export const PRODUCT_GRID_SECTION_SCHEMA: SectionSchema = {
  name: 'Product Grid',
  tag: 'section',
  class: 'section-product-grid',

  enabled_on: {
    templates: ['index', 'collection'],
    groups: ['body'],
  },

  settings: [
    // Heading
    ...HEADING_SETTINGS,

    // Product Source
    {
      type: 'header',
      id: 'source_header',
      label: 'Product Source',
    },
    {
      type: 'select',
      id: 'source',
      label: 'Product Source',
      options: [
        { value: 'all', label: 'All Products' },
        { value: 'collection', label: 'From Collection' },
        { value: 'featured', label: 'Featured Products' },
        { value: 'new', label: 'New Arrivals' },
        { value: 'sale', label: 'On Sale' },
      ],
      default: 'all',
    },
    {
      type: 'collection',
      id: 'collection',
      label: 'Collection',
      info: 'Select when source is "From Collection"',
    },
    {
      type: 'range',
      id: 'products_count',
      label: 'Number of Products',
      min: 2,
      max: 24,
      step: 1,
      default: 8,
    },

    // Layout
    {
      type: 'header',
      id: 'layout_header',
      label: 'Layout',
    },
    {
      type: 'range',
      id: 'columns_desktop',
      label: 'Columns (Desktop)',
      min: 2,
      max: 6,
      step: 1,
      default: 4,
    },
    {
      type: 'range',
      id: 'columns_mobile',
      label: 'Columns (Mobile)',
      min: 1,
      max: 3,
      step: 1,
      default: 2,
    },
    {
      type: 'range',
      id: 'gap',
      label: 'Gap Between Products',
      min: 8,
      max: 48,
      step: 4,
      unit: 'px',
      default: 24,
    },

    // Product Card
    {
      type: 'header',
      id: 'card_header',
      label: 'Product Card',
    },
    {
      type: 'select',
      id: 'image_ratio',
      label: 'Image Ratio',
      options: [
        { value: 'portrait', label: 'Portrait (3:4)' },
        { value: 'square', label: 'Square (1:1)' },
        { value: 'landscape', label: 'Landscape (4:3)' },
      ],
      default: 'portrait',
    },
    {
      type: 'checkbox',
      id: 'show_secondary_image',
      label: 'Show Second Image on Hover',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_vendor',
      label: 'Show Vendor',
      default: false,
    },
    {
      type: 'checkbox',
      id: 'show_rating',
      label: 'Show Rating',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'quick_add',
      label: 'Enable Quick Add',
      default: true,
    },

    // View All Link
    {
      type: 'header',
      id: 'link_header',
      label: 'View All Link',
    },
    {
      type: 'checkbox',
      id: 'show_view_all',
      label: 'Show View All Button',
      default: true,
    },
    {
      type: 'text',
      id: 'view_all_label',
      label: 'View All Label',
      default: 'View All Products',
    },
    {
      type: 'url',
      id: 'view_all_link',
      label: 'View All Link',
      default: '/products',
    },

    // Colors & Padding
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'Featured Products',
      category: 'Products',
      settings: {
        heading: 'Featured Products',
        source: 'featured',
        products_count: 8,
      },
    },
    {
      name: 'New Arrivals',
      category: 'Products',
      settings: {
        heading: 'New Arrivals',
        source: 'new',
        products_count: 4,
      },
    },
    {
      name: 'Collection Products',
      category: 'Products',
      settings: {
        heading: 'Shop the Collection',
        source: 'collection',
        products_count: 8,
      },
    },
  ],
};

// ============================================================================
// FEATURED COLLECTION SECTION SCHEMA
// ============================================================================

export const FEATURED_COLLECTION_SECTION_SCHEMA: SectionSchema = {
  name: 'Featured Collection',
  tag: 'section',
  class: 'section-featured-collection',

  enabled_on: {
    templates: ['index'],
    groups: ['body'],
  },

  settings: [
    {
      type: 'collection',
      id: 'collection',
      label: 'Collection',
    },
    ...HEADING_SETTINGS,
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      info: 'Leave empty to use collection description',
    },
    {
      type: 'image_picker',
      id: 'image',
      label: 'Image',
      info: 'Leave empty to use collection image',
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'image_left', label: 'Image Left' },
        { value: 'image_right', label: 'Image Right' },
        { value: 'image_top', label: 'Image Top' },
        { value: 'overlay', label: 'Text Overlay' },
      ],
      default: 'image_left',
    },
    {
      type: 'range',
      id: 'products_count',
      label: 'Products to Show',
      min: 2,
      max: 12,
      step: 1,
      default: 4,
    },
    ...BUTTON_SETTINGS,
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'Featured Collection',
      category: 'Collections',
    },
  ],
};

// ============================================================================
// COLLECTION LIST SECTION SCHEMA
// ============================================================================

export const COLLECTION_LIST_SECTION_SCHEMA: SectionSchema = {
  name: 'Collection List',
  tag: 'section',
  class: 'section-collection-list',

  enabled_on: {
    templates: ['index'],
    groups: ['body'],
  },

  settings: [
    ...HEADING_SETTINGS,
    {
      type: 'select',
      id: 'source',
      label: 'Collections Source',
      options: [
        { value: 'all', label: 'All Collections' },
        { value: 'selected', label: 'Selected Collections' },
      ],
      default: 'all',
    },
    {
      type: 'collection_list',
      id: 'collections',
      label: 'Collections',
      info: 'Select specific collections (when source is "Selected")',
    },
    {
      type: 'range',
      id: 'collections_count',
      label: 'Number of Collections',
      min: 2,
      max: 12,
      step: 1,
      default: 6,
      info: 'Used when source is "All Collections"',
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'slider', label: 'Slider' },
        { value: 'masonry', label: 'Masonry' },
      ],
      default: 'grid',
    },
    {
      type: 'range',
      id: 'columns',
      label: 'Columns',
      min: 2,
      max: 6,
      step: 1,
      default: 3,
    },
    {
      type: 'select',
      id: 'image_ratio',
      label: 'Image Ratio',
      options: [
        { value: 'portrait', label: 'Portrait (3:4)' },
        { value: 'square', label: 'Square (1:1)' },
        { value: 'landscape', label: 'Landscape (4:3)' },
        { value: 'wide', label: 'Wide (16:9)' },
      ],
      default: 'square',
    },
    {
      type: 'checkbox',
      id: 'show_product_count',
      label: 'Show Product Count',
      default: true,
    },
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'Collection Grid',
      category: 'Collections',
      settings: {
        heading: 'Shop by Category',
        layout: 'grid',
        columns: 3,
      },
    },
  ],
};

// ============================================================================
// RICH TEXT SECTION SCHEMA
// ============================================================================

export const RICH_TEXT_SECTION_SCHEMA: SectionSchema = {
  name: 'Rich Text',
  tag: 'section',
  class: 'section-rich-text',

  enabled_on: {
    templates: ['index', 'product', 'collection', 'page'],
    groups: ['body'],
  },

  settings: [
    ...HEADING_SETTINGS,
    {
      type: 'richtext',
      id: 'content',
      label: 'Content',
      default: '<p>Share your story, explain your product, or describe your brand.</p>',
    },
    {
      type: 'select',
      id: 'text_alignment',
      label: 'Text Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'center',
    },
    {
      type: 'select',
      id: 'content_width',
      label: 'Content Width',
      options: [
        { value: 'small', label: 'Small (600px)' },
        { value: 'medium', label: 'Medium (800px)' },
        { value: 'large', label: 'Large (1000px)' },
        { value: 'full', label: 'Full Width' },
      ],
      default: 'medium',
    },
    ...BUTTON_SETTINGS,
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'About Us',
      category: 'Text',
      settings: {
        heading: 'About Us',
        content:
          '<p>Tell your brand story here. Share your values, mission, and what makes you unique.</p>',
      },
    },
    {
      name: 'Store Information',
      category: 'Text',
      settings: {
        heading: 'Our Story',
        text_alignment: 'center',
      },
    },
  ],
};

// ============================================================================
// IMAGE WITH TEXT SECTION SCHEMA
// ============================================================================

export const IMAGE_WITH_TEXT_SECTION_SCHEMA: SectionSchema = {
  name: 'Image with Text',
  tag: 'section',
  class: 'section-image-text',

  enabled_on: {
    templates: ['index', 'page'],
    groups: ['body'],
  },

  settings: [
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'image_first', label: 'Image Left' },
        { value: 'text_first', label: 'Text Left' },
      ],
      default: 'image_first',
    },
    {
      type: 'select',
      id: 'height',
      label: 'Section Height',
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small (300px)' },
        { value: 'medium', label: 'Medium (400px)' },
        { value: 'large', label: 'Large (500px)' },
      ],
      default: 'auto',
    },
    {
      type: 'checkbox',
      id: 'full_width',
      label: 'Full Width',
      default: false,
    },

    // Image
    {
      type: 'header',
      id: 'image_header',
      label: 'Image',
    },
    {
      type: 'image_picker',
      id: 'image',
      label: 'Image',
    },
    {
      type: 'select',
      id: 'image_width',
      label: 'Image Width',
      options: [
        { value: '33', label: '33%' },
        { value: '50', label: '50%' },
        { value: '66', label: '66%' },
      ],
      default: '50',
    },

    // Text
    {
      type: 'header',
      id: 'text_header',
      label: 'Text Content',
    },
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
    },
    {
      type: 'richtext',
      id: 'content',
      label: 'Content',
    },
    ...BUTTON_SETTINGS,
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'Image with Text',
      category: 'Image',
    },
  ],
};

// ============================================================================
// NEWSLETTER SECTION SCHEMA
// ============================================================================

export const NEWSLETTER_SECTION_SCHEMA: SectionSchema = {
  name: 'Newsletter',
  tag: 'section',
  class: 'section-newsletter',

  enabled_on: {
    templates: ['index', 'page'],
    groups: ['body', 'footer'],
  },

  settings: [
    ...HEADING_SETTINGS,
    {
      type: 'textarea',
      id: 'content',
      label: 'Content',
      default: 'Subscribe to get special offers, free giveaways, and exclusive deals.',
    },
    {
      type: 'text',
      id: 'button_label',
      label: 'Button Label',
      default: 'Subscribe',
    },
    {
      type: 'text',
      id: 'placeholder',
      label: 'Email Placeholder',
      default: 'Enter your email',
    },
    {
      type: 'text',
      id: 'success_message',
      label: 'Success Message',
      default: 'Thanks for subscribing!',
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'stacked', label: 'Stacked' },
      ],
      default: 'horizontal',
    },
    {
      type: 'select',
      id: 'content_width',
      label: 'Content Width',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      default: 'medium',
    },
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'Newsletter Signup',
      category: 'Marketing',
      settings: {
        heading: 'Join Our Newsletter',
        subheading: 'Get the latest updates and exclusive offers',
      },
    },
  ],
};

// ============================================================================
// TESTIMONIALS SECTION SCHEMA
// ============================================================================

export const TESTIMONIALS_SECTION_SCHEMA: SectionSchema = {
  name: 'Testimonials',
  tag: 'section',
  class: 'section-testimonials',

  enabled_on: {
    templates: ['index', 'product', 'page'],
    groups: ['body'],
  },

  settings: [
    ...HEADING_SETTINGS,
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'slider', label: 'Slider' },
        { value: 'masonry', label: 'Masonry' },
      ],
      default: 'slider',
    },
    {
      type: 'range',
      id: 'columns',
      label: 'Columns (Grid)',
      min: 1,
      max: 4,
      step: 1,
      default: 3,
    },
    {
      type: 'checkbox',
      id: 'show_rating',
      label: 'Show Star Rating',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_avatar',
      label: 'Show Avatar',
      default: true,
    },
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  blocks: [
    {
      type: 'testimonial',
      name: 'Testimonial',
      settings: [
        {
          type: 'textarea',
          id: 'quote',
          label: 'Quote',
          default: 'Amazing product! Highly recommend.',
        },
        {
          type: 'text',
          id: 'author',
          label: 'Author Name',
          default: 'Happy Customer',
        },
        {
          type: 'text',
          id: 'role',
          label: 'Author Role/Location',
          default: 'Dhaka, Bangladesh',
        },
        {
          type: 'image_picker',
          id: 'avatar',
          label: 'Avatar Image',
        },
        {
          type: 'range',
          id: 'rating',
          label: 'Rating',
          min: 1,
          max: 5,
          step: 1,
          default: 5,
        },
      ],
    },
  ],

  max_blocks: 12,

  presets: [
    {
      name: 'Customer Reviews',
      category: 'Social Proof',
      settings: {
        heading: 'What Our Customers Say',
      },
      blocks: [
        {
          type: 'testimonial',
          settings: {
            quote: 'Best purchase I ever made! Quality is amazing.',
            author: 'Rahim Ahmed',
            role: 'Dhaka',
            rating: 5,
          },
        },
        {
          type: 'testimonial',
          settings: {
            quote: 'Fast delivery and excellent customer service.',
            author: 'Fatima Khan',
            role: 'Chittagong',
            rating: 5,
          },
        },
        {
          type: 'testimonial',
          settings: {
            quote: 'Great value for money. Will buy again!',
            author: 'Karim Hossain',
            role: 'Sylhet',
            rating: 4,
          },
        },
      ],
    },
  ],
};

// ============================================================================
// FAQ SECTION SCHEMA
// ============================================================================

export const FAQ_SECTION_SCHEMA: SectionSchema = {
  name: 'FAQ',
  tag: 'section',
  class: 'section-faq',

  enabled_on: {
    templates: ['index', 'product', 'page'],
    groups: ['body'],
  },

  settings: [
    ...HEADING_SETTINGS,
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'accordion', label: 'Accordion' },
        { value: 'grid', label: 'Two Column Grid' },
        { value: 'list', label: 'Simple List' },
      ],
      default: 'accordion',
    },
    {
      type: 'checkbox',
      id: 'open_first',
      label: 'Open First Item by Default',
      default: true,
    },
    {
      type: 'select',
      id: 'content_width',
      label: 'Content Width',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'full', label: 'Full Width' },
      ],
      default: 'medium',
    },
    ...COLOR_SETTINGS,
    ...PADDING_SETTINGS,
  ],

  blocks: [
    {
      type: 'question',
      name: 'Question',
      settings: [
        {
          type: 'text',
          id: 'question',
          label: 'Question',
          default: 'What is your return policy?',
        },
        {
          type: 'richtext',
          id: 'answer',
          label: 'Answer',
          default:
            '<p>We offer a 7-day return policy for all unused items in original packaging.</p>',
        },
      ],
    },
  ],

  max_blocks: 20,

  presets: [
    {
      name: 'FAQ Section',
      category: 'Information',
      settings: {
        heading: 'Frequently Asked Questions',
      },
      blocks: [
        {
          type: 'question',
          settings: {
            question: 'How long does delivery take?',
            answer: '<p>Delivery within Dhaka takes 1-2 days. Outside Dhaka takes 3-5 days.</p>',
          },
        },
        {
          type: 'question',
          settings: {
            question: 'What payment methods do you accept?',
            answer: '<p>We accept Cash on Delivery, bKash, Nagad, and all major credit cards.</p>',
          },
        },
        {
          type: 'question',
          settings: {
            question: 'Do you offer returns?',
            answer:
              '<p>Yes, we offer 7-day easy returns for unused items in original packaging.</p>',
          },
        },
      ],
    },
  ],
};

// ============================================================================
// PRODUCT PAGE SECTIONS
// ============================================================================

export const PRODUCT_INFO_SECTION_SCHEMA: SectionSchema = {
  name: 'Product Information',
  tag: 'section',
  class: 'section-product-info',
  limit: 1,

  enabled_on: {
    templates: ['product'],
    groups: ['body'],
  },

  settings: [
    // Layout
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'image_left', label: 'Image Left' },
        { value: 'image_right', label: 'Image Right' },
        { value: 'stacked', label: 'Stacked' },
      ],
      default: 'image_left',
    },
    {
      type: 'select',
      id: 'media_size',
      label: 'Media Size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      default: 'medium',
    },

    // Media
    {
      type: 'header',
      id: 'media_header',
      label: 'Media Settings',
    },
    {
      type: 'checkbox',
      id: 'enable_zoom',
      label: 'Enable Image Zoom',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'enable_video',
      label: 'Enable Video Playback',
      default: true,
    },
    {
      type: 'select',
      id: 'gallery_layout',
      label: 'Thumbnail Position',
      options: [
        { value: 'below', label: 'Below' },
        { value: 'left', label: 'Left Side' },
        { value: 'right', label: 'Right Side' },
      ],
      default: 'below',
    },

    // Product Form
    {
      type: 'header',
      id: 'form_header',
      label: 'Product Form',
    },
    {
      type: 'checkbox',
      id: 'show_quantity',
      label: 'Show Quantity Selector',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_variant_labels',
      label: 'Show Variant Labels',
      default: true,
    },
    {
      type: 'select',
      id: 'variant_style',
      label: 'Variant Style',
      options: [
        { value: 'buttons', label: 'Buttons' },
        { value: 'dropdown', label: 'Dropdown' },
        { value: 'swatches', label: 'Color Swatches' },
      ],
      default: 'buttons',
    },
    {
      type: 'checkbox',
      id: 'show_buy_now',
      label: 'Show Buy Now Button',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_wishlist',
      label: 'Show Wishlist Button',
      default: true,
    },

    // Additional Info
    {
      type: 'header',
      id: 'info_header',
      label: 'Additional Information',
    },
    {
      type: 'checkbox',
      id: 'show_sku',
      label: 'Show SKU',
      default: false,
    },
    {
      type: 'checkbox',
      id: 'show_inventory',
      label: 'Show Inventory Status',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_share',
      label: 'Show Share Buttons',
      default: true,
    },

    ...PADDING_SETTINGS,
  ],

  blocks: [
    {
      type: 'text',
      name: 'Text Block',
      settings: [
        {
          type: 'richtext',
          id: 'content',
          label: 'Content',
        },
      ],
    },
    {
      type: 'collapsible',
      name: 'Collapsible Row',
      settings: [
        {
          type: 'text',
          id: 'heading',
          label: 'Heading',
          default: 'Details',
        },
        {
          type: 'select',
          id: 'icon',
          label: 'Icon',
          options: [
            { value: 'none', label: 'None' },
            { value: 'check', label: 'Checkmark' },
            { value: 'truck', label: 'Truck' },
            { value: 'return', label: 'Return Arrow' },
            { value: 'ruler', label: 'Ruler' },
            { value: 'heart', label: 'Heart' },
          ],
          default: 'none',
        },
        {
          type: 'richtext',
          id: 'content',
          label: 'Content',
        },
        {
          type: 'checkbox',
          id: 'open_by_default',
          label: 'Open by Default',
          default: false,
        },
      ],
    },
    {
      type: 'custom_field',
      name: 'Metafield',
      settings: [
        {
          type: 'text',
          id: 'metafield_namespace',
          label: 'Namespace',
          default: 'custom',
        },
        {
          type: 'text',
          id: 'metafield_key',
          label: 'Key',
        },
        {
          type: 'text',
          id: 'label',
          label: 'Label',
        },
      ],
    },
  ],

  max_blocks: 10,

  presets: [
    {
      name: 'Product Information',
      category: 'Product',
    },
  ],
};

export const RELATED_PRODUCTS_SECTION_SCHEMA: SectionSchema = {
  name: 'Related Products',
  tag: 'section',
  class: 'section-related-products',

  enabled_on: {
    templates: ['product'],
    groups: ['body'],
  },

  settings: [
    ...HEADING_SETTINGS,
    {
      type: 'select',
      id: 'source',
      label: 'Product Source',
      options: [
        { value: 'auto', label: 'Automatic (Same Collection)' },
        { value: 'collection', label: 'From Specific Collection' },
        { value: 'tags', label: 'By Tags' },
      ],
      default: 'auto',
    },
    {
      type: 'collection',
      id: 'collection',
      label: 'Collection',
    },
    {
      type: 'range',
      id: 'products_count',
      label: 'Number of Products',
      min: 2,
      max: 12,
      step: 1,
      default: 4,
    },
    {
      type: 'range',
      id: 'columns',
      label: 'Columns',
      min: 2,
      max: 6,
      step: 1,
      default: 4,
    },
    ...PADDING_SETTINGS,
  ],

  presets: [
    {
      name: 'Related Products',
      category: 'Product',
      settings: {
        heading: 'You May Also Like',
      },
    },
    {
      name: 'Recently Viewed',
      category: 'Product',
      settings: {
        heading: 'Recently Viewed',
        source: 'auto',
      },
    },
  ],
};

// ============================================================================
// CART PAGE SECTIONS
// ============================================================================

export const CART_ITEMS_SECTION_SCHEMA: SectionSchema = {
  name: 'Cart Items',
  tag: 'section',
  class: 'section-cart-items',
  limit: 1,

  enabled_on: {
    templates: ['cart'],
    groups: ['body'],
  },

  settings: [
    {
      type: 'checkbox',
      id: 'show_image',
      label: 'Show Product Image',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_variant',
      label: 'Show Variant Info',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_quantity_selector',
      label: 'Show Quantity Selector',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_remove_button',
      label: 'Show Remove Button',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_line_price',
      label: 'Show Line Price',
      default: true,
    },
    ...PADDING_SETTINGS,
  ],
};

export const CART_FOOTER_SECTION_SCHEMA: SectionSchema = {
  name: 'Cart Footer',
  tag: 'section',
  class: 'section-cart-footer',
  limit: 1,

  enabled_on: {
    templates: ['cart'],
    groups: ['body'],
  },

  settings: [
    {
      type: 'checkbox',
      id: 'show_subtotal',
      label: 'Show Subtotal',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_shipping_estimate',
      label: 'Show Shipping Estimate',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_discount_code',
      label: 'Show Discount Code Field',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_cart_note',
      label: 'Show Cart Note',
      default: true,
    },
    {
      type: 'text',
      id: 'checkout_button_text',
      label: 'Checkout Button Text',
      default: 'Proceed to Checkout',
    },
    {
      type: 'checkbox',
      id: 'show_continue_shopping',
      label: 'Show Continue Shopping Link',
      default: true,
    },

    // Trust badges
    {
      type: 'header',
      id: 'trust_header',
      label: 'Trust Badges',
    },
    {
      type: 'checkbox',
      id: 'show_trust_badges',
      label: 'Show Trust Badges',
      default: true,
    },
    {
      type: 'text',
      id: 'trust_text_1',
      label: 'Trust Text 1',
      default: 'Secure Checkout',
    },
    {
      type: 'text',
      id: 'trust_text_2',
      label: 'Trust Text 2',
      default: 'Free Shipping',
    },
    {
      type: 'text',
      id: 'trust_text_3',
      label: 'Trust Text 3',
      default: '7-Day Returns',
    },
    ...PADDING_SETTINGS,
  ],
};

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero: HERO_SECTION_SCHEMA,
  'product-grid': PRODUCT_GRID_SECTION_SCHEMA,
  'featured-collection': FEATURED_COLLECTION_SECTION_SCHEMA,
  'collection-list': COLLECTION_LIST_SECTION_SCHEMA,
  'rich-text': RICH_TEXT_SECTION_SCHEMA,
  'image-with-text': IMAGE_WITH_TEXT_SECTION_SCHEMA,
  newsletter: NEWSLETTER_SECTION_SCHEMA,
  testimonials: TESTIMONIALS_SECTION_SCHEMA,
  faq: FAQ_SECTION_SCHEMA,
  'product-info': PRODUCT_INFO_SECTION_SCHEMA,
  'related-products': RELATED_PRODUCTS_SECTION_SCHEMA,
  'cart-items': CART_ITEMS_SECTION_SCHEMA,
  'cart-footer': CART_FOOTER_SECTION_SCHEMA,
};

export default SECTION_SCHEMAS;
