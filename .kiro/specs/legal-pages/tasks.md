# Legal Pages & Compliance System - Implementation Tasks

## Status: ✅ PARTIALLY COMPLETE

**Completed:**
- ✅ Legal documents created (Terms, Privacy, Cookies, Tax Receipts, Acceptable Use)
- ✅ Footer component with legal links
- ✅ Legal page components with markdown rendering
- ✅ Routing configured
- ✅ Tailwind typography plugin installed

**In Progress:**
- 🔄 Database schema implementation
- 🔄 Service layer development
- 🔄 Compliance components

**Pending:**
- ⏳ Tax receipt system
- ⏳ Cookie consent banner
- ⏳ Terms acceptance tracking
- ⏳ Privacy controls dashboard

---

## Phase 1: Foundation (Week 1)

### Task 1.1: Database Schema ⏳
**Priority: HIGH**

Create database tables for compliance tracking.

**Subtasks:**
- [ ] Create migration file `017_add_legal_compliance_tables.sql`
- [ ] Add `terms_acceptance` table
- [ ] Add `cookie_consent` table
- [ ] Add `tax_receipts` table
- [ ] Add `policy_violations` table
- [ ] Add `data_requests` table
- [ ] Add `compliance_audit_log` table
- [ ] Create indexes for performance
- [ ] Add foreign key constraints
- [ ] Test migration locally

**Files:**
- `supabase/migrations/017_add_legal_compliance_tables.sql`

**Acceptance Criteria:**
- All tables created successfully
- Indexes improve query performance
- Foreign keys maintain referential integrity
- Migration is reversible

---

### Task 1.2: Legal Service Layer ⏳
**Priority: HIGH**

Implement service layer for legal operations.

**Subtasks:**
- [ ] Create `src/services/legal.service.ts`
- [ ] Implement `getCurrentTermsVersion()`
- [ ] Implement `acceptTerms()`
- [ ] Implement `hasAcceptedCurrentTerms()`
- [ ] Implement `getLegalDocument()`
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Write unit tests

**Files:**
- `src/services/legal.service.ts`
- `src/types/legal.types.ts`
- `src/services/legal.service.test.ts`

**Acceptance Criteria:**
- All methods work correctly
- Proper error handling
- Type safety enforced
- Unit tests pass (>80% coverage)

---

### Task 1.3: Consent Service Layer ⏳
**Priority: HIGH**

Implement cookie consent management.

**Subtasks:**
- [ ] Create `src/services/consent.service.ts`
- [ ] Implement `saveCookiePreferences()`
- [ ] Implement `getCookiePreferences()`
- [ ] Implement `applyAnalyticsSettings()`
- [ ] Add localStorage integration
- [ ] Add Supabase sync
- [ ] Add TypeScript types
- [ ] Write unit tests

**Files:**
- `src/services/consent.service.ts`
- `src/types/consent.types.ts`
- `src/services/consent.service.test.ts`

**Acceptance Criteria:**
- Preferences saved to DB and localStorage
- Analytics tracking respects preferences
- Sync between storage and DB
- Unit tests pass

---

## Phase 2: Core Components (Week 2)

### Task 2.1: Cookie Consent Banner ⏳
**Priority: HIGH**

Create cookie consent banner component.

**Subtasks:**
- [ ] Create `src/components/legal/CookieConsentBanner.tsx`
- [ ] Design banner UI (bottom slide-up)
- [ ] Add "Accept All" / "Reject All" / "Customize" buttons
- [ ] Create `CookieSettingsModal.tsx` for detailed settings
- [ ] Add animation (slide-up on mount)
- [ ] Implement preference toggles
- [ ] Add cookie descriptions
- [ ] Integrate with consent service
- [ ] Add to App.tsx root level
- [ ] Test on all devices
- [ ] Write component tests

**Files:**
- `src/components/legal/CookieConsentBanner.tsx`
- `src/components/legal/CookieSettingsModal.tsx`
- `src/components/legal/index.ts`
- `src/components/legal/CookieConsentBanner.test.tsx`

**Acceptance Criteria:**
- Banner shows on first visit only
- Preferences saved correctly
- Analytics disabled if rejected
- Mobile responsive
- Accessible (WCAG AA)
- Tests pass

---

### Task 2.2: Terms Acceptance Component ⏳
**Priority: HIGH**

Create terms acceptance checkbox for registration.

**Subtasks:**
- [ ] Create `src/components/legal/TermsAcceptanceCheckbox.tsx`
- [ ] Add checkbox with terms link
- [ ] Open terms in modal or new tab
- [ ] Track acceptance state
- [ ] Add validation (required)
- [ ] Integrate with legal service
- [ ] Add to RegisterForm
- [ ] Record IP address and timestamp
- [ ] Write component tests

**Files:**
- `src/components/legal/TermsAcceptanceCheckbox.tsx`
- `src/components/auth/RegisterForm.tsx` (update)
- `src/components/legal/TermsAcceptanceCheckbox.test.tsx`

**Acceptance Criteria:**
- Checkbox required for registration
- Terms link opens correctly
- Acceptance recorded in database
- IP and timestamp captured
- Tests pass

---

### Task 2.3: Legal Page Enhancements ✅ → ⏳
**Priority: MEDIUM**

Enhance legal pages with additional features.

**Subtasks:**
- [ ] Add table of contents (auto-generated)
- [ ] Add print stylesheet
- [ ] Add "Last Updated" badge
- [ ] Add breadcrumb navigation
- [ ] Add scroll-to-top button
- [ ] Improve loading states
- [ ] Add error boundaries
- [ ] Test print functionality
- [ ] Test on mobile devices

**Files:**
- `src/pages/legal/*.tsx` (all pages)
- `src/components/legal/TableOfContents.tsx`
- `src/styles/print.css`

**Acceptance Criteria:**
- TOC navigates to sections
- Print layout is clean
- Mobile responsive
- Error handling works
- Accessible

---

## Phase 3: Tax Receipt System (Week 3)

### Task 3.1: Tax Receipt Service ⏳
**Priority: HIGH**

Implement tax receipt generation service.

**Subtasks:**
- [ ] Create `src/services/taxReceipt.service.ts`
- [ ] Implement `generateReceipt()`
- [ ] Implement `getUserReceipts()`
- [ ] Implement `generateAnnualSummary()`
- [ ] Implement `downloadReceiptPDF()`
- [ ] Implement `resendReceiptEmail()`
- [ ] Implement `verifyOrganizationKRA()`
- [ ] Add unique receipt number generation
- [ ] Add TypeScript types
- [ ] Write unit tests

**Files:**
- `src/services/taxReceipt.service.ts`
- `src/types/taxReceipt.types.ts`
- `src/services/taxReceipt.service.test.ts`

**Acceptance Criteria:**
- Receipts generated correctly
- Unique receipt numbers
- KRA verification works
- Unit tests pass

---

### Task 3.2: PDF Generation ⏳
**Priority: HIGH**

Implement PDF generation for tax receipts.

**Subtasks:**
- [ ] Install PDF library (jsPDF or react-pdf)
- [ ] Create receipt PDF template
- [ ] Add company logo and branding
- [ ] Include all required information
- [ ] Format for KRA compliance
- [ ] Add QR code for verification
- [ ] Test PDF generation
- [ ] Optimize file size

**Files:**
- `src/utils/pdfGenerator.ts`
- `src/templates/taxReceiptTemplate.ts`

**Acceptance Criteria:**
- PDF matches KRA format
- All information included
- Professional appearance
- File size < 500KB
- QR code works

---

### Task 3.3: Tax Receipt Components ⏳
**Priority: HIGH**

Create UI components for tax receipts.

**Subtasks:**
- [ ] Create `src/components/tax/TaxReceiptCard.tsx`
- [ ] Create `src/components/tax/TaxReceiptList.tsx`
- [ ] Create `src/components/tax/AnnualTaxSummary.tsx`
- [ ] Create `src/components/tax/TaxReceiptModal.tsx`
- [ ] Add download button
- [ ] Add resend email button
- [ ] Add year filter
- [ ] Add search/filter functionality
- [ ] Write component tests

**Files:**
- `src/components/tax/*.tsx`
- `src/components/tax/index.ts`
- `src/components/tax/*.test.tsx`

**Acceptance Criteria:**
- Receipts display correctly
- Download works
- Email resend works
- Filters work
- Mobile responsive
- Tests pass

---

### Task 3.4: Tax Receipt Integration ⏳
**Priority: HIGH**

Integrate tax receipts into donation flow.

**Subtasks:**
- [ ] Add receipt generation to donation completion
- [ ] Trigger email notification
- [ ] Add receipt link to confirmation page
- [ ] Add receipts section to profile
- [ ] Add KRA PIN field to profile settings
- [ ] Add annual summary generation (cron job)
- [ ] Test end-to-end flow

**Files:**
- `src/services/donation.service.ts` (update)
- `src/pages/ProfilePage.tsx` (update)
- `src/components/profile/TaxReceiptsSection.tsx`
- `supabase/functions/generate-annual-summaries/index.ts`

**Acceptance Criteria:**
- Receipt auto-generated on donation
- Email sent within 24 hours
- Receipts visible in profile
- Annual summaries generated
- End-to-end flow works

---

## Phase 4: Privacy Controls (Week 4)

### Task 4.1: Privacy Service Layer ⏳
**Priority: HIGH**

Implement privacy and data rights service.

**Subtasks:**
- [ ] Create `src/services/privacy.service.ts`
- [ ] Implement `requestDataExport()`
- [ ] Implement `getExportStatus()`
- [ ] Implement `downloadExport()`
- [ ] Implement `requestAccountDeletion()`
- [ ] Implement `updatePrivacyPreferences()`
- [ ] Add TypeScript types
- [ ] Write unit tests

**Files:**
- `src/services/privacy.service.ts`
- `src/types/privacy.types.ts`
- `src/services/privacy.service.test.ts`

**Acceptance Criteria:**
- All methods work correctly
- Data export includes all user data
- Account deletion is thorough
- Unit tests pass

---

### Task 4.2: Data Export Functionality ⏳
**Priority: HIGH**

Implement user data export (Kenya DPA/GDPR).

**Subtasks:**
- [ ] Create Supabase Edge Function for export
- [ ] Collect all user data (profile, donations, receipts, etc.)
- [ ] Format as JSON
- [ ] Generate secure download link
- [ ] Set expiration (7 days)
- [ ] Send email notification
- [ ] Add export history tracking
- [ ] Test with real data

**Files:**
- `supabase/functions/export-user-data/index.ts`
- `src/utils/dataExporter.ts`

**Acceptance Criteria:**
- All user data included
- JSON format is valid
- Download link expires
- Email notification sent
- Secure process

---

### Task 4.3: Privacy Settings Dashboard ⏳
**Priority: MEDIUM**

Create privacy controls dashboard.

**Subtasks:**
- [ ] Create `src/components/privacy/PrivacySettingsDashboard.tsx`
- [ ] Add data access section
- [ ] Add cookie preferences section
- [ ] Add communication preferences
- [ ] Add account deletion section
- [ ] Add data export request button
- [ ] Add deletion confirmation modal
- [ ] Show export history
- [ ] Write component tests

**Files:**
- `src/components/privacy/PrivacySettingsDashboard.tsx`
- `src/components/privacy/DataExportSection.tsx`
- `src/components/privacy/AccountDeletionSection.tsx`
- `src/components/privacy/index.ts`

**Acceptance Criteria:**
- All sections functional
- Export request works
- Deletion has confirmation
- Mobile responsive
- Tests pass

---

### Task 4.4: Account Deletion Flow ⏳
**Priority: HIGH**

Implement account deletion with data erasure.

**Subtasks:**
- [ ] Create deletion confirmation modal
- [ ] Add "Are you sure?" warnings
- [ ] List consequences of deletion
- [ ] Implement soft delete (30-day grace period)
- [ ] Create Supabase Edge Function for deletion
- [ ] Delete user data (except legal requirements)
- [ ] Retain tax records (7 years)
- [ ] Send confirmation email
- [ ] Test deletion process

**Files:**
- `src/components/privacy/AccountDeletionModal.tsx`
- `supabase/functions/delete-user-account/index.ts`

**Acceptance Criteria:**
- Confirmation required
- Grace period implemented
- Data properly deleted
- Legal records retained
- Email confirmation sent

---

## Phase 5: Violation Reporting (Week 5)

### Task 5.1: Violation Reporting Service ⏳
**Priority: MEDIUM**

Implement policy violation reporting service.

**Subtasks:**
- [ ] Create `src/services/violation.service.ts`
- [ ] Implement `reportViolation()`
- [ ] Implement `getMyReports()`
- [ ] Implement `getViolationDetails()`
- [ ] Implement `submitAppeal()`
- [ ] Add file upload for evidence
- [ ] Add TypeScript types
- [ ] Write unit tests

**Files:**
- `src/services/violation.service.ts`
- `src/types/violation.types.ts`
- `src/services/violation.service.test.ts`

**Acceptance Criteria:**
- Reports submitted successfully
- Evidence uploaded
- User can view their reports
- Unit tests pass

---

### Task 5.2: Violation Report Form ⏳
**Priority: MEDIUM**

Create violation reporting form component.

**Subtasks:**
- [ ] Create `src/components/reporting/ViolationReportForm.tsx`
- [ ] Add violation type dropdown
- [ ] Add description textarea
- [ ] Add evidence upload (images)
- [ ] Add anonymous reporting option
- [ ] Add form validation
- [ ] Integrate with violation service
- [ ] Add success confirmation
- [ ] Write component tests

**Files:**
- `src/components/reporting/ViolationReportForm.tsx`
- `src/components/reporting/index.ts`
- `src/components/reporting/ViolationReportForm.test.tsx`

**Acceptance Criteria:**
- Form validates correctly
- Evidence uploads work
- Anonymous option works
- Success message shown
- Tests pass

---

### Task 5.3: Admin Moderation Dashboard ⏳
**Priority: MEDIUM**

Create admin dashboard for violation moderation.

**Subtasks:**
- [ ] Create `src/components/admin/ViolationModerationDashboard.tsx`
- [ ] Add pending reports queue
- [ ] Add report details view
- [ ] Add evidence gallery
- [ ] Add action buttons (warn, suspend, ban)
- [ ] Add resolution notes field
- [ ] Add status filters
- [ ] Send email notifications
- [ ] Write component tests

**Files:**
- `src/components/admin/ViolationModerationDashboard.tsx`
- `src/components/admin/ViolationReportCard.tsx`
- `src/pages/admin/ModerationPage.tsx`

**Acceptance Criteria:**
- Queue displays correctly
- Actions work properly
- Notifications sent
- Admin-only access
- Tests pass

---

### Task 5.4: Report Integration ⏳
**Priority: MEDIUM**

Integrate reporting into platform.

**Subtasks:**
- [ ] Add "Report" button to posts
- [ ] Add "Report" button to comments
- [ ] Add "Report" button to user profiles
- [ ] Add "Report" button to initiatives
- [ ] Add report modal
- [ ] Test reporting flow
- [ ] Add rate limiting

**Files:**
- Various component files (update)
- `src/components/reporting/ReportButton.tsx`
- `src/components/reporting/ReportModal.tsx`

**Acceptance Criteria:**
- Report buttons visible
- Modal opens correctly
- Reports submitted
- Rate limiting works
- End-to-end flow works

---

## Phase 6: Testing & Polish (Week 6)

### Task 6.1: Comprehensive Testing ⏳
**Priority: HIGH**

Test all compliance features thoroughly.

**Subtasks:**
- [ ] Unit tests for all services (>80% coverage)
- [ ] Component tests for all UI
- [ ] Integration tests for flows
- [ ] E2E tests for critical paths
- [ ] Accessibility testing (WCAG AA)
- [ ] Mobile device testing
- [ ] Browser compatibility testing
- [ ] Performance testing
- [ ] Security testing

**Acceptance Criteria:**
- All tests pass
- Coverage > 80%
- No accessibility issues
- Works on all devices
- Performance acceptable

---

### Task 6.2: Legal Review ⏳
**Priority: CRITICAL**

Get legal documents reviewed by attorney.

**Subtasks:**
- [ ] Engage Kenyan attorney
- [ ] Review Terms of Service
- [ ] Review Privacy Policy
- [ ] Review Tax Receipt Policy
- [ ] Review Acceptable Use Policy
- [ ] Verify Kenya DPA compliance
- [ ] Verify KRA tax receipt format
- [ ] Make recommended changes
- [ ] Get final approval

**Acceptance Criteria:**
- Attorney approval obtained
- All documents legally sound
- Kenya DPA compliant
- KRA format approved

---

### Task 6.3: ODPC Registration ⏳
**Priority: HIGH**

Register with Office of Data Protection Commissioner.

**Subtasks:**
- [ ] Prepare registration documents
- [ ] Appoint Data Protection Officer
- [ ] Submit registration to ODPC
- [ ] Pay registration fees
- [ ] Obtain registration certificate
- [ ] Display certificate number on site
- [ ] Set up data breach notification process

**Acceptance Criteria:**
- ODPC registration complete
- Certificate obtained
- DPO appointed
- Breach process documented

---

### Task 6.4: Documentation ⏳
**Priority: MEDIUM**

Create user and developer documentation.

**Subtasks:**
- [ ] User guide for privacy settings
- [ ] User guide for tax receipts
- [ ] Developer guide for compliance features
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Compliance checklist
- [ ] Incident response plan

**Files:**
- `docs/user-guides/privacy-settings.md`
- `docs/user-guides/tax-receipts.md`
- `docs/developer-guides/compliance-features.md`
- `docs/api/compliance-endpoints.md`

**Acceptance Criteria:**
- All guides complete
- Clear and comprehensive
- Examples included
- Easy to follow

---

### Task 6.5: Deployment & Monitoring ⏳
**Priority: HIGH**

Deploy compliance features and set up monitoring.

**Subtasks:**
- [ ] Deploy database migrations
- [ ] Deploy Edge Functions
- [ ] Deploy frontend updates
- [ ] Configure email templates
- [ ] Set up monitoring alerts
- [ ] Set up error tracking
- [ ] Set up compliance dashboards
- [ ] Test in production
- [ ] Create rollback plan

**Acceptance Criteria:**
- All features deployed
- Monitoring active
- Alerts configured
- Rollback plan ready
- Production tested

---

## Quick Wins (Can be done anytime)

### Quick Win 1: Email Templates ⏳
Create email templates for compliance notifications.

**Templates needed:**
- Terms acceptance confirmation
- Tax receipt delivery
- Annual tax summary
- Data export ready
- Account deletion confirmation
- Violation report received
- Violation resolved

**Files:**
- `src/templates/emails/*.html`

---

### Quick Win 2: Analytics Integration ⏳
Track compliance metrics in analytics.

**Events to track:**
- Terms accepted
- Cookie preferences saved
- Tax receipt downloaded
- Data export requested
- Account deleted
- Violation reported

**Files:**
- `src/utils/analytics.ts` (update)

---

### Quick Win 3: Help Documentation ⏳
Add help tooltips and info icons.

**Locations:**
- Cookie consent banner
- Privacy settings
- Tax receipt page
- Violation report form

**Files:**
- Various component files (update)

---

## Dependencies

**External:**
- Legal attorney review
- ODPC registration
- KRA consultation
- PDF generation library
- Email service configuration

**Internal:**
- User authentication system
- Donation system
- Profile system
- Admin dashboard

---

## Risk Mitigation

**High Risk Items:**
1. Legal document errors → Attorney review
2. Tax receipt non-compliance → KRA consultation
3. Data breach → Security audit
4. Performance issues → Load testing

**Mitigation Plans:**
- Professional legal review before launch
- Phased rollout with monitoring
- Regular security audits
- Performance optimization
- Comprehensive testing

---

## Success Metrics

**Compliance:**
- 100% terms acceptance rate
- 0 data breaches
- < 30 day data request response time
- 100% tax receipt generation success

**User Engagement:**
- Cookie consent rate by category
- Tax receipt download rate
- Privacy settings usage
- Violation reports submitted

**Performance:**
- Page load time < 3s
- PDF generation < 5s
- Email delivery < 24h
- Data export < 48h

---

## Notes

- Prioritize legal review and ODPC registration early
- Test tax receipt format with KRA before launch
- Ensure all features are mobile-responsive
- Maintain comprehensive audit logs
- Regular compliance reviews (quarterly)
