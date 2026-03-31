import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateReflectionDto } from './dto/create-reflection.dto';

interface ExperienceRow {
  id: string;
  user_id: string;
}

export interface ReflectionRow {
  id: string;
  experience_id: string;
  user_id: string;
  reflection_text: string;
  created_at: string;
  updated_at: string | null;
}

@Injectable()
export class ReflectionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createReflection(
    experienceId: string,
    userId: string,
    dto: CreateReflectionDto,
  ): Promise<ReflectionRow> {
    const supabase = this.supabaseService.getClient();

    // Check ownership
    const { data: experience, error: experienceError } = (await supabase
      .from('experiences')
      .select('id, user_id')
      .eq('id', experienceId)
      .single()) as {
      data: ExperienceRow | null;
      error: unknown;
    };

    if (experienceError || !experience) {
      throw new NotFoundException('Experience not found');
    }

    if (experience.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this experience');
    }

    const { data, error } = (await supabase
      .from('reflections')
      .insert({
        experience_id: experienceId,
        user_id: userId,
        reflection_text: dto.reflection_text,
      })
      .select(
        'id, experience_id, user_id, reflection_text, created_at, updated_at',
      )
      .single()) as {
      data: ReflectionRow | null;
      error: unknown;
    };

    if (error || !data) {
      throw new InternalServerErrorException('Failed to create reflection');
    }

    return data;
  }

  async getReflectionsForExperience(
    experienceId: string,
    userId: string,
  ): Promise<ReflectionRow[]> {
    const supabase = this.supabaseService.getClient();

    // Check the experience exists and belongs to the authenticated user
    const { data: experience, error: experienceError } = (await supabase
      .from('experiences')
      .select('id, user_id')
      .eq('id', experienceId)
      .single()) as {
      data: ExperienceRow | null;
      error: unknown;
    };

    if (experienceError || !experience) {
      throw new NotFoundException('Experience not found');
    }

    if (experience.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this experience');
    }

    const { data, error } = (await supabase
      .from('reflections')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: false })) as {
      data: ReflectionRow[] | null;
      error: unknown;
    };

    if (error || !data) {
      throw new InternalServerErrorException('Failed to fetch reflections');
    }

    return data;
  }

  async updateReflection(
    reflectionId: string,
    userId: string,
    dto: CreateReflectionDto,
  ): Promise<ReflectionRow> {
    const supabase = this.supabaseService.getClient();

    // 1. Fetch reflection
    const { data: reflection, error: fetchError } = (await supabase
      .from('reflections')
      .select('id, user_id')
      .eq('id', reflectionId)
      .single()) as {
      data: Pick<ReflectionRow, 'id' | 'user_id'> | null;
      error: unknown;
    };

    if (fetchError || !reflection) {
      throw new NotFoundException('Reflection not found');
    }

    // 2. Ownership check
    if (reflection.user_id !== userId) {
      throw new ForbiddenException('You do not own this reflection');
    }

    // 3. Update
    const { data, error } = (await supabase
      .from('reflections')
      .update({
        reflection_text: dto.reflection_text,
      })
      .eq('id', reflectionId)
      .select(
        'id, experience_id, user_id, reflection_text, created_at, updated_at',
      )
      .single()) as {
      data: ReflectionRow | null;
      error: unknown;
    };

    if (error || !data) {
      throw new InternalServerErrorException('Failed to update reflection');
    }

    return data;
  }

  async deleteReflection(
    reflectionId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const supabase = this.supabaseService.getClient();

    // 1. Fetch reflection
    const { data: reflection, error: fetchError } = (await supabase
      .from('reflections')
      .select('id, user_id')
      .eq('id', reflectionId)
      .single()) as {
      data: Pick<ReflectionRow, 'id' | 'user_id'> | null;
      error: unknown;
    };

    if (fetchError || !reflection) {
      throw new NotFoundException('Reflection not found');
    }

    // 2. Ownership check
    if (reflection.user_id !== userId) {
      throw new ForbiddenException('You do not own this reflection');
    }

    // 3. Delete
    const { error } = await supabase
      .from('reflections')
      .delete()
      .eq('id', reflectionId);

    if (error) {
      throw new InternalServerErrorException('Failed to delete reflection');
    }

    return { message: 'Reflection deleted successfully' };
  }
}
