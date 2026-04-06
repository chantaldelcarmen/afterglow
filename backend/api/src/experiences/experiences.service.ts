import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience } from './experiences.interface';

@Injectable()
export class ExperiencesService {
  private readonly logger = new Logger(ExperiencesService.name);

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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<Experience[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
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
    const supabase = this.supabase.getClient();

    const { data: fragments, error: fragmentsError } = await supabase
      .from('fragments')
      .select('storage_path')
      .eq('experience_id', id)
      .returns<Array<{ storage_path: string | null }>>();

    if (fragmentsError) {
      throw new InternalServerErrorException(fragmentsError.message);
    }

    const storagePaths = (fragments ?? [])
      .map((fragment) => fragment.storage_path)
      .filter((path): path is string => Boolean(path));

    const { error: clearAnchorError } = await supabase
      .from('experiences')
      .update({ anchor_fragment_id: null, is_draft: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (clearAnchorError) {
      throw new InternalServerErrorException(clearAnchorError.message);
    }

    const { error: reflectionsError } = await supabase
      .from('reflections')
      .delete()
      .eq('experience_id', id);

    if (reflectionsError) {
      throw new InternalServerErrorException(reflectionsError.message);
    }

    const { error: deleteFragmentsError } = await supabase
      .from('fragments')
      .delete()
      .eq('experience_id', id);

    if (deleteFragmentsError) {
      throw new InternalServerErrorException(deleteFragmentsError.message);
    }

    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new InternalServerErrorException(error.message);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('fragments')
        .remove(storagePaths);

      if (storageError) {
        this.logger.error(
          `Experience ${id} deleted but fragment storage cleanup failed: ${storageError.message}`,
        );
      }
    }

    return { message: 'Experience deleted successfully' };
  }
}
