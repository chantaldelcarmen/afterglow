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

async function fetchMediaBuffer(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch media from ${url}`);
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
    const buffer = await fetchMediaBuffer(imageUrl);
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

async function uploadVideo(
  userId: string,
  experienceId: string,
  videoUrl: string,
  caption: string,
): Promise<void> {
  try {
    const buffer = await fetchMediaBuffer(videoUrl);
    const fragmentId = crypto.randomUUID();
    const storagePath = `${userId}/${experienceId}/${fragmentId}.mp4`;

    const { error: uploadError } = await supabase.storage
      .from('fragments')
      .upload(storagePath, buffer, { contentType: 'video/mp4' });

    if (uploadError) {
      console.error(`Failed to upload video: ${uploadError.message}`);
      return;
    }

    await supabase.from('fragments').insert({
      id: fragmentId,
      experience_id: experienceId,
      type: 'video',
      caption,
      storage_path: storagePath,
    });
    console.log(`  + video fragment: "${caption}"`);
  } catch (err) {
    console.error(`Video upload failed: ${err instanceof Error ? err.message : err}`);
  }
}

async function createExperience(params: {
  userId: string;
  title: string;
  description: string;
  location: string | null;
  experienceDate: string | null;
  startDate?: string;
  endDate?: string;
  emotionTags: string[];
  imageUrl: string;
  imageCaption: string;
  additionalImages?: { url: string; caption: string }[];
  videoFragments?: { url: string; caption: string }[];
  textFragments: { text: string; caption?: string }[];
  reflectionText?: string;
}): Promise<void> {
  const { data: exp, error: expError } = await supabase
    .from('experiences')
    .insert({
      user_id: params.userId,
      title: params.title,
      description: params.description,
      location: params.location,
      experience_date: params.experienceDate,
      start_date: params.startDate ?? null,
      end_date: params.endDate ?? null,
      emotion_tags: params.emotionTags,
      is_draft: true,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (!exp) {
    console.error(`Failed to create experience: ${params.title} -- ${expError?.message ?? 'unknown error'}`);
    return;
  }

  const photoFragId = await uploadPhoto(params.userId, exp.id, params.imageUrl, params.imageCaption);

  for (const extra of params.additionalImages ?? []) {
    await uploadPhoto(params.userId, exp.id, extra.url, extra.caption);
  }

  for (const vid of params.videoFragments ?? []) {
    await uploadVideo(params.userId, exp.id, vid.url, vid.caption);
  }

  for (const tf of params.textFragments) {
    await supabase.from('fragments').insert({
      experience_id: exp.id,
      type: 'text',
      text_context: tf.text,
      caption: tf.caption ?? null,
    });
  }

  if (photoFragId) {
    await supabase
      .from('experiences')
      .update({ anchor_fragment_id: photoFragId, is_draft: false })
      .eq('id', exp.id);
    console.log(`Created: ${params.title} (published)`);
  } else {
    console.log(`Created: ${params.title} (draft -- photo upload failed)`);
  }

  if (params.reflectionText) {
    await supabase.from('reflections').insert({
      experience_id: exp.id,
      user_id: params.userId,
      reflection_text: params.reflectionText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
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

      const now = new Date().toISOString();
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { id: userId, role: account.role, display_name: account.display_name, created_at: now, updated_at: now },
          { onConflict: 'id' },
        );

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

  // Enable AI reflection for the primary test user so the monthly insight endpoint returns real data
  if (testUserId) {
    const now = new Date().toISOString();
    await supabase
      .from('user_settings')
      .upsert(
        { user_id: testUserId, ai_reflection_enabled: true, updated_at: now },
        { onConflict: 'user_id' },
      );
    console.log('Enabled ai_reflection_enabled for user@afterglow.dev');
  }

  if (!testUserId) {
    console.error('\nCould not resolve test user ID -- skipping sample data.');
    console.log('\nDone.');
    return;
  }

  // -----------------------------------------------
  // 2. Clear existing experiences and system flags
  // -----------------------------------------------
  console.log('\nClearing existing sample data...');

  await supabase.from('system_flags').delete().gt('id', 0);
  // Nullify anchors first to avoid FK constraint, then delete fragments, then experiences
  await supabase.from('experiences').update({ is_draft: true, anchor_fragment_id: null }).gte('created_at', '2000-01-01');
  await supabase.from('fragments').delete().gte('created_at', '2000-01-01');
  const { error: deleteError } = await supabase.from('experiences').delete().gte('created_at', '2000-01-01');
  if (deleteError) console.error('Failed to clear experiences:', deleteError.message);

  // Clear storage bucket for both users
  for (const userId of [testUserId, testUser2Id].filter(Boolean) as string[]) {
    const { data: files } = await supabase.storage.from('fragments').list(userId);
    if (files && files.length > 0) {
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
  // 3. Seed Test User 1
  // -------------------------
  // Experience data for user 1 and user 2 was AI-generated (Claude) for demo and testing purposes.
  // Prompt used: "Generate 18 realistic personal experiences per user spread across 2024, 2025, and 2026
  // with varied titles, descriptions, locations, emotion_tags, and experience_dates. Each should feel
  // like a genuine memory. Include a mix of travel, everyday moments, milestones, and social events.
  // Locations should mostly be Calgary/Alberta with occasional trips elsewhere."
  console.log('\nSeeding 18 experiences for user@afterglow.dev...\n');

  // 2024 experiences (6)
  await createExperience({
    userId: testUserId,
    title: 'New Year Cabin Trip',
    description: 'Rang in 2024 at a cabin in the mountains with close friends.',
    location: 'Banff, Alberta',
    experienceDate: '2024-01-01',
    emotionTags: ['Joy', 'Grateful', 'Peaceful'],
    imageUrl: 'https://picsum.photos/seed/cabin2024/800/600',
    imageCaption: 'Cabin at midnight',
    textFragments: [{ text: 'We stayed up until 3am just talking. No phones, no plans. One of the best nights in a long time.' }],
    reflectionText: 'Starting the year surrounded by people who matter. Hard to ask for more.',
  });

  await createExperience({
    userId: testUserId,
    title: 'Spring Farmers Market',
    description: 'First market of the season. Bought too much cheese.',
    location: 'Calgary, AB',
    experienceDate: '2024-04-14',
    emotionTags: ['Joy', 'Calm'],
    imageUrl: 'https://picsum.photos/seed/farmersmarket/800/600',
    imageCaption: 'Fresh produce stalls',
    textFragments: [{ text: 'The lavender honey vendor was back. Bought three jars. No regrets.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Graduation Ceremony',
    description: 'Finally crossed the stage after four years.',
    location: 'Calgary, AB',
    experienceDate: '2024-06-10',
    emotionTags: ['Proud', 'Nostalgic', 'Grateful'],
    imageUrl: 'https://picsum.photos/seed/graduation/800/600',
    imageCaption: 'After the ceremony',
    textFragments: [
      { text: 'Four years of late nights and early mornings. Standing on that stage made all of it feel worth it.' },
      { text: 'My parents flew in from Edmonton. Seeing their faces in the crowd was the part I will remember most.' },
    ],
    reflectionText: 'I keep coming back to this one. A chapter ending and beginning at the same time.',
  });

  await createExperience({
    userId: testUserId,
    title: 'Summer Road Trip',
    description: 'A weekend drive through the mountains with old friends.',
    location: 'Kananaskis, Alberta',
    experienceDate: null,
    startDate: '2024-07-12',
    endDate: '2024-07-14',
    emotionTags: ['Nostalgic', 'Peaceful', 'Grateful'],
    imageUrl: 'https://picsum.photos/seed/roadtrip/800/600',
    imageCaption: 'Golden hour on the highway',
    videoFragments: [
      { url: 'https://www.w3schools.com/html/mov_bbb.mp4', caption: 'Driving through the valley' },
    ],
    textFragments: [
      { text: 'We drove through Kananaskis just as the sun was setting. The sky turned deep orange over the peaks.' },
      { text: 'Woke up to rain on the tent. Made instant coffee on a camp stove. It was perfect.' },
    ],
  });

  await createExperience({
    userId: testUserId,
    title: 'First Solo Travel',
    description: 'Three days in Vancouver, completely alone.',
    location: 'Vancouver, BC',
    experienceDate: '2024-09-05',
    emotionTags: ['Brave', 'Peaceful', 'Joy'],
    imageUrl: 'https://picsum.photos/seed/vancouver/800/600',
    imageCaption: 'Seawall at sunrise',
    textFragments: [{ text: 'Got lost twice, found a bookshop I will think about forever, ate ramen alone at a counter seat. Perfect.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Holiday Baking Day',
    description: 'Annual tradition with family.',
    location: 'Edmonton, Alberta',
    experienceDate: '2024-12-22',
    emotionTags: ['Joy', 'Nostalgic', 'Grateful'],
    imageUrl: 'https://picsum.photos/seed/baking/800/600',
    imageCaption: 'Cookie chaos',
    textFragments: [{ text: 'We made the same recipes my grandmother used. My sister burned the first batch, same as every year.' }],
    reflectionText: 'These traditions are the ones I hope never change.',
  });

  // 2025 experiences (6)
  await createExperience({
    userId: testUserId,
    title: 'First Marathon',
    description: 'Ran my first full marathon after six months of training.',
    location: 'Calgary, AB',
    experienceDate: null,
    startDate: '2025-05-04',
    endDate: '2025-05-04',
    emotionTags: ['Proud', 'Joy'],
    imageUrl: 'https://picsum.photos/seed/marathon/800/600',
    imageCaption: 'Finish line',
    textFragments: [{ text: 'Crossed the finish line at 4:12. My legs were completely done but I could not stop smiling.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Camping Under the Stars',
    description: 'No light pollution, no agenda.',
    location: 'Kananaskis, Alberta',
    experienceDate: '2025-06-20',
    emotionTags: ['Peaceful', 'Awe', 'Grateful'],
    imageUrl: 'https://picsum.photos/seed/stars/800/600',
    imageCaption: 'Milky way over the campsite',
    textFragments: [{ text: 'Counted shooting stars until 2am. The silence out there is different from any silence I know.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Concert Night',
    description: 'Front row at an outdoor show.',
    location: 'Calgary, AB',
    experienceDate: '2025-07-18',
    emotionTags: ['Joy', 'Excited'],
    imageUrl: 'https://picsum.photos/seed/concert/800/600',
    imageCaption: 'Stage lights',
    videoFragments: [
      { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', caption: 'Crowd during the opening act' },
    ],
    textFragments: [{ text: 'The bass hit so hard I felt it in my chest. Three hours standing and I did not notice once.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Weekend Pottery Class',
    description: 'Tried something completely new.',
    location: 'Calgary, AB',
    experienceDate: '2025-08-09',
    emotionTags: ['Calm', 'Curious'],
    imageUrl: 'https://picsum.photos/seed/pottery/800/600',
    imageCaption: 'First bowl attempt',
    textFragments: [{ text: 'My bowl collapsed twice. The instructor said that was normal. I am choosing to believe her.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Autumn Hike',
    description: 'Larch season in the Rockies.',
    location: 'Banff, Alberta',
    experienceDate: '2025-10-02',
    emotionTags: ['Awe', 'Peaceful', 'Nostalgic'],
    imageUrl: 'https://picsum.photos/seed/larch/800/600',
    imageCaption: 'Golden larches',
    textFragments: [{ text: 'The whole valley was gold. I kept stopping to just stand there. My hiking partner understood.' }],
    reflectionText: 'This is the one I come back to when I need to remember what quiet feels like.',
  });

  await createExperience({
    userId: testUserId,
    title: 'Reading Journal - March',
    description: 'Books and notes from this month.',
    location: null,
    experienceDate: '2025-03-15',
    emotionTags: ['Calm', 'Reflective'],
    imageUrl: 'https://picsum.photos/seed/books/800/600',
    imageCaption: 'Current reads',
    textFragments: [{ text: 'Started "Klara and the Sun" by Kazuo Ishiguro. The narrator voice is unlike anything I have read.' }],
  });

  // 2026 experiences (6)
  await createExperience({
    userId: testUserId,
    title: 'New Year Walk',
    description: 'Quiet walk on January 1st to clear my head.',
    location: 'Calgary, AB',
    experienceDate: '2026-01-01',
    emotionTags: ['Peaceful', 'Reflective'],
    imageUrl: 'https://picsum.photos/seed/newyearwalk/800/600',
    imageCaption: 'Empty streets at 7am',
    textFragments: [{ text: 'The city was completely still. Just me and a couple of dog walkers. Best way to start a year.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Friend\'s Wedding',
    description: 'Watched my closest friend get married.',
    location: 'Canmore, Alberta',
    experienceDate: '2026-02-14',
    emotionTags: ['Joy', 'Grateful', 'Nostalgic'],
    imageUrl: 'https://picsum.photos/seed/wedding/800/600',
    imageCaption: 'Reception dinner',
    textFragments: [
      { text: 'She looked so happy. The kind of happy that makes the whole room feel different.' },
      { text: 'We danced until the venue kicked us out. Worth every sore muscle the next day.' },
    ],
    reflectionText: 'Watching people you love reach moments like this is its own kind of joy.',
  });

  await createExperience({
    userId: testUserId,
    title: 'First Bike Ride of Spring',
    description: 'Finally warm enough to get back on the bike.',
    location: 'Calgary, AB',
    experienceDate: '2026-03-08',
    emotionTags: ['Joy', 'Peaceful'],
    imageUrl: 'https://picsum.photos/seed/bikeride/800/600',
    imageCaption: 'River pathway',
    textFragments: [{ text: 'The Bow River pathway was muddy in patches but I did not care. Thirty minutes of pure spring air.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Cooking Class',
    description: 'Italian pasta making with a small group.',
    location: 'Calgary, AB',
    experienceDate: '2026-03-15',
    emotionTags: ['Joy', 'Curious', 'Grateful'],
    imageUrl: 'https://picsum.photos/seed/pasta/800/600',
    imageCaption: 'Fresh tagliatelle',
    textFragments: [{ text: 'Made fresh pasta from scratch. The chef made it look effortless. It was not effortless.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Late Night Drive',
    description: 'No destination, just driving.',
    location: 'Calgary, AB',
    experienceDate: '2026-03-20',
    emotionTags: ['Calm', 'Reflective'],
    imageUrl: 'https://picsum.photos/seed/nightdrive/800/600',
    imageCaption: 'City lights from the hill',
    textFragments: [{ text: 'Sometimes you just need to drive with no destination. Ended up parked on a hill watching the city lights for an hour.' }],
  });

  await createExperience({
    userId: testUserId,
    title: 'Art Gallery Visit',
    description: 'Afternoon at the Glenbow.',
    location: 'Calgary, AB',
    experienceDate: '2026-03-28',
    emotionTags: ['Awe', 'Calm', 'Curious'],
    imageUrl: 'https://picsum.photos/seed/artgallery/800/600',
    imageCaption: 'Main exhibition hall',
    textFragments: [{ text: 'Spent an hour in front of one painting. Did not look at my phone once. That felt significant.' }],
  });

  // April 2026 experiences (5) -- seeded so the AI monthly reflection endpoint has real data to work with
  await createExperience({
    userId: testUserId,
    title: 'Cherry Blossom Walk',
    description: 'Peak blossom season along the river pathway.',
    location: 'Calgary, AB',
    experienceDate: '2026-04-05',
    emotionTags: ['Peaceful', 'Awe', 'Joy'],
    imageUrl: 'https://picsum.photos/seed/blossom26a/800/600',
    imageCaption: 'Pink canopy along the path',
    additionalImages: [
      { url: 'https://picsum.photos/seed/blossom26b/800/600', caption: 'Petals on the ground' },
      { url: 'https://picsum.photos/seed/blossom26c/800/600', caption: 'Close-up of a branch' },
    ],
    textFragments: [
      { text: 'The whole pathway was lined with pink. People kept stopping to look up, which meant you had to stop too.' },
      { text: 'Found a bench by the water and just sat for a while. No earphones, no phone. Just the sound of petals falling.' },
    ],
  });

  await createExperience({
    userId: testUserId,
    title: 'Spring Cleaning Weekend',
    description: 'Finally tackled the closet and the spare room.',
    location: 'Calgary, AB',
    experienceDate: '2026-04-11',
    emotionTags: ['Calm', 'Proud', 'Reflective'],
    imageUrl: 'https://picsum.photos/seed/cleaning26a/800/600',
    imageCaption: 'Before the chaos',
    additionalImages: [
      { url: 'https://picsum.photos/seed/cleaning26b/800/600', caption: 'Donation pile' },
    ],
    textFragments: [
      { text: 'Found a box of things from three years ago. Kept two items. Felt lighter after.' },
      { text: 'There is something genuinely satisfying about seeing a clean, empty shelf. I forgot that.' },
      { text: 'Ended the day with a long walk. The kind of tired that feels earned.' },
    ],
    reflectionText: 'Clearing space in a room and clearing space in your head are the same thing sometimes.',
  });

  await createExperience({
    userId: testUserId,
    title: 'Brunch with Old Friends',
    description: 'First time all four of us were in the same place in two years.',
    location: 'Calgary, AB',
    experienceDate: '2026-04-13',
    emotionTags: ['Joy', 'Grateful', 'Nostalgic'],
    imageUrl: 'https://picsum.photos/seed/brunch26a/800/600',
    imageCaption: 'Table full of food',
    additionalImages: [
      { url: 'https://picsum.photos/seed/brunch26b/800/600', caption: 'Late morning light' },
      { url: 'https://picsum.photos/seed/brunch26c/800/600', caption: 'Last slice of french toast' },
    ],
    textFragments: [
      { text: 'We sat there for three hours and no one checked the time once. Picked up exactly where we left off.' },
      { text: 'The restaurant kept trying to turn the table. We ordered more coffee until they gave up.' },
    ],
    reflectionText: 'Some friendships do not need maintenance. They just resume.',
  });

  await createExperience({
    userId: testUserId,
    title: 'Plant Market Score',
    description: 'Found a rare monstera and a peace lily at the weekend market.',
    location: 'Calgary, AB',
    experienceDate: '2026-04-19',
    emotionTags: ['Joy', 'Excited', 'Calm'],
    imageUrl: 'https://picsum.photos/seed/plants26a/800/600',
    imageCaption: 'New additions',
    additionalImages: [
      { url: 'https://picsum.photos/seed/plants26b/800/600', caption: 'The monstera up close' },
    ],
    textFragments: [
      { text: 'The seller said the monstera was two years old. Already has three fenestrations. Walked away fast before I bought anything else.' },
      { text: 'Spent the afternoon repotting everything. Got soil on the floor. Did not care.' },
    ],
  });

  await createExperience({
    userId: testUserId,
    title: 'Evening Walk by the Bow',
    description: 'Golden hour along the river after a long week.',
    location: 'Calgary, AB',
    experienceDate: '2026-04-25',
    emotionTags: ['Peaceful', 'Reflective', 'Grateful'],
    imageUrl: 'https://picsum.photos/seed/bowriver26a/800/600',
    imageCaption: 'River at golden hour',
    additionalImages: [
      { url: 'https://picsum.photos/seed/bowriver26b/800/600', caption: 'Reflections on the water' },
      { url: 'https://picsum.photos/seed/bowriver26c/800/600', caption: 'The path home' },
    ],
    textFragments: [
      { text: 'The light on the water at that hour is something else. Oranges and pinks reflecting off the current.' },
      { text: 'Walked for ninety minutes without really intending to. The week felt smaller by the time I got home.' },
    ],
    reflectionText: 'This city is genuinely beautiful in April. I forget that until I am standing in it.',
  });

  // -------------------------
  // 4. Seed Test User 2
  // -------------------------
  if (testUser2Id) {
    console.log('\nSeeding 18 experiences for user2@afterglow.dev...\n');

    // 2024 experiences (6)
    await createExperience({
      userId: testUser2Id,
      title: 'Winter Skating',
      description: 'Outdoor rink at Olympic Plaza.',
      location: 'Calgary, AB',
      experienceDate: '2024-01-20',
      emotionTags: ['Joy', 'Nostalgic'],
      imageUrl: 'https://picsum.photos/seed/skating/800/600',
      imageCaption: 'Outdoor rink at dusk',
      textFragments: [{ text: 'Fell twice, laughed both times. The hot chocolate after was worth the cold.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Cherry Blossom Walk',
      description: 'Peak blossom season in the park.',
      location: 'Vancouver, BC',
      experienceDate: '2024-04-05',
      emotionTags: ['Peaceful', 'Awe', 'Joy'],
      imageUrl: 'https://picsum.photos/seed/blossom/800/600',
      imageCaption: 'Pink canopy overhead',
      textFragments: [{ text: 'The whole street was pink. People were just standing with their heads up, phones forgotten for once.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Camping Trip with Family',
      description: 'Three nights in Jasper with my siblings.',
      location: 'Jasper, Alberta',
      experienceDate: null,
      startDate: '2024-06-28',
      endDate: '2024-07-01',
      emotionTags: ['Grateful', 'Joy', 'Nostalgic'],
      imageUrl: 'https://picsum.photos/seed/jasper/800/600',
      imageCaption: 'Evening campfire',
      textFragments: [
        { text: 'My brother still burns the marshmallows every single time. At this point it is tradition.' },
        { text: 'Saw a black bear on the trail. Kept a safe distance. My heart did not.' },
      ],
      reflectionText: 'We talked about doing this every year. This time I think we actually will.',
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Music Festival',
      description: 'Two days of live music.',
      location: 'Calgary, AB',
      experienceDate: null,
      startDate: '2024-08-03',
      endDate: '2024-08-04',
      emotionTags: ['Joy', 'Excited', 'Grateful'],
      imageUrl: 'https://picsum.photos/seed/festival/800/600',
      imageCaption: 'Main stage sunset set',
      videoFragments: [
        { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', caption: 'Headliner closing set' },
      ],
      textFragments: [{ text: 'The headliner played for two and a half hours. No one wanted them to stop.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'First Day at New Job',
      description: 'Nervous and excited in equal parts.',
      location: 'Calgary, AB',
      experienceDate: '2024-09-16',
      emotionTags: ['Nervous', 'Excited', 'Proud'],
      imageUrl: 'https://picsum.photos/seed/newjob/800/600',
      imageCaption: 'New desk setup',
      textFragments: [{ text: 'Remembered everyone\'s name by 2pm. Small win. The work looks interesting. Good sign.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Friendsgiving Dinner',
      description: 'Hosted dinner for 10, first time.',
      location: 'Calgary, AB',
      experienceDate: '2024-11-23',
      emotionTags: ['Joy', 'Grateful', 'Proud'],
      imageUrl: 'https://picsum.photos/seed/friendsgiving/800/600',
      imageCaption: 'Full table',
      textFragments: [{ text: 'The turkey was a little dry. No one cared. The table was loud and full and warm.' }],
      reflectionText: 'I want to do this every year.',
    });

    // 2025 experiences (6)
    await createExperience({
      userId: testUser2Id,
      title: 'Weekend Hiking Trip',
      description: 'Two days in Banff with stunning views.',
      location: 'Banff, Alberta',
      experienceDate: '2025-04-20',
      emotionTags: ['Awe', 'Peaceful', 'Grateful'],
      imageUrl: 'https://picsum.photos/seed/hiking/800/600',
      imageCaption: 'Summit view',
      textFragments: [{ text: 'Made it to the summit just before clouds rolled in. Worth every step.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Spontaneous Road Trip',
      description: 'Packed a bag and left with no plan.',
      location: 'Drumheller, Alberta',
      experienceDate: '2025-05-31',
      emotionTags: ['Brave', 'Joy', 'Excited'],
      imageUrl: 'https://picsum.photos/seed/badlands/800/600',
      imageCaption: 'Badlands at golden hour',
      textFragments: [{ text: 'The hoodoos look fake in person. Like a film set. Stood there for a long time just looking.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Learning to Surf',
      description: 'Lesson at a surf camp.',
      location: 'Tofino, BC',
      experienceDate: '2025-07-10',
      emotionTags: ['Brave', 'Joy', 'Excited'],
      imageUrl: 'https://picsum.photos/seed/surfing/800/600',
      imageCaption: 'First wave attempt',
      videoFragments: [
        { url: 'https://www.w3schools.com/html/mov_bbb.mp4', caption: 'First time standing on the board' },
      ],
      textFragments: [{ text: 'Stood up on the board exactly once. For approximately two seconds. It counted.' }],
      reflectionText: 'I want to go back and actually get good at this.',
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Neighbourhood Street Festival',
      description: 'Summer block party that turned into something special.',
      location: 'Calgary, AB',
      experienceDate: '2025-08-16',
      emotionTags: ['Joy', 'Grateful', 'Calm'],
      imageUrl: 'https://picsum.photos/seed/streetfestival/800/600',
      imageCaption: 'Live band on the street',
      textFragments: [{ text: 'Met neighbours I had lived next to for two years but never spoken to. Exchanged numbers. Actually texted after.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Coffee Shop Sessions',
      description: 'My favourite spots to work and think.',
      location: 'Calgary, AB',
      experienceDate: '2025-09-10',
      emotionTags: ['Calm', 'Reflective'],
      imageUrl: 'https://picsum.photos/seed/coffeeshop/800/600',
      imageCaption: 'Corner window seat',
      textFragments: [{ text: 'Found a new spot on 17th. Good light, no music, perfect for writing.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'First Snowfall of the Season',
      description: 'That quiet morning everything turned white.',
      location: 'Calgary, AB',
      experienceDate: '2025-11-08',
      emotionTags: ['Peaceful', 'Nostalgic', 'Awe'],
      imageUrl: 'https://picsum.photos/seed/snowfall/800/600',
      imageCaption: 'Snow on the back yard',
      textFragments: [{ text: 'Woke up at 6am for some reason and looked outside. The whole yard was white and completely still.' }],
    });

    // 2026 experiences (6)
    await createExperience({
      userId: testUser2Id,
      title: 'Dry January Run Streak',
      description: 'Ran every day for 31 days.',
      location: 'Calgary, AB',
      experienceDate: '2026-01-31',
      emotionTags: ['Proud', 'Grateful'],
      imageUrl: 'https://picsum.photos/seed/running/800/600',
      imageCaption: 'Day 31 finish',
      textFragments: [{ text: 'Day 31. It got easier around day 12. The hardest part was day 4.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Valentine\'s Day Dinner',
      description: 'Cooked a proper three course meal at home.',
      location: 'Calgary, AB',
      experienceDate: '2026-02-14',
      emotionTags: ['Joy', 'Grateful', 'Calm'],
      imageUrl: 'https://picsum.photos/seed/valentinesdinner/800/600',
      imageCaption: 'Candlelit table',
      textFragments: [{ text: 'The risotto took 45 minutes of constant stirring. Would do it again in a heartbeat.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Book Club Launch',
      description: 'Started a book club with coworkers.',
      location: 'Calgary, AB',
      experienceDate: '2026-02-28',
      emotionTags: ['Curious', 'Grateful', 'Joy'],
      imageUrl: 'https://picsum.photos/seed/bookclub/800/600',
      imageCaption: 'First meeting',
      textFragments: [{ text: 'Six people, wildly different takes on the same book. The argument about the ending lasted an hour.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Sunrise Yoga',
      description: 'Outdoor class in the park.',
      location: 'Calgary, AB',
      experienceDate: '2026-03-07',
      emotionTags: ['Peaceful', 'Calm', 'Grateful'],
      imageUrl: 'https://picsum.photos/seed/yoga/800/600',
      imageCaption: 'Park at 6:30am',
      textFragments: [{ text: 'The instructor said to notice three things around you. I noticed the light, the cold air, and how quiet it was.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Night Photography Walk',
      description: 'Learning long exposure photography.',
      location: 'Calgary, AB',
      experienceDate: '2026-03-19',
      emotionTags: ['Curious', 'Calm', 'Awe'],
      imageUrl: 'https://picsum.photos/seed/nightphoto/800/600',
      imageCaption: 'Light trails on Centre Street',
      textFragments: [{ text: 'Spent three hours getting one shot I was happy with. Apparently that is normal for long exposure.' }],
    });

    await createExperience({
      userId: testUser2Id,
      title: 'Spring Market Weekend',
      description: 'Opening weekend of the outdoor market season.',
      location: 'Calgary, AB',
      experienceDate: '2026-03-29',
      emotionTags: ['Joy', 'Peaceful', 'Grateful'],
      imageUrl: 'https://picsum.photos/seed/springmarket/800/600',
      imageCaption: 'Market morning',
      textFragments: [{ text: 'First market of the year. Bought honey, sourdough, and a plant I have no room for.' }],
    });
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
