# ============================================================================
# Grant Admin Rights Script
# ============================================================================
# This script helps you grant admin rights to users in the GangGreen platform
# Usage: .\scripts\grant-admin.ps1
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [switch]$List,
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Show-Help {
    Write-Host "`n=== GangGreen Admin Management Tool ===" -ForegroundColor $InfoColor
    Write-Host "`nUsage:" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\grant-admin.ps1 -List                    # List all current admins"
    Write-Host "  .\scripts\grant-admin.ps1 -Email user@example.com  # Grant admin rights to user"
    Write-Host "  .\scripts\grant-admin.ps1 -Help                    # Show this help message"
    Write-Host "`nExamples:" -ForegroundColor $InfoColor
    Write-Host "  .\scripts\grant-admin.ps1 -List"
    Write-Host "  .\scripts\grant-admin.ps1 -Email admin@ganggreen.org"
    Write-Host "`nNote: You need to execute the SQL queries manually in Supabase SQL Editor." -ForegroundColor $WarningColor
    Write-Host "This script generates the queries for you.`n"
}

function Show-CurrentAdmins {
    Write-Host "`n=== Current Admin Users ===" -ForegroundColor $InfoColor
    Write-Host "`nExecute this query in Supabase SQL Editor:" -ForegroundColor $WarningColor
    Write-Host "`nhttps://app.supabase.com/project/wobpryllvdjaapzjbsxx/editor/sql`n" -ForegroundColor $InfoColor
    
    $query = @"
SELECT 
  id,
  email,
  role,
  forest_preference,
  created_at,
  updated_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;
"@
    
    Write-Host $query -ForegroundColor $SuccessColor
    Write-Host "`n"
}

function Grant-AdminRights {
    param([string]$UserEmail)
    
    if ([string]::IsNullOrWhiteSpace($UserEmail)) {
        Write-Host "`nError: Email address is required!" -ForegroundColor $ErrorColor
        Write-Host "Usage: .\scripts\grant-admin.ps1 -Email user@example.com`n" -ForegroundColor $WarningColor
        return
    }
    
    Write-Host "`n=== Grant Admin Rights ===" -ForegroundColor $InfoColor
    Write-Host "`nUser Email: $UserEmail" -ForegroundColor $InfoColor
    Write-Host "`nStep 1: Open Supabase SQL Editor" -ForegroundColor $WarningColor
    Write-Host "https://app.supabase.com/project/wobpryllvdjaapzjbsxx/editor/sql`n" -ForegroundColor $InfoColor
    
    Write-Host "Step 2: Execute this query:" -ForegroundColor $WarningColor
    
    $query = @"
-- Grant admin rights to $UserEmail
UPDATE users 
SET role = 'admin',
    updated_at = NOW()
WHERE email = '$UserEmail'
RETURNING id, email, role, updated_at;
"@
    
    Write-Host "`n$query`n" -ForegroundColor $SuccessColor
    
    Write-Host "Step 3: Verify the change:" -ForegroundColor $WarningColor
    
    $verifyQuery = @"
-- Verify admin rights for $UserEmail
SELECT 
  id,
  email,
  role,
  forest_preference,
  created_at,
  updated_at
FROM users
WHERE email = '$UserEmail';
"@
    
    Write-Host "`n$verifyQuery`n" -ForegroundColor $SuccessColor
    
    Write-Host "Step 4: User should log out and log back in to refresh their token.`n" -ForegroundColor $WarningColor
}

function Show-AllUsers {
    Write-Host "`n=== All Users (for reference) ===" -ForegroundColor $InfoColor
    Write-Host "`nExecute this query to see all users:" -ForegroundColor $WarningColor
    
    $query = @"
SELECT 
  u.id,
  u.email,
  u.role,
  u.forest_preference,
  up.full_name,
  up.organization,
  u.created_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC
LIMIT 50;
"@
    
    Write-Host "`n$query`n" -ForegroundColor $SuccessColor
}

function Show-QuickReference {
    Write-Host "`n=== Quick Reference ===" -ForegroundColor $InfoColor
    Write-Host "`nUser Roles:" -ForegroundColor $WarningColor
    Write-Host "  - admin        : Full platform access"
    Write-Host "  - organization : Can create initiatives"
    Write-Host "  - community    : Local forest participation"
    Write-Host "  - individual   : Basic user access"
    
    Write-Host "`nAdmin Capabilities:" -ForegroundColor $WarningColor
    Write-Host "  ✓ Manage all initiatives"
    Write-Host "  ✓ Verify carbon credits"
    Write-Host "  ✓ View all transactions"
    Write-Host "  ✓ Manage badge criteria"
    Write-Host "  ✓ Moderate content"
    Write-Host "  ✓ View analytics"
    
    Write-Host "`nImportant Files:" -ForegroundColor $WarningColor
    Write-Host "  - supabase/admin-management.sql       : Complete SQL queries"
    Write-Host "  - supabase/ADMIN_MANAGEMENT_GUIDE.md  : Detailed guide"
    Write-Host "  - supabase/SETUP_GUIDE.md             : Database setup"
    
    Write-Host "`nSupabase Dashboard:" -ForegroundColor $WarningColor
    Write-Host "  https://app.supabase.com/project/wobpryllvdjaapzjbsxx`n"
}

# Main script logic
if ($Help) {
    Show-Help
    Show-QuickReference
    exit 0
}

if ($List) {
    Show-CurrentAdmins
    Show-AllUsers
    exit 0
}

if ($Email) {
    Grant-AdminRights -UserEmail $Email
    exit 0
}

# No parameters provided, show help
Show-Help
Show-QuickReference
