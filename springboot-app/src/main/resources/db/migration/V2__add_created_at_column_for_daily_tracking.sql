-- Migration script to add created_at column for daily expense tracking
-- This script adds the created_at timestamp column to the expenses table
-- for hourly expense analysis functionality

-- Add created_at column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Update existing records to have created_at based on the date field
-- (This assumes expenses were created at 12:00 PM on their respective dates)
UPDATE expenses 
SET created_at = date + TIME '12:00:00'
WHERE created_at IS NULL;

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Create an index on date and created_by combination for daily queries
CREATE INDEX IF NOT EXISTS idx_expenses_date_created_by ON expenses(date, created_by);

-- Create an index on created_by and created_at combination for hourly queries
CREATE INDEX IF NOT EXISTS idx_expenses_created_by_created_at ON expenses(created_by, created_at);

-- Comment for documentation
COMMENT ON COLUMN expenses.created_at IS 'Timestamp when the expense was created - used for hourly analysis in daily expense tracking';
