# Design Document: Strapi CMS Integration

## Overview

This design outlines the integration of Strapi CMS as a headless content management system alongside the existing Supabase backend. Strapi will handle editorial content (legal documents, blog posts, partner profiles, FAQs) while Supabase continues to manage transactional data (users, initiatives, trees, carbon credits).

**Key Design Principles:**
- Separation of concerns: CMS for content, Supabase for application data
- API-first architecture for frontend consumption
- Performance optimization through caching and CDN
- Non-technical user empowerment through visual editing
- Minimal impact on existing codebase

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                    │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Content Pages │  │  Application   │  │  Admin Panel  │ │
│  │  (Blog, Legal) │  │  (Dashboard)   │  │               │ │
│  └────────┬───────┘  └────────┬───────┘  └───────┬───────┘ │
└───────────┼──────────────────┼──────────────────┼──────────┘
            │                   │                   │
            │                   │                   │
    ┌───────▼────────┐  ┌──────▼────────┐  ┌──────▼────────┐
    │  Strapi CMS    │  │   Supabase    │  │  Strapi Admin │
    │   REST/GraphQL │  │   PostgreSQL  │  │      UI       │
    │      API       │  │   Auth/RT     │  │               │
    └───────┬────────┘  └───────────────┘  └───────────────┘
            │
    ┌───────▼────────┐
    │  PostgreSQL    │
    │  (CMS Database)│
    └────────────────┘
```

### Data Flow

1. **Content Creation Flow:**
   - Content Editor logs into Strapi Admin UI
   - Creates/edits content using visual editor
   - Saves as draft or publishes
   - Strapi stores in PostgreSQL and triggers webhook

2. **Content Consumption Flow:**
   - React app requests content via Strapi API
   - Response cached in browser/CDN
   - Content rendered with existing UI components
   - Cache invalidated on webhook notification

3. **User Data Flow (Unchanged):**
   - User authentication via Supabase Auth
   - Application data (initiatives, trees) via Supabase
   - Real-time updates via Supabase subscriptions

## Components and Interfaces

### 1. Strapi Content Types

#### Legal Document Content Type
```typescript
interface LegalDocument {
  id: number;
  title: string;
  slug: string; // e.g., "terms-of-service"
  content: string; // Rich text
  documentType: 'terms' | 'privacy' | 'cookie' | 'acceptable-use' | 'tax-receipt';
  version: string; // e.g., "1.2"
  effectiveDate: Date;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Blog Post Content Type
```typescript
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Rich text with markdown support
  featuredImage: Media;
  author: Author;
  tags: Tag[];
  forestLocation?: 'kakamega' | 'karura' | 'mau' | 'all';
  category: 'conservation' | 'technology' | 'community' | 'impact';
  publishedAt?: Date;
  scheduledFor?: Date;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number; // Auto-calculated
  createdAt: Date;
  updatedAt: Date;
}
```

#### Partner Profile Content Type
```typescript
interface Partner {
  id: number;
  name: string;
  slug: string;
  logo: Media;
  description: string; // Rich text
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
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### FAQ Content Type
```typescript
interface FAQ {
  id: number;
  question: string;
  answer: string; // Rich text
  category: 'general' | 'carbon-credits' | 'nft-badges' | 'initiatives' | 'technical';
  displayOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Frontend Service Layer

#### Strapi Service (`src/services/strapi.service.ts`)
```typescript
import axios, { AxiosInstance } from 'axios';

class StrapiService {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_STRAPI_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.cache = new Map();
  }

  // Generic fetch with caching
  private async fetchWithCache<T>(
    endpoint: string,
    params?: any
  ): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const response = await this.client.get(endpoint, { params });
    const data = response.data.data;

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  // Invalidate cache for specific endpoint
  invalidateCache(endpoint: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(endpoint)) {
        this.cache.delete(key);
      }
    }
  }

  // Legal Documents
  async getLegalDocument(slug: string): Promise<LegalDocument> {
    return this.fetchWithCache(`/legal-documents`, {
      filters: { slug: { $eq: slug } },
      populate: '*',
    });
  }

  async getAllLegalDocuments(): Promise<LegalDocument[]> {
    return this.fetchWithCache('/legal-documents', {
      sort: 'documentType:asc',
      populate: '*',
    });
  }

  // Blog Posts
  async getBlogPosts(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    forestLocation?: string;
    tags?: string[];
  }): Promise<{ data: BlogPost[]; meta: any }> {
    const filters: any = {};
    
    if (params?.category) {
      filters.category = { $eq: params.category };
    }
    if (params?.forestLocation) {
      filters.forestLocation = { $eq: params.forestLocation };
    }
    if (params?.tags?.length) {
      filters.tags = { slug: { $in: params.tags } };
    }

    return this.fetchWithCache('/blog-posts', {
      filters,
      sort: 'publishedAt:desc',
      populate: ['featuredImage', 'author', 'tags'],
      pagination: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
    });
  }

  async getBlogPost(slug: string): Promise<BlogPost> {
    return this.fetchWithCache(`/blog-posts`, {
      filters: { slug: { $eq: slug } },
      populate: ['featuredImage', 'author', 'tags'],
    });
  }

  // Partners
  async getPartners(featured?: boolean): Promise<Partner[]> {
    const filters = featured ? { isFeatured: { $eq: true } } : {};
    
    return this.fetchWithCache('/partners', {
      filters,
      sort: 'displayOrder:asc',
      populate: 'logo',
    });
  }

  async getPartner(slug: string): Promise<Partner> {
    return this.fetchWithCache(`/partners`, {
      filters: { slug: { $eq: slug } },
      populate: 'logo',
    });
  }

  // FAQs
  async getFAQs(category?: string): Promise<FAQ[]> {
    const filters = category ? { category: { $eq: category } } : {};
    
    return this.fetchWithCache('/faqs', {
      filters: { ...filters, isPublished: { $eq: true } },
      sort: 'displayOrder:asc',
    });
  }
}

export const strapiService = new StrapiService();
```

### 3. React Hooks

#### useStrapiContent Hook
```typescript
import { useState, useEffect } from 'react';
import { strapiService } from '../services/strapi.service';

export function useStrapiContent<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}
```

### 4. Updated Legal Pages Component

```typescript
// src/pages/legal/LegalPage.tsx
import { useParams } from 'react-router-dom';
import { useStrapiContent } from '../../hooks/useStrapiContent';
import { strapiService } from '../../services/strapi.service';
import ReactMarkdown from 'react-markdown';

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: document, loading, error } = useStrapiContent(
    () => strapiService.getLegalDocument(slug!),
    [slug]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading document</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{document.title}</h1>
      <div className="text-sm text-gray-600 mb-8">
        Version {document.version} • Effective {new Date(document.effectiveDate).toLocaleDateString()}
      </div>
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{document.content}</ReactMarkdown>
      </div>
    </div>
  );
}
```

### 5. Blog Components

```typescript
// src/components/blog/BlogList.tsx
import { useStrapiContent } from '../../hooks/useStrapiContent';
import { strapiService } from '../../services/strapi.service';
import { BlogCard } from './BlogCard';

export function BlogList({ category, forestLocation }: Props) {
  const { data, loading, error } = useStrapiContent(
    () => strapiService.getBlogPosts({ category, forestLocation }),
    [category, forestLocation]
  );

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.data.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

## Data Models

### Strapi Database Schema

Strapi will use a separate PostgreSQL database with the following tables (auto-generated by Strapi):

- `legal_documents` - Legal content with versioning
- `blog_posts` - Blog articles with rich content
- `partners` - Partner organization profiles
- `faqs` - Frequently asked questions
- `authors` - Content authors/editors
- `tags` - Taxonomy for blog posts
- `upload_files` - Media library
- `upload_folders` - Media organization
- `admin_users` - CMS users
- `admin_roles` - Role-based permissions
- `admin_permissions` - Granular access control

### Relationship with Existing Supabase Schema

**No changes required to Supabase schema.** The systems operate independently:

- **Supabase**: User profiles, initiatives, trees, carbon credits, transactions, gamification
- **Strapi**: Editorial content, blog posts, legal documents, partner profiles

## Error Handling

### Frontend Error Handling

```typescript
class StrapiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

// In service layer
try {
  const response = await this.client.get(endpoint);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new StrapiError(
      error.response?.data?.error?.message || 'Failed to fetch content',
      error.response?.status,
      error.response?.data
    );
  }
  throw error;
}
```

### Fallback Strategy

1. **Cache-first approach**: Serve stale content if API fails
2. **Static fallback**: Keep critical legal docs in `public/legal/` as backup
3. **Error boundaries**: Graceful degradation for content sections
4. **Retry logic**: Exponential backoff for transient failures

```typescript
async fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.fetchWithRetry(fn, retries - 1, delay * 2);
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// src/services/strapi.service.test.ts
describe('StrapiService', () => {
  it('should fetch legal document by slug', async () => {
    const doc = await strapiService.getLegalDocument('terms-of-service');
    expect(doc).toHaveProperty('title');
    expect(doc.slug).toBe('terms-of-service');
  });

  it('should cache responses', async () => {
    const first = await strapiService.getBlogPosts();
    const second = await strapiService.getBlogPosts();
    // Second call should be from cache (test with spy)
  });

  it('should handle API errors gracefully', async () => {
    // Mock API failure
    await expect(
      strapiService.getLegalDocument('non-existent')
    ).rejects.toThrow(StrapiError);
  });
});
```

### Integration Tests

```typescript
// Test full flow from API to component rendering
describe('Legal Page Integration', () => {
  it('should render legal document from Strapi', async () => {
    render(<LegalPage />);
    await waitFor(() => {
      expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```typescript
// tests/e2e/content.spec.ts
test('should display blog posts from CMS', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('.blog-card')).toHaveCount(10);
});
```

## Deployment Architecture

### Infrastructure Setup

```yaml
# docker-compose.yml for Strapi
version: '3'
services:
  strapi:
    image: strapi/strapi:latest
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: strapi-db
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: ${STRAPI_DB_PASSWORD}
      JWT_SECRET: ${STRAPI_JWT_SECRET}
      ADMIN_JWT_SECRET: ${STRAPI_ADMIN_JWT_SECRET}
      APP_KEYS: ${STRAPI_APP_KEYS}
      NODE_ENV: production
    ports:
      - '1337:1337'
    volumes:
      - ./strapi-app:/srv/app
    depends_on:
      - strapi-db

  strapi-db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: strapi
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: ${STRAPI_DB_PASSWORD}
    volumes:
      - strapi-data:/var/lib/postgresql/data

volumes:
  strapi-data:
```

### Environment Variables

```bash
# Frontend (.env)
VITE_STRAPI_URL=https://cms.ganggreen.com
VITE_STRAPI_API_TOKEN=<public_api_token>

# Strapi (.env)
DATABASE_CLIENT=postgres
DATABASE_HOST=strapi-db.internal
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=<secure_password>
JWT_SECRET=<random_secret>
ADMIN_JWT_SECRET=<random_secret>
APP_KEYS=<random_keys>
API_TOKEN_SALT=<random_salt>
TRANSFER_TOKEN_SALT=<random_salt>
```

### Hosting Options

**Option 1: Separate VPS/Cloud Instance**
- Deploy Strapi on DigitalOcean/AWS/Railway
- PostgreSQL managed database
- Nginx reverse proxy with SSL
- Estimated cost: $20-50/month

**Option 2: Strapi Cloud**
- Managed Strapi hosting
- Built-in CDN and backups
- Automatic scaling
- Estimated cost: $99/month (Pro plan)

**Option 3: Self-hosted with Docker**
- Deploy alongside existing infrastructure
- Use existing PostgreSQL instance (separate database)
- Cost-effective but requires maintenance

### CDN and Caching

```typescript
// Cloudflare/Vercel Edge caching configuration
export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Closest to your users
};

// Cache headers from Strapi
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  }
  next();
});
```

## Webhook Integration

### Strapi Webhook Configuration

```typescript
// Strapi webhook to invalidate frontend cache
// Configure in Strapi Admin: Settings > Webhooks

{
  "url": "https://ganggreen.com/api/webhooks/strapi",
  "headers": {
    "Authorization": "Bearer <webhook_secret>"
  },
  "events": [
    "entry.publish",
    "entry.unpublish",
    "entry.update"
  ]
}
```

### Frontend Webhook Handler

```typescript
// src/api/webhooks/strapi.ts (if using Next.js API routes)
// Or Supabase Edge Function

export async function POST(request: Request) {
  const signature = request.headers.get('x-strapi-signature');
  
  // Verify webhook signature
  if (!verifyWebhookSignature(signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await request.json();
  const { model, entry } = payload;

  // Invalidate cache based on content type
  switch (model) {
    case 'blog-post':
      await revalidatePath('/blog');
      await revalidatePath(`/blog/${entry.slug}`);
      break;
    case 'legal-document':
      await revalidatePath(`/legal/${entry.slug}`);
      break;
    case 'partner':
      await revalidatePath('/partners');
      break;
  }

  return new Response('OK', { status: 200 });
}
```

## Migration Strategy

### Phase 1: Setup (Week 1)
1. Deploy Strapi instance
2. Configure content types
3. Set up authentication and roles
4. Import existing legal documents

### Phase 2: Integration (Week 2)
1. Create Strapi service layer
2. Update legal pages to use Strapi
3. Implement caching strategy
4. Add error handling and fallbacks

### Phase 3: Content Migration (Week 3)
1. Migrate blog posts (if any)
2. Add partner profiles
3. Create FAQ content
4. Train content editors

### Phase 4: Optimization (Week 4)
1. Set up CDN
2. Configure webhooks
3. Implement cache invalidation
4. Performance testing

## Performance Considerations

### Optimization Strategies

1. **Response Caching**: 5-minute browser cache, 10-minute CDN cache
2. **Image Optimization**: Strapi image transformation API
3. **Lazy Loading**: Load content below fold on demand
4. **Prefetching**: Prefetch likely next pages
5. **Bundle Splitting**: Separate Strapi client from main bundle

### Performance Targets

- API response time: < 200ms (cached), < 500ms (uncached)
- Time to First Byte (TTFB): < 300ms
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s

## Security Considerations

### API Security

```typescript
// Rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
};

// CORS configuration
const corsOptions = {
  origin: ['https://ganggreen.com', 'https://gg.lochtech.africa'],
  credentials: true,
};
```

### Content Security

- Role-based access control (RBAC) in Strapi
- Approval workflows for sensitive content
- Version history and rollback capability
- Audit logs for all content changes

### Data Protection

- HTTPS only for all API calls
- API tokens with limited scope
- Webhook signature verification
- Regular security updates

## Alternative Considerations

### Why Strapi vs Alternatives?

**Strapi Advantages:**
- Open source and self-hostable
- PostgreSQL native support
- Flexible content types
- Good TypeScript support
- Active community

**Alternatives Considered:**
- **Contentful**: More expensive, vendor lock-in
- **Sanity**: Great DX but higher learning curve
- **Ghost**: Blog-focused, less flexible
- **Directus**: Similar to Strapi, slightly less mature
- **Keep in Supabase**: Possible but lacks CMS features (no visual editor, no approval workflows)

### Decision: Proceed with Strapi

Strapi offers the best balance of features, cost, and flexibility for your use case while maintaining the ability to self-host and avoid vendor lock-in.
