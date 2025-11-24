# Legal Pages & Compliance System - Requirements

## Overview

Implement comprehensive legal documentation and compliance features for the #GangGreen platform, including Terms of Service, Privacy Policy, Cookie Policy, Tax Receipt Policy, and Acceptable Use Policy. The system must comply with Kenyan law (Kenya Data Protection Act 2019, Income Tax Act) and provide users with clear legal information and tax benefits.

## Business Goals

1. **Legal Compliance**: Meet all Kenyan legal requirements for data protection, tax reporting, and platform operations
2. **User Trust**: Build confidence through transparent legal policies and data practices
3. **Tax Incentives**: Enable Kenyan users to claim tax deductions on charitable donations
4. **Risk Mitigation**: Protect the platform and users through clear terms and acceptable use policies
5. **International Standards**: Align with GDPR and other international data protection standards

## Target Users

- **All Platform Users**: Must accept terms and understand privacy practices
- **Kenyan Donors**: Need tax receipts for KRA deductions
- **Organizations**: Require clear terms for initiative creation and fund management
- **International Users**: Need to understand cross-border data implications
- **Administrators**: Need tools to enforce policies and manage compliance

## Core Features

### 1. Legal Document Display

**Requirements:**
- Display all 5 legal documents in readable, accessible format
- Markdown rendering with proper typography
- Mobile-responsive layout
- Print-friendly formatting
- Version tracking and update notifications
- Last updated date prominently displayed

**Documents:**
1. Terms of Service
2. Privacy Policy
3. Cookie Policy
4. Tax Receipt Policy
5. Acceptable Use Policy

### 2. Footer Navigation

**Requirements:**
- Legal links in footer on all pages
- Quick access to all legal documents
- Contact information for legal inquiries
- Tax relief notice for Kenyan users
- Pilot forest information
- Copyright and licensing information

### 3. Terms Acceptance System

**Requirements:**
- Mandatory acceptance during registration
- Checkbox with link to full terms
- Track acceptance timestamp and IP address
- Version tracking for terms updates
- Re-acceptance required for material changes
- Audit trail for compliance

### 4. Cookie Consent Banner

**Requirements:**
- Display on first visit
- Granular consent options (essential, analytics, preferences, functional)
- Remember user preferences
- Easy to modify settings later
- Comply with Kenya DPA and GDPR
- Analytics opt-out functionality

### 5. Tax Receipt System

**Requirements:**
- Automatic receipt generation for eligible donations
- KRA-compliant receipt format
- Include donor KRA PIN (optional)
- Organization KRA PIN and tax exemption certificate number
- Unique receipt numbers
- Email delivery within 24 hours
- Download from user dashboard
- Annual tax summaries
- 7-year retention period

### 6. Privacy Controls

**Requirements:**
- Data export functionality (Kenya DPA/GDPR right to portability)
- Account deletion with data erasure
- Cookie preference management
- Marketing communication opt-out
- Privacy settings dashboard
- Data access request handling

### 7. Policy Violation Reporting

**Requirements:**
- In-platform reporting tools
- Email reporting (abuse@ganggreen.africa)
- Report categories (fraud, harassment, spam, etc.)
- Evidence attachment (screenshots, links)
- Investigation workflow
- User notification of outcomes
- Appeals process

## Kenyan Tax Relief Integration

### Tax Deduction Framework

**Section 15(2)(p) Income Tax Act:**
- Donations to KRA-approved charitable organizations are tax-deductible
- Maximum deduction typically 10-20% of taxable income
- Requires proper documentation and receipts

**Platform Implementation:**
1. Verify organization KRA approval status
2. Display tax exemption certificate numbers
3. Generate compliant tax receipts
4. Provide annual donation summaries
5. Include tax benefit messaging in donation flow
6. Offer tax calculator for estimated savings

### Required Information

**From Users:**
- KRA PIN (optional but recommended)
- Full legal name
- Contact information
- Donation history

**From Organizations:**
- Organization KRA PIN
- Tax exemption certificate number
- Certificate expiration date
- Charitable purpose documentation

## Technical Requirements

### Database Schema

**Tables Needed:**

```sql
-- Terms acceptance tracking
terms_acceptance (
  id, user_id, terms_version, accepted_at, ip_address
)

-- Cookie consent tracking
cookie_consent (
  id, user_id, essential, analytics, preferences, 
  functional, consent_date, ip_address
)

-- Tax receipts
tax_receipts (
  id, user_id, donation_id, receipt_number, amount,
  organization_name, organization_kra_pin, user_kra_pin,
  issued_date, tax_year, pdf_url
)

-- Policy violations
policy_violations (
  id, reporter_id, reported_user_id, violation_type,
  description, evidence_urls, status, created_at
)

-- Data requests (GDPR/Kenya DPA)
data_requests (
  id, user_id, request_type, status, requested_at,
  completed_at, download_url
)
```

### API Endpoints

**Legal Documents:**
- `GET /api/legal/terms/current-version`
- `POST /api/legal/terms/accept`
- `GET /api/legal/cookie-consent`
- `POST /api/legal/cookie-consent`

**Tax Receipts:**
- `POST /api/tax-receipts/generate`
- `GET /api/tax-receipts/:id`
- `GET /api/tax-receipts/annual-summary/:year`
- `GET /api/tax-receipts/download/:id`

**Privacy Rights:**
- `POST /api/user/data-export-request`
- `POST /api/user/data-deletion-request`
- `GET /api/user/data-access-request`

**Reporting:**
- `POST /api/violations/report`
- `GET /api/violations/my-reports`
- `POST /api/violations/appeal`

### Frontend Components

**Legal Pages:**
- `TermsOfServicePage.tsx`
- `PrivacyPolicyPage.tsx`
- `CookiePolicyPage.tsx`
- `TaxReceiptPolicyPage.tsx`
- `AcceptableUsePolicyPage.tsx`

**Compliance Components:**
- `CookieConsentBanner.tsx`
- `TermsAcceptanceCheckbox.tsx`
- `TaxReceiptGenerator.tsx`
- `PrivacySettingsDashboard.tsx`
- `ViolationReportForm.tsx`

**Layout:**
- `Footer.tsx` (with legal links)

## User Flows

### 1. New User Registration

1. User fills registration form
2. Terms acceptance checkbox displayed (required)
3. Link to full Terms of Service
4. Cookie consent banner appears
5. User selects cookie preferences
6. Account created with acceptance recorded
7. Welcome email includes links to all policies

### 2. Donation with Tax Receipt

1. User makes donation to KRA-approved organization
2. System checks organization approval status
3. Tax receipt automatically generated
4. Receipt emailed within 24 hours
5. Receipt available in dashboard
6. User can add KRA PIN for compliant receipt
7. Receipt includes all required information

### 3. Annual Tax Summary

1. System generates summaries in January
2. Email sent to all donors
3. Summary includes:
   - Total donations by organization
   - Monthly breakdown
   - Estimated tax deduction
   - Individual receipt list
4. Downloadable PDF format
5. Available in dashboard year-round

### 4. Cookie Preference Management

1. User clicks "Cookie Settings" in footer
2. Dashboard shows current preferences
3. User toggles categories on/off
4. Essential cookies cannot be disabled
5. Changes saved immediately
6. Analytics tracking updated

### 5. Data Export Request

1. User requests data export (Kenya DPA right)
2. System queues export job
3. Email notification when ready
4. Secure download link (expires in 7 days)
5. JSON format with all personal data
6. Includes donation history, receipts, activity

### 6. Policy Violation Report

1. User clicks "Report" on content/user
2. Form with violation type selection
3. Description and evidence upload
4. Submission confirmation
5. Investigation by moderators
6. Email notification of outcome
7. Appeals process if needed

## Compliance Requirements

### Kenya Data Protection Act 2019

**User Rights:**
- Right to access personal data
- Right to rectification
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to data portability
- Right to object
- Right to withdraw consent

**Platform Obligations:**
- Obtain explicit consent for data processing
- Provide clear privacy information
- Implement security measures
- Report data breaches within 72 hours
- Appoint Data Protection Officer
- Register with ODPC

### Income Tax Act (Section 15(2)(p))

**Requirements:**
- Verify organization KRA approval
- Issue compliant tax receipts
- Include required information
- Maintain 7-year records
- Report to KRA as required

### International Compliance

**GDPR (EU Users):**
- Enhanced consent requirements
- Right to be forgotten
- Data portability
- Privacy by design

**CCPA (California Users):**
- Disclosure of data collection
- Opt-out rights
- Non-discrimination

## Success Metrics

### Compliance Metrics
- 100% terms acceptance rate for new users
- Cookie consent rate by category
- Data request response time < 30 days
- Zero data breach incidents
- Policy violation resolution time < 10 days

### Tax Receipt Metrics
- Tax receipt generation success rate > 99%
- Average receipt delivery time < 12 hours
- Annual summary generation rate 100%
- User KRA PIN adoption rate
- Tax deduction claim rate (survey)

### User Engagement
- Legal page views
- Cookie preference changes
- Privacy settings usage
- Data export requests
- Violation reports submitted

## Security & Privacy

### Data Protection
- Encrypt sensitive data (KRA PINs, personal info)
- Secure storage for legal documents
- Access controls for admin functions
- Audit logging for all compliance actions
- Regular security assessments

### Privacy by Design
- Minimize data collection
- Purpose limitation
- Data minimization
- Storage limitation
- Integrity and confidentiality

## Future Enhancements

### Phase 2
- Multi-language legal documents (Swahili)
- Interactive policy summaries
- Video explanations of key terms
- Chatbot for legal questions
- Automated KRA verification API

### Phase 3
- Blockchain-based consent records
- Smart contract for tax receipts
- AI-powered policy violation detection
- Predictive compliance analytics
- Integration with KRA iTax system

## Dependencies

- React Router (routing)
- react-markdown (document rendering)
- @tailwindcss/typography (styling)
- Supabase (database, storage)
- Email service (receipt delivery)
- PDF generation library (receipts)

## Risks & Mitigation

**Risk: Legal document errors**
- Mitigation: Professional legal review before deployment

**Risk: Tax receipt non-compliance**
- Mitigation: Consult with KRA, use certified format

**Risk: Data breach**
- Mitigation: Encryption, access controls, monitoring

**Risk: Policy violation backlog**
- Mitigation: Dedicated moderation team, automated tools

**Risk: International law conflicts**
- Mitigation: Legal counsel, jurisdiction clauses

## Timeline Estimate

- **Week 1**: Database schema, API endpoints
- **Week 2**: Frontend components, legal pages
- **Week 3**: Tax receipt system, cookie consent
- **Week 4**: Privacy controls, reporting system
- **Week 5**: Testing, legal review
- **Week 6**: Deployment, monitoring

## Acceptance Criteria

- [ ] All 5 legal documents accessible via footer
- [ ] Terms acceptance required during registration
- [ ] Cookie consent banner functional
- [ ] Tax receipts auto-generated for donations
- [ ] Annual tax summaries generated
- [ ] Data export functionality working
- [ ] Account deletion with data erasure
- [ ] Policy violation reporting functional
- [ ] Mobile-responsive design
- [ ] Legal review completed
- [ ] Kenya DPA compliance verified
- [ ] KRA tax receipt format approved
