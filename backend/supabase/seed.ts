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
    email: 'user2@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'user',
    display_name: 'Test User 2',
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

async function fetchImageBuffer(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image from ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function uploadPhoto(
  userId: string,
  experienceId: string,
  imageUrl: string,
  caption: string,
): Promise<string | null> {
  try {
    const buffer = await fetchImageBuffer(imageUrl);
    const fragmentId = crypto.randomUUID();
    const storagePath = `${userId}/${experienceId}/${fragmentId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('fragments')
      .upload(storagePath, buffer, { contentType: 'image/jpeg' });

    if (uploadError) {
      console.error(`Failed to upload photo: ${uploadError.message}`);
      return null;
    }

    const { data: frag } = await supabase
      .from('fragments')
      .insert({
        id: fragmentId,
        experience_id: experienceId,
        type: 'photo',
        caption,
        storage_path: storagePath,
      })
      .select('id')
      .single();

    return frag?.id ?? null;
  } catch (err) {
    console.error(`Photo upload failed: ${err instanceof Error ? err.message : err}`);
    return null;
  }
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
        .update({ role: account.role, display_name: account.display_name })
        .eq('id', userId);

      if (profileError) {
        console.error(`Failed to update profile for ${account.email}: ${profileError.message}`);
      } else {
        console.log(`Updated [${account.role}] ${account.email}`);
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
  }

  const testUserId = userIds['user@afterglow.dev'];
  const testUser2Id = userIds['user2@afterglow.dev'];
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
  await supabase.from('experiences').update({ is_draft: true, anchor_fragment_id: null }).gte('created_at', '2000-01-01');
  const { error: deleteError } = await supabase.from('experiences').delete().gte('created_at', '2000-01-01');
  if (deleteError) console.error('Failed to clear experiences:', deleteError.message);

  // Clear storage bucket for both users
  for (const userId of [testUserId, testUser2Id].filter(Boolean)) {
    const { data: files } = await supabase.storage.from('fragments').list(userId);
    if (files && files.length > 0) {
      // list subdirectories per experience
      for (const dir of files) {
        const { data: subFiles } = await supabase.storage.from('fragments').list(`${userId}/${dir.name}`);
        if (subFiles && subFiles.length > 0) {
          const paths = subFiles.map((f: { name: string }) => `${userId}/${dir.name}/${f.name}`);
          await supabase.storage.from('fragments').remove(paths);
        }
      }
    }
  }

  // -------------------------
  // 3. Seed Test User 1 data
  // -------------------------
  console.log('\nSeeding experiences for user@afterglow.dev...\n');

  // --- Experience 1: Summer Road Trip ---
  const { data: exp1 } = await supabase
    .from('experiences')
    .insert({
      user_id: testUserId,
      title: 'Summer Road Trip',
      description: 'A weekend drive through the mountains with old friends.',
      location: 'Kananaskis, Alberta',
      start_date: '2025-07-12',
      end_date: '2025-07-14',
      emotion_tags: ['Nostalgic', 'Peaceful', 'Grateful'],
      is_draft: true,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (exp1) {
    const photoFragId = await uploadPhoto(
      testUserId,
      exp1.id,
      'https://picsum.photos/seed/roadtrip/800/600',
      'Golden hour on the highway',
    );

    await supabase.from('fragments').insert({
      experience_id: exp1.id,
      type: 'text',
      text_context: 'We drove through Kananaskis just as the sun was setting. The sky turned deep orange over the peaks. Three hours of good music and no agenda.',
      caption: 'Golden hour on the highway',
    });

    await supabase.from('fragments').insert({
      experience_id: exp1.id,
      type: 'text',
      text_context: 'Woke up to rain on the tent. Made instant coffee on a camp stove. It was perfect.',
      caption: 'Morning at the campsite',
    });

    if (photoFragId) {
      await supabase
        .from('experiences')
        .update({ anchor_fragment_id: photoFragId, is_draft: false })
        .eq('id', exp1.id);
      console.log('Created published experience: Summer Road Trip (with photo anchor)');
    } else {
      console.log('Created experience: Summer Road Trip (no photo -- upload failed)');
    }

    await supabase.from('reflections').insert({
      experience_id: exp1.id,
      user_id: testUserId,
      reflection_text: 'Looking back at this trip, I keep thinking about how rare it is to have a full weekend with no plans. Need to do this more often.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // --- Experience 2: First Marathon ---
  const { data: exp2 } = await supabase
    .from('experiences')
    .insert({
      user_id: testUserId,
      title: 'First Marathon',
      description: 'Ran my first full marathon after six months of training.',
      location: 'Calgary, AB',
      start_date: '2025-05-04',
      end_date: '2025-05-04',
      emotion_tags: ['Proud', 'Exhausted', 'Joy'],
      is_draft: true,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (exp2) {
    const photoFragId = await uploadPhoto(
      testUserId,
      exp2.id,
      'https://picsum.photos/seed/marathon/800/600',
      'Finish line',
    );

    await supabase.from('fragments').insert({
      experience_id: exp2.id,
      type: 'text',
      text_context: 'Crossed the finish line at 4:12. My legs were completely done but I could not stop smiling. Six months of 5am runs came down to this.',
      caption: 'Finish line',
    });

    if (photoFragId) {
      await supabase
        .from('experiences')
        .update({ anchor_fragment_id: photoFragId, is_draft: false })
        .eq('id', exp2.id);
      console.log('Created published experience: First Marathon (with photo anchor)');
    } else {
      console.log('Created experience: First Marathon (no photo -- upload failed)');
    }
  }

  // --- Experience 3: Reading Journal (draft, no anchor) ---
  const { data: exp3 } = await supabase
    .from('experiences')
    .insert({
      user_id: testUserId,
      title: 'Reading Journal - March',
      description: 'Books and notes from this month.',
      emotion_tags: ['Calm', 'Reflective'],
      is_draft: true,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (exp3) {
    await supabase.from('fragments').insert({
      experience_id: exp3.id,
      type: 'text',
      text_context: 'Started "Klara and the Sun" by Kazuo Ishiguro. The narrator voice is unlike anything I have read. Hard to put down.',
    });
    console.log('Created draft experience: Reading Journal - March');
  }

  // -------------------------
  // 4. Seed Test User 2 data
  // -------------------------
  if (testUser2Id) {
    console.log('\nSeeding experiences for user2@afterglow.dev...\n');

    // --- User 2 Experience 1: Weekend Hiking ---
    const { data: u2exp1 } = await supabase
      .from('experiences')
      .insert({
        user_id: testUser2Id,
        title: 'Weekend Hiking Trip',
        description: 'Two days in Banff with stunning views.',
        location: 'Banff, Alberta',
        experience_date: '2025-08-20',
        emotion_tags: ['Awe', 'Peaceful', 'Grateful'],
        is_draft: true,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (u2exp1) {
      const photoFragId = await uploadPhoto(
        testUser2Id,
        u2exp1.id,
        'https://picsum.photos/seed/hiking/800/600',
        'Summit view',
      );

      await supabase.from('fragments').insert({
        experience_id: u2exp1.id,
        type: 'text',
        text_context: 'Made it to the summit just before clouds rolled in. Worth every step.',
        caption: 'Summit notes',
      });

      if (photoFragId) {
        await supabase
          .from('experiences')
          .update({ anchor_fragment_id: photoFragId, is_draft: false })
          .eq('id', u2exp1.id);
        console.log('Created published experience: Weekend Hiking Trip (with photo anchor)');
      } else {
        console.log('Created experience: Weekend Hiking Trip (no photo -- upload failed)');
      }
    }

    // --- User 2 Experience 2: Draft, no anchor ---
    const { data: u2exp2 } = await supabase
      .from('experiences')
      .insert({
        user_id: testUser2Id,
        title: 'Coffee Shop Sessions',
        description: 'My favourite spots to work and think.',
        location: 'Calgary, AB',
        experience_date: '2025-09-10',
        emotion_tags: ['Calm', 'Focused'],
        is_draft: true,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (u2exp2) {
      await supabase.from('fragments').insert({
        experience_id: u2exp2.id,
        type: 'text',
        text_context: 'Found a new spot on 17th. Good light, no music, perfect for writing.',
      });
      console.log('Created draft experience: Coffee Shop Sessions');
    }
  }

  // -------------------------
  // 5. System flag (for reviewer demo)
  // -------------------------
  const { error: flagError } = await supabase.from('system_flags').insert({
    flagged_user: testUserId,
    reviewed_by: reviewerUserId ?? null,
    notes: 'Sample flag for reviewer demo.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (!flagError) console.log('\nCreated sample system flag');

  console.log('\nDone.');
}

seed().catch(console.error);
