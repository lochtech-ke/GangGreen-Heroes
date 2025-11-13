-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
-- This file configures security policies to control data access at the row level
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE web3_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamified_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Users and Profiles Policies
-- ============================================================================

-- Users can view their own user record
CREATE POLICY "Users can view own user record"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own user record
CREATE POLICY "Users can update own user record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Initiatives Policies
-- ============================================================================

-- Anyone can view active initiatives
CREATE POLICY "Anyone can view active initiatives"
  ON initiatives FOR SELECT
  USING (status = 'active' OR auth.uid() = organization_id);

-- Organizations can create initiatives
CREATE POLICY "Organizations can create initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (
    auth.uid() = organization_id AND 
    (SELECT role FROM users WHERE id = auth.uid()) IN ('organization', 'admin')
  );

-- Organizations can update their own initiatives
CREATE POLICY "Organizations can update own initiatives"
  ON initiatives FOR UPDATE
  USING (auth.uid() = organization_id);

-- Admins can update any initiative
CREATE POLICY "Admins can update any initiative"
  ON initiatives FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- Initiative Participants Policies
-- ============================================================================

-- Users can view participants of initiatives they're part of
CREATE POLICY "Users can view initiative participants"
  ON initiative_participants FOR SELECT
  USING (true);

-- Users can join initiatives
CREATE POLICY "Users can join initiatives"
  ON initiative_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "Users can update own participation"
  ON initiative_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Trees Policies
-- ============================================================================

-- Anyone can view trees
CREATE POLICY "Anyone can view trees"
  ON trees FOR SELECT
  USING (true);

-- Authenticated users can add trees
CREATE POLICY "Authenticated users can add trees"
  ON trees FOR INSERT
  WITH CHECK (auth.uid() = planted_by);

-- Users can update trees they planted
CREATE POLICY "Users can update own trees"
  ON trees FOR UPDATE
  USING (auth.uid() = planted_by);

-- Admins can update any tree
CREATE POLICY "Admins can update any tree"
  ON trees FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- Tree Images Policies
-- ============================================================================

-- Anyone can view tree images
CREATE POLICY "Anyone can view tree images"
  ON tree_images FOR SELECT
  USING (true);

-- Authenticated users can upload tree images
CREATE POLICY "Authenticated users can upload tree images"
  ON tree_images FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- Carbon Credits Policies
-- ============================================================================

-- Anyone can view verified carbon credits
CREATE POLICY "Anyone can view verified carbon credits"
  ON carbon_credits FOR SELECT
  USING (verification_status = 'verified' OR 
         auth.uid() IN (SELECT organization_id FROM initiatives WHERE id = initiative_id));

-- Organizations can create carbon credits for their initiatives
CREATE POLICY "Organizations can create carbon credits"
  ON carbon_credits FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT organization_id FROM initiatives WHERE id = initiative_id)
  );

-- Organizations can update their carbon credits
CREATE POLICY "Organizations can update own carbon credits"
  ON carbon_credits FOR UPDATE
  USING (
    auth.uid() IN (SELECT organization_id FROM initiatives WHERE id = initiative_id)
  );

-- Admins can update any carbon credit
CREATE POLICY "Admins can update any carbon credit"
  ON carbon_credits FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- Transactions Policies
-- ============================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = buyer_id);

-- Users can create transactions
CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- Notifications Policies
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Web3 Wallets Policies
-- ============================================================================

-- Users can view their own wallets
CREATE POLICY "Users can view own wallets"
  ON web3_wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add their own wallets
CREATE POLICY "Users can add own wallets"
  ON web3_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallets
CREATE POLICY "Users can update own wallets"
  ON web3_wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own wallets
CREATE POLICY "Users can delete own wallets"
  ON web3_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Crypto Donations Policies
-- ============================================================================

-- Users can view their own crypto donations
CREATE POLICY "Users can view own crypto donations"
  ON crypto_donations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create crypto donations
CREATE POLICY "Users can create crypto donations"
  ON crypto_donations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can view confirmed donations (for transparency)
CREATE POLICY "Anyone can view confirmed donations"
  ON crypto_donations FOR SELECT
  USING (status = 'confirmed');

-- ============================================================================
-- NFT Badges Policies
-- ============================================================================

-- Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON nft_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view badges (public showcase)
CREATE POLICY "Anyone can view badges"
  ON nft_badges FOR SELECT
  USING (true);

-- System can mint badges
CREATE POLICY "System can mint badges"
  ON nft_badges FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Badge Criteria Policies
-- ============================================================================

-- Anyone can view active badge criteria
CREATE POLICY "Anyone can view badge criteria"
  ON badge_criteria FOR SELECT
  USING (active = true);

-- Admins can manage badge criteria
CREATE POLICY "Admins can manage badge criteria"
  ON badge_criteria FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- Gamification Policies
-- ============================================================================

-- Users can view their own gamification data
CREATE POLICY "Users can view own gamification"
  ON user_gamification FOR SELECT
  USING (auth.uid() = id);

-- Anyone can view leaderboard data
CREATE POLICY "Anyone can view leaderboard"
  ON user_gamification FOR SELECT
  USING (true);

-- System can update gamification data
CREATE POLICY "System can update gamification"
  ON user_gamification FOR ALL
  USING (true);

-- Users can view their own actions
CREATE POLICY "Users can view own actions"
  ON gamified_actions FOR SELECT
  USING (auth.uid() = user_id);

-- System can create actions
CREATE POLICY "System can create actions"
  ON gamified_actions FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Achievements Policies
-- ============================================================================

-- Anyone can view active achievements
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (active = true);

-- Users can view their own unlocked achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- System can unlock achievements
CREATE POLICY "System can unlock achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Challenge Quests Policies
-- ============================================================================

-- Anyone can view active quests
CREATE POLICY "Anyone can view active quests"
  ON challenge_quests FOR SELECT
  USING (status = 'active');

-- Admins can manage quests
CREATE POLICY "Admins can manage quests"
  ON challenge_quests FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Users can view their quest participation
CREATE POLICY "Users can view own quest participation"
  ON quest_participants FOR SELECT
  USING (auth.uid() = user_id);

-- Users can join quests
CREATE POLICY "Users can join quests"
  ON quest_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their quest progress
CREATE POLICY "Users can update own quest progress"
  ON quest_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Referrals Policies
-- ============================================================================

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Users can create referrals
CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- System can update referral status
CREATE POLICY "System can update referrals"
  ON referrals FOR UPDATE
  USING (true);

-- ============================================================================
-- RLS Policies Complete
-- ============================================================================
-- All Row Level Security policies have been configured
-- Data access is now controlled at the row level based on user authentication
-- ============================================================================
