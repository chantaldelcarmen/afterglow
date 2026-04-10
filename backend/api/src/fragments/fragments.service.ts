import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';
import { AttachFragmentDto } from './dto/attach-fragment.dto';
import { Fragment } from './fragments.interface';
import { Experience } from '../experiences/experiences.interface';

@Injectable()
export class FragmentsService {
  private static readonly SIGNED_URL_EXPIRY_SECONDS = 3600;

  constructor(private readonly supabaseService: SupabaseService) {}
  /*
    Uploads a fragment to the 'fragments' storage bucket
    Logs the fragment data into the 'fragments' table
    */
  async attachFragment(
    userId: string,
    experienceId: string,
    file: Express.Multer.File | undefined,
    dto: AttachFragmentDto,
  ): Promise<{ storagePath: string | null; publicUrl: string | null }> {
    const supabase = this.supabaseService.getClient();
    // check ownership
    await this.findOne(userId, experienceId);

    const trimmedCaption = dto.caption?.trim() || undefined;
    const trimmedTextContext = dto.text_context?.trim();

    if (dto.type === 'text') {
      if (!trimmedTextContext) {
        throw new BadRequestException('Text content is required');
      }

      const fragmentId = uuidv4();
      const { error: dbError } = await supabase.from('fragments').insert({
        id: fragmentId,
        experience_id: experienceId,
        type: 'text',
        caption: trimmedCaption,
        text_context: trimmedTextContext,
        storage_path: null,
      });

      if (dbError) {
        throw new InternalServerErrorException(dbError.message);
      }

      return { storagePath: null, publicUrl: null };
    }

    // guard for file existance
    if (!file) throw new BadRequestException('File is required');
    const ext = file.originalname.split('.').pop() ?? 'bin';

    const fragmentId = uuidv4();
    const storagePath = `${userId}/${experienceId}/${fragmentId}.${ext}`;
    const type = fragmentType(file);

    // uploading image to 'fragments' bucket
    const { error: uploadError } = await supabase.storage
      .from('fragments')
      .upload(storagePath, file.buffer);

    if (uploadError)
      throw new InternalServerErrorException(uploadError.message);

    // inserting fragment data into 'fragments' table
    const { error: dbError } = await supabase.from('fragments').insert({
      id: fragmentId,
      experience_id: experienceId,
      type: type,
      caption: trimmedCaption,
      text_context: trimmedTextContext,
      storage_path: storagePath,
    });

    if (dbError) {
      // remove from bucket if error after tring to insert into table
      await supabase.storage.from('fragments').remove([storagePath]);
      throw new InternalServerErrorException(dbError.message);
    }

    const { data } = supabase.storage
      .from('fragments')
      .getPublicUrl(storagePath);

    return { storagePath, publicUrl: data.publicUrl };
  }

  /*
    Selects all columns of the fragments associated with an experience
    */
  async getFragmentsList(
    userId: string,
    experienceId: string,
  ): Promise<Fragment[]> {
    const supabase = this.supabaseService.getClient();

    // check ownership first
    await this.findOne(userId, experienceId);

    // returns a sorted list of fragments for an experience
    const { data: fragments, error: fragError } = await supabase
      .from('fragments')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: false })
      .returns<Fragment[]>();

    if (fragError) {
      throw new InternalServerErrorException(fragError.message);
    } else {
      return fragments ?? [];
    }
  }

  async getFragmentSignedUrl(
    userId: string,
    experienceId: string,
    fragmentId: string,
  ): Promise<{ signedUrl: string | null }> {
    const supabase = this.supabaseService.getClient();

    await this.findOne(userId, experienceId);

    const { data: fragment, error } = await supabase
      .from('fragments')
      .select('storage_path')
      .eq('id', fragmentId)
      .eq('experience_id', experienceId)
      .single<{ storage_path: string | null }>();

    if (error || !fragment) {
      throw new NotFoundException('Fragment not found');
    }

    if (!fragment.storage_path) {
      return { signedUrl: null };
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from('fragments')
      .createSignedUrl(
        fragment.storage_path,
        FragmentsService.SIGNED_URL_EXPIRY_SECONDS,
      );

    if (signedUrlError) {
      throw new InternalServerErrorException(signedUrlError.message);
    }

    return { signedUrl: data.signedUrl };
  }

  /*
    Remove fragment from 1. bucket and 2. table
    */
  async removeFragment(
    userId: string,
    experienceId: string,
    fragmentId: string,
  ): Promise<{ message: string }> {
    const supabase = this.supabaseService.getClient();

    // check ownership first
    const experience = await this.findOne(userId, experienceId);

    // check if fragment to be deleted is the anchor, block request
    if (experience.anchor_fragment_id === fragmentId)
      throw new BadRequestException(
        'Cannot delete the anchor fragment. Set a new anchor first.',
      );

    // 1. get storage_path from fragments table
    const { data: fragmentPath, error: pathError } = await supabase
      .from('fragments')
      .select('storage_path')
      .eq('id', fragmentId)
      .eq('experience_id', experienceId)
      .single();

    if (pathError || !fragmentPath)
      throw new NotFoundException('Fragment not found');

    // 2. delete fragment from 'fragments' table
    const { error: tableError } = await supabase
      .from('fragments')
      .delete()
      .eq('id', fragmentId)
      .eq('experience_id', experienceId);

    if (tableError) throw new InternalServerErrorException(tableError.message);

    // 3. delete fragment from 'fragments' storage bucket
    if (!fragmentPath.storage_path) {
      return { message: 'Fragment deleted successfully' };
    }

    const { error: bucketError } = await supabase.storage
      .from('fragments')
      .remove([fragmentPath.storage_path]);

    if (bucketError)
      throw new InternalServerErrorException(bucketError.message);

    return { message: 'Fragment deleted successfully' };
  }

  /*
    Updates anchor_fragment_id for an experience to set a new anchor point
    Assigns a fragment the anchor status
    */
  async setAnchorFragment(
    userId: string,
    experienceId: string,
    fragmentId: string,
  ): Promise<Experience> {
    const supabase = this.supabaseService.getClient();

    // check ownership first
    await this.findOne(userId, experienceId);

    // check fragment exists and belongs to experience
    const { data: fragData, error: fragError } = await supabase
      .from('fragments')
      .select('id')
      .eq('id', fragmentId)
      .eq('experience_id', experienceId)
      .single();

    if (fragError || !fragData)
      throw new NotFoundException('Fragment not found for this Experience');

    // update experience with new anchor
    const { data, error } = await supabase
      .from('experiences')
      .update({ anchor_fragment_id: fragmentId })
      .eq('id', experienceId)
      .eq('user_id', userId)
      .select()
      .single<Experience>();

    if (error) {
      throw new InternalServerErrorException(error.message);
    } else if (!data) {
      throw new ForbiddenException('Access denied');
    } else {
      return data;
    }
  }

  // helper function to confirm ownership
  async findOne(userId: string, id: string): Promise<Experience> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single<Experience>();

    if (error) throw new ForbiddenException('Access denied');
    if (!data) throw new NotFoundException('Experience not found');

    return data;
  }
}

/* 
Helper function to determine fragment media type
*/
export function fragmentType(file: Express.Multer.File) {
  if (file.mimetype.startsWith('image/')) {
    return 'photo';
  } else if (file.mimetype.startsWith('video/')) {
    return 'video';
  } else if (file.mimetype.startsWith('audio/')) {
    return 'audio';
  }
  return 'text';
}
