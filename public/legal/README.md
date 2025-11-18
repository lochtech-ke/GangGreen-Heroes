# Legal Documents - #GangGreen Platform

This directory contains all legal policies and documents for the #GangGreen platform operated by Loch Tech Solutions.

## Available Documents

### Core Legal Documents

1. **[Terms of Service](./terms-of-service.md)**
   - User agreement and platform rules
   - Account responsibilities
   - Donation and transaction terms
   - Tax receipt provisions for Kenyan donors
   - NFT and cryptocurrency terms
   - Liability limitations and dispute resolution

2. **[Privacy Policy](./privacy-policy.md)**
   - Data collection and usage practices
   - Kenya Data Protection Act compliance
   - User rights and data protection
   - International data transfers
   - Cookie and tracking information

3. **[Cookie Policy](./cookie-policy.md)**
   - Types of cookies used
   - How to manage cookie preferences
   - Third-party cookies
   - Impact of disabling cookies

4. **[Tax Receipt Policy](./tax-receipt-policy.md)**
   - Kenyan tax deduction framework
   - Tax receipt issuance process
   - Annual tax summaries
   - Documentation requirements
   - Cryptocurrency donation tax treatment

5. **[Acceptable Use Policy](./acceptable-use-policy.md)**
   - Permitted and prohibited activities
   - Content standards
   - Community conduct rules
   - Enforcement and consequences

## Quick Reference

### For Users

**Before Using the Platform:**
- Read [Terms of Service](./terms-of-service.md)
- Review [Privacy Policy](./privacy-policy.md)
- Understand [Acceptable Use Policy](./acceptable-use-policy.md)

**For Tax Purposes:**
- Review [Tax Receipt Policy](./tax-receipt-policy.md)
- Provide your KRA PIN in profile settings
- Download annual tax summaries in January

**Privacy Settings:**
- Manage cookies via [Cookie Policy](./cookie-policy.md) instructions
- Control data sharing in account settings
- Exercise your data rights per Privacy Policy

### For Organizations

**Creating Initiatives:**
- Ensure KRA tax exemption certificate is current
- Provide accurate organization information
- Comply with Terms of Service Section 5
- Follow Acceptable Use Policy Section 5

**Tax Receipts:**
- Verify your organization's KRA approval status
- Provide organization KRA PIN
- Issue receipts through platform automatically

### For Developers

**Integration Requirements:**
- Display Terms of Service during signup
- Implement cookie consent banner
- Provide privacy policy links in footer
- Enable tax receipt download functionality

**Compliance Checklist:**
- [ ] Terms acceptance checkbox on registration
- [ ] Cookie consent banner on first visit
- [ ] Privacy policy link in footer
- [ ] Tax receipt generation for donations
- [ ] Data export functionality (GDPR/Kenya DPA)
- [ ] Account deletion option
- [ ] Cookie preference management

## Legal Compliance

### Kenyan Law Compliance

**Kenya Data Protection Act, 2019:**
- User consent for data processing
- Data subject rights implementation
- Data breach notification procedures
- Cross-border data transfer safeguards

**Income Tax Act:**
- Section 15(2)(p) charitable donation deductions
- Tax receipt requirements
- KRA reporting obligations

**Computer Misuse and Cybercrimes Act, 2018:**
- Security measures and access controls
- Prohibited activities enforcement

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

## Document Updates

### Last Updated
All documents: November 18, 2025

### Update Frequency
- Reviewed quarterly
- Updated as needed for legal changes
- Users notified of material changes

### Version History
Track changes in git commit history for this directory.

## Contact Information

### Legal Inquiries

**General Legal Questions:**  
Email: legal@ganggreen.africa

**Privacy and Data Protection:**  
Email: privacy@ganggreen.africa  
Data Protection Officer: dpo@ganggreen.africa

**Tax Receipts:**  
Email: tax-receipts@ganggreen.africa

**Policy Violations:**  
Email: abuse@ganggreen.africa

**Appeals:**  
Email: appeals@ganggreen.africa

### Company Information

**Loch Tech Solutions**  
Address: [Physical Address], Nairobi, Kenya  
Phone: [Contact Number]  
Website: www.ganggreen.africa  
KRA PIN: [Company KRA PIN]

### Regulatory Authorities

**Office of the Data Protection Commissioner (ODPC)**  
Email: datacommissioner@odpc.go.ke  
Website: www.odpc.go.ke  
Address: Nairobi, Kenya

**Kenya Revenue Authority (KRA)**  
Website: www.kra.go.ke  
iTax Portal: https://itax.kra.go.ke  
Call Center: 0711-099-999

## Implementation Notes

### For Frontend Development

**Required Components:**

1. **Legal Pages** (`src/pages/legal/`)
   - TermsOfService.tsx
   - PrivacyPolicy.tsx
   - CookiePolicy.tsx
   - TaxReceiptPolicy.tsx
   - AcceptableUsePolicy.tsx

2. **Cookie Consent Banner** (`src/components/legal/`)
   - CookieConsentBanner.tsx
   - Cookie preference management
   - Analytics opt-out functionality

3. **Terms Acceptance** (`src/components/auth/`)
   - Checkbox during registration
   - Link to full terms
   - Version tracking

4. **Footer Links** (`src/components/common/Footer.tsx`)
   - Links to all legal documents
   - Copyright notice
   - Contact information

### Database Requirements

**Tables Needed:**

```sql
-- Track terms acceptance
CREATE TABLE terms_acceptance (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  terms_version VARCHAR(50),
  accepted_at TIMESTAMP,
  ip_address VARCHAR(45)
);

-- Track cookie consent
CREATE TABLE cookie_consent (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  essential BOOLEAN DEFAULT true,
  analytics BOOLEAN DEFAULT false,
  preferences BOOLEAN DEFAULT false,
  functional BOOLEAN DEFAULT false,
  consent_date TIMESTAMP,
  ip_address VARCHAR(45)
);

-- Tax receipt records
CREATE TABLE tax_receipts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  donation_id UUID REFERENCES donations(id),
  receipt_number VARCHAR(50) UNIQUE,
  amount DECIMAL(10,2),
  organization_name VARCHAR(255),
  organization_kra_pin VARCHAR(20),
  user_kra_pin VARCHAR(20),
  issued_date TIMESTAMP,
  tax_year INTEGER
);
```

### API Endpoints Needed

```typescript
// Tax receipts
POST /api/tax-receipts/generate
GET /api/tax-receipts/:id
GET /api/tax-receipts/annual-summary/:year

// Legal documents
GET /api/legal/terms/current-version
POST /api/legal/terms/accept
GET /api/legal/cookie-consent
POST /api/legal/cookie-consent

// Data rights (Kenya DPA / GDPR)
GET /api/user/data-export
POST /api/user/data-deletion-request
GET /api/user/data-access-request
```

## License

These legal documents are proprietary to Loch Tech Solutions and are provided for use with the #GangGreen platform only.

**Copyright © 2025 Loch Tech Solutions. All rights reserved.**

---

**Note:** These documents should be reviewed by a qualified attorney licensed in Kenya before deployment. This is especially important for tax-related provisions and compliance with Kenyan law.
