import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(userId: string, dto: CreateExperienceDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Experience not found');
    if (data.user_id !== userId) throw new ForbiddenException('Access denied');

    return data;
  }

  async update(userId: string, id: string, dto: UpdateExperienceDto) {
    // Verify ownership first
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(userId: string, id: string) {

    await this.findOne(userId, id);

    const { error } = await this.supabase
      .getClient()
      .from('experiences')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Experience deleted successfully' };
  }
}
