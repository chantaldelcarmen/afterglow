import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';
import { AttachFragmentDto } from './dto/attach-fragement.dto';
import { Fragment } from './fragments.interface';
import { Experience } from '../experiences/experiences.interface';

@Injectable()
export class FragmentsService {
  constructor(private readonly supabaseService: SupabaseService) {}
  /*
    Uploads a fragment to the 'fragments' storage bucket
    Logs the fragment data into the 'fragments' table
    */
  async attachFragment(
    userId: string,
    experienceId: string,
    file: Express.Multer.File,
    dto: AttachFragmentDto,
  ): Promise<{ storagePath: string; publicUrl: string }> {
    const supabase = this.supabaseService.getClient();
    // check ownership
    await this.findOne(userId, experienceId);

    const ext = file.originalname.split('.').pop() ?? 'bin';
    const fragmentId = uuidv4();
    const storagePath = `${userId}/${experienceId}/${fragmentId}.${ext}`;
    const type = fragmentType(file);

    // uploading image to 'fragments' bucket
    const { error: uploadError } = await supabase.storage
      .from('fragments')
      .upload(storagePath, file.buffer);

    if (uploadError) throw new Error(uploadError.message);

    // inserting fragment data into 'fragments' table
    const { error: dbError } = await supabase.from('fragments').insert({
      ...dto,
      id: fragmentId,
      experience_id: experienceId,
      type: type,
      storage_path: storagePath,
    });

    if (dbError) throw new Error(dbError.message);

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
      throw new Error(fragError.message);
    } else {
      return fragments ?? [];
    }
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
    await this.findOne(userId, experienceId);

    // 1. get storage_path from fragments table
    const { data: fragmentPath, error: pathError } = await supabase
      .from('fragments')
      .select('storage_path')
      .eq('id', fragmentId)
      .eq('experience_id', experienceId)
      .single();

    if (pathError || !fragmentPath)
      throw new NotFoundException('Fragment not found');

    // 2. delete fragment from 'fragments' storage bucket
    const { error: bucketError } = await supabase.storage
      .from('fragments')
      .remove([fragmentPath.storage_path]);

    if (bucketError) throw new Error(bucketError.message);

    // 3. delete fragment from 'fragments' table
    const { error: tableError } = await supabase
      .from('fragments')
      .delete()
      .eq('id', fragmentId)
      .eq('experience_id', experienceId);

    if (tableError) throw new Error(tableError.message);
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
      throw new Error(error.message);
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
      .single<Experience>();

    if (error || !data) throw new NotFoundException('Experience not found');
    if (data.user_id !== userId) throw new ForbiddenException('Access denied');

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
