#!/bin/bash

# GangGreen Platform - Database Migration Script
# This script helps push migrations to Supabase

echo "🌳 GangGreen Platform - Database Migration"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI found"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "🔗 Linking to Supabase project..."
    echo "Please authenticate when prompted."
    echo ""
    
    # Login to Supabase
    supabase login
    
    # Link to project
    supabase link --project-ref wobpryllvdjaapzjbsxx
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Failed to link project."
        echo ""
        echo "📝 Manual Setup Instructions:"
        echo "1. Run: supabase login"
        echo "2. Run: supabase link --project-ref wobpryllvdjaapzjbsxx"
        echo "3. Run this script again"
        exit 1
    fi
fi

echo "✅ Project linked"
echo ""

# Push migrations
echo "📤 Pushing migrations to Supabase..."
echo ""

supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations pushed successfully!"
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Verify tables in Supabase Dashboard"
    echo "2. Set up storage buckets (see supabase/storage/README.md)"
    echo "3. Proceed to Task 3: Authentication System"
else
    echo ""
    echo "❌ Migration failed."
    echo ""
    echo "📝 Alternative: Use Supabase Dashboard"
    echo "1. Go to https://app.supabase.com"
    echo "2. Open SQL Editor"
    echo "3. Execute: supabase/migrations/000_all_migrations.sql"
    echo "4. Execute: supabase/migrations/010_rls_policies.sql"
    echo "5. Execute: supabase/storage/buckets.sql"
    exit 1
fi
