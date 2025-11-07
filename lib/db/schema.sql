-- Create cattle table
CREATE TABLE IF NOT EXISTS cattle (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(255) NOT NULL,
  cattle_type VARCHAR(50) NOT NULL DEFAULT 'cow',
  date_of_joining DATE NOT NULL,
  purchase_amount DECIMAL(10, 2),
  seller_contact_number VARCHAR(20),
  seller_address TEXT,
  age INTEGER,
  photo_url TEXT,
  estimated_milk_production_daily DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create milk_records table
CREATE TABLE IF NOT EXISTS milk_records (
  id SERIAL PRIMARY KEY,
  cattle_id INTEGER NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  morning_milk DECIMAL(5, 2) NOT NULL DEFAULT 0,
  evening_milk DECIMAL(5, 2) NOT NULL DEFAULT 0,
  rate_per_liter DECIMAL(5, 2) NOT NULL DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cattle_id, record_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cattle_date_of_joining ON cattle(date_of_joining);
CREATE INDEX IF NOT EXISTS idx_milk_records_date ON milk_records(record_date);
CREATE INDEX IF NOT EXISTS idx_milk_records_cattle_id ON milk_records(cattle_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_cattle_updated_at BEFORE UPDATE ON cattle
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_records_updated_at BEFORE UPDATE ON milk_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

