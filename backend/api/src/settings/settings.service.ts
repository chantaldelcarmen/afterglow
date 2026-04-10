import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service'; // adjust import to match your project
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getSettings(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('user_settings')
      .select()
      .eq('user_id', userId)
      .single();

    if (error) {
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
