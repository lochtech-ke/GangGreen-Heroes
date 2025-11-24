-- Create user_gamification table
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  experience_to_next_level INTEGER DEFAULT 100 CHECK (experience_to_next_level >= 0),
  rank_global INTEGER,
  rank_forest INTEGER,
  badges_earned INTEGER DEFAULT 0 CHECK (badges_earned >= 0),
  achievements_unlocked INTEGER DEFAULT 0 CHECK (achievements_unlocked >= 0),
  referrals_count INTEGER DEFAULT 0 CHECK (referrals_count >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gamified_actions table
CREATE TABLE gamified_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('tree_plant', 'donation', 'monitor', 'referral', 'share', 'verify')),
  points_awarded INTEGER NOT NULL CHECK (points_awarded >= 0),
  multiplier DECIMAL(3, 2) DEFAULT 1.0 CHECK (multiplier > 0),
  description TEXT,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  points_reward INTEGER NOT NULL CHECK (points_reward >= 0),
  action_type TEXT NOT NULL,
  required_count INTEGER NOT NULL CHECK (required_count > 0),
  timeframe TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX idx_user_gamification_points ON user_gamification(total_points DESC);
CREATE INDEX idx_user_gamification_level ON user_gamification(level DESC);
CREATE INDEX idx_user_gamification_rank_global ON user_gamification(rank_global);
CREATE INDEX idx_user_gamification_rank_forest ON user_gamification(rank_forest);

CREATE INDEX idx_gamified_actions_user ON gamified_actions(user_id);
CREATE INDEX idx_gamified_actions_type ON gamified_actions(action_type);
CREATE INDEX idx_gamified_actions_date ON gamified_actions(created_at DESC);

CREATE INDEX idx_achievements_active ON achievements(active) WHERE active = TRUE;
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
