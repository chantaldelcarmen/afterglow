// Run this script from the backend/api directory so node_modules are resolved correctly:
// cd backend/api && npx tsx ../supabase/seed.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testAccounts = [
  {
    email: 'user@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'user',
    display_name: 'Test User',
  },
  {
    email: 'reviewer@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'platform_reviewer',
    display_name: 'Test Reviewer',
  },
  {
    email: 'admin@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'admin',
    display_name: 'Test Admin',
  },
];

async function seed() {
  console.log('Seeding test accounts...\n');

  for (const account of testAccounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
    });

    if (error) {
      console.error(`Failed to create ${account.email}: ${error.message}`);
      continue;
    }

    const userId = data.user.id;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: account.role, display_name: account.display_name })
      .eq('id', userId);

    if (profileError) {
      console.error(`Failed to update profile for ${account.email}: ${profileError.message}`);
    } else {
      console.log(`Created [${account.role}] ${account.email} / password: Afterglow1234!`);
    }
  }

  console.log('\nDone.');
}

seed().catch(console.error);
