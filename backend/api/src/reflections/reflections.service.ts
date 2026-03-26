import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateReflectionDto } from './dto/create-reflection.dto';

@Injectable()
export class ReflectionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createReflection(
    experienceId: string,
    userId: string,
    dto: CreateReflectionDto,
) {
    const supabase = this.supabaseService.getClient();

    // Check ownership
    const { data: experience, error: experienceError } = await supabase
        .from('experiences')
        .select('id, user_id')
        .eq('id', experienceId)
        .single();

    if (experienceError || !experience) {
        throw new NotFoundException('Experience not found');
    }

    if (experience.user_id !== userId) {
        throw new ForbiddenException('You do not have access to this experience');
    }

    const { data, error } = await supabase
        .from('reflections')
        .insert({
        experience_id: experienceId,
        user_id: userId,
        reflection_text: dto.reflection_text, 
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        throw new InternalServerErrorException('Failed to create reflection');
    }

    return data;
    }

  async getReflectionsForExperience(experienceId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Check the experience exists and belongs to the authenticated user
    const { data: experience, error: experienceError } = await supabase
      .from('experiences')
      .select('id, user_id')
      .eq('id', experienceId)
      .single();

    if (experienceError || !experience) {
      throw new NotFoundException('Experience not found');
    }

    if (experience.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this experience');
    }

    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException('Failed to fetch reflections');
    }

    return data;
  }
}