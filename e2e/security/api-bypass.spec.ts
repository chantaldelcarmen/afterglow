import { profiles } from '../utils/profiles';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

/*
API Security Bypass Tests
Tests that the API enforces auth and ownership even when the UI is bypassed.

Need:
 - Docker running + stack up (docker compose up)

Run from project root:
 - npx jest e2e/security/api-bypass.spec.ts
*/

const port = process.env.PORT ?? '3001';
const api = `http://localhost:${port}`;

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? '';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

async function getToken(email: string, password: string): Promise<string> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Sign in failed for ${email}: ${error?.message}`);
  return data.session.access_token;
}

async function req(
  token: string | null,
  method: string,
  path: string,
  body?: object,
): Promise<{ status_code: number, data: any }> {
  const headers = {'Content-Type': 'application/json'};

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${api}${path}`, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  return { status_code: res.status, data };
};

let userAId: string;
let tokenA: string;
let tokenB: string;

let expIdA: string | null;
let expIdA_2: string | null;
let expIdA_3: string | null;
let fragIdAAnchor: string | null;

let fragIdA: string | null;


beforeAll(async () => {
  // get tokens for user A and user B
  tokenA = await getToken(profiles.user.email, profiles.user.password);
  tokenB = await getToken(profiles.platform_reviewer.email, profiles.platform_reviewer.password);

  // use user tokens to grab an experience for user A and user B
  const { data: experienceA } = await req(tokenA, 'GET', '/experiences');
  expIdA = experienceA[0]?.id ?? null;
  expIdA_2 = experienceA[1]?.id ?? null;

  // use experience id to grab one fragment each for user A (one anchor + one other fragment)
  const { data: fragmentA } = await req(tokenA, 'GET', `/experiences/${expIdA}/fragments`);
  fragIdA = fragmentA[0]?.id ?? null;
  fragIdAAnchor = experienceA[0]?.anchor_fragment_id ?? null;

  // create a draft experience with no anchor fragment for data integrity test
  const { data: newExp } = await req(tokenA, 'POST', '/experiences', {
  title: 'Test draft no anchor',
  });
  expIdA_3 = newExp?.id ?? null;

  // getting user A user_id from their token
  const { data: { user } } = await supabase.auth.getUser(tokenA);
  userAId = user.id;

});

afterAll(async () => {
  // remove test experience
  if (expIdA_3) {
    await req(tokenA, 'DELETE', `/experiences/${expIdA_3}`);
  }
});

// Authentication API testing
describe('Authentication (2 cases)', () => {
  it('Call GET /experiences with no JWT - confirm 401', async () => {
      const { status_code } = await req(null, 'GET', '/experiences');
      expect(status_code).toBe(401);
  });

  it('Call GET /experiences with an invalid/expired JWT -- confirm 401', async () => {
      const { status_code } = await req("invalide-jwt-token", 'GET', '/experiences');
      expect(status_code).toBe(401);
  });
});


// Ownership Enforcement API testing
describe('Ownership Enforcement (6 cases)', () => {
  it('Call GET /experiences with User As JWT - confirm you only receive User As experiences, not User B', async () => {
    const { data: experiences } = await req(tokenA, 'GET', '/experiences');

    const experiencesList = experiences ?? [];

    for (const each of experiencesList) {
      expect(each.user_id).toBe(userAId);
    }
  });

  it('Call GET /experiences/:id with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {
    const { status_code } = await req(tokenB, 'GET', `/experiences/${expIdA}`);
    expect([403, 404]).toContain(status_code);
  });
  
  it('Call PATCH /experiences/:id with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {
    const { status_code } = await req(tokenB, 'PATCH', `/experiences/${expIdA}`);
    expect([403, 404]).toContain(status_code);
  });
  
  it('Call DELETE /experiences/:id with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {
    const { status_code } = await req(tokenB, 'DELETE', `/experiences/${expIdA}`);
    expect([403, 404]).toContain(status_code);
  });
  
  it('Call GET /experiences/:id/fragments with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {
    const { status_code } = await req(tokenB, 'GET', `/experiences/${expIdA}/fragments`);
    expect([403, 404]).toContain(status_code);
  });

  it('Call GET /experiences/:id/fragments/:fragmentId/signed-url with User Bs JWT on User As fragment - confirm 403', async () => {
    const { status_code } = await req(tokenB, 'GET', `/experiences/${expIdA}/fragments/${fragIdAAnchor}/signed-url`);
    expect([403, 404]).toContain(status_code);
  });
});


// Data Integrity API testing
describe('Data Integrity (3 cases)', () => {
  it('Call PATCH /experiences/:id with is_draft: false on an experience with no anchor fragment set - confirm 400', async () => {
    const { status_code } = await req(tokenA, 'PATCH', `/experiences/${expIdA_3}`, {is_draft: false});
    expect(status_code).toBe(400);
  });

  it('Call PATCH /experiences/:id/fragments/:fragmentId/anchor where the fragment belongs to a different experience -- confirm the request is rejected', async () => {
    const { status_code } = await req(tokenA, 'PATCH', `/experiences/${expIdA_2}/fragments/${fragIdA}/anchor`);
    expect([403, 404]).toContain(status_code);
  });

  it('Call DELETE /experiences/:id/fragments/:fragmentId where fragmentId is the current anchor -- confirm 400 (cannot delete anchor)', async () => {
    const { status_code } = await req(tokenA, 'DELETE', `/experiences/${expIdA}/fragments/${fragIdAAnchor}`);
    expect(status_code).toBe(400);
  });
});

