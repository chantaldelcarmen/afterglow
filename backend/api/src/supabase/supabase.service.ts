import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private anonClient: SupabaseClient;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_KEY');
    const anonKey = this.config.get<string>('SUPABASE_PUBLISHABLE_DEFAULT_KEY');

    if (!url || !key || !anonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.client = createClient(url, key);
    this.anonClient = createClient(url, anonKey!);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getAnonClient(): SupabaseClient {
    return this.anonClient;
  }
}
