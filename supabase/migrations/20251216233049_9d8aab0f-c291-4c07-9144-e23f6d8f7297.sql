-- Add unique constraint for upsert to work correctly
ALTER TABLE experience_time_slots 
ADD CONSTRAINT experience_time_slots_unique_slot 
UNIQUE (event_id, date, start_time);