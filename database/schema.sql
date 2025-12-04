-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mythic_name TEXT NOT NULL,
  original_object TEXT NOT NULL,
  rarity_index INTEGER NOT NULL,
  adjusted_rarity INTEGER,
  rarity_tier TEXT NOT NULL,
  element TEXT NOT NULL,
  flavor_text TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  weight_class TEXT NOT NULL,
  estimated_weight TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_word TEXT,
  reward_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  daily_date DATE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenges table
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET total_points = total_points + points WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_rarity ON collections(rarity_index DESC);
CREATE INDEX idx_challenges_active ON challenges(is_active, daily_date);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_friendships_user ON friendships(user_id);
