// Strapi CMS Type Definitions

// Base Strapi response structure
export interface StrapiResponse<T> {
  data: T;
  meta?: StrapiMeta;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// Media/Upload types
export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path?: string;
  url: string;
}

// Legal Document types
export interface LegalDocument {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string;
    documentType: 'terms' | 'privacy' | 'cookie' | 'acceptable-use' | 'tax-receipt';
    version: string;
    effectiveDate: string;
    requiresApproval: boolean;
    approvedBy?: string;
    approvedAt?: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Blog Post types
export interface BlogPost {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: {
      data: StrapiMedia;
    };
    author?: {
      data: Author;
    };
    tags?: {
      data: Tag[];
    };
    forestLocation?: 'kakamega' | 'karura' | 'mau' | 'all';
    category: 'conservation' | 'technology' | 'community' | 'impact';
    publishedAt?: string;
    scheduledFor?: string;
    seoTitle?: string;
    seoDescription?: string;
    readTime?: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Author {
  id: number;
  attributes: {
    name: string;
    bio?: string;
    avatar?: {
      data: StrapiMedia;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface Tag {
  id: number;
  attributes: {
    name: string;
    slug: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Partner Profile types
export interface Partner {
  id: number;
  attributes: {
    name: string;
    slug: string;
    logo: {
      data: StrapiMedia;
    };
    description: string;
    websiteUrl: string;
    partnershipType: 'conservation' | 'technology' | 'funding';
    isFeatured: boolean;
    displayOrder: number;
    contactEmail?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      facebook?: string;
    };
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// FAQ types
export interface FAQ {
  id: number;
  attributes: {
    question: string;
    answer: string;
    category: 'general' | 'carbon-credits' | 'nft-badges' | 'initiatives' | 'technical';
    displayOrder: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Query parameter types
export interface BlogPostQueryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  forestLocation?: string;
  tags?: string[];
}

export interface PartnerQueryParams {
  featured?: boolean;
}

export interface FAQQueryParams {
  category?: string;
}

// Error types
export class StrapiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}
