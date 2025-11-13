# GangGreen Platform - Push Migrations to Supabase
# This script executes SQL migrations directly on the remote database

Write-Host "🌳 GangGreen Platform - Database Migration" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if we're linked to Supabase
if (-not (Test-Path ".supabase")) {
    Write-Host "❌ Not linked to Supabase project" -ForegroundColor Red
    Write-Host "Run: npx supabase link --project-ref wobpryllvdjaapzjbsxx" -ForegroundColor Yellow
    exit 1
}

Write-Host "📡 Connected to Supabase project" -ForegroundColor Green
Write-Host ""

# Function to execute SQL file
function Execute-SqlFile {
    param (
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "📄 Executing: $Description" -ForegroundColor Cyan
    
    $content = Get-Content $FilePath -Raw
    
    # Save to temp file for psql
    $tempFile = [System.IO.Path]::GetTempFileName()
    $content | Out-File -FilePath $tempFile -Encoding UTF8
    
    try {
        # Use Supabase CLI to execute
        $output = npx supabase db execute --file $tempFile --linked 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Success" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ Failed" -ForegroundColor Red
            Write-Host "  Error: $output" -ForegroundColor Red
            return $false
        }
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

# Execute migrations
Write-Host "🚀 Starting migration process..." -ForegroundColor Yellow
Write-Host ""

$success = $true

# Main schema migration
if (Execute-SqlFile "supabase/migrations/000_all_migrations.sql" "Complete Database Schema") {
    Write-Host ""
} else {
    $success = $false
}

# RLS policies
if ($success) {
    if (Execute-SqlFile "supabase/migrations/010_rls_policies.sql" "Row Level Security Policies") {
        Write-Host ""
    } else {
        $success = $false
    }
}

# Storage buckets
if ($success) {
    if (Execute-SqlFile "supabase/storage/buckets.sql" "Storage Buckets Configuration") {
        Write-Host ""
    } else {
        $success = $false
    }
}

# Summary
Write-Host "==========================================" -ForegroundColor Green
if ($success) {
    Write-Host "✅ All migrations completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Database setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Verify tables in Supabase Dashboard" -ForegroundColor White
    Write-Host "2. Check storage buckets are created" -ForegroundColor White
    Write-Host "3. Proceed to Task 3: Authentication System" -ForegroundColor White
} else {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Try manual approach:" -ForegroundColor Yellow
    Write-Host "1. Go to https://app.supabase.com" -ForegroundColor White
    Write-Host "2. Open SQL Editor" -ForegroundColor White
    Write-Host "3. Execute migration files manually" -ForegroundColor White
    exit 1
}
