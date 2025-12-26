-- Add accommodation_id to reviews table to link reviews to accommodations
ALTER TABLE reviews ADD COLUMN accommodation_id UUID NOT NULL;

-- Add foreign key constraint
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_accommodation
FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_reviews_accommodation_id ON reviews(accommodation_id);
