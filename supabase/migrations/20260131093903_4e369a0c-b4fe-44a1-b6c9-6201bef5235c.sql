-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule cache cleanup to run every 10 minutes
SELECT cron.schedule(
  'place-cache-cleanup-job',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://gzihagvdpdjcoyjpvyvs.supabase.co/functions/v1/place-cache-cleanup',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aWhhZ3ZkcGRqY295anB2eXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM2NzQsImV4cCI6MjA3NzE0OTY3NH0.2y2vuzaq9dKDrJIyjbAfcNAgrxVEpxeYwS5xNHSrqYw"}'::jsonb,
      body := concat('{"triggered_at": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);