# #GangGreen Platform - User Guide

**Last Updated**: November 14, 2025  
**Version**: 1.4  
**Status**: Development Phase - Sprint 2

---

## Welcome to #GangGreen! 🌳

#GangGreen is your gateway to participating in forest conservation, earning rewards, and making a real impact on Africa's environment. This guide will help you get started and make the most of the platform.

---

## 🚧 Development Status

**Current Phase**: Sprint 2 - Authentication & Core Setup (50% Complete)

The #GangGreen platform is currently in **active development**. This user guide describes both implemented features and planned functionality.

### What's Available Now

**✅ Implemented Features**:
- User registration with email/password
- User login and authentication
- Password reset functionality
- Protected dashboard access
- Session persistence across page refreshes
- Role-based access control

**🚧 In Development**:
- Authentication testing (60% complete)
- Database deployment to Supabase
- Profile management features

**📋 Coming Soon**:
- **Conversational Profile Setup**: Complete your profile through a friendly chatbot after registration
- Tree planting initiatives
- Carbon credit marketplace
- Web3 wallet integration
- NFT badges and gamification
- AI-powered tree monitoring

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your Account](#creating-your-account)
3. [Completing Your Profile (NEW)](#completing-your-profile-new)
4. [User Roles](#user-roles)
5. [Account Management](#account-management)
6. [Tree Planting Initiatives](#tree-planting-initiatives)
7. [Carbon Credit Marketplace](#carbon-credit-marketplace)
8. [Web3 Wallet & Crypto Donations](#web3-wallet--crypto-donations)
9. [NFT Badges](#nft-badges)
10. [Gamification & Rewards](#gamification--rewards)
11. [Onboarding Chatbot](#onboarding-chatbot)
12. [FAQ](#faq)
13. [Support](#support)

---

## Getting Started

### Platform Access

**Development Preview**: `http://localhost:5173` (for developers)  
**Production URL**: Coming soon (Week 15)

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet**: Stable connection required
- **JavaScript**: Must be enabled
- **Cookies**: Must be enabled for authentication

---

## Creating Your Account

**Status**: ✅ Implemented

### Quick Registration (Recommended)

We've made registration super simple! Just provide your email and password, and our friendly chatbot will help you complete your profile afterward.

**Steps**:
1. Visit the #GangGreen platform
2. Click **"Sign Up"** in the top right corner
3. Enter your **email address**
4. Create a **password** (minimum 8 characters)
5. Click **"Create Account"**
6. Check your email for verification (if required)
7. **The chatbot will automatically open** to help you complete your profile!

**Why This Approach?**
- ✅ Faster registration (just email & password)
- ✅ Conversational profile completion
- ✅ Skip optional fields naturally
- ✅ Friendly, guided experience
- ✅ Higher completion rates

### Traditional Registration (Alternative)

If you prefer to fill out all information upfront:

1. Visit the registration page
2. Fill in all fields:
   - Email address
   - Password (minimum 8 characters)
   - Full name
   - Account type (Individual, Community, Organization)
   - Forest preference (Kakamega, Karura, Mau)
   - Phone number (optional)
   - Location (optional)
   - Organization name (if applicable)
3. Click "Create Account"
4. Verify your email

---

## Completing Your Profile (NEW)

**Status**: 📋 Planned for Sprint 6

### Conversational Profile Setup

After you register with just your email and password, our friendly chatbot will guide you through completing your profile. It's like having a conversation!

**What to Expect**:

1. **Chatbot Opens Automatically**
   - Right after registration, the chatbot appears
   - Friendly greeting: "Hi there! Let's set up your profile..."

2. **One Question at a Time**
   - The chatbot asks questions conversationally
   - You answer naturally, like chatting with a friend
   - No overwhelming forms!

3. **Questions You'll Be Asked**:
   - "What's your full name?"
   - "What type of account would you like? (Individual, Community, or Organization)"
   - "Which forest interests you most? (Kakamega, Karura, or Mau)"
   - "What's your phone number?" (optional - you can skip)
   - "Where are you located?" (optional)
   - "What's your organization name?" (if you chose Organization)

4. **Validation & Help**
   - If you enter something invalid, the chatbot politely asks again
   - You can skip optional questions by saying "skip" or clicking "Skip"
   - The chatbot remembers your answers

5. **Profile Saved**
   - Once you've answered all required questions, your profile is saved
   - Welcome message: "Great! Your profile is all set up!"
   - The chatbot transitions to general help mode

6. **Complete Later Option**
   - Not ready to complete your profile? No problem!
   - You can skip the process and complete it later from Settings
   - The chatbot will remind you next time you log in

### Example Conversation

```
Chatbot: Hi there! Welcome to #GangGreen! 🌳 
         Let's set up your profile. This will only take a minute.
         
Chatbot: First, what's your full name?

You: John Doe

Chatbot: Nice to meet you, John! 
         What type of account would you like?
         - Individual (for personal participation)
         - Community Member (for local conservation)
         - Organization (for NGOs and companies)

You: Individual

Chatbot: Perfect! Which forest interests you most?
         - Kakamega Forest (primary pilot site)
         - Karura Forest (urban conservation)
         - Mau Forest (water tower ecosystem)

You: Kakamega

Chatbot: Great choice! Kakamega is amazing.
         What's your phone number? (You can skip this if you prefer)

You: skip

Chatbot: No problem! Where are you located? (Also optional)

You: Nairobi, Kenya

Chatbot: Awesome! Your profile is all set up, John! 🎉
         You're now ready to explore initiatives, plant trees, and make an impact.
         
         What would you like to do next?
         [Find Projects] [Learn More] [Explore Dashboard]
```

### Benefits of Conversational Setup

- ✅ **Less Intimidating**: One question at a time feels easier
- ✅ **Natural**: Like chatting with a friend
- ✅ **Flexible**: Skip optional fields without guilt
- ✅ **Engaging**: Immediate interaction with the platform
- ✅ **Higher Completion**: Studies show 80%+ completion vs ~50% for forms

### Completing Profile Later

If you skip the chatbot setup:

1. Go to **Settings** → **Profile**
2. Click **"Complete Profile"**
3. The chatbot will reopen and guide you through the remaining questions
4. Or fill out the traditional form if you prefer

---

## User Roles

**Status**: ✅ Implemented

### Individual

Perfect for anyone who wants to support conservation efforts.

**What you can do**:
- Join tree planting initiatives
- Purchase carbon credits
- Make crypto donations
- Earn NFT badges and points
- Track your environmental impact

### Community Member

Ideal for local community members actively participating in forest conservation.

**What you can do**:
- Everything an Individual can do
- Register trees you've planted
- Upload tree monitoring photos
- Participate in community challenges
- Access forest-specific features

### Organization

For NGOs, companies, and groups managing conservation initiatives.

**What you can do**:
- Everything Community Members can do
- Create and manage initiatives
- Generate carbon credits
- Receive crypto donations
- Access advanced analytics
- Manage team members

### Administrator

Platform administrators with full access to manage and moderate the platform.

---

## Account Management

**Status**: ✅ Implemented (Login/Logout), 📋 Planned (Profile Editing)

### Logging In

1. Click **"Login"** in the top right corner
2. Enter your **email** and **password**
3. Click **"Sign In"**
4. You'll be redirected to your dashboard

### Logging Out

1. Click your profile picture or name in the top right
2. Select **"Logout"**
3. You'll be signed out and redirected to the login page

### Forgot Password?

1. Click **"Forgot Password"** on the login page
2. Enter your email address
3. Click **"Send Reset Link"**
4. Check your email for the reset link
5. Click the link and enter your new password
6. Your password is updated!

### Editing Your Profile (Coming Soon)

**Status**: 📋 Planned for Sprint 2

Once implemented:
1. Go to **Profile Settings**
2. Update your information:
   - Full name
   - Bio
   - Location
   - Forest preference
   - Profile picture
3. Click **"Save Changes"**

### Changing Your Password (Coming Soon)

1. Go to **Profile Settings**
2. Click **"Security"** tab
3. Enter your current password
4. Enter your new password
5. Confirm new password
6. Click **"Update Password"**

---

## Tree Planting Initiatives

**Status**: 📋 Planned for Sprint 2 (Weeks 3-5)

### Browsing Initiatives (Coming Soon)

Once implemented:
1. Click **"Initiatives"** in the main navigation
2. Use filters to find initiatives:
   - **Forest**: Kakamega, Karura, or Mau
   - **Status**: Active, Planning, Completed
   - **Sort by**: Newest, Most Popular, Ending Soon

### Joining an Initiative (Coming Soon)

1. Open the initiative details page
2. Click **"Join Initiative"**
3. Confirm your participation
4. You'll receive notifications about updates and milestones

### Creating an Initiative (Organizations Only)

**Status**: 📋 Planned for Sprint 2

1. Click **"Create Initiative"** from the Initiatives page
2. Fill in the details:
   - **Title**: Clear, descriptive name
   - **Description**: Goals, methods, and expected impact
   - **Forest**: Select Kakamega, Karura, or Mau
   - **Target Trees**: Number of trees to plant
   - **Target Area**: Hectares to cover
   - **Location**: Pin on map or enter coordinates
   - **Timeline**: Start and end dates
3. Upload supporting documents (optional)
4. Click **"Create Initiative"**
5. Your initiative will be reviewed and published

---

## Carbon Credit Marketplace

**Status**: 📋 Planned for Sprint 3 (Weeks 6-7)

### Understanding Carbon Credits

Carbon credits represent the amount of CO₂ sequestered by trees. One credit = one tonne of CO₂ removed from the atmosphere.

**Verification Process**:
- Credits are generated from verified initiatives
- Third-party verification ensures accuracy
- Blockchain tracking for transparency

### Purchasing Carbon Credits (Coming Soon)

1. Click **"Marketplace"** in the main navigation
2. View available carbon credits
3. Filter by:
   - Forest location
   - Price range
   - Verification status
   - Vintage year
4. Click on a credit listing
5. Review details
6. Enter quantity to purchase
7. Select payment method (Card or Crypto)
8. Complete payment
9. Receive digital certificate

---

## Web3 Wallet & Crypto Donations

**Status**: 📋 Planned for Sprint 4 (Weeks 8-10)

### Connecting Your Wallet (Coming Soon)

1. Click **"Connect Wallet"** in the top right
2. Select your wallet provider:
   - MetaMask
   - WalletConnect
   - Coinbase Wallet
3. Approve the connection in your wallet
4. Your wallet address will be displayed

**Supported Networks**:
- Ethereum Mainnet
- Polygon (recommended for lower fees)

### Making a Crypto Donation (Coming Soon)

1. Navigate to an initiative or the donation page
2. Click **"Donate Crypto"**
3. Select cryptocurrency:
   - ETH (Ethereum)
   - MATIC (Polygon)
   - USDC (Stablecoin)
4. Enter donation amount
5. Review USD equivalent and gas fees
6. Click **"Donate"**
7. Confirm transaction in your wallet
8. Wait for blockchain confirmation

---

## NFT Badges

**Status**: 📋 Planned for Sprint 4 (Weeks 8-10)

### What are NFT Badges?

NFT badges are unique digital collectibles that recognize your conservation achievements. They're stored on the blockchain and truly owned by you.

**Badge Tiers**:
- 🥉 **Bronze**: Entry-level achievements
- 🥈 **Silver**: Significant contributions
- 🥇 **Gold**: Major milestones
- 💎 **Platinum**: Exceptional impact

### Earning Badges (Coming Soon)

Badges are earned by:
- Planting trees
- Making donations
- Completing challenges
- Reaching milestones
- Referring friends
- Consistent participation

### Minting Your Badge (Coming Soon)

1. When you earn a badge, you'll receive a notification
2. Click **"Mint Badge"** in the notification
3. Connect your Web3 wallet (if not connected)
4. Review badge details and rarity
5. Click **"Mint NFT"**
6. Approve transaction in your wallet
7. Wait for minting confirmation
8. Badge appears in your gallery!

---

## Gamification & Rewards

**Status**: 📋 Planned for Sprint 5 (Weeks 11-12)

### Points System (Coming Soon)

Earn points for every action:

| Action | Points |
|--------|--------|
| Register account | 100 |
| Complete profile | 50 |
| Plant a tree | 10 |
| Upload tree photo | 5 |
| Join initiative | 20 |
| Make donation | 1 point per $1 |
| Refer a friend | 50 |
| Daily login | 5 |
| Complete quest | 50-500 |

### Leaderboards (Coming Soon)

Compete with others and climb the ranks:

1. **Global Leaderboard**: All users worldwide
2. **Forest Leaderboards**: Kakamega, Karura, Mau
3. **Time Periods**: Daily, Weekly, Monthly, All-Time

### Achievements (Coming Soon)

Unlock achievements by completing specific tasks:

**Categories**:
- 🌱 **Getting Started**: Complete onboarding tasks
- 🌳 **Tree Planter**: Plant trees and monitor growth
- 💰 **Supporter**: Make donations and purchases
- 🤝 **Community**: Engage with others
- 🏆 **Master**: Complete advanced challenges

---

## Onboarding Chatbot

**Status**: 📋 Planned for Sprint 6 (Week 13+)

### What is the Chatbot?

The #GangGreen Onboarding Chatbot is your AI-powered assistant that:
- **Guides you through profile completion** after registration (NEW!)
- Answers 27 frequently asked questions
- Provides context-aware responses
- Connects you to human support when needed
- Available 24/7

### Using the Chatbot

**For Profile Completion**:
- The chatbot opens automatically after you register
- Answer questions conversationally
- Skip optional fields if you want
- Complete your profile in under 2 minutes

**For General Help**:
1. Click the green chat bubble in the bottom-right corner
2. Type your question or select a quick action
3. Get instant answers
4. Ask follow-up questions - the chatbot remembers context
5. Request human support if needed

### What the Chatbot Can Help With

**Getting Started**:
- "What is Gang Green and how can I get involved?"
- "How do I sign up as an individual?"
- "What are the sponsorship opportunities?"

**Finding Projects**:
- "How do I find active climate action projects?"
- "How do I join a project?"
- "Can I see completed projects?"

**Education & Gamification**:
- "What educational tools are available?"
- "How does the gamification system work?"

**Community Building**:
- "How do I join or create a local group?"
- "Can schools participate?"

**Impact Verification**:
- "How is project impact verified?"
- "How do I get updates on project progress?"

**Support & Troubleshooting**:
- "I'm having trouble logging in"
- "My badges are missing"
- "How do I report a bug?"

### Quick Actions

The chatbot provides quick action buttons:
- **Getting Started**: Learn about the platform
- **Find Projects**: Browse active initiatives
- **How to Join**: Step-by-step participation guide
- **Contact Support**: Connect with human support

### When to Escalate

The chatbot will connect you to human support when:
- Your question is too complex or specific
- The chatbot's confidence is below 70%
- You explicitly request human assistance
- Two attempts haven't resolved your issue

### Tips for Best Results

1. **Be Specific**: "How do I register a tree?" vs "How does this work?"
2. **Use Keywords**: Include terms like "sign up", "donate", "project"
3. **Ask Follow-ups**: The chatbot remembers context
4. **Try Rephrasing**: If you don't get a good answer, rephrase
5. **Use Quick Actions**: Click suggested buttons for common tasks

---

## FAQ

### General Questions

**Q: Is #GangGreen free to use?**
A: Yes! Creating an account and participating in initiatives is completely free.

**Q: Which forests can I support?**
A: Currently, we focus on three Kenyan forests: Kakamega, Karura, and Mau.

**Q: How are trees verified?**
A: Trees are monitored using AI-powered analysis through Antugrow API and verified by local organizations.

### Registration & Profile

**Q: Why do I only need email and password to register?**
A: We want to make registration as quick as possible! Our chatbot will help you complete your profile afterward in a friendly, conversational way.

**Q: Can I skip the profile completion chatbot?**
A: Yes! You can skip it and complete your profile later from Settings. But we recommend doing it right away - it only takes 2 minutes!

**Q: What if I make a mistake during profile setup?**
A: No worries! You can edit your profile anytime from Settings.

### Technical Issues

**Q: I can't upload photos. What should I do?**
A: Ensure images are under 10MB and in JPG/PNG format. Try a different browser if issues persist.

**Q: My wallet won't connect. Help!**
A: Make sure you're on a supported network (Ethereum or Polygon) and your wallet is unlocked.

**Q: How do I delete my account?**
A: Contact support at support@ganggreen.org to request account deletion.

---

## Support

### Getting Help

**AI Chatbot**: Available 24/7 in bottom-right corner (coming Sprint 6)

**Email Support**: support@ganggreen.org  
**Response Time**: Within 24 hours

**Live Chat**: Available Mon-Fri, 9 AM - 5 PM EAT (coming soon)

**Community Forum**: Connect with other users and share tips (coming soon)

### Reporting Issues

1. Click **"Help"** in the footer
2. Select **"Report Issue"**
3. Describe the problem
4. Attach screenshots if helpful
5. Submit report

### Feature Requests

We love hearing your ideas!
1. Go to **"Feedback"** in settings
2. Describe your feature idea
3. Explain how it would help
4. Submit suggestion

### Social Media

Stay connected:
- Twitter: @GangGreenAfrica
- Facebook: /GangGreenPlatform
- Instagram: @ganggreen_africa
- LinkedIn: /company/ganggreen

---

## Quick Start Checklist

- [ ] Create account with email and password
- [ ] Complete profile via chatbot (or skip for later)
- [ ] Explore your dashboard
- [ ] Browse available initiatives
- [ ] Join your first initiative
- [ ] Connect Web3 wallet (optional)
- [ ] Make your first donation (optional)
- [ ] Earn your first badge
- [ ] Refer a friend
- [ ] Complete a daily quest

---

## Tips for Success

### Maximize Your Impact

1. **Set Goals**: Decide how many trees you want to plant or carbon to offset
2. **Stay Consistent**: Login daily to maintain streaks
3. **Engage**: Join initiatives and participate in challenges
4. **Share**: Invite friends to multiply your impact
5. **Monitor**: Upload regular photos of your trees

### Get the Most from the Chatbot

1. **Use It for Profile Setup**: It's faster and more fun than forms!
2. **Ask Questions**: Don't hesitate - the chatbot is here to help
3. **Be Conversational**: Talk naturally, like chatting with a friend
4. **Skip When Needed**: Optional fields can be skipped without guilt
5. **Complete Later**: You can always finish your profile from Settings

---

**Welcome to the #GangGreen community! Together, we're growing a carbon-negative Africa, one tree at a time.** 🌍🌳

*Last Updated: November 14, 2025*

