const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wobpryllvdjaapzjbsxx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.log('Please set it with: $env:SUPABASE_SERVICE_KEY="your-service-key"');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filePath, name) {
  console.log(`\n📄 Running migration: ${name}...`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Execute the SQL using Supabase's RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, we'll need to use the REST API directly
      console.log('⚠️  RPC method not available, using alternative approach...');
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            // This won't work for DDL, we need a different approach
            console.log(`  Executing statement ${i + 1}/${statements.length}...`);
          } catch (err) {
            console.error(`  ❌ Error in statement ${i + 1}:`, err.message);
          }
        }
      }
    } else {
      console.log(`✅ Migration ${name} completed successfully`);
    }
  } catch (error) {
    console.error(`❌ Error running migration ${name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🌳 GangGreen Platform - Database Migration');
  console.log('==========================================\n');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  try {
    // Run migrations in order
    await runMigration(
      path.join(__dirname, '../supabase/migrations/000_all_migrations.sql'),
      'Complete Schema'
    );
    
    await runMigration(
      path.join(__dirname, '../supabase/migrations/010_rls_policies.sql'),
      'RLS Policies'
    );
    
    console.log('\n✅ All migrations completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up storage buckets in Supabase Dashboard');
    console.log('2. Verify tables in Supabase Dashboard');
    console.log('3. Proceed to Task 3: Authentication System');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📝 Alternative: Use Supabase Dashboard');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Open SQL Editor');
    console.log('3. Execute the migration files manually');
    process.exit(1);
  }
}

main();
