import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class ExperiencesService {
    constructor(private readonly supabaseService: SupabaseService) {}
    /*
    Uploads a fragment to the 'fragments' storage bucket
    Logs the fragment data into the 'fragments' table
    */
    async attachFragment(
        userId: string,
        experienceId: string,
        file: Express.Multer.File,
    ) {
        const supabase = this.supabaseService.getClient();
        const ext = file.originalname.split('.').pop() ?? 'bin';
        const fragmentId = uuidv4();
        const storagePath = `${userId}/${experienceId}/${fragmentId}.${ext}`;
        const type = fragmentType(file);

        // uploading image to 'fragments' bucket
        const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('fragments')
        .upload(storagePath, file.buffer);

        if ( uploadError ) throw uploadError;
        
        // inserting fragment data into 'fragments' table
        const { data: fragmentData, error: dbError } = await supabase
        .from('fragments')
        .insert({
            id: fragmentId,
            experience_id: experienceId,
            type: type,
            caption: null,
            storage_path: storagePath,
            text_context: null,
        })

        if (dbError) throw dbError;

        const publicURL = await supabase
        .storage
        .from("fragments")
        .getPublicUrl(storagePath);
            
        return {storagePath, publicURL};

    }


    /*
    Selects all columns of the fragments associated with an experience
    */
    async getFragmentsList(
        experienceId: string,
    ) {
        const supabase = this.supabaseService.getClient();
        const { data: fragments, error } = await supabase
        .from('fragments')
        .select('*')
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: true })

        if (error) {
            throw error;
        } else {
            return fragments;
        }
    }

    /*
    Remove fragment from 1. bucket and 2. table
    */
    async removeFragment(
        experienceId: string,
        fragmentId: string,
    ) {
        const supabase = this.supabaseService.getClient();

        // 1. get storage_path from fragments table
        const { data: path, error: pathError } = await supabase
        .from('fragments')
        .select('storage_path')
        .eq('id', fragmentId)
        .eq('experience_id', experienceId)
        .single();

        if (pathError || !path) throw pathError;

        // 2. delete fragment from 'fragments' storage bucket
        const { error: bucketError } = await supabase
        .storage
        .from('fragments') 
        .remove([path.storage_path]);

        if (bucketError) throw bucketError;

        // 3. delete fragment from 'fragments' table
        const { error: tableError } = await supabase
        .from('fragments')
        .delete()
        .eq('id', fragmentId)
        .eq('experience_id', experienceId);

        if (tableError) throw tableError;
    }

    /*
    Updates anchor_fragment_id for an experience to set a new anchor point
    Assigns a fragment the anchor status
    */
    async setAnchorFragment(
        userId: string,
        experienceId: string,
        fragmentId: string,
    ) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
        .from('experiences')
        .update({ anchor_fragment_id: fragmentId })
        .eq('id', experienceId)
        .eq('user_id', userId);

        if (error) {
            throw error;
        } else {
            return data;
        }
    }
}

/* 
Helper function to determine fragment media type
*/
export function fragmentType(
    file: Express.Multer.File,
) {
    if (file.mimetype.startsWith('image/')) {
        return 'photo';
    } else if (file.mimetype.startsWith('video/')) {
        return 'video';
    } else if (file.mimetype.startsWith('audio/')) {
        return 'audio';
    } return 'text';
}