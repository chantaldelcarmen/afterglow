import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience } from './experiences.interface';

@Injectable()
export class ExperiencesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(userId: string, dto: CreateExperienceDto): Promise<Experience> {
    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .insert({ ...dto, user_id: userId })
      .select()
      .single<Experience>();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll(userId: string): Promise<Experience[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .select('*, fragments!experiences_anchor_fragment_id_fkey(storage_path)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<(Experience & { fragments: { storage_path: string } | null })[]>();

    if (error) throw new InternalServerErrorException(error.message);

    return data.map((exp) => ({
      ...exp,
      anchor_storage_path: exp.fragments?.storage_path ?? null,
      fragments: undefined,
    }));
  }

  async findOne(userId: string, id: string): Promise<Experience> {
    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single<Experience>();

    if (error || !data) throw new NotFoundException('Experience not found');
    return data;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateExperienceDto,
  ): Promise<Experience> {
    // Verify ownership first
    const experience = await this.findOne(userId, id);

    // cannot publish an experience without an anchor set (no invalid transitions)
    if (dto.is_draft === false && !experience.anchor_fragment_id)
      throw new BadRequestException(
        'An anchor fragment must be set before publishing',
      );

    const { data, error } = await this.supabase
      .getClient()
      .from('experiences')
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single<Experience>();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .getClient()
      .from('experiences')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Experience deleted successfully' };
  }
}
