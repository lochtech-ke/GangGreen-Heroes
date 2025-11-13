-- Create initiatives table
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  target_trees INTEGER NOT NULL CHECK (target_trees > 0),
  trees_planted INTEGER DEFAULT 0 CHECK (trees_planted >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  area_hectares DECIMAL(10, 2) CHECK (area_hectares > 0),
  organization_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Create initiative_participants table
CREATE TABLE initiative_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trees_contributed INTEGER DEFAULT 0 CHECK (trees_contributed >= 0),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, user_id)
);

-- Create indexes
CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_organization ON initiatives(organization_id);
CREATE INDEX idx_initiatives_start_date ON initiatives(start_date);
CREATE INDEX idx_initiatives_location ON initiatives USING GIST(location);

CREATE INDEX idx_initiative_participants_initiative ON initiative_participants(initiative_id);
CREATE INDEX idx_initiative_participants_user ON initiative_participants(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
