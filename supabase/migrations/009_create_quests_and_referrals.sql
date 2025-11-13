-- Create challenge_quests table
CREATE TABLE challenge_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  forest TEXT CHECK (forest IN ('kakamega', 'karura', 'mau')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  objectives JSONB NOT NULL,
  rewards JSONB NOT NULL,
  participants_count INTEGER DEFAULT 0 CHECK (participants_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_quest_dates CHECK (end_date > start_date)
);

-- Create quest_participants table
CREATE TABLE quest_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID REFERENCES challenge_quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress JSONB,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, user_id)
);

-- Create referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referee_id),
  CONSTRAINT no_self_referral CHECK (referrer_id != referee_id)
);

-- Create indexes
CREATE INDEX idx_challenge_quests_status ON challenge_quests(status);
CREATE INDEX idx_challenge_quests_forest ON challenge_quests(forest);
CREATE INDEX idx_challenge_quests_dates ON challenge_quests(start_date, end_date);

CREATE INDEX idx_quest_participants_user ON quest_participants(user_id);
CREATE INDEX idx_quest_participants_quest ON quest_participants(quest_id);
CREATE INDEX idx_quest_participants_completed ON quest_participants(completed);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);
