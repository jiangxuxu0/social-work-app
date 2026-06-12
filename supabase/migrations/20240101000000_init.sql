-- Create elderly table
CREATE TABLE IF NOT EXISTS elderly (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL CHECK (age > 0),
  admission_date DATE NOT NULL,
  health_status VARCHAR(20) NOT NULL CHECK (health_status IN ('excellent', 'good', 'fair', 'poor')),
  social_worker_id VARCHAR(100),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Create adl_assessments table
CREATE TABLE IF NOT EXISTS adl_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  elder_id UUID NOT NULL REFERENCES elderly(id) ON DELETE CASCADE,
  bathing INT NOT NULL CHECK (bathing BETWEEN 1 AND 4),
  dressing INT NOT NULL CHECK (dressing BETWEEN 1 AND 4),
  toileting INT NOT NULL CHECK (toileting BETWEEN 1 AND 4),
  transferring INT NOT NULL CHECK (transferring BETWEEN 1 AND 4),
  continence INT NOT NULL CHECK (continence BETWEEN 1 AND 4),
  feeding INT NOT NULL CHECK (feeding BETWEEN 1 AND 4),
  grooming INT NOT NULL CHECK (grooming BETWEEN 1 AND 4),
  mobility INT NOT NULL CHECK (mobility BETWEEN 1 AND 4),
  communication INT NOT NULL CHECK (communication BETWEEN 1 AND 4),
  cognition INT NOT NULL CHECK (cognition BETWEEN 1 AND 4),
  total_score INT NOT NULL,
  grade VARCHAR(20) NOT NULL,
  assessed_at TIMESTAMP NOT NULL,
  assessed_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Create service_records table
CREATE TABLE IF NOT EXISTS service_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  elder_id UUID NOT NULL REFERENCES elderly(id) ON DELETE CASCADE,
  social_worker_id VARCHAR(100) NOT NULL,
  visit_time TIMESTAMP NOT NULL,
  content TEXT NOT NULL,
  next_visit_reminder TIMESTAMP,
  created_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_elderly_name ON elderly(name);
CREATE INDEX IF NOT EXISTS idx_adl_elder_id ON adl_assessments(elder_id);
CREATE INDEX IF NOT EXISTS idx_service_records_elder_id ON service_records(elder_id);
CREATE INDEX IF NOT EXISTS idx_service_records_visit_time ON service_records(visit_time);

-- Enable Row Level Security
ALTER TABLE elderly ENABLE ROW LEVEL SECURITY;
ALTER TABLE adl_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read elderly" ON elderly
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert elderly" ON elderly
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update elderly" ON elderly
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete elderly" ON elderly
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read adl_assessments" ON adl_assessments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert adl_assessments" ON adl_assessments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read service_records" ON service_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert service_records" ON service_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
