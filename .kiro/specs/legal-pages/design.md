# Legal Pages & Compliance System - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Legal Pages  │  Footer  │  Consent  │  Tax Receipts        │
│  Components   │  Nav     │  Banner   │  Dashboard           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Legal      │  Consent    │  Tax Receipt  │  Privacy        │
│  Service    │  Service    │  Service      │  Service        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase   │  Storage    │  Email        │  PDF            │
│  Database   │  (Docs)     │  Service      │  Generator      │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Legal Pages

**Base Component: `LegalPageTemplate.tsx`**

```typescript
interface LegalPageTemplateProps {
  documentPath: string;
  title: string;
  lastUpdated: string;
  highlightSection?: React.ReactNode;
  actionButtons?: React.ReactNode;
}

// Reusable template for all legal pages
// Handles markdown loading, rendering, and common UI
```

**Page Components:**
- `TermsOfServicePage.tsx`
- `PrivacyPolicyPage.tsx`
- `CookiePolicyPage.tsx`
- `TaxReceiptPolicyPage.tsx`
- `AcceptableUsePolicyPage.tsx`

**Features:**
- Markdown rendering with `react-markdown`
- Table of contents (auto-generated from headings)
- Print-friendly styling
- Loading states
- Error handling
- Breadcrumb navigation

### 2. Footer Component

**Structure:**

```
Footer
├── About Section (2 columns)
│   ├── Platform description
│   └── Hackathon info
├── Quick Links (1 column)
│   ├── Initiatives
│   ├── Carbon Credits
│   ├── Tree Registry
│   └── NFT Badges
├── Legal Links (1 column)
│   ├── Terms of Service
│   ├── Privacy Policy
│   ├── Cookie Policy
│   ├── Tax Receipt Policy
│   └── Acceptable Use
└── Bottom Section
    ├── Pilot Forests
    ├── Contact Info
    ├── Copyright
    └── Tax Relief Notice
```

**Responsive Design:**
- Desktop: 4-column grid
- Tablet: 2-column grid
- Mobile: Single column stack

### 3. Cookie Consent System

**Components:**

**`CookieConsentBanner.tsx`**
```typescript
interface CookieConsentBannerProps {
  onAccept: (preferences: CookiePreferences) => void;
  onReject: () => void;
}

interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  preferences: boolean;
  functional: boolean;
}
```

**Features:**
- Slide-up animation on first visit
- Granular consent options
- "Accept All" / "Reject All" / "Customize"
- Persistent storage in localStorage
- Sync with backend

**`CookieSettingsModal.tsx`**
- Detailed cookie information
- Toggle switches for each category
- Description of each cookie type
- Third-party cookie disclosure
- Save preferences

**Cookie Management Flow:**

```
First Visit
    ↓
Display Banner
    ↓
User Choice
    ├── Accept All → Enable all cookies
    ├── Reject All → Essential only
    └── Customize → Show detailed settings
         ↓
    Save Preferences
         ↓
    Store in DB + localStorage
         ↓
    Apply cookie settings
```

### 4. Terms Acceptance System

**Component: `TermsAcceptanceCheckbox.tsx`**

```typescript
interface TermsAcceptanceProps {
  onAccept: (accepted: boolean) => void;
  required?: boolean;
  termsVersion: string;
}
```

**Features:**
- Checkbox with inline terms link
- Opens terms in modal or new tab
- Tracks acceptance timestamp
- Records IP address
- Version tracking

**Database Schema:**

```sql
CREATE TABLE terms_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  terms_version VARCHAR(50) NOT NULL,
  accepted_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  UNIQUE(user_id, terms_version)
);

CREATE INDEX idx_terms_user ON terms_acceptance(user_id);
CREATE INDEX idx_terms_version ON terms_acceptance(terms_version);
```

### 5. Tax Receipt System

**Components:**

**`TaxReceiptGenerator.tsx`**
- Triggered on donation completion
- Fetches organization KRA info
- Generates unique receipt number
- Creates PDF receipt
- Sends email notification

**`TaxReceiptCard.tsx`**
- Display receipt summary
- Download PDF button
- View details modal
- Resend email option

**`AnnualTaxSummary.tsx`**
- Year selector
- Total donations by organization
- Monthly breakdown chart
- Estimated tax deduction calculator
- Download PDF summary
- Export to CSV

**Receipt Format:**

```
┌─────────────────────────────────────────────┐
│         #GangGreen Tax Receipt              │
│         Loch Tech Solutions                 │
├─────────────────────────────────────────────┤
│ Receipt No: GG-2025-00001                   │
│ Date: November 18, 2025                     │
│                                             │
│ DONOR INFORMATION                           │
│ Name: [Donor Name]                          │
│ KRA PIN: [PIN] (if provided)               │
│                                             │
│ DONATION DETAILS                            │
│ Amount: KES 5,000.00                        │
│ Organization: [Org Name]                    │
│ Organization KRA PIN: [PIN]                 │
│ Tax Exemption Cert: [Number]                │
│ Initiative: [Initiative Name]               │
│                                             │
│ TAX DEDUCTION ELIGIBILITY                   │
│ This donation may be tax-deductible under   │
│ Section 15(2)(p) of the Income Tax Act.     │
│ Consult your tax advisor.                   │
│                                             │
│ Platform Transaction ID: [UUID]             │
│ Verification: ganggreen.africa/verify/[ID]  │
└─────────────────────────────────────────────┘
```

**Database Schema:**

```sql
CREATE TABLE tax_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES donations(id),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  organization_kra_pin VARCHAR(20),
  organization_tax_cert VARCHAR(100),
  user_kra_pin VARCHAR(20),
  issued_date TIMESTAMP DEFAULT NOW(),
  tax_year INTEGER NOT NULL,
  pdf_url TEXT,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_receipt_user ON tax_receipts(user_id);
CREATE INDEX idx_receipt_year ON tax_receipts(tax_year);
CREATE INDEX idx_receipt_number ON tax_receipts(receipt_number);
```

### 6. Privacy Controls Dashboard

**Component: `PrivacySettingsDashboard.tsx`**

**Sections:**

1. **Data Access**
   - View personal data summary
   - Request full data export
   - Download previous exports

2. **Cookie Preferences**
   - Manage cookie categories
   - View active cookies
   - Clear cookies

3. **Communication Preferences**
   - Email notifications toggle
   - Marketing emails opt-out
   - Newsletter subscription

4. **Account Management**
   - Download account data
   - Request account deletion
   - Deletion consequences warning

5. **Privacy Rights (Kenya DPA)**
   - Right to access
   - Right to rectification
   - Right to erasure
   - Right to restrict processing
   - Right to data portability
   - Right to object

**Data Export Format:**

```json
{
  "export_date": "2025-11-18T10:00:00Z",
  "user_id": "uuid",
  "personal_information": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "kra_pin": "..."
  },
  "account_activity": [...],
  "donations": [...],
  "tax_receipts": [...],
  "initiatives": [...],
  "trees_planted": [...],
  "nft_badges": [...],
  "gamification": {...},
  "preferences": {...}
}
```

### 7. Policy Violation Reporting

**Component: `ViolationReportForm.tsx`**

**Form Fields:**
- Violation type (dropdown)
- Reported user/content (auto-filled)
- Description (textarea)
- Evidence upload (images, screenshots)
- Anonymous reporting option

**Violation Types:**
- Fraudulent activity
- Harassment/abuse
- Spam
- Inappropriate content
- Intellectual property violation
- Terms of Service violation
- Other

**Admin Component: `ViolationModerationDashboard.tsx`**

**Features:**
- Queue of pending reports
- Report details view
- Evidence gallery
- User history
- Action buttons (warn, suspend, ban)
- Resolution notes
- Email notification to reporter

**Database Schema:**

```sql
CREATE TABLE policy_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  reported_content_type VARCHAR(50), -- 'post', 'comment', 'initiative'
  reported_content_id UUID,
  violation_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status VARCHAR(50) DEFAULT 'pending', -- pending, investigating, resolved, dismissed
  assigned_to UUID REFERENCES users(id),
  resolution_notes TEXT,
  action_taken VARCHAR(100), -- warning, suspension, ban, none
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_violation_status ON policy_violations(status);
CREATE INDEX idx_violation_reporter ON policy_violations(reporter_id);
CREATE INDEX idx_violation_reported ON policy_violations(reported_user_id);
```

## Service Layer Design

### 1. Legal Service

**`src/services/legal.service.ts`**

```typescript
export class LegalService {
  // Get current terms version
  async getCurrentTermsVersion(): Promise<string>
  
  // Record terms acceptance
  async acceptTerms(userId: string, version: string, ipAddress: string): Promise<void>
  
  // Check if user has accepted current terms
  async hasAcceptedCurrentTerms(userId: string): Promise<boolean>
  
  // Get legal document content
  async getLegalDocument(documentType: string): Promise<string>
}
```

### 2. Consent Service

**`src/services/consent.service.ts`**

```typescript
export class ConsentService {
  // Save cookie preferences
  async saveCookiePreferences(userId: string, preferences: CookiePreferences): Promise<void>
  
  // Get cookie preferences
  async getCookiePreferences(userId: string): Promise<CookiePreferences>
  
  // Apply cookie settings to analytics
  applyAnalyticsSettings(preferences: CookiePreferences): void
}
```

### 3. Tax Receipt Service

**`src/services/taxReceipt.service.ts`**

```typescript
export class TaxReceiptService {
  // Generate receipt for donation
  async generateReceipt(donationId: string): Promise<TaxReceipt>
  
  // Get user receipts
  async getUserReceipts(userId: string, year?: number): Promise<TaxReceipt[]>
  
  // Generate annual summary
  async generateAnnualSummary(userId: string, year: number): Promise<AnnualSummary>
  
  // Download receipt PDF
  async downloadReceiptPDF(receiptId: string): Promise<Blob>
  
  // Resend receipt email
  async resendReceiptEmail(receiptId: string): Promise<void>
  
  // Verify organization KRA status
  async verifyOrganizationKRA(organizationId: string): Promise<KRAStatus>
}
```

### 4. Privacy Service

**`src/services/privacy.service.ts`**

```typescript
export class PrivacyService {
  // Request data export
  async requestDataExport(userId: string): Promise<ExportRequest>
  
  // Get export status
  async getExportStatus(requestId: string): Promise<ExportStatus>
  
  // Download exported data
  async downloadExport(requestId: string): Promise<Blob>
  
  // Request account deletion
  async requestAccountDeletion(userId: string, reason?: string): Promise<void>
  
  // Update privacy preferences
  async updatePrivacyPreferences(userId: string, preferences: PrivacyPreferences): Promise<void>
}
```

## UI/UX Design

### Visual Design

**Color Scheme:**
- Primary: Green (#16a34a) - Trust, environment
- Secondary: Gray (#374151) - Professional, readable
- Accent: Blue (#3b82f6) - Links, actions
- Warning: Yellow (#f59e0b) - Important notices
- Error: Red (#ef4444) - Violations, deletions
- Success: Green (#10b981) - Confirmations

**Typography:**
- Headings: Inter, Bold
- Body: Inter, Regular
- Legal text: 16px for readability
- Line height: 1.6 for legal documents

**Spacing:**
- Generous whitespace for readability
- Clear section separation
- Consistent padding/margins

### Accessibility

**WCAG 2.1 AA Compliance:**
- Color contrast ratio ≥ 4.5:1
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Alt text for images
- Semantic HTML

**Features:**
- Skip to content links
- ARIA labels
- Heading hierarchy
- Form labels
- Error messages

### Mobile Optimization

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Features:**
- Collapsible table of contents
- Sticky footer navigation
- Touch-friendly buttons (min 44px)
- Simplified layouts
- Optimized font sizes

## Integration Points

### 1. Registration Flow

```typescript
// RegisterForm.tsx
<TermsAcceptanceCheckbox
  onAccept={handleTermsAccept}
  required={true}
  termsVersion="1.0.0"
/>

// On submit
await legalService.acceptTerms(userId, version, ipAddress);
```

### 2. Donation Flow

```typescript
// After successful donation
const receipt = await taxReceiptService.generateReceipt(donationId);
await emailService.sendTaxReceipt(receipt);
```

### 3. Cookie Banner

```typescript
// App.tsx - Root level
<CookieConsentBanner
  onAccept={handleCookieAccept}
  onReject={handleCookieReject}
/>

// Apply settings
consentService.applyAnalyticsSettings(preferences);
```

### 4. Profile Settings

```typescript
// ProfilePage.tsx
<PrivacySettingsDashboard
  userId={user.id}
  onExportRequest={handleExportRequest}
  onDeleteRequest={handleDeleteRequest}
/>
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Load legal documents on demand
   - Code splitting for legal pages
   - Defer non-critical scripts

2. **Caching**
   - Cache legal documents (1 hour)
   - Cache user preferences (localStorage)
   - CDN for static legal files

3. **PDF Generation**
   - Generate PDFs asynchronously
   - Queue system for bulk generation
   - Cache generated PDFs

4. **Database Queries**
   - Index frequently queried fields
   - Pagination for receipt lists
   - Aggregate queries for summaries

## Security Measures

### Data Protection

1. **Encryption**
   - Encrypt KRA PINs at rest
   - TLS for data in transit
   - Secure PDF storage

2. **Access Control**
   - User can only access own receipts
   - Admin role for violation moderation
   - Audit logging for sensitive actions

3. **Privacy**
   - Anonymize IP addresses after 90 days
   - Secure data export process
   - Permanent deletion on account removal

### Compliance Auditing

**Audit Log:**
```sql
CREATE TABLE compliance_audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(100), -- 'terms_accepted', 'data_exported', 'account_deleted'
  details JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Testing Strategy

### Unit Tests
- Service layer functions
- Component rendering
- Form validation
- PDF generation

### Integration Tests
- Terms acceptance flow
- Tax receipt generation
- Data export process
- Cookie consent flow

### E2E Tests
- Complete registration with terms
- Donation to tax receipt
- Privacy settings management
- Violation reporting

### Compliance Tests
- Kenya DPA requirements
- GDPR requirements
- Tax receipt format
- Cookie consent compliance

## Deployment Checklist

- [ ] Legal documents reviewed by attorney
- [ ] KRA tax receipt format approved
- [ ] ODPC registration completed
- [ ] Data Protection Officer appointed
- [ ] Privacy Policy published
- [ ] Cookie consent functional
- [ ] Terms acceptance working
- [ ] Tax receipt generation tested
- [ ] Email delivery configured
- [ ] PDF generation working
- [ ] Database migrations applied
- [ ] Monitoring and alerts set up
- [ ] Backup and recovery tested
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Accessibility audit passed
- [ ] Mobile testing completed
- [ ] User documentation created
