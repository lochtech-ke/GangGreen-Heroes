# Implementation Plan: Strapi CMS Integration

- [ ] 1. Set up Strapi CMS infrastructure
  - Deploy Strapi instance with PostgreSQL database
  - Configure environment variables for database connection and secrets
  - Set up admin user account and initial authentication
  - Configure CORS to allow requests from frontend domain
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 2. Define and configure Strapi content types
  - [ ] 2.1 Create Legal Document content type
    - Define schema with title, slug, content, documentType, version, effectiveDate fields
    - Add approval workflow fields (requiresApproval, approvedBy, approvedAt)
    - Configure rich text editor for content field
    - Set up slug auto-generation from title
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 2.2 Create Blog Post content type
    - Define schema with title, slug, excerpt, content, featuredImage, author, tags
    - Add forestLocation and category enumeration fields
    - Configure scheduling fields (publishedAt, scheduledFor)
    - Set up SEO fields (seoTitle, seoDescription)
    - Add read time auto-calculation logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 2.3 Create Partner Profile content type
    - Define schema with name, slug, logo, description, websiteUrl
    - Add partnershipType enumeration and isFeatured boolean
    - Configure displayOrder for manual sorting
    - Add socialLinks component for social media URLs
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 2.4 Create FAQ content type
    - Define schema with question, answer, category, displayOrder
    - Add isPublished boolean for draft management
    - Configure rich text for answer field
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 2.5 Configure shared components
    - Create Author component (name, bio, avatar)
    - Create Tag component (name, slug, color)
    - Create Media component for image handling
    - Export content type definitions to version control
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Configure Strapi API and permissions
  - Set up public API access for read operations
  - Generate API token for frontend consumption
  - Configure role-based permissions (Editor, Author, Reviewer, Admin)
  - Enable both REST and GraphQL endpoints
  - Configure API response population and filtering
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

- [x] 4. Implement frontend Strapi service layer







  - [ ] 4.1 Create base Strapi service class
    - Initialize Axios client with base URL and headers
    - Implement generic fetch method with error handling
    - Add request/response interceptors for logging
    - Create StrapiError custom error class
    - _Requirements: 3.1, 3.2_

  
  - [ ] 4.2 Implement caching mechanism
    - Create in-memory cache with Map data structure
    - Add cache TTL configuration (5 minutes default)
    - Implement cache key generation from endpoint and params
    - Add cache invalidation methods by endpoint pattern

    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 4.3 Add content-specific methods
    - Implement getLegalDocument(slug) method
    - Implement getAllLegalDocuments() method
    - Implement getBlogPosts(params) with filtering and pagination
    - Implement getBlogPost(slug) method
    - Implement getPartners(featured) method
    - Implement getPartner(slug) method

    - Implement getFAQs(category) method
    - _Requirements: 1.1, 2.1, 6.1, 3.1_
  
  - [x] 4.4 Add retry logic for failed requests


    - Implement exponential backoff retry mechanism
    - Configure maximum retry attempts (3 retries)
    - Add delay calculation with exponential increase
    - Handle non-retryable errors (4xx status codes)
    - _Requirements: 3.2_






- [ ] 5. Create React hooks for content fetching
  - Create useStrapiContent generic hook with loading/error states
  - Add dependency array support for refetching
  - Implement cleanup on component unmount
  - Add TypeScript generics for type safety


  - _Requirements: 3.1, 3.2_

- [ ] 6. Update legal pages to use Strapi
  - [x] 6.1 Create new LegalPage component

    - Use useParams to get document slug from URL
    - Fetch document using useStrapiContent hook
    - Render loading and error states
    - Display document title, version, and effective date
    - Render content with ReactMarkdown component
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 6.2 Update routing configuration
    - Add dynamic route for /legal/:slug
    - Update navigation links to use new routes
    - Remove old static legal page components
    - _Requirements: 1.3_
  
  - [ ] 6.3 Add fallback for offline/error scenarios
    - Keep existing markdown files in public/legal/ as backup
    - Implement fallback logic to load static files on API failure
    - Display warning message when using fallback content
    - _Requirements: 1.1, 1.2_

- [ ] 7. Implement blog functionality
  - [ ] 7.1 Create BlogList component
    - Fetch blog posts using strapiService.getBlogPosts()
    - Implement filtering by category and forestLocation
    - Add pagination controls
    - Display loading skeleton during fetch
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 7.2 Create BlogCard component
    - Display featured image with lazy loading
    - Show title, excerpt, author, and publish date
    - Add read time indicator
    - Link to individual blog post page
    - _Requirements: 2.1_
  
  - [ ] 7.3 Create BlogPost detail page
    - Fetch single post by slug
    - Render full content with rich text formatting
    - Display author information and tags
    - Add social sharing buttons
    - Show related posts based on tags or category
    - _Requirements: 2.1, 2.5_
  
  - [ ] 7.4 Add blog routes
    - Create /blog route for blog list
    - Create /blog/:slug route for individual posts
    - Add blog link to main navigation
    - _Requirements: 2.3_

- [ ] 8. Implement partner profiles display
  - [ ] 8.1 Create PartnerGrid component
    - Fetch partners using strapiService.getPartners()
    - Display partners in responsive grid layout
    - Show logo, name, and partnership type
    - Add filter for featured partners only
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ] 8.2 Update PartnershipSection component
    - Replace static partner data with Strapi content
    - Fetch featured partners for homepage display
    - Maintain existing glassmorphism design
    - Add link to full partners page
    - _Requirements: 6.5_
  
  - [ ] 8.3 Create partner detail page (optional)
    - Create /partners/:slug route
    - Display full partner information
    - Show description, website link, and social links
    - _Requirements: 6.1_

- [ ] 9. Add FAQ section
  - Create FAQList component with accordion UI
  - Fetch FAQs using strapiService.getFAQs()
  - Implement category filtering
  - Add search functionality for questions
  - Create /faq route and add to footer navigation
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 10. Implement webhook handler for cache invalidation
  - [ ] 10.1 Create webhook endpoint
    - Set up API route at /api/webhooks/strapi
    - Verify webhook signature for security
    - Parse webhook payload to extract model and entry data
    - _Requirements: 7.2, 7.3_
  
  - [ ] 10.2 Implement cache invalidation logic
    - Invalidate cache based on content type (blog-post, legal-document, partner)
    - Trigger revalidation for affected routes
    - Log webhook events for debugging
    - Return appropriate HTTP status codes
    - _Requirements: 7.3_
  
  - [ ] 10.3 Configure webhook in Strapi
    - Add webhook URL in Strapi admin settings
    - Configure events (entry.publish, entry.unpublish, entry.update)
    - Add authorization header with secret token
    - Test webhook delivery
    - _Requirements: 7.2, 7.3_

- [x] 11. Add environment configuration


  - Add VITE_STRAPI_URL to .env.example
  - Add VITE_STRAPI_API_TOKEN to .env.example
  - Update .env with actual Strapi URL and token
  - Document environment variables in README
  - _Requirements: 8.4_

- [ ] 12. Migrate existing content to Strapi
  - [ ] 12.1 Create migration script for legal documents
    - Read existing markdown files from public/legal/
    - Parse frontmatter and content
    - Create legal documents in Strapi via API
    - Validate migrated content
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 12.2 Verify migrated content
    - Compare original and migrated content
    - Check formatting and metadata preservation
    - Test rendering on frontend
    - _Requirements: 10.2, 10.4_

- [ ] 13. Implement preview functionality
  - Add preview mode support in Strapi service
  - Create preview route with token authentication
  - Generate temporary preview URLs with expiration
  - Add preview banner to indicate preview mode
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 14. Add TypeScript types


  - Create types/strapi.types.ts with all content type interfaces
  - Export LegalDocument, BlogPost, Partner, FAQ interfaces
  - Add API response types with meta and pagination
  - Update service methods with proper return types
  - _Requirements: 3.1, 3.2, 5.3_

- [ ] 15. Performance optimization
  - [ ] 15.1 Implement image optimization
    - Use Strapi image transformation API for responsive images
    - Add srcset for different screen sizes
    - Implement lazy loading for images below fold
    - _Requirements: 3.5_
  
  - [ ] 15.2 Add prefetching for likely navigation
    - Prefetch blog posts on blog list hover
    - Prefetch legal documents on footer link hover
    - Use React Router's prefetch functionality
    - _Requirements: 7.1, 7.5_
  
  - [ ] 15.3 Configure CDN caching
    - Set appropriate Cache-Control headers in Strapi
    - Configure CDN (Cloudflare/Vercel) for static assets
    - Test cache hit rates
    - _Requirements: 7.1, 7.5_

- [ ] 16. Error handling and fallbacks
  - Add error boundaries for content sections
  - Implement graceful degradation when API fails
  - Show user-friendly error messages
  - Add retry button for failed content loads
  - Log errors to monitoring service
  - _Requirements: 3.2_

- [ ] 17. Documentation
  - Create CMS user guide for content editors
  - Document content type schemas and fields
  - Add API integration examples
  - Update project README with Strapi setup instructions
  - Document deployment process
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [ ]* 18. Testing
  - [ ]* 18.1 Write unit tests for Strapi service
    - Test fetch methods with mocked API responses
    - Test caching behavior
    - Test error handling and retry logic
    - Test cache invalidation
    - _Requirements: 3.1, 3.2, 7.1, 7.2_
  
  - [ ]* 18.2 Write integration tests for components
    - Test LegalPage component with mocked Strapi data
    - Test BlogList component with pagination
    - Test PartnerGrid component
    - Test error states and loading states
    - _Requirements: 1.1, 2.1, 6.1_
  
  - [ ]* 18.3 Write E2E tests
    - Test legal document page rendering
    - Test blog list and detail pages
    - Test partner profiles display
    - Test FAQ accordion functionality
    - _Requirements: 1.3, 2.3, 6.3_
