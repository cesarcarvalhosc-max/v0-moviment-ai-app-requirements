# MovimentAI - Setup Guide

## Test Users

The following test users are available for development and testing:

### CEO Account
- Email: `cesarcarvalho.sc@gmail.com`
- Password: `@Cesar333`

### Developer Account
- Email: `dev@teste.com`
- Password: `MovimentAi`

## Creating Users in Supabase

To create these users:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add user" > "Create new user"
4. Enter the email and password
5. Click "Create user"
6. Run the SQL script `scripts/003_create_test_users.sql` to set up the profile and default data

Alternatively, you can sign up through the app's onboarding flow.

## Database Setup

1. Run the SQL scripts in order:
   - `scripts/001_create_schema.sql` - Creates all tables
   - `scripts/002_create_trigger.sql` - Creates triggers for updated_at
   - `scripts/003_create_test_users.sql` - Creates test user profiles (after creating auth users)

## Environment Variables

Make sure you have the following environment variables set:
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are automatically configured when you connect the Supabase integration in v0.
