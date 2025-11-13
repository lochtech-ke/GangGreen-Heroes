-- Create trees table
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  planted_date DATE NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  planted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  antugrow_id TEXT UNIQUE,
  current_height_cm DECIMAL(10, 2) CHECK (current_height_cm >= 0),
  current_diameter_cm DECIMAL(10, 2) CHECK (current_diameter_cm >= 0),
  health_status TEXT CHECK (health_status IN ('healthy', 'stressed', 'diseased', 'dead')),
  last_monitored TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tree_images table
CREATE TABLE tree_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  antugrow_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_trees_initiative ON trees(initiative_id);
CREATE INDEX idx_trees_planted_by ON trees(planted_by);
CREATE INDEX idx_trees_species ON trees(species);
CREATE INDEX idx_trees_health_status ON trees(health_status);
CREATE INDEX idx_trees_antugrow_id ON trees(antugrow_id);
CREATE INDEX idx_trees_location ON trees USING GIST(location);
CREATE INDEX idx_trees_planted_date ON trees(planted_date);

CREATE INDEX idx_tree_images_tree ON tree_images(tree_id);
CREATE INDEX idx_tree_images_captured_at ON tree_images(captured_at);

-- Add trigger for updated_at
CREATE TRIGGER update_trees_updated_at
  BEFORE UPDATE ON trees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
