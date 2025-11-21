# Implementation Plan

- [x] 1. Create UnifiedFooter component with glassmorphism styling



  - Create `src/components/common/UnifiedFooter.tsx` with TypeScript interface
  - Implement glassmorphism background with gradient and backdrop blur
  - Add responsive container with proper padding and max-width
  - Define FooterLink, SocialLink, PilotForest, and Partner interfaces
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.2, 7.5_

- [ ] 2. Implement brand section with logo and mission statement
  - Add #GangGreen logo with circular green background
  - Display platform tagline and mission statement
  - Include "Built for Track 3" badge with heart icon
  - Apply proper typography and spacing
  - _Requirements: 1.3, 6.5_

- [ ] 3. Build navigation grid with platform, support, and legal links
  - Create three-column grid for desktop (four columns total with company info)
  - Implement Platform section with links to Initiatives, Trees, Marketplace, NFT Badges
  - Implement Support section with links to Help, Contact, FAQs, Privacy
  - Implement Legal section with all five legal page links
  - Add lucide-react icons to each link with hover effects
  - Make grid responsive (stack on mobile, grid on desktop)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

- [ ] 4. Add pilot forests information section
  - Create bordered section with "Pilot Forests" heading
  - Display three pilot forests in grid layout (Kakamega, Karura, Mau)
  - Include name and description for each forest
  - Make responsive (three columns desktop, single column mobile)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Implement social media links section
  - Create "Connect With Us" section with centered heading
  - Add social media icons for Twitter, Facebook, Instagram, LinkedIn
  - Apply glassmorphism styling to icon buttons
  - Implement hover effects with scale and color transitions
  - Add proper aria-labels for accessibility
  - Configure links to open in new tabs with security attributes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Build partnership and recognition section
  - Create bordered section for partnership information
  - Display partner names: Green Belt Movement, GSMA, Antugrow
  - Add external link icons where appropriate
  - Include Prof. Wangari Maathai tribute with TreePine icon
  - Display Wangari Maathai Hackathon 2025 Track 3 submission info
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Add contact, copyright, and tax notice sections
  - Display Loch Tech Solutions company name
  - Add email contact link (info@ganggreen.africa)
  - Show current year copyright dynamically
  - Include MIT License notice
  - Create tax deduction notice banner with green styling
  - Link tax notice to tax receipt policy page
  - _Requirements: 3.4, 3.5_

- [ ] 8. Update Layout component to use UnifiedFooter
  - Import UnifiedFooter in `src/components/layout/Layout.tsx`
  - Replace Footer component with UnifiedFooter
  - Maintain mobile visibility logic (hidden on mobile when bottom nav is present)
  - Test footer renders correctly on authenticated pages
  - _Requirements: 1.1, 7.1, 7.4_

- [ ] 9. Update HomePage to use UnifiedFooter
  - Import UnifiedFooter in `src/pages/HomePage.tsx`
  - Replace HomeFooter component with UnifiedFooter
  - Ensure footer renders at bottom of landing page
  - Test footer styling matches rest of home page design
  - _Requirements: 1.1, 7.1, 7.4_

- [ ] 10. Remove deprecated footer components
  - Delete `src/components/layout/Footer.tsx`
  - Delete `src/components/home/HomeFooter.tsx`
  - Update `src/components/home/index.ts` to remove HomeFooter export
  - Verify no other files import the old footer components
  - _Requirements: 7.1, 7.3_

- [ ]* 11. Add unit tests for UnifiedFooter component
  - Create `src/components/common/UnifiedFooter.test.tsx`
  - Test component renders without errors
  - Test all navigation links are present
  - Test social media links have correct attributes
  - Test responsive classes are applied
  - Test copyright year is current
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [ ]* 12. Perform visual and accessibility testing
  - Test desktop layout matches design specifications
  - Test mobile layout stacks correctly
  - Test tablet breakpoint behavior
  - Verify keyboard navigation through all links
  - Check color contrast meets WCAG AA standards
  - Verify screen reader compatibility
  - Test hover and focus states
  - _Requirements: 1.5, 5.5_
