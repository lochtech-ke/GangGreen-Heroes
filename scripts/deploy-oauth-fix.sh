#!/bin/bash

# Deploy OAuth Fix Migration
# This script deploys the fix for Google OAuth authentication

echo "========================================="
echo "Deploying OAuth Fix Migration"
echo "========================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or run the SQL manually in Supabase SQL Editor:"
    echo "  supabase/migrations/023_fix_oauth_trigger_for_google.sql"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Push the migration
echo "Deploying migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Migration deployed successfully!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Test Google OAuth login again"
    echo "2. Verify user record is created in 'users' table"
    echo "3. Check that profile is created in 'user_profiles' table"
    echo ""
else
    echo ""
    echo "========================================="
    echo "❌ Migration deployment failed"
    echo "========================================="
    echo ""
    echo "Manual deployment option:"
    echo "1. Open Supabase SQL Editor"
    echo "2. Copy contents of: supabase/migrations/023_fix_oauth_trigger_for_google.sql"
    echo "3. Paste and run in SQL Editor"
    echo ""
fi
