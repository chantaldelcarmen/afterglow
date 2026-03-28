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

async function getOrCreateUser(email: string, password: string): Promise<string> {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users.find((u: { email?: string }) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(`Failed to create ${email}: ${error.message}`);
  return data.user.id;
}

async function seed() {
  // -------------------------
  // 1. Upsert test accounts
  // -------------------------
  console.log('Seeding test accounts...\n');

  const userIds: Record<string, string> = {};

  for (const account of testAccounts) {
    try {
      const userId = await getOrCreateUser(account.email, account.password);
      userIds[account.email] = userId;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: userId, role: account.role, display_name: account.display_name });

      if (profileError) {
        console.error(`Failed to upsert profile for ${account.email}: ${profileError.message}`);
      } else {
        console.log(`Upserted [${account.role}] ${account.email}`);
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
  }

  const testUserId = userIds['user@afterglow.dev'];
  const reviewerUserId = userIds['reviewer@afterglow.dev'];

  if (!testUserId) {
    console.error('\nCould not resolve test user ID -- skipping sample data.');
    console.log('\nDone.');
    return;
  }

  // -----------------------------------------------
  // 2. Clear existing experiences and system flags
  //    (fragments and reflections cascade from experiences)
  // -----------------------------------------------
  console.log('\nClearing existing sample data...');

  await supabase.from('system_flags').delete().gt('id', 0);
  await supabase.from('experiences').delete().gte('created_at', '2000-01-01');

  // -------------------------
  // 3. Seed sample data
  // -------------------------
  console.log('\nSeeding sample experiences...\n');

  // --- Experience 1: Summer Road Trip (published) ---
  const { data: exp1 } = await supabase
    .from('experiences')
    .insert({
      user_id: testUserId,
      title: 'Summer Road Trip',
      description: 'A weekend drive through the mountains with old friends.',
      location: 'Kananaskis, Alberta',
      start_date: '2025-07-12',
      end_date: '2025-07-14',
      is_draft: true,
    })
    .select('id')
    .single();

  if (exp1) {
    const { data: frag1 } = await supabase
      .from('fragments')
      .insert({
        experience_id: exp1.id,
        type: 'text',
        text_context:
          'We drove through Kananaskis just as the sun was setting. The sky turned deep orange over the peaks. Three hours of good music and no agenda.',
        caption: 'Golden hour on the highway',
      })
      .select('id')
      .single();

    if (frag1) {
      await supabase
        .from('experiences')
        .update({ anchor_fragment_id: frag1.id, is_draft: false })
        .eq('id', exp1.id);
    }

    await supabase.from('fragments').insert({
      experience_id: exp1.id,
      type: 'text',
      text_context: 'Woke up to rain on the tent. Made instant coffee on a camp stove. It was perfect.',
      caption: 'Morning at the campsite',
    });

    console.log('Created published experience: Summer Road Trip');
  }

  // --- Experience 2: First Marathon (published) ---
  const { data: exp2 } = await supabase
    .from('experiences')
    .insert({
      user_id: testUserId,
      title: 'First Marathon',
      description: 'Ran my first full marathon after six months of training.',
      location: 'Calgary, AB',
      start_date: '2025-05-04',
      end_date: '2025-05-04',
      is_draft: true,
    })
    .select('id')
    .single();

  if (exp2) {
    const { data: frag2 } = await supabase
      .from('fragments')
      .insert({
        experience_id: exp2.id,
        type: 'text',
        text_context:
          'Crossed the finish line at 4:12. My legs were completely done but I could not stop smiling. Six months of 5am runs came down to this.',
        caption: 'Finish line',
      })
      .select('id')
      .single();

    if (frag2) {
      await supabase
        .from('experiences')
        .update({ anchor_fragment_id: frag2.id, is_draft: false })
        .eq('id', exp2.id);
    }

    console.log('Created published experience: First Marathon');
  }

  // --- Experience 3: Reading Journal (draft) ---
  const { data: exp3 } = await supabase
    .from('experiences')
    .insert({
      user_id: testUserId,
      title: 'Reading Journal - March',
      description: 'Books and notes from this month.',
      is_draft: true,
    })
    .select('id')
    .single();

  if (exp3) {
    await supabase.from('fragments').insert({
      experience_id: exp3.id,
      type: 'text',
      text_context:
        'Started "Klara and the Sun" by Kazuo Ishiguro. The narrator voice is unlike anything I have read. Hard to put down.',
    });

    console.log('Created draft experience: Reading Journal - March');
  }

  // --- Reflection ---
  if (exp1) {
    const { error: reflError } = await supabase.from('reflections').insert({
      experience_id: exp1.id,
      user_id: testUserId,
      reflection_text:
        'Looking back at this trip, I keep thinking about how rare it is to have a full weekend with no plans. Need to do this more often.',
    });

    if (!reflError) console.log('Created reflection on Summer Road Trip');
  }

  // --- System flag (for reviewer demo) ---
  const { error: flagError } = await supabase.from('system_flags').insert({
    flagged_user: testUserId,
    reviewed_by: reviewerUserId ?? null,
    notes: 'Sample flag for reviewer demo.',
  });

  if (!flagError) console.log('Created sample system flag');

  console.log('\nDone.');
}

seed().catch(console.error);
