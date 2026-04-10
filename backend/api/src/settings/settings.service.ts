import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service'; // adjust import to match your project
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getSettings(userId: string) {
    // Try to fetch existing row first
    const { data: existing } = await this.supabase
      .getClient()
      .from('user_settings')
      .select()
      .eq('user_id', userId)
      .single();

    if (existing) {
      return { ai_reflection_enabled: existing.ai_reflection_enabled };
    }

    // No row yet — insert with defaults, handling the rare concurrent-insert race
    const { data, error } = await this.supabase
      .getClient()
      .from('user_settings')
      .insert({ user_id: userId, ai_reflection_enabled: false })
      .select()
      .single();

    if (error) {
      // 23505 = unique_violation: a concurrent request already inserted the row
      if (error.code === '23505') {
        const { data: retried } = await this.supabase
          .getClient()
          .from('user_settings')
          .select()
          .eq('user_id', userId)
          .single();
        if (retried) return { ai_reflection_enabled: retried.ai_reflection_enabled };
      }
      console.error('Supabase error:', JSON.stringify(error));
      throw error;
    }

    return { ai_reflection_enabled: data.ai_reflection_enabled };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('user_settings')
      .upsert(
        { user_id: userId, ...dto, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return { ai_reflection_enabled: data.ai_reflection_enabled };
  }
}
