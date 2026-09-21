# PTown Access production backend setup

The repository now includes a Supabase-compatible staging schema and adapter. Nothing is connected by default.

1. Create separate development, staging, and production Supabase projects.
2. Apply `supabase/migrations/202609210001_ptown_operations.sql` to development first.
3. Create the first authenticated owner, then insert that user into `staff_profiles` as `owner` using an administrative server process.
4. Configure `runtimeMode`, `apiUrl`, `authIssuer`, and `syncEnabled` through release environment configuration. Never commit service-role keys.
5. Install and initialize the approved Supabase client in the app entrypoint, then construct `SupabaseOperationsBackend` with that client.
6. Test Owner, Booking Manager, Viewer, inactive-user, stale-version, audit, backup, and restore cases in staging.
7. Migrate preview records only after validation and owner approval.
8. Keep production disabled until recovery testing and release review pass.
