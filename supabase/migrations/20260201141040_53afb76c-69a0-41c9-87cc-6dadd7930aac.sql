-- Add unique constraint for user_notifications upsert
ALTER TABLE public.user_notifications 
ADD CONSTRAINT user_notifications_user_notification_unique 
UNIQUE (user_id, notification_id);