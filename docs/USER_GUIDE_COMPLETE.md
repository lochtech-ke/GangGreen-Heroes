# #GangGreen Platform - User Guide

**Version**: 1.4  
**Last Updated**: November 13, 2025  
**Platform Status**: In Development - Sprint 2

---

## Welcome to #GangGreen! 🌳

#GangGreen is your gateway to participating in forest conservation, earning rewards, and making a real impact on Africa's environment. This guide will help you get started and make the most of the platform.

---

## 🚧 Development Status

**Current Phase**: Sprint 2 - Authentication & Core Setup  
**Completion**: 18% overall (5.6 of 31 tasks)  
**Last Updated**: November 13, 2025

### What's Available Now

**✅ Implemented Features**:
- User registration and authentication
- Login and logout functionality
- Password reset flow
- Protected routes and role-based access
- User profile management
- Session persistence
- Real-time auth state updates

**🚧 In Development**:
- Authentication test suite (60% complete)
- Database deployment to Supabase
- Storage bucket configuration

**📋 Coming Soon**:
- Tree planting initiatives (Sprint 3)
- Tree registry and monitoring (Sprint 3)
- Carbon credit marketplace (Sprint 4)
- Web3 wallet integration (Sprint 5)
- NFT badges and gamification (Sprint 6)

### Implementation Timeline

| Milestone | Status | Timeline | Features |
|-----------|--------|----------|----------|
| **Foundation** | ✅ 100% | Weeks 1-2 | Project setup, Database, Auth system |
| **Core Features** | 📋 Planned | Weeks 3-5 | Initiatives, Trees, AI Monitoring |
| **Marketplace** | 📋 Planned | Weeks 6-7 | Carbon Credits, Impact Dashboard |
| **Web3** | 📋 Planned | Weeks 8-10 | Wallets, Crypto Donations, NFTs |
| **Gamification** | 📋 Planned | Weeks 11-12 | Points, Quests, Referrals |
| **Launch** | 📋 Planned | Weeks 13-15 | Testing, Security, Deployment |

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your Account](#creating-your-account)
3. [User Roles](#user-roles)
4. [Account Management](#account-management)
5. [Dashboard Overview](#dashboard-overview)
6. [Security & Privacy](#security--privacy)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)
9. [Support](#support)

---

## Getting Started

### Accessing the Platform

**Development Environment**:
- URL: `http://localhost:5173` (for developers)
- Browser: Chrome, Firefox, Safari, or Edge (latest versions)
- Internet connection required

**Production Environment** (Coming Soon):
- URL: TBD (will be announced)
- Mobile-responsive design
- Works on all modern browsers

### System Requirements

**Minimum**:
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection (broadband recommended)
- JavaScript enabled
- Cookies enabled

**Recommended**:
- Desktop or laptop for best experience
- Mobile devices supported (responsive design)
- Stable internet connection

---

## Creating Your Account

### Registration Process

1. **Navigate to Registration Page**
   - Click "Sign Up" or "Register" button
   - Or visit `/register` directly

2. **Fill in Your Information**

   **Required Fields**:
   - **Full Name**: Your complete name
   - **Email Address**: Valid email for account verification
   - **Password**: Minimum 8 characters
   - **Confirm Password**: Must match password
   - **Account Type**: Select your role (see User Roles below)

   **Optional Fields**:
   - **Phone Number**: Contact number (format: +254 700 000000)
   - **Location**: Your city or region
   - **Forest Preference**: Choose Kakamega, Karura, or Mau
   - **Organization Name**: Required if selecting "Organization" role

3. **Submit Registration**
   - Click "Create Account" button
   - Wait for account creation (usually < 2 seconds)
   - You'll be automatically logged in

4. **Welcome to #GangGreen!**
   - You'll be redirected to your dashboard
   - Complete your profile for better experience

### Registration Tips

✅ **Do**:
- Use a valid email address you can access
- Choose a strong password (mix of letters, numbers, symbols)
- Select the role that best describes you
- Provide accurate information

❌ **Don't**:
- Use someone else's email
- Share your password
- Create multiple accounts
- Provide false information

### Email Verification

**Current Status**: Not yet implemented  
**Coming Soon**: Email verification will be required for account activation

---

## User Roles

The platform supports four user roles, each with different capabilities:

### 1. Individual 👤

**Best for**: Anyone who wants to support conservation through donations and participation

**What you can do** (when implemented):
- Join tree planting initiatives
- Purchase carbon credits
- Make crypto donations
- Earn NFT badges and points
- Track your environmental impact
- View forest information
- Participate in challenges

**Access Level**: Basic

### 2. Community Member 🤝

**Best for**: Local community members actively participating in forest conservation

**What you can do**:
- Everything an Individual can do, plus:
- Register trees you've planted
- Upload tree monitoring photos
- Participate in community challenges
- Access forest-specific features
- Contribute to local initiatives

**Access Level**: Standard

### 3. Organization 🏢

**Best for**: NGOs, companies, and groups managing conservation initiatives

**What you can do**:
- Everything Community Members can do, plus:
- Create and manage initiatives
- Generate carbon credits
- Receive crypto donations
- Access advanced analytics
- Manage team members
- Create custom reports

**Access Level**: Advanced

**Requirements**:
- Organization name required during registration
- May require verification (future feature)

### 4. Administrator 👑

**Best for**: Platform administrators

**What you can do**:
- Full platform access
- User management
- Content moderation
- System configuration
- Analytics and reporting

**Access Level**: Full

**Note**: Admin accounts are created by existing administrators only

---

## Account Management

### Logging In

1. **Navigate to Login Page**
   - Click "Login" or "Sign In" button
   - Or visit `/login` directly

2. **Enter Credentials**
   - Email address
   - Password

3. **Sign In**
   - Click "Sign In" button
   - Wait for authentication
   - Redirected to dashboard

### Forgot Password?

1. **Request Password Reset**
   - Click "Forgot password?" on login page
   - Enter your email address
   - Click "Send Reset Link"

2. **Check Your Email**
   - Look for password reset email
   - Click the reset link
   - Link expires in 1 hour

3. **Set New Password**
   - Enter new password (minimum 8 characters)
   - Confirm new password
   - Click "Update Password"

4. **Login with New Password**
   - Return to login page
   - Use your new password

### Logging Out

**Method 1**: Dashboard
- Click your profile picture or name
- Select "Logout" from dropdown

**Method 2**: Direct
- Click "Logout" button (if visible)

**What Happens**:
- Session is terminated
- You're redirected to login page
- Local data is cleared

---

## Dashboard Overview

### Your Dashboard

After logging in, you'll see your personal dashboard with:

**Profile Section**:
- Your name and email
- Account role
- Forest preference
- Organization (if applicable)
- Location (if provided)

**Forest Information**:
- Kakamega Forest card
- Karura Forest card
- Mau Forest card

**Quick Stats** (Coming Soon):
- Trees planted
- Carbon offset
- Points earned
- Badges collected

**Activity Feed** (Coming Soon):
- Recent actions
- Milestone achievements
- Community updates

### Navigation

**Main Menu**:
- Dashboard (home)
- Initiatives (coming soon)
- Trees (coming soon)
- Marketplace (coming soon)
- Profile
- Settings

**User Menu** (top right):
- Profile
- Settings
- Logout

---

## Security & Privacy

### Password Security

**Requirements**:
- Minimum 8 characters
- Mix of letters and numbers recommended
- Special characters recommended
- No common passwords

**Best Practices**:
- Use unique password for this platform
- Don't share your password
- Change password regularly
- Use password manager

### Session Security

**Features**:
- Automatic session timeout (configurable)
- Secure token storage
- HTTPS encryption (production)
- Session invalidation on logout

**Tips**:
- Always logout on shared computers
- Don't save password on public devices
- Clear browser data after use

### Data Privacy

**What We Collect**:
- Account information (name, email, role)
- Profile information (optional fields)
- Activity data (trees planted, donations)
- Usage analytics (anonymous)

**What We Don't Collect**:
- Credit card information (handled by payment processor)
- Sensitive personal data
- Browsing history outside platform

**Your Rights**:
- View your data
- Update your information
- Delete your account
- Export your data (coming soon)

### Row Level Security

**Database Protection**:
- You can only access your own data
- Role-based access control
- Automatic enforcement
- No manual configuration needed

**What This Means**:
- Your profile is private
- Your transactions are secure
- Your data is protected
- Other users can't see your private information

---

## Troubleshooting

### Common Issues

#### Can't Login

**Symptoms**: Login fails with error message

**Solutions**:
1. Check email and password are correct
2. Ensure Caps Lock is off
3. Try password reset if forgotten
4. Clear browser cache and cookies
5. Try different browser
6. Contact support if issue persists

#### Registration Fails

**Symptoms**: Can't create account

**Solutions**:
1. Check all required fields are filled
2. Ensure password is at least 8 characters
3. Verify passwords match
4. Use different email if "already exists" error
5. Check internet connection
6. Try again in a few minutes

#### Page Won't Load

**Symptoms**: Blank page or loading spinner

**Solutions**:
1. Check internet connection
2. Refresh page (F5 or Ctrl+R)
3. Clear browser cache
4. Try different browser
5. Check if platform is under maintenance
6. Contact support

#### Logged Out Unexpectedly

**Symptoms**: Redirected to login page

**Possible Causes**:
- Session expired (timeout)
- Logged in on another device
- Browser cleared cookies
- Security logout triggered

**Solutions**:
1. Login again
2. Check "Remember me" option (if available)
3. Adjust session timeout in settings
4. Ensure cookies are enabled

### Error Messages

**"Invalid credentials"**:
- Email or password is incorrect
- Try password reset

**"Email already exists"**:
- Account already registered with this email
- Try logging in instead
- Use password reset if forgotten

**"Please fill in all required fields"**:
- Complete all fields marked with *
- Check for validation errors

**"Passwords do not match"**:
- Ensure password and confirm password are identical
- Check for typos

**"Network error"**:
- Check internet connection
- Try again in a moment
- Contact support if persists

### Browser Compatibility

**Supported Browsers**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Not Supported**:
- ❌ Internet Explorer
- ❌ Very old browser versions

**Recommendation**: Use latest browser version for best experience

---

## FAQ

### General Questions

**Q: Is #GangGreen free to use?**  
A: Yes! Creating an account and participating in initiatives is completely free. Some features like purchasing carbon credits will have costs.

**Q: Which forests can I support?**  
A: Currently, we focus on three Kenyan forests: Kakamega, Karura, and Mau.

**Q: Do I need to choose a forest preference?**  
A: No, it's optional. You can participate in initiatives across all forests.

**Q: Can I change my role after registration?**  
A: Not currently. Contact support if you need to change your role.

**Q: Can I have multiple accounts?**  
A: No, one account per person/organization. Multiple accounts may be suspended.

### Account Questions

**Q: How do I delete my account?**  
A: Contact support at support@ganggreen.org to request account deletion.

**Q: Can I change my email address?**  
A: Not currently. This feature is coming soon.

**Q: What if I forget my password?**  
A: Use the "Forgot password?" link on the login page to reset it.

**Q: How long does my session last?**  
A: Sessions last until you logout or after a period of inactivity (configurable).

**Q: Is my data secure?**  
A: Yes, we use industry-standard security including encryption, secure authentication, and Row Level Security.

### Technical Questions

**Q: What browsers are supported?**  
A: Chrome, Firefox, Safari, and Edge (latest versions). Internet Explorer is not supported.

**Q: Does the platform work on mobile?**  
A: Yes, the platform is fully responsive and works on mobile devices.

**Q: Do I need to install anything?**  
A: No, it's a web application. Just use your browser.

**Q: Can I use the platform offline?**  
A: Not currently. Internet connection is required. Offline mode is planned for future.

**Q: What if I encounter a bug?**  
A: Report it to support@ganggreen.org with details about what happened.

### Future Features

**Q: When will tree planting features be available?**  
A: Sprint 3 (Weeks 3-5) - estimated 2-3 weeks from now.

**Q: When can I purchase carbon credits?**  
A: Sprint 4 (Weeks 6-7) - estimated 4-5 weeks from now.

**Q: When will Web3 features launch?**  
A: Sprint 5 (Weeks 8-10) - estimated 6-8 weeks from now.

**Q: When will gamification be available?**  
A: Sprint 6 (Weeks 11-12) - estimated 9-10 weeks from now.

**Q: When is the public launch?**  
A: Sprint 7 (Weeks 13-15) - estimated 11-13 weeks from now.

---

## Support

### Getting Help

**Email Support**:
- Address: support@ganggreen.org
- Response Time: Within 24 hours
- Available: Monday-Friday, 9 AM - 5 PM EAT

**Documentation**:
- User Guide: This document
- Technical Guide: For developers
- FAQ: Common questions answered

**Community** (Coming Soon):
- Community forum
- User discussions
- Tips and tricks

### Reporting Issues

**Bug Reports**:
1. Email support@ganggreen.org
2. Include:
   - What you were trying to do
   - What happened instead
   - Error messages (if any)
   - Browser and device information
   - Screenshots (if helpful)

**Feature Requests**:
1. Email support@ganggreen.org
2. Describe:
   - What feature you'd like
   - Why it would be useful
   - How it should work

### Social Media

**Stay Connected** (Coming Soon):
- Twitter: @GangGreenAfrica
- Facebook: /GangGreenPlatform
- Instagram: @ganggreen_africa
- LinkedIn: /company/ganggreen

---

## Quick Start Checklist

Ready to get started? Follow these steps:

- [ ] Create your account
- [ ] Verify your email (when available)
- [ ] Complete your profile
- [ ] Choose your forest preference
- [ ] Explore the dashboard
- [ ] Read about the three pilot forests
- [ ] Wait for tree planting features (coming soon!)
- [ ] Join your first initiative (coming soon!)
- [ ] Plant or register your first tree (coming soon!)

---

## Tips for Success

### Getting the Most from #GangGreen

1. **Complete Your Profile**
   - Add all optional information
   - Upload a profile picture (coming soon)
   - Set your forest preference

2. **Stay Informed**
   - Check dashboard regularly
   - Read notifications (coming soon)
   - Follow social media (coming soon)

3. **Engage with Community**
   - Join initiatives (coming soon)
   - Participate in challenges (coming soon)
   - Share your impact (coming soon)

4. **Track Your Impact**
   - Monitor trees planted (coming soon)
   - View carbon offset (coming soon)
   - Celebrate milestones (coming soon)

5. **Invite Friends**
   - Share the platform
   - Build your network
   - Multiply your impact

---

## Glossary

**Carbon Credit**: Certificate representing 1 tonne of CO₂ removed from atmosphere

**Initiative**: Organized tree planting project in a specific forest

**NFT Badge**: Blockchain-based digital collectible recognizing achievements

**RLS**: Row Level Security - database security ensuring data privacy

**Supabase**: Backend platform powering the application

**Web3**: Decentralized internet technologies including blockchain and crypto

**Antugrow**: AI-powered tree monitoring and analysis service

---

## About #GangGreen

### Mission

Catalyzing a carbon-negative Africa through technology-enabled forest conservation, community engagement, and transparent impact tracking.

### Pilot Forests

**Kakamega Forest**:
- Primary pilot site
- Tropical rainforest
- Rich biodiversity
- Community-based conservation

**Karura Forest**:
- Urban conservation area
- Located in Nairobi
- Recreation and education
- Community involvement

**Mau Forest**:
- Critical water tower ecosystem
- Largest indigenous forest in East Africa
- Water source for millions
- Restoration focus

### Technology

Built with modern web technologies:
- React + TypeScript for frontend
- Supabase for backend
- PostgreSQL database
- AI-powered tree monitoring
- Blockchain integration (coming soon)

### Hackathon

Built for **Wangari Maathai Hackathon**:
- Track 3: Community Engagement and Sustainability
- Technology for Forest Conservation
- Innovation in environmental action

---

**Welcome to the #GangGreen community! Together, we're growing a carbon-negative Africa, one tree at a time.** 🌍🌳

---

**Document Version**: 1.4  
**Last Updated**: November 13, 2025  
**Platform Status**: Sprint 2 - 50% Complete  
**Next Update**: Upon completion of Sprint 2 or major feature addition
