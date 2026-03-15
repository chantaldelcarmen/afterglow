import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  client;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_PUBLISHABLE_DEFAULT_KEY');

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }

  }

  getClient() {
    return this.client;
  }
}