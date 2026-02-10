

## Fix: Place Cache "upsert_place_cache" PGRST202 Error

### Problem
The edge function code is correct — it already passes all 5 parameters including `p_attributions`. However, PostgREST (the layer between the edge function and the database) has a stale schema cache. It still thinks the function is being called with only 4 parameters.

This is a known Supabase issue that happens after database function changes.

### Solution
Create a small database migration that sends the `NOTIFY pgrst, 'reload schema'` command. This forces PostgREST to refresh its understanding of all database functions and pick up the correct 5-parameter signature.

### Steps

1. **Create a migration file** containing:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   This single line forces PostgREST to reload its schema cache across all regions.

2. **Redeploy the `place-cache` edge function** to ensure the latest version is active on all regions (the error came from `eu-west-3`, previous fix may have only refreshed `us-east-2`).

3. **Verify** by testing the function and confirming the error no longer appears in logs.

### Why This Keeps Happening
Each time a migration modifies the `upsert_place_cache` function or the `place_cache` table, PostgREST needs to be notified. Without the `NOTIFY` command, different regions can serve stale schema caches, causing intermittent failures.

