# Manual Testing Checklist for Badges Route

## Prerequisites
- Development server should be running: `npm run dev`
- Have a test user account ready (or create one during testing)

## Test Cases

### 1. Direct Navigation to /badges

**Steps:**
1. Start the development server
2. Open browser to `http://localhost:5173/badges`
3. Check browser console for any warnings

**Expected Results:**
- ✅ No "No routes matched location" warning in console
- ✅ If not logged in: Redirects to login page
- ✅ If logged in: Displays badges page with badge progression

### 2. Authentication Flow

**Steps:**
1. Logout if currently logged in
2. Navigate to `http://localhost:5173/badges`
3. Complete login with valid credentials
4. Observe redirect behavior

**Expected Results:**
- ✅ Redirects to login page when not authenticated
- ✅ After successful login, redirects back to /badges
- ✅ Badges page displays correctly with user data

### 3. Navigation from Dashboard

**Steps:**
1. Login and navigate to dashboard (`/dashboard`)
2. Locate the "Badge Progress" card
3. Click the "View All" button
4. Verify navigation

**Expected Results:**
- ✅ Navigates to /badges page
- ✅ URL updates to show /badges
- ✅ Page displays badge progression
- ✅ Navigation header remains visible

### 4. Navigation from Badge Progress Card

**Steps:**
1. On dashboard, find the Badge Progress card
2. If there are more than 2 requirements, click "+X more requirements" link
3. Verify navigation

**Expected Results:**
- ✅ Navigates to /badges page
- ✅ All requirements are visible on badges page

### 5. Navigation from Profile Page

**Steps:**
1. Navigate to profile page (`/profile`)
2. Scroll to transactions section
3. If no transactions, click "Purchase a badge to earn your first GG Coins →" link
4. Verify navigation

**Expected Results:**
- ✅ Navigates to /badges page
- ✅ Page loads without errors

### 6. Layout Consistency

**Steps:**
1. Navigate to /badges
2. Check for navigation header
3. Navigate to another page (e.g., /dashboard)
4. Navigate back to /badges

**Expected Results:**
- ✅ Navigation header is present on badges page
- ✅ Navigation header is consistent across pages
- ✅ Can navigate to other pages from badges page

### 7. Browser Navigation

**Steps:**
1. Navigate to /dashboard
2. Navigate to /badges
3. Click browser back button
4. Click browser forward button

**Expected Results:**
- ✅ Back button returns to dashboard
- ✅ Forward button returns to badges
- ✅ URL updates correctly
- ✅ Pages render correctly

### 8. Badge Progression Display

**Steps:**
1. Navigate to /badges while logged in
2. Verify page content

**Expected Results:**
- ✅ "My Badges" heading is visible
- ✅ "Track your community engagement journey" subtitle is visible
- ✅ Badge progression view displays
- ✅ Current badge information shows
- ✅ Progress to next badge displays (if applicable)
- ✅ No console errors

### 9. Console Verification

**Steps:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to /badges
4. Check for warnings or errors

**Expected Results:**
- ✅ No "No routes matched location" warnings
- ✅ No routing-related errors
- ✅ Only expected service logs (if any)

### 10. Responsive Design

**Steps:**
1. Navigate to /badges
2. Resize browser window to mobile size
3. Test navigation on mobile view

**Expected Results:**
- ✅ Page is responsive
- ✅ Navigation works on mobile
- ✅ Content is readable and accessible

## Issues Found

Document any issues found during manual testing:

| Test Case | Issue Description | Severity | Status |
|-----------|------------------|----------|--------|
| | | | |

## Sign-off

- [ ] All test cases passed
- [ ] No console warnings related to routing
- [ ] Navigation works from all entry points
- [ ] Authentication flow works correctly
- [ ] Layout is consistent across pages

**Tested by:** _________________  
**Date:** _________________  
**Browser:** _________________  
**Notes:** _________________
