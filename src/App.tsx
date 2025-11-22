import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { JourneyProvider } from './contexts/JourneyContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import InitiativesPage from './pages/InitiativesPage';
import { InitiativeDetailsPage } from './pages/InitiativeDetailsPage';
import { CreateInitiativePage } from './pages/CreateInitiativePage';
import { TreesPage } from './pages/TreesPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { GamificationPage } from './pages/GamificationPage';
import { SettingsPage } from './pages/SettingsPage';
import { SocialFeedPage } from './pages/SocialFeedPage';
import { JourneyDashboardPage } from './pages/JourneyDashboardPage';
import { GovernancePage } from './pages/GovernancePage';
import { ProposalDetailPage } from './pages/ProposalDetailPage';
import { PetitionDetailPage } from './pages/PetitionDetailPage';
import {
  TermsOfServicePage,
  PrivacyPolicyPage,
  CookiePolicyPage,
  TaxReceiptPolicyPage,
  AcceptableUsePolicyPage,
} from './pages/legal';
import { LegalPage } from './pages/legal/LegalPage';
import { ProtectedRoute } from './components/auth';
import { ChatWidget } from './components/chatbot';
import { Layout } from './components/layout';
import { SupabaseTest } from './components/auth/SupabaseTest';
import StickmanPreloader from './components/common/StickmanPreloader';

// Feature flag for chatbot (can be moved to environment variable)
const CHATBOT_ENABLED = true;

function ChatbotWrapper() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuthContext();
  const location = useLocation();

  // Don't show chatbot on register page (it has its own onboarding chatbot)
  if (location.pathname === '/register') {
    return null;
  }

  // Don't show if feature is disabled
  if (!CHATBOT_ENABLED) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {/* Pulse animation for first-time users */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        userId={user?.id}
        userEmail={user?.email}
        position="bottom-right"
        hasCompletedProfile={!!user?.profile?.full_name}
      />
    </>
  );
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/test-supabase" element={<SupabaseTest />} />
        
        {/* Social Feed */}
        <Route
          path="/social-feed"
          element={
            <Layout>
              <SocialFeedPage />
            </Layout>
          }
        />
        
        {/* Legal Pages - Dynamic route using Strapi CMS */}
        <Route
          path="/legal/:slug"
          element={
            <Layout>
              <LegalPage />
            </Layout>
          }
        />
        
        {/* Legacy Legal Pages - Keep for backwards compatibility */}
        <Route
          path="/legal/terms"
          element={
            <Layout>
              <TermsOfServicePage />
            </Layout>
          }
        />
        <Route
          path="/legal/privacy"
          element={
            <Layout>
              <PrivacyPolicyPage />
            </Layout>
          }
        />
        <Route
          path="/legal/cookies"
          element={
            <Layout>
              <CookiePolicyPage />
            </Layout>
          }
        />
        <Route
          path="/legal/tax-receipts"
          element={
            <Layout>
              <TaxReceiptPolicyPage />
            </Layout>
          }
        />
        <Route
          path="/legal/acceptable-use"
          element={
            <Layout>
              <AcceptableUsePolicyPage />
            </Layout>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/journey"
          element={
            <ProtectedRoute>
              <Layout>
                <JourneyDashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/initiatives"
          element={
            <ProtectedRoute>
              <Layout>
                <InitiativesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/initiatives/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateInitiativePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/initiatives/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InitiativeDetailsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trees"
          element={
            <ProtectedRoute>
              <Layout>
                <TreesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Layout>
                <MarketplacePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gamification"
          element={
            <ProtectedRoute>
              <Layout>
                <GamificationPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/governance"
          element={
            <ProtectedRoute>
              <Layout>
                <GovernancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/governance/proposals"
          element={
            <ProtectedRoute>
              <Layout>
                <GovernancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/governance/proposals/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProposalDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/governance/petitions"
          element={
            <ProtectedRoute>
              <Layout>
                <GovernancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/governance/petitions/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PetitionDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ChatbotWrapper />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  );
}

function AppWithRouter() {
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true);

  // Routes where preloader should NOT be shown
  // Authentication pages need immediate interaction without waiting for animations
  const excludedRoutes = ['/login', '/register', '/reset-password'];
  const shouldShowPreloader = !excludedRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowPreloader && showPreloader && (
        <StickmanPreloader
          minDisplayDuration={1500}
          fadeOutDuration={500}
          backgroundColor="#0D4D2D"
          textColorCycleSpeed={800}
          onComplete={() => setShowPreloader(false)}
        />
      )}
      <AuthProvider>
        <JourneyProviderWrapper>
          <AppContent />
        </JourneyProviderWrapper>
      </AuthProvider>
    </>
  );
}

// Wrapper to provide user ID to JourneyProvider
function JourneyProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  return <JourneyProvider userId={user?.id || null}>{children}</JourneyProvider>;
}

export default App;
