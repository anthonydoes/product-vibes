# Supabase Setup Guide

This guide will help you set up Supabase for your Product Vibes application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - Name: `product-vibes`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API Key (anon public)

## Step 3: Configure Environment Variables

1. Copy the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `/database/init.sql` from this project
3. Paste it into the SQL Editor and run it
4. This will create all necessary tables, policies, and functions

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL:
   - Site URL: `http://localhost:5173` (for development)
   - Additional redirect URLs: Add your production domain when ready

### Enable OAuth Providers (Optional)

1. Go to Authentication > Providers
2. Enable GitHub (or other providers you want):
   - Get GitHub OAuth credentials from GitHub Developer settings
   - Add them to your Supabase auth provider configuration

## Step 6: Generate TypeScript Types

Run the following command to generate TypeScript types from your database:

```bash
npm run types:supabase
```

Note: You'll need to set the `SUPABASE_PROJECT_ID` environment variable first:

```bash
export SUPABASE_PROJECT_ID=your-project-id
npm run types:supabase
```

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and try to:
   - Sign up for a new account
   - Sign in with existing credentials
   - Sign in with GitHub (if configured)

## Database Structure

The application uses the following main tables:

- **profiles**: User profile information
- **products**: Product listings
- **upvotes**: User upvotes for products

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only modify their own data
- All products and profiles are publicly readable
- Authentication is required for creating products and upvotes

## Next Steps

1. Customize the database schema as needed
2. Add more OAuth providers if desired
3. Set up email templates in Supabase
4. Configure webhooks for advanced integrations
5. Set up database backups and monitoring

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure your `.env.local` file is in the project root and restart your dev server.

2. **Database connection errors**: Verify your Supabase URL and API key are correct.

3. **Authentication not working**: Check that your site URL is configured correctly in Supabase.

4. **Type errors**: Run `npm run types:supabase` to regenerate types after database changes.

### Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase/discussions
