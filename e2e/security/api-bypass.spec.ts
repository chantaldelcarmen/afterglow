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

const port = process.env.PORT ?? '3000';
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

let tokenA: string;
let tokenB: string;

beforeAll(async () => {
  // get tokens for user A and user B
  const tokenA = await getToken(profiles.user.email, profiles.user.password);
  const tokenB = await getToken(profiles.platform_reviewer.email, profiles.platform_reviewer.password);

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
  it('Call GET /experiences with User Bs JWT - confirm you only receive User Bs experiences, not User A', async () => {

  });

  it('Call GET /experiences/:id with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {

  });
  
  it('Call PATCH /experiences/:id with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {

  });
  
  it('Call DELETE /experiences/:id with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {

  });
  
  it('Call GET /experiences/:id/fragments with an experience ID that belongs to User A, using User Bs JWT - confirm 403 or 404', async () => {

  });

  it('Call GET /experiences/:id/fragments/:fragmentId/signed-url with User Bs JWT on User As fragment - confirm 403', async () => {

  });
});

// Data Integrity API testing
describe('Data Integrity (3 cases)', () => {
  it('Call PATCH /experiences/:id with is_draft: false on an experience with no anchor fragment set - confirm 400', async () => {

  });

  it('Call PATCH /experiences/:id/fragments/:fragmentId/anchor where the fragment belongs to a different experience -- confirm the request is rejected', async () => {

  });

  it('Call DELETE /experiences/:id/fragments/:fragmentId where fragmentId is the current anchor -- confirm 400 (cannot delete anchor)', async () => {

  });
});
